-- =============================================================================
-- Khel Drishti — database bootstrap for the self-hosted Supabase stack
-- =============================================================================
-- Creates the roles, schemas and default privileges that GoTrue (auth),
-- PostgREST (rest), Storage API and the app's migrations expect.
--
-- Written to run as a NON-superuser with CREATEROLE + CREATEDB, which is what
-- the RDS master user is. The same file runs against the local Postgres
-- container, so local and AWS behave identically.
--
-- Idempotent: safe to run on every `docker compose up`. Passwords are
-- (re)applied each run, so rotating them in docker/.env takes effect here.
--
-- psql variables (passed by docker/db/init.sh):
--   authenticator_password, auth_admin_password, storage_admin_password
-- =============================================================================
\set ON_ERROR_STOP on
SET client_min_messages = warning;

-- ---------------------------------------------------------------- roles ----
-- API roles: never log in directly; PostgREST switches into them per request.
SELECT format('CREATE ROLE %I NOLOGIN NOINHERIT', r)
FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) \gexec

-- Roles some upstream Supabase migrations reference; harmless placeholders here.
SELECT format('CREATE ROLE %I NOLOGIN', r)
FROM unnest(ARRAY['dashboard_user', 'supabase_admin', 'supabase_functions_admin']) AS r
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) \gexec

-- Login roles for the services.
SELECT 'CREATE ROLE authenticator LOGIN NOINHERIT'
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') \gexec
SELECT 'CREATE ROLE supabase_auth_admin LOGIN NOINHERIT CREATEROLE'
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') \gexec
SELECT 'CREATE ROLE supabase_storage_admin LOGIN NOINHERIT CREATEROLE'
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_storage_admin') \gexec

ALTER ROLE authenticator          WITH PASSWORD :'authenticator_password';
ALTER ROLE supabase_auth_admin    WITH PASSWORD :'auth_admin_password';
ALTER ROLE supabase_storage_admin WITH PASSWORD :'storage_admin_password';

-- PostgREST logs in as authenticator and SET ROLEs into the API roles.
GRANT anon, authenticated, service_role TO authenticator;

-- The migration user (postgres / RDS master) must be able to act as the
-- service owners: it creates FKs to auth.users, a trigger on auth.users and
-- policies on storage.objects. On PG16+ the creator only gets ADMIN on a new
-- role (no INHERIT/SET), so the explicit grant is required there too.
SELECT format('GRANT %I TO %I', r, current_user)
FROM unnest(ARRAY['anon', 'authenticated', 'service_role',
                  'supabase_auth_admin', 'supabase_storage_admin']) AS r
WHERE NOT pg_has_role(current_user, r, 'USAGE') \gexec  -- USAGE = inherits privileges (PG15 and PG16+)

-- service_role must bypass RLS (edge functions read user_roles with it).
-- Plain Postgres: works. RDS: depends on the master user's attributes; if it
-- is refused, docker/db/post-migrate.sql adds explicit service_role policies.
DO $$
BEGIN
  IF NOT (SELECT rolbypassrls FROM pg_roles WHERE rolname = 'service_role') THEN
    BEGIN
      ALTER ROLE service_role BYPASSRLS;
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE WARNING 'service_role could not be given BYPASSRLS (%). post-migrate.sql will add explicit service_role policies instead.', SQLERRM;
    END;
  END IF;
END $$;

-- Per-role timeouts, mirroring Supabase defaults.
ALTER ROLE anon          SET statement_timeout = '3s';
ALTER ROLE authenticated SET statement_timeout = '8s';
ALTER ROLE authenticator SET statement_timeout = '8s';
ALTER ROLE supabase_auth_admin    SET search_path = auth;
ALTER ROLE supabase_storage_admin SET search_path = storage;

-- -------------------------------------------------------------- schemas ----
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto    WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role,
                                    supabase_auth_admin, supabase_storage_admin;

CREATE SCHEMA IF NOT EXISTS auth    AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
GRANT USAGE ON SCHEMA auth, storage TO anon, authenticated, service_role;

SELECT format('GRANT CONNECT, CREATE, TEMPORARY ON DATABASE %I TO supabase_auth_admin, supabase_storage_admin', current_database()) \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO authenticator', current_database()) \gexec

-- Objects the storage admin creates are reachable through the API roles.
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_storage_admin IN SCHEMA storage
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_storage_admin IN SCHEMA storage
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_storage_admin IN SCHEMA storage
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ------------------------------------------------------- public schema ----
-- Same model as hosted Supabase: API roles get table privileges by default and
-- Row Level Security decides which rows they see. The app's migrations rely on
-- this (they enable RLS and write policies, they do not GRANT).
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Migration bookkeeping (same table the Supabase CLI uses, so `supabase
-- migration repair` and this runner agree on what has been applied).
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version    text PRIMARY KEY,
  statements text[],
  name       text,
  applied_at timestamptz DEFAULT now()
);
-- Older CLI-created tables lack applied_at.
ALTER TABLE supabase_migrations.schema_migrations ADD COLUMN IF NOT EXISTS applied_at timestamptz DEFAULT now();

SELECT 'bootstrap complete for database ' || current_database() AS status;
