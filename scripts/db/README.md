# Database: schema baseline and security hardening

## Why this folder exists

The live database has drifted from `supabase/migrations/`. About 25 tables, 35 views and 3 functions (all `oly_*`, `kisce_*`, `kd_v_*`, `sai_projects`, `centre_contacts`, `facility_crosswalk`, `kd_state_alias`, `stg_athlete_birth`, the `refresh_*_cache` functions) exist on live but are created by no migration. A fresh database built from the repo fails at `20260816032403_…sql` (`relation "public.oly_v_india_olympians" does not exist`).

## Step 1: Capture the live schema (read-only)

`dump_live_schema.sql` reads only system catalogs. It is safe on production. It returns one column, `ddl`, one statement per row, already in dependency order.

Run it with **one** of these:

- **Lovable editor (simplest):** ask the agent:
  > Run the read-only SQL in `scripts/db/dump_live_schema.sql` against the database. Write every row of the `ddl` column, in the order returned, separated by a blank line, to `supabase/live_schema_dump.sql`. Do not change anything else.
- **psql** (if you have the connection string):
  ```bash
  psql "$DATABASE_URL" -X -A -t -f scripts/db/dump_live_schema.sql > supabase/live_schema_dump.sql
  ```

Before converting it, check that the output:

- starts with `-- Generated … SET check_function_bodies = false;`
- contains `CREATE VIEW public.oly_v_india_olympians`
- ends with `-- rows <table>: <n>` lines

The script was tested by round-tripping. A database was dumped, the dump was loaded into an empty database, and that database was dumped again. The two dumps were identical.

## Step 2: Convert it to a baseline (done in the repo, not on live)

1. Copy the dump to `supabase/migrations/20260930000000_baseline_live_schema.sql`.
2. Move the 21 older migrations to `supabase/migrations_legacy/` for history. They are superseded by the baseline.
3. **Live database:** the baseline must be recorded as applied but never executed, because the objects already exist.
   - Supabase CLI: `supabase migration repair --status applied 20260930000000`
   - Lovable Cloud: do not ask the agent to run the baseline.
4. **New environments** (staging, DR restore) run the baseline, then the migrations that follow it.

The dump covers schema only. Reference data (sports, centres, capacity CSVs, regional centres) is restored from `/admin/export` → "Download all data", or from `public/data/*.csv` via `/import`.

## Step 3: Security hardening migration

`supabase/migrations/20261001090000_security_hardening.sql` is idempotent. It can run on live before or after the baseline exists, and it is safe to re-run.

| Area | Before | After |
|---|---|---|
| STC assessment tables (`stc_detailed_data`, `stc_staff_roster`, …) | Anyone, including anonymous visitors, could read respondent mobile/email and staff names | Admins, plus users assigned to that centre or its region |
| STC writes | Any editor could insert data for any centre. Updates needed a table-level grant that centre in-charges never got, so their saves changed 0 rows silently | `can_edit_centre()` on insert and update, which needs the editor role plus an active assignment. Delete is admin-only |
| `stc-attachments` bucket | Any signed-up user could read | Scoped by the first path segment (`{centre_id}/…`). Read uses view access, upload and delete use edit access. 10 MB cap |
| `profiles` | Any signed-up user could read every email | Own row, plus admins |
| `form_submissions` | Logged-in only, and `submitted_by` could be spoofed | Per-form `allow_anonymous` toggle, `submitted_by` forced to the caller, 64 KB cap |
| `setup_first_admin` | Any caller could promote any user id. Racy | Caller can only promote themselves. Advisory lock. Not executable by anon |
| `can_edit_centre` / `can_view_centre` / `get_user_accessible_centres` | Any user could probe another user's access | Own id only, or admin |

**How to apply on live:** paste the file into the Lovable agent and ask it to run it as a migration, or run `supabase db push` if you use the CLI.

**After applying:** non-admin HQ staff without a region or centre assignment no longer see STC assessment data, by design. Give them a region assignment with `view` access level in User Management.

## Tests

`scripts/db/tests/security_hardening_test.sql` has 34 RLS assertions covering anonymous visitors, viewers, editors, regional officers and admins. It inserts fixtures inside a transaction and rolls back at the end. **Run it only on a non-production database.**

```bash
psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/db/tests/security_hardening_test.sql
# → ALL SECURITY HARDENING TESTS PASSED
```

Against the old policies the suite fails on its first assertion, "anon cannot read stc_detailed_data". This confirms that it detects the exposure.
