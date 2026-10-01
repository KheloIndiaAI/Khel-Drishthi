-- =============================================================================
-- RLS regression tests for 20261001090000_security_hardening.sql
-- Run as a superuser on a NON-PRODUCTION database (it inserts fixtures and
-- rolls everything back at the end). Any failed expectation raises an error.
--   psql -v ON_ERROR_STOP=1 -f scripts/db/tests/security_hardening_test.sql
-- =============================================================================
\set QUIET on
\pset tuples_only on
\o /dev/null
BEGIN;

-- ---------------------------------------------------------------- fixtures --
CREATE TEMP TABLE ids (k text PRIMARY KEY, v uuid) ON COMMIT DROP;
GRANT SELECT ON ids TO anon, authenticated;
INSERT INTO ids VALUES
  ('admin', gen_random_uuid()), ('editor_c1', gen_random_uuid()), ('editor_none', gen_random_uuid()),
  ('viewer', gen_random_uuid()), ('regional', gen_random_uuid()), ('viewer_assigned', gen_random_uuid());

-- Remove any pre-existing admin so setup_first_admin can be exercised.
DELETE FROM public.user_roles WHERE role = 'admin';

INSERT INTO auth.users (id, email) SELECT v, k || '@test.local' FROM ids;  -- trigger creates profile + viewer role
UPDATE public.user_roles SET role = 'admin'  WHERE user_id = (SELECT v FROM ids WHERE k = 'admin');
UPDATE public.user_roles SET role = 'editor' WHERE user_id IN (SELECT v FROM ids WHERE k IN ('editor_c1', 'editor_none', 'regional'));

-- Own regional centres, so the suite does not depend on seed/reference data.
INSERT INTO public.regional_centres (id, name, display_name) VALUES
  ('00000000-0000-0000-0000-0000000000b1', 'T_RC_South', 'T RC South'),
  ('00000000-0000-0000-0000-0000000000b2', 'T_RC_Central', 'T RC Central');

INSERT INTO public.centres (centre_id, centre_type, centre_name, state)
VALUES ('T_C1', 'STC', 'Test Centre 1', 'Karnataka'), ('T_C2', 'STC', 'Test Centre 2', 'Madhya Pradesh');

INSERT INTO public.stc_capacity (centre_id, centre_name, region, state)
VALUES ('T_C1', 'Test Centre 1', 'T_RC_South', 'Karnataka'),
       ('T_C2', 'Test Centre 2', 'T_RC_Central', 'Madhya Pradesh');

INSERT INTO public.user_centre_assignments (user_id, centre_id)
SELECT v, 'T_C1' FROM ids WHERE k IN ('editor_c1', 'viewer_assigned');

INSERT INTO public.user_region_assignments (user_id, region_id, access_level)
VALUES ((SELECT v FROM ids WHERE k = 'regional'), '00000000-0000-0000-0000-0000000000b2', 'view_edit');

INSERT INTO public.stc_detailed_data (centre_id, centre_name, respondent)
VALUES ('T_C2', 'Test Centre 2', '{"respondent_mobile":"9999999999"}');

INSERT INTO storage.buckets (id, name, public) VALUES ('stc-attachments', 'stc-attachments', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.form_definitions (id, name, is_active, allow_anonymous) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'anon ok', true, true),
  ('00000000-0000-0000-0000-0000000000a2', 'login only', true, false),
  ('00000000-0000-0000-0000-0000000000a3', 'inactive', false, true);

