-- =============================================================================
-- Security hardening — 2026-10-01
-- =============================================================================
-- Fixes (see scripts/db/README.md for the review that produced them):
--   A. STC assessment data (respondent mobile/email, staff names) was readable
--      by anonymous visitors. Now: readable only by admins and users assigned
--      to that centre or its region.
--   B. STC writes were not centre-scoped (any editor could insert for any
--      centre) and UPDATE required a table-level grant that centre in-charges
--      never receive (their saves silently changed 0 rows). Now: every write
--      is checked with can_edit_centre(); deletes are admin-only.
--   C. stc-attachments readable by any signed-up user. Now centre-scoped by
--      the first path segment ({centre_id}/{category}/{file}).
--   D. Any signed-up user could read every profile (emails). Now own + admin.
--   E. Public forms: per-form "allow_anonymous" toggle, submitted_by is forced
--      to the caller, payload capped at 64 KB.
--   F. setup_first_admin(): caller can only promote themselves; serialised
--      with an advisory lock; anon cannot execute.
--   G. Access-check helpers no longer let one user probe another user's
--      roles/assignments.
--
-- Idempotent by design: safe to run on the live DB (which has drifted from
-- the repo) and safe to re-run on a fresh DB built from the baseline dump.
-- Policies on the affected tables are dropped dynamically, so policies that
-- exist on live but not in the repo are removed too.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- G. Access-check helpers
-- -----------------------------------------------------------------------------
-- Editing requires the editor role (or admin) AND an active assignment, so
-- revoking someone's editor role immediately revokes write access even if an
-- assignment row is left behind. Region access_level 'view' stays read-only.
CREATE OR REPLACE FUNCTION public.can_edit_centre(_user_id uuid, _centre_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _user_id IS NOT NULL
    AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
    AND (
      public.has_role(_user_id, 'admin'::app_role)
      OR (
        public.has_role(_user_id, 'editor'::app_role)
        AND (
          EXISTS (
            SELECT 1 FROM public.user_centre_assignments uca
            WHERE uca.user_id = _user_id AND uca.centre_id = _centre_id AND uca.is_active
          )
          OR EXISTS (
            SELECT 1
            FROM public.user_region_assignments ura
            JOIN public.regional_centres rc ON rc.id = ura.region_id
            JOIN public.stc_capacity sc
              ON sc.centre_id = _centre_id AND (sc.region = rc.display_name OR sc.region = rc.name)
            WHERE ura.user_id = _user_id AND ura.is_active
              AND ura.access_level IN ('view_edit', 'view_edit_approve')
          )
        )
      )
    )
$$;

CREATE OR REPLACE FUNCTION public.can_view_centre(_user_id uuid, _centre_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _user_id IS NOT NULL
    AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
    AND (
      public.has_role(_user_id, 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.user_centre_assignments uca
        WHERE uca.user_id = _user_id AND uca.centre_id = _centre_id AND uca.is_active
      )
      OR EXISTS (
        SELECT 1
        FROM public.user_region_assignments ura
        JOIN public.regional_centres rc ON rc.id = ura.region_id
        JOIN public.stc_capacity sc
          ON sc.centre_id = _centre_id AND (sc.region = rc.display_name OR sc.region = rc.name)
        WHERE ura.user_id = _user_id AND ura.is_active
      )
    )
$$;

CREATE OR REPLACE FUNCTION public.get_user_accessible_centres(_user_id uuid)
RETURNS TABLE(centre_id text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH caller_ok AS (
    SELECT _user_id IS NOT NULL
       AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role)) AS ok
  )
  SELECT DISTINCT sc.centre_id FROM public.stc_capacity sc, caller_ok
  WHERE caller_ok.ok AND public.has_role(_user_id, 'admin'::app_role)
  UNION
  SELECT uca.centre_id FROM public.user_centre_assignments uca, caller_ok
  WHERE caller_ok.ok AND uca.user_id = _user_id AND uca.is_active
  UNION
  SELECT sc.centre_id
  FROM public.user_region_assignments ura
  JOIN public.regional_centres rc ON rc.id = ura.region_id
  JOIN public.stc_capacity sc ON (sc.region = rc.display_name OR sc.region = rc.name)
  CROSS JOIN caller_ok
  WHERE caller_ok.ok AND ura.user_id = _user_id AND ura.is_active
$$;

REVOKE EXECUTE ON FUNCTION public.can_edit_centre(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_view_centre(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_accessible_centres(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_edit_centre(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_view_centre(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_accessible_centres(uuid) TO authenticated, service_role;

-- Helper indexes for the per-row checks above.
CREATE INDEX IF NOT EXISTS idx_uca_user_centre ON public.user_centre_assignments (user_id, centre_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_ura_user ON public.user_region_assignments (user_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_stc_capacity_centre_region ON public.stc_capacity (centre_id, region);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles (user_id, role);

-- -----------------------------------------------------------------------------
-- A + B. STC assessment tables: centre-scoped read and write
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t   text;
  pol record;
BEGIN
  FOREACH t IN ARRAY ARRAY['stc_detailed_data', 'stc_discipline_strength', 'stc_staff_roster',
                           'stc_equipment_gaps', 'stc_competition_summary']
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'security_hardening: table % not found, skipped', t;
      CONTINUE;
    END IF;

    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);

    EXECUTE format($p$CREATE POLICY "Assigned users read %1$s" ON public.%1$I
                      FOR SELECT TO authenticated
                      USING (public.can_view_centre((SELECT auth.uid()), centre_id))$p$, t);
    EXECUTE format($p$CREATE POLICY "Centre editors insert %1$s" ON public.%1$I
                      FOR INSERT TO authenticated
                      WITH CHECK (public.can_edit_centre((SELECT auth.uid()), centre_id))$p$, t);
    EXECUTE format($p$CREATE POLICY "Centre editors update %1$s" ON public.%1$I
                      FOR UPDATE TO authenticated
                      USING (public.can_edit_centre((SELECT auth.uid()), centre_id))
                      WITH CHECK (public.can_edit_centre((SELECT auth.uid()), centre_id))$p$, t);
    EXECUTE format($p$CREATE POLICY "Admins delete %1$s" ON public.%1$I
                      FOR DELETE TO authenticated
                      USING (public.has_role((SELECT auth.uid()), 'admin'::app_role))$p$, t);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- C. stc-attachments bucket: private, centre-scoped by first path segment
-- -----------------------------------------------------------------------------
DO $$
DECLARE pol record;
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'security_hardening: storage schema not present, skipped';
    RETURN;
  END IF;

  UPDATE storage.buckets SET public = false WHERE id = 'stc-attachments';

  -- 10 MB cap, mirroring the client-side MAX_FILE_SIZE (column exists on hosted Supabase).
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'storage' AND table_name = 'buckets' AND column_name = 'file_size_limit') THEN
    EXECUTE $q$UPDATE storage.buckets SET file_size_limit = 10485760 WHERE id = 'stc-attachments'$q$;
  END IF;

  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (coalesce(qual, '') LIKE '%stc-attachments%' OR coalesce(with_check, '') LIKE '%stc-attachments%')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;

  CREATE POLICY "STC attachments: assigned users read" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'stc-attachments'
           AND public.can_view_centre((SELECT auth.uid()), (storage.foldername(name))[1]));

  CREATE POLICY "STC attachments: centre editors upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'stc-attachments'
                AND public.can_edit_centre((SELECT auth.uid()), (storage.foldername(name))[1]));

  CREATE POLICY "STC attachments: centre editors delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'stc-attachments'
           AND public.can_edit_centre((SELECT auth.uid()), (storage.foldername(name))[1]));
END $$;

-- -----------------------------------------------------------------------------
-- D. profiles: own row + admins only
-- -----------------------------------------------------------------------------
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd IN ('SELECT', 'ALL') LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

REVOKE ALL ON public.profiles FROM anon;

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'::app_role));

-- -----------------------------------------------------------------------------
-- E. Public forms
-- -----------------------------------------------------------------------------
ALTER TABLE public.form_definitions
  ADD COLUMN IF NOT EXISTS allow_anonymous boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.form_definitions.allow_anonymous IS
  'When true, visitors who are not logged in may submit this form (active forms only).';

-- Attribution comes from the session, never from the client.
ALTER TABLE public.form_submissions ALTER COLUMN submitted_by SET DEFAULT auth.uid();

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'form_submissions' AND cmd = 'INSERT' LOOP
    EXECUTE format('DROP POLICY %I ON public.form_submissions', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Submit to active forms" ON public.form_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    submitted_by IS NOT DISTINCT FROM (SELECT auth.uid())
    AND pg_column_size(data) <= 65536
    AND EXISTS (
      SELECT 1 FROM public.form_definitions f
      WHERE f.id = form_id
        AND f.is_active
        AND (f.allow_anonymous OR (SELECT auth.uid()) IS NOT NULL)
    )
  );

GRANT INSERT ON public.form_submissions TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- F. First-admin bootstrap
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.setup_first_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only the signed-in user can promote themselves.
  IF auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
    RETURN false;
  END IF;

  -- Serialise concurrent first-admin attempts.
  PERFORM pg_advisory_xact_lock(hashtext('public.setup_first_admin'));

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = _user_id;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin');
  END IF;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.setup_first_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.setup_first_admin(uuid) TO authenticated;
