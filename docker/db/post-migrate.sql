-- =============================================================================
-- Post-migrate safety net (idempotent, runs after every migrate)
-- =============================================================================
-- If the database refused to give service_role BYPASSRLS (possible on RDS,
-- where the master user is not a true superuser), the edge functions' service
-- client would be filtered by RLS like an anonymous user — e.g. it could not
-- read user_roles, and every admin call would 403 again.
--
-- In that case add an explicit "service_role full access" policy to every
-- RLS-enabled table in public. When BYPASSRLS is in place this does nothing.
-- =============================================================================
DO $$
DECLARE
  t record;
BEGIN
  IF (SELECT rolbypassrls FROM pg_roles WHERE rolname = 'service_role') THEN
    RETURN;
  END IF;

  RAISE NOTICE 'service_role lacks BYPASSRLS: ensuring explicit service_role policies';
  FOR t IN
    SELECT c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND c.relrowsecurity
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies
                   WHERE schemaname = 'public' AND tablename = t.relname
                     AND policyname = 'service_role full access') THEN
      EXECUTE format('CREATE POLICY "service_role full access" ON public.%I
                        FOR ALL TO service_role USING (true) WITH CHECK (true)', t.relname);
    END IF;
  END LOOP;
END $$;

-- Report what the API roles can do, so misconfiguration is visible in logs.
SELECT format('post-migrate: service_role bypassrls=%s, rls tables in public=%s',
              (SELECT rolbypassrls FROM pg_roles WHERE rolname = 'service_role'),
              (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
               WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity)) AS status;