-- ------------------------------------------------------------------ helpers --
CREATE OR REPLACE FUNCTION pg_temp.act_as(_k text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF _k = 'anon' THEN
    PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
    PERFORM set_config('request.jwt.claim.sub', '', true);
    SET LOCAL ROLE anon;
  ELSE
    PERFORM set_config('request.jwt.claims',
      json_build_object('sub', (SELECT v FROM ids WHERE k = _k), 'role', 'authenticated')::text, true);
    PERFORM set_config('request.jwt.claim.sub', (SELECT v FROM ids WHERE k = _k)::text, true);
    SET LOCAL ROLE authenticated;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION pg_temp.expect(_label text, _ok boolean) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF _ok IS NOT TRUE THEN RAISE EXCEPTION 'FAIL: %', _label; END IF;
  RAISE NOTICE 'ok   %', _label;
END $$;

-- Runs _sql as _who and reports whether it raised (true = blocked).
CREATE OR REPLACE FUNCTION pg_temp.blocked(_who text, _sql text) RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_temp.act_as(_who);
  BEGIN
    EXECUTE _sql;
  EXCEPTION WHEN insufficient_privilege OR check_violation OR others THEN
    RESET ROLE;
    RETURN true;
  END;
  RESET ROLE;
  RETURN false;
END $$;

CREATE OR REPLACE FUNCTION pg_temp.count_as(_who text, _sql text) RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE n bigint;
BEGIN
  PERFORM pg_temp.act_as(_who);
  EXECUTE _sql INTO n;
  RESET ROLE;
  RETURN n;
EXCEPTION WHEN others THEN
  RESET ROLE;
  RETURN -1;   -- -1 = statement raised
END $$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pg_temp TO anon, authenticated;

-- ============================================================ A. STC reads ==
SELECT pg_temp.expect('anon cannot read stc_detailed_data',
  pg_temp.blocked('anon', 'SELECT 1 FROM public.stc_detailed_data'));
SELECT pg_temp.expect('anon cannot read stc_staff_roster',
  pg_temp.blocked('anon', 'SELECT 1 FROM public.stc_staff_roster'));
SELECT pg_temp.expect('plain viewer sees 0 STC rows',
  pg_temp.count_as('viewer', 'SELECT count(*) FROM public.stc_detailed_data') = 0);
SELECT pg_temp.expect('editor of C1 cannot see C2 (respondent PII)',
  pg_temp.count_as('editor_c1', $q$SELECT count(*) FROM public.stc_detailed_data WHERE centre_id = 'T_C2'$q$) = 0);
SELECT pg_temp.expect('regional officer sees C2 in own region',
  pg_temp.count_as('regional', $q$SELECT count(*) FROM public.stc_detailed_data WHERE centre_id = 'T_C2'$q$) = 1);
SELECT pg_temp.expect('admin sees C2',
  pg_temp.count_as('admin', $q$SELECT count(*) FROM public.stc_detailed_data WHERE centre_id = 'T_C2'$q$) = 1);

-- =========================================================== B. STC writes ==
SELECT pg_temp.expect('editor of C1 cannot insert for C2',
  pg_temp.blocked('editor_c1', $q$INSERT INTO public.stc_detailed_data (centre_id) VALUES ('T_C2_x')$q$));
SELECT pg_temp.expect('unassigned editor cannot insert anywhere',
  pg_temp.blocked('editor_none', $q$INSERT INTO public.stc_detailed_data (centre_id) VALUES ('T_C1')$q$));
SELECT pg_temp.expect('viewer assigned to C1 cannot insert (needs editor role)',
  pg_temp.blocked('viewer_assigned', $q$INSERT INTO public.stc_detailed_data (centre_id) VALUES ('T_C1')$q$));
SELECT pg_temp.expect('editor of C1 can insert C1',
  NOT pg_temp.blocked('editor_c1', $q$INSERT INTO public.stc_detailed_data (centre_id) VALUES ('T_C1')$q$));
SELECT pg_temp.expect('editor of C1 update on C1 touches 1 row',
  pg_temp.count_as('editor_c1', $q$WITH u AS (UPDATE public.stc_detailed_data SET form_progress = 50 WHERE centre_id = 'T_C1' RETURNING 1) SELECT count(*) FROM u$q$) = 1);
SELECT pg_temp.expect('editor of C1 update on C2 touches 0 rows',
  pg_temp.count_as('editor_c1', $q$WITH u AS (UPDATE public.stc_detailed_data SET form_progress = 50 WHERE centre_id = 'T_C2' RETURNING 1) SELECT count(*) FROM u$q$) = 0);
SELECT pg_temp.expect('editor of C1 cannot move a row to C2',
  pg_temp.blocked('editor_c1', $q$UPDATE public.stc_detailed_data SET centre_id = 'T_C2' WHERE centre_id = 'T_C1'$q$));
SELECT pg_temp.expect('regional officer (view_edit) updates C2',
  pg_temp.count_as('regional', $q$WITH u AS (UPDATE public.stc_detailed_data SET form_progress = 10 WHERE centre_id = 'T_C2' RETURNING 1) SELECT count(*) FROM u$q$) = 1);
SELECT pg_temp.expect('editor cannot delete',
  pg_temp.count_as('editor_c1', $q$WITH d AS (DELETE FROM public.stc_detailed_data WHERE centre_id = 'T_C1' RETURNING 1) SELECT count(*) FROM d$q$) = 0);

-- ========================================================== C. attachments ==
SELECT pg_temp.expect('editor of C1 uploads into T_C1/',
  NOT pg_temp.blocked('editor_c1', $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('stc-attachments', 'T_C1/photos/a.jpg')$q$));
SELECT pg_temp.expect('editor of C1 cannot upload into T_C2/',
  pg_temp.blocked('editor_c1', $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('stc-attachments', 'T_C2/photos/a.jpg')$q$));
SELECT pg_temp.expect('plain viewer cannot list attachments',
  pg_temp.count_as('viewer', $q$SELECT count(*) FROM storage.objects WHERE bucket_id = 'stc-attachments'$q$) = 0);

-- ============================================================= D. profiles ==
SELECT pg_temp.expect('viewer reads only own profile',
  pg_temp.count_as('viewer', 'SELECT count(*) FROM public.profiles') = 1);
SELECT pg_temp.expect('anon cannot read profiles',
  pg_temp.blocked('anon', 'SELECT 1 FROM public.profiles'));
SELECT pg_temp.expect('admin reads all test profiles',
  pg_temp.count_as('admin', $q$SELECT count(*) FROM public.profiles WHERE email LIKE '%@test.local'$q$) = 6);

-- ================================================================ E. forms ==
SELECT pg_temp.expect('anon submits to allow_anonymous form',
  NOT pg_temp.blocked('anon', $q$INSERT INTO public.form_submissions (form_id, data) VALUES ('00000000-0000-0000-0000-0000000000a1', '{"x":1}')$q$));
SELECT pg_temp.expect('anon blocked on login-only form',
  pg_temp.blocked('anon', $q$INSERT INTO public.form_submissions (form_id, data) VALUES ('00000000-0000-0000-0000-0000000000a2', '{}')$q$));
SELECT pg_temp.expect('anon blocked on inactive form',
  pg_temp.blocked('anon', $q$INSERT INTO public.form_submissions (form_id, data) VALUES ('00000000-0000-0000-0000-0000000000a3', '{}')$q$));
SELECT pg_temp.expect('logged-in user submits login-only form',
  NOT pg_temp.blocked('viewer', $q$INSERT INTO public.form_submissions (form_id, data) VALUES ('00000000-0000-0000-0000-0000000000a2', '{}')$q$));
SELECT pg_temp.expect('submitted_by defaults to caller',
  (SELECT count(*) FROM public.form_submissions
   WHERE form_id = '00000000-0000-0000-0000-0000000000a2' AND submitted_by = (SELECT v FROM ids WHERE k = 'viewer')) = 1);
SELECT pg_temp.expect('cannot spoof submitted_by',
  pg_temp.blocked('viewer', format($q$INSERT INTO public.form_submissions (form_id, data, submitted_by) VALUES ('00000000-0000-0000-0000-0000000000a2', '{}', %L)$q$,
                                   (SELECT v FROM ids WHERE k = 'admin'))));
SELECT pg_temp.expect('payload over 64 KB rejected',
  pg_temp.blocked('anon', $q$INSERT INTO public.form_submissions (form_id, data) VALUES ('00000000-0000-0000-0000-0000000000a1', jsonb_build_object('x', (SELECT string_agg(md5(i::text), '') FROM generate_series(1, 3000) i)))$q$));

-- ======================================================= F/G. functions ==
SELECT pg_temp.expect('anon cannot execute setup_first_admin',
  pg_temp.blocked('anon', $q$SELECT public.setup_first_admin('00000000-0000-0000-0000-000000000000')$q$));
SELECT pg_temp.expect('setup_first_admin refuses while an admin exists',
  pg_temp.count_as('viewer', $q$SELECT CASE WHEN public.setup_first_admin(auth.uid()) THEN 1 ELSE 0 END$q$) = 0);
DELETE FROM public.user_roles WHERE role = 'admin';
SELECT pg_temp.expect('setup_first_admin refuses to promote someone else',
  pg_temp.count_as('viewer', format($q$SELECT CASE WHEN public.setup_first_admin(%L) THEN 1 ELSE 0 END$q$,
                                    (SELECT v FROM ids WHERE k = 'editor_none'))) = 0);
SELECT pg_temp.expect('setup_first_admin promotes the caller when no admin exists',
  pg_temp.count_as('viewer', $q$SELECT CASE WHEN public.setup_first_admin(auth.uid()) THEN 1 ELSE 0 END$q$) = 1);
SELECT pg_temp.expect('editor cannot probe another user via can_edit_centre',
  pg_temp.count_as('editor_none', format($q$SELECT CASE WHEN public.can_edit_centre(%L, 'T_C1') THEN 1 ELSE 0 END$q$,
                                         (SELECT v FROM ids WHERE k = 'editor_c1'))) = 0);
SELECT pg_temp.expect('anon cannot call get_user_accessible_centres',
  pg_temp.blocked('anon', $q$SELECT * FROM public.get_user_accessible_centres('00000000-0000-0000-0000-000000000000')$q$));

\o
\echo 'ALL SECURITY HARDENING TESTS PASSED'
ROLLBACK;
