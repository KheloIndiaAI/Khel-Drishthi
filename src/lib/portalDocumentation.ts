/**
 * Builds the complete Khel Drishti portal documentation as a Markdown string.
 * Content is authored as structured constants so it stays easy to update.
 */

export interface TableDoc {
  name: string;
  pk: string;
  description: string;
  columns: string;
  fks?: string;
}

export interface TableGroup {
  group: string;
  intro: string;
  tables: TableDoc[];
}

export const SCHEMA_GROUPS: TableGroup[] = [
  {
    group: 'Core Sports Reference',
    intro: 'Master registry of sports, their disciplines and events, including presence flags for LA 2028 and Asian Games 2026.',
    tables: [
      {
        name: 'sports', pk: 'sport_id (text)',
        description: 'Master sports registry with games presence, event counts, centre counts, capacity roll-ups and programme flags (TOPS / TAGG / TEAMS / ASMITA / NIS).',
        columns: 'sport_id, sport_name, present_la28, present_ag2026, la28_events, ag2026_events, kic_centres, kisce_centres, stc_centres, ncoe_centres, existing_athletes, sanctioned_capacity, is_tops, is_tagg, is_teams, nis_diploma_status, asmita_league_status, sport_category, category_list, discipline_labels_from_image, present_in_tops_tagg_teams_list, present_in_asmita_nis_sheet, created_at, updated_at',
      },
      {
        name: 'disciplines', pk: 'discipline_id (text)',
        description: 'Sub-divisions of a sport (e.g. Swimming to Freestyle) with per-games event counts.',
        columns: 'discipline_id, sport_id, discipline_std, discipline_raw, present_la28, present_ag2026, la28_event_count, ag2026_event_count, is_active, created_at',
        fks: 'sport_id to sports.sport_id',
      },
      {
        name: 'events', pk: 'event_id (text)',
        description: 'Individual competition events with gender, event type and per-games men/women/total quotas.',
        columns: 'event_id, sport_id, discipline_id, event_std, event_raw, gender_std, event_type_std, participant_type, present_la28, present_ag2026, la28_men, la28_women, la28_total, ag2026_men, ag2026_women, ag2026_total, both_games, created_at',
        fks: 'sport_id to sports.sport_id, discipline_id to disciplines.discipline_id',
      },
      {
        name: 'event_overlap', pk: 'id (uuid)',
        description: 'Pre-computed analysis of how many events a sport has in LA28 only, AG2026 only, or both.',
        columns: 'id, sport_id, sport_std, events_total, la28_events, ag_events, both_events, only_la28, only_ag, created_at',
        fks: 'sport_id to sports.sport_id',
      },
      {
        name: 'eco_categories', pk: 'eco_category_id (text)',
        description: 'Ecosystem categorisation of sports with supply/demand presence flags across centre programmes and games.',
        columns: 'eco_category_id, eco_category_name, notes, is_ecosystem_category, present_in_tops_tagg_teams_list, present_in_asmita_nis_sheet, present_kic, present_kisce, present_stc, present_ncoe, has_supply_any, present_la28, present_ag2026, present_both_games, la28_events, ag2026_events, kic_centres, kisce_centres, stc_centres, ncoe_centres, source, created_at',
      },
    ],
  },
  {
    group: 'Infrastructure & Geography',
    intro: 'Physical training centres, the sports they run, and the regional/state hierarchy used across the portal.',
    tables: [
      {
        name: 'centres', pk: 'centre_id (text)',
        description: 'All training centres (NCOE, STC, KIC, KISCE) with location, programme subtype, coordinates and operational status.',
        columns: 'centre_id, centre_type, centre_name, centre_name_raw, state, district, region_unit, programme_subtype, operational_status, source_dataset, is_active, latitude, longitude, created_at, updated_at',
      },
      {
        name: 'centre_sport_links', pk: 'id (uuid)',
        description: 'Many-to-many bridge linking each centre to the sports and disciplines it offers.',
        columns: 'id, bridge_id, centre_id, sport_id, centre_type, state, district, sport_name, discipline_id, discipline_name, source_dataset, programme_subtype, operational_status, created_at',
        fks: 'centre_id to centres.centre_id, sport_id to sports.sport_id',
      },
      {
        name: 'regional_centres', pk: 'id (uuid)',
        description: 'SAI regional centres (e.g. NSNIS Patiala, SAI Bengaluru) used to group states and centres.',
        columns: 'id, name, display_name, sort_order, created_at, updated_at',
      },
      {
        name: 'region_state_mappings', pk: 'id (uuid)',
        description: 'Admin-editable mapping of each state to its regional centre; drives regional roll-ups.',
        columns: 'id, state_name, region_id, updated_by, created_at, updated_at',
        fks: 'region_id to regional_centres.id',
      },
    ],
  },
  {
    group: 'Capacity',
    intro: 'Sanctioned versus existing athlete strength, split by residential/non-residential and gender.',
    tables: [
      {
        name: 'ncoe_capacity', pk: 'id (uuid)',
        description: 'National Centre of Excellence capacity per centre and discipline.',
        columns: 'id, centre_id, centre_name, region, state, sport_id, discipline_raw, san_res_boys/girls/total, san_nonres_boys/girls/total, san_grand_total, ex_res_boys/girls/total, ex_nonres_boys/girls/total, ex_grand_total, is_para, created_at',
        fks: 'centre_id to centres.centre_id, sport_id to sports.sport_id',
      },
      {
        name: 'stc_capacity', pk: 'id (uuid)',
        description: 'State Training Centre capacity per centre and discipline (same shape as NCOE capacity).',
        columns: 'id, centre_id, centre_name, region, state, sport_id, discipline_raw, san_* columns, ex_* columns, is_para, created_at',
        fks: 'centre_id to centres.centre_id, sport_id to sports.sport_id',
      },
    ],
  },
  {
    group: 'STC Assessment (Data Collection)',
    intro: 'Structured survey data captured through the multi-section STC assessment form, plus its normalised child tables.',
    tables: [
      {
        name: 'stc_detailed_data', pk: 'id (uuid)',
        description: 'One assessment record per centre. Section answers are stored as JSON blocks, with progress tracking, derived KPIs, data-quality flags and scoring.',
        columns: 'id, centre_id, centre_name, state, region, assessment_id, assessment_year, form_version, form_progress, current_section, last_section_completed, centre_identity, infrastructure, staff_details, athlete_details, equipment_inventory, hostel_facilities, medical_facilities, challenges, respondent, derived_kpis, data_quality_flags, scoring, is_submitted, submitted_at, submitted_by, created_at, updated_at',
      },
      {
        name: 'stc_discipline_strength', pk: 'id (uuid)',
        description: 'Per-discipline sanctioned/existing strength with utilisation, vacancy, field-of-play and equipment adequacy details.',
        columns: 'id, assessment_id, centre_id, discipline_code, discipline_name, sanctioned_/existing_ res+nonres boys/girls, sanctioned_total, existing_total, utilization_rate, vacancy_total, surplus_total, facility_* , fop_*, equipment_adequacy_status, notes, created_at, updated_at',
      },
      {
        name: 'stc_staff_roster', pk: 'id (uuid)',
        description: 'Coaching, admin, security and support staff attached to an assessment.',
        columns: 'id, assessment_id, centre_id, staff_type, staff_name, staff_designation, discipline_code, division_responsibility, posted_since_date, employment_nature, dedicated_to_stc, created_at',
      },
      {
        name: 'stc_equipment_gaps', pk: 'id (uuid)',
        description: 'Equipment shortfalls reported per discipline with required quantity and priority.',
        columns: 'id, assessment_id, centre_id, discipline_code, gap_item_name, gap_qty_required, gap_priority, created_at',
      },
      {
        name: 'stc_competition_summary', pk: 'id (uuid)',
        description: 'Competition outcomes by level: participations, medals and top-8 finishes.',
        columns: 'id, assessment_id, centre_id, competition_level, participations_count, medals_count, top8_count, created_at',
      },
    ],
  },
  {
    group: 'Performance & History',
    intro: "India's Olympic record used across the medals and sport-detail analytics.",
    tables: [
      {
        name: 'olympic_medals', pk: 'id (uuid)',
        description: 'Medal records by year, athlete/team, medal colour and sport.',
        columns: 'id, year, year_raw, games_name, athlete_or_team, medal, sport_id, sport_raw, sport_std, event_raw, source, created_at',
        fks: 'sport_id to sports.sport_id',
      },
      {
        name: 'olympic_participation', pk: 'id (uuid)',
        description: 'Athlete participation counts by games year and sport.',
        columns: 'id, year, year_raw, games_name, sport_id, sport_raw, sport_std, athletes, source, created_at',
        fks: 'sport_id to sports.sport_id',
      },
      {
        name: 'olympic_timeline', pk: 'id (uuid)',
        description: 'Narrative milestones in Indian Olympic history, optionally linked to a sport.',
        columns: 'id, years_raw, year_start, years_list, milestone_title, milestone_description, sport_id, sport_guess_raw, sport_std, source, source_url, created_at',
        fks: 'sport_id to sports.sport_id',
      },
    ],
  },
  {
    group: 'Collaboration & Forms',
    intro: 'Notes on sports and the dynamic form builder used for ad-hoc data collection.',
    tables: [
      {
        name: 'sport_notes', pk: 'id (uuid)',
        description: 'Collaborative notes on a sport with pinning, tags and file attachments (stored in the stc-attachments bucket).',
        columns: 'id, sport_id, note_type, title, content, created_by, created_by_name, is_pinned, attachments, tags, created_at, updated_at',
        fks: 'sport_id to sports.sport_id, created_by to auth.users.id',
      },
      {
        name: 'form_definitions', pk: 'id (uuid)',
        description: 'Admin-authored dynamic form schemas (field list stored as JSON).',
        columns: 'id, name, description, fields, is_active, created_by, created_at, updated_at',
      },
      {
        name: 'form_submissions', pk: 'id (uuid)',
        description: 'Responses submitted against a form definition.',
        columns: 'id, form_id, data, submitted_by, submitted_at',
        fks: 'form_id to form_definitions.id',
      },
    ],
  },
  {
    group: 'Identity, Access & Audit',
    intro: 'User profiles, role assignments, scoped access grants and the change audit trail.',
    tables: [
      {
        name: 'profiles', pk: 'id (uuid, = auth user id)',
        description: 'User profile record created automatically on signup, including the access scope the user requested.',
        columns: 'id, email, name, organization, avatar_url, last_login, assignment_type, requested_centre_id, requested_region_id, created_at, updated_at',
      },
      {
        name: 'user_roles', pk: 'id (uuid)',
        description: 'Role assignments using the app_role enum (admin | editor | viewer). Roles are deliberately kept out of profiles to prevent privilege escalation.',
        columns: 'id, user_id, role, created_at',
      },
      {
        name: 'user_centre_assignments', pk: 'id (uuid)',
        description: 'Grants a user edit/view access to specific centres.',
        columns: 'id, user_id, centre_id, assigned_by, assigned_at, is_active',
      },
      {
        name: 'user_region_assignments', pk: 'id (uuid)',
        description: 'Grants a user access to every centre in a region, with an access level (view, view_edit, view_edit_approve).',
        columns: 'id, user_id, region_id, access_level, assigned_by, assigned_at, is_active',
      },
      {
        name: 'user_table_permissions', pk: 'id (uuid)',
        description: 'Per-table edit permissions for editors, checked by can_edit_table().',
        columns: 'id, user_id, table_name, created_by, created_at',
      },
      {
        name: 'access_requests', pk: 'id (uuid)',
        description: 'Requests from users for elevated roles, with review status and reviewer notes.',
        columns: 'id, user_id, requested_role, status, reason, requested_at, reviewed_at, reviewed_by, reviewer_notes',
      },
      {
        name: 'audit_logs', pk: 'id (uuid)',
        description: 'Append-only trail of data changes: who changed what, before/after payloads and the changed field list.',
        columns: 'id, user_id, user_email, user_name, table_name, record_id, action, old_data, new_data, changed_fields, created_at',
      },
    ],
  },
];

export const RELATIONSHIPS: { parent: string; child: string; key: string; type: string }[] = [
  { parent: 'sports', child: 'disciplines', key: 'sport_id', type: '1:Many' },
  { parent: 'sports', child: 'events', key: 'sport_id', type: '1:Many' },
  { parent: 'disciplines', child: 'events', key: 'discipline_id', type: '1:Many' },
  { parent: 'sports', child: 'centre_sport_links', key: 'sport_id', type: 'Many:Many' },
  { parent: 'centres', child: 'centre_sport_links', key: 'centre_id', type: 'Many:Many' },
  { parent: 'sports', child: 'ncoe_capacity', key: 'sport_id', type: '1:Many' },
  { parent: 'sports', child: 'stc_capacity', key: 'sport_id', type: '1:Many' },
  { parent: 'centres', child: 'ncoe_capacity', key: 'centre_id', type: '1:Many' },
  { parent: 'centres', child: 'stc_capacity', key: 'centre_id', type: '1:Many' },
  { parent: 'centres', child: 'stc_detailed_data', key: 'centre_id', type: '1:Many' },
  { parent: 'stc_detailed_data', child: 'stc_discipline_strength', key: 'assessment_id', type: '1:Many' },
  { parent: 'stc_detailed_data', child: 'stc_staff_roster', key: 'assessment_id', type: '1:Many' },
  { parent: 'stc_detailed_data', child: 'stc_equipment_gaps', key: 'assessment_id', type: '1:Many' },
  { parent: 'stc_detailed_data', child: 'stc_competition_summary', key: 'assessment_id', type: '1:Many' },
  { parent: 'regional_centres', child: 'region_state_mappings', key: 'region_id', type: '1:Many' },
  { parent: 'regional_centres', child: 'user_region_assignments', key: 'region_id', type: '1:Many' },
  { parent: 'sports', child: 'olympic_medals', key: 'sport_id', type: '1:Many' },
  { parent: 'sports', child: 'olympic_participation', key: 'sport_id', type: '1:Many' },
  { parent: 'sports', child: 'olympic_timeline', key: 'sport_id', type: '1:Many' },
  { parent: 'sports', child: 'event_overlap', key: 'sport_id', type: '1:Many' },
  { parent: 'sports', child: 'sport_notes', key: 'sport_id', type: '1:Many' },
  { parent: 'auth.users', child: 'profiles', key: 'id', type: '1:1' },
  { parent: 'auth.users', child: 'user_roles', key: 'user_id', type: '1:Many' },
  { parent: 'form_definitions', child: 'form_submissions', key: 'form_id', type: '1:Many' },
];

export const ROUTES: { path: string; name: string; description: string; access: string }[] = [
  { path: '/', name: 'Home', description: 'Landing dashboard: hero, countdown to LA28/AG2026, headline stats, medal chart and searchable sports grid.', access: 'Public' },
  { path: '/sport/:sportId', name: 'Sport Detail', description: 'Full profile of one sport: events split by games, discipline breakdown, centres, capacity, medal history, timeline, readiness score and collaborative notes.', access: 'Public (notes need sign-in)' },
  { path: '/infrastructure', name: 'Infrastructure', description: 'Centre explorer with three view modes: by region, by state and by type; global search, filters and centre detail dialogs.', access: 'Public' },
  { path: '/infrastructure/insights', name: 'Infrastructure Insights', description: 'Aggregated analysis of centre coverage, gaps and distribution.', access: 'Public' },
  { path: '/infrastructure/stc', name: 'STC Data Collection', description: 'List of State Training Centres with assessment progress; entry point to the assessment form.', access: 'Authenticated' },
  { path: '/infrastructure/stc/:centreId', name: 'STC Form (legacy)', description: 'Earlier conversational version of the assessment form.', access: 'Assigned users / admin' },
  { path: '/infrastructure/stc/:centreId/form', name: 'STC Form V4', description: 'Current 10-section assessment form with sidebar navigation, autosave and validation.', access: 'Assigned users / admin' },
  { path: '/infrastructure/stc/:centreId/report', name: 'STC Report', description: 'Read-only report of a submitted assessment with scoring and PDF export.', access: 'Assigned users / admin' },
  { path: '/infrastructure/hostel-dashboard', name: 'Hostel Dashboard', description: 'Cross-centre analysis of hostel capacity, sanitation and quality answers.', access: 'Authenticated' },
  { path: '/infrastructure/hr-dashboard', name: 'HR Dashboard', description: 'Coaching and support staff coverage across centres.', access: 'Authenticated' },
  { path: '/capacity', name: 'Capacity', description: 'NCOE and STC sanctioned vs existing strength, utilisation and vacancy analysis.', access: 'Public' },
  { path: '/geographic', name: 'Geographic Analytics', description: 'Interactive India map (Mapbox) with state-level centre and capacity metrics.', access: 'Public' },
  { path: '/medals', name: 'Medals', description: "India's Olympic medal history with charts, filters and timeline. /history is an alias.", access: 'Public' },
  { path: '/chintan', name: 'Chintan Presentation', description: 'Standalone slide deck (3D carousel, capture-mode PDF export).', access: 'Public' },
  { path: '/nada', name: 'NADA Presentation', description: 'Standalone anti-doping slide deck with keyboard shortcuts and fullscreen mode.', access: 'Public' },
  { path: '/schema', name: 'Schema Documentation', description: 'On-screen, printable summary of the database schema and routes.', access: 'Public' },
  { path: '/form/:formId', name: 'Public Form', description: 'Renders a dynamic form definition for public submission.', access: 'Public' },
  { path: '/auth', name: 'Authentication', description: 'Sign in / sign up. Supports username mode (appends the internal domain) and email mode, plus forgot-password.', access: 'Public' },
  { path: '/reset-password', name: 'Reset Password', description: 'Landing page for the password recovery link.', access: 'Public' },
  { path: '/setup', name: 'First Admin Setup', description: 'One-time bootstrap that promotes the first user to admin when no admin exists.', access: 'Public until first admin exists' },
  { path: '/admin', name: 'Admin Home', description: 'Tile navigation for all admin tools.', access: 'Admin' },
  { path: '/admin/dashboard', name: 'Admin Dashboard', description: 'Operational metrics: users, pending access requests, table counts and charts.', access: 'Admin' },
  { path: '/admin/data', name: 'Data Manager', description: 'Browse and inline-edit core tables; export the current table or all data.', access: 'Admin' },
  { path: '/admin/export', name: 'Export & Documentation', description: 'Download all portal data as CSV, this documentation file, or a complete bundle.', access: 'Admin' },
  { path: '/admin/editor', name: 'Data Editor', description: 'Focused record editor with audit logging.', access: 'Admin / permitted editors' },
  { path: '/admin/forms', name: 'Form Builder', description: 'Create and manage dynamic form definitions and view submissions.', access: 'Admin' },
  { path: '/admin/users', name: 'User Management', description: 'Roles, centre/region assignments, access requests and bulk user creation.', access: 'Admin' },
  { path: '/admin/region-mapping', name: 'Region Mapping', description: 'Assign each state to a SAI regional centre.', access: 'Admin' },
  { path: '/admin/audit-logs', name: 'Audit Logs', description: 'Searchable history of data changes with before/after values.', access: 'Admin' },
  { path: '/import', name: 'Import Data', description: 'Bulk CSV import into reference tables via edge functions.', access: 'Admin' },
];

function mdTable(headers: string[], rows: string[][]): string {
  const esc = (s: string) => s.replace(/\|/g, '\\|');
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(r => `| ${r.map(esc).join(' | ')} |`),
  ].join('\n');
}

export interface DocContext {
  /** Row counts per table, when a data snapshot was taken. */
  counts?: Record<string, number>;
  generatedBy?: string;
}

export function buildPortalDocumentation(ctx: DocContext = {}): string {
  const now = new Date();
  const { counts, generatedBy } = ctx;

  const parts: string[] = [];

  parts.push(`# Khel Drishti — Portal Documentation

Generated: ${now.toISOString()} (${now.toLocaleString('en-IN')})${generatedBy ? `  \nGenerated by: ${generatedBy}` : ''}

---

## 1. Overview

**Khel Drishti** is India's sports ecosystem analytics portal, built to track readiness for the **Los Angeles 2028 Olympics** and the **Aichi–Nagoya Asian Games 2026**.

It brings four kinds of information into one place:

1. **Demand** — what will be contested: sports, disciplines and events at LA28 and AG2026, including overlap between the two games.
2. **Supply** — what India has: training centres (NCOE, STC, KIC, KISCE), the sports each runs, and their sanctioned versus actual athlete strength.
3. **Performance** — historical Olympic medals, participation and milestone timeline.
4. **Field intelligence** — a structured assessment form completed by State Training Centres covering infrastructure, hostels, staff, medical, equipment and talent pipeline.

On top of this sit analytics pages, an admin back office, role-scoped access control, and a full audit trail.

---

## 2. Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + TypeScript, Vite |
| Styling | Tailwind CSS with semantic HSL design tokens |
| Components | shadcn/ui (Radix primitives) |
| Data fetching | TanStack React Query (staleTime 5 min, gcTime 10 min) |
| Charts | Recharts |
| Maps | Mapbox GL (token served by an edge function) |
| Backend | Lovable Cloud (managed Postgres, auth, storage, edge functions) |
| Auth | Email/password sessions, role table + security-definer checks |
| Exports | jsPDF / html2canvas (reports and decks), JSZip (data bundles) |
`);

  // Schema
  parts.push(`---

## 3. Database Schema

The database uses a single \`public\` schema. Every table has Row-Level Security enabled; reference data is publicly readable while operational and personal tables are restricted.
`);

  for (const g of SCHEMA_GROUPS) {
    parts.push(`### 3.${SCHEMA_GROUPS.indexOf(g) + 1} ${g.group}\n\n${g.intro}\n`);
    for (const t of g.tables) {
      const rowCount = counts?.[t.name];
      parts.push(`#### \`${t.name}\`

- **Primary key:** ${t.pk}${rowCount !== undefined ? `\n- **Rows at export time:** ${rowCount.toLocaleString()}` : ''}
- **Purpose:** ${t.description}
- **Columns:** ${t.columns}${t.fks ? `\n- **Foreign keys:** ${t.fks}` : ''}
`);
    }
  }

  parts.push(`### 3.8 Relationships

${mdTable(['Parent', 'Child', 'Join key', 'Cardinality'], RELATIONSHIPS.map(r => [r.parent, r.child, r.key, r.type]))}

### 3.9 Entity Diagram

\`\`\`text
                       +-----------+
                       |  sports   |
                       +-----+-----+
        +--------------------+--------------------+-------------------+
        |            |             |              |                   |
  +-----v------+ +---v----+  +-----v---------+ +--v-------------+ +---v---------+
  |disciplines | | events |  |centre_sport_  | |olympic_medals  | | sport_notes |
  +-----+------+ +--------+  |    links      | |participation   | +-------------+
        |                    +-----+---------+ |timeline        |
        |                          |           +----------------+
        |                    +-----v-----+
        |                    |  centres  |<---------------+
        |                    +-----+-----+                |
        |                          |                      |
        |            +-------------+-------------+        |
        |            |                           |        |
        |     +------v-------+           +-------v------+ |
        |     | stc_capacity |           | ncoe_capacity| |
        |     +--------------+           +--------------+ |
        |                                                 |
        |                     +---------------------------+
        |                     |
                        +-----v-------------+
                        | stc_detailed_data |  (one assessment per centre)
                        +-----+-------------+
                              | assessment_id
        +---------------------+-----------+------------------+
        |                     |           |                  |
+-------v---------+ +---------v-----+ +---v-------------+ +--v-----------------+
|discipline_      | | staff_roster  | | equipment_gaps  | |competition_summary |
|   strength      | +---------------+ +-----------------+ +--------------------+
+-----------------+

  auth.users ---1:1--- profiles
  auth.users ---1:M--- user_roles / user_centre_assignments / user_region_assignments
  regional_centres ---1:M--- region_state_mappings
  form_definitions ---1:M--- form_submissions
\`\`\`
`);

  // Security
  parts.push(`---

## 4. Security & Access Model

### 4.1 Roles

Roles live in a dedicated \`user_roles\` table using the \`app_role\` enum — never on \`profiles\` — so a user cannot escalate their own privileges by editing their profile.

| Role | Capabilities |
| --- | --- |
| **admin** | Full read/write on all tables, user and role management, imports, exports, form builder, audit logs, region mapping. |
| **editor** | Reads all data; writes limited to tables granted in \`user_table_permissions\` and centres/regions they are assigned to; creates and edits notes. |
| **viewer** | Reads public data, views notes, submits public forms. Default role on signup. |

### 4.2 Security-definer functions

These run with owner privileges to avoid recursive RLS evaluation:

| Function | Purpose |
| --- | --- |
| \`has_role(user_id, role)\` | Checks a role. A user may check their own role; only admins may check other users' roles. |
| \`can_edit_centre(user_id, centre_id)\` | True for admins, directly assigned users, or regional officers whose region contains the centre with edit-level access. |
| \`can_view_centre(user_id, centre_id)\` | True for anyone who can edit, plus view-only regional officers. |
| \`can_edit_table(user_id, table_name)\` | Admins, or editors with an explicit table permission row. |
| \`get_user_accessible_centres(user_id)\` | Returns every centre id a user can reach through role, direct assignment, or region. |
| \`setup_first_admin(user_id)\` | One-time bootstrap; refuses to run once any admin exists. |
| \`handle_new_user()\` | Trigger on signup: creates the profile, records the requested centre/region, assigns the \`viewer\` role. |

### 4.3 Row-Level Security patterns

- Reference tables (sports, disciplines, events, centres, capacity, medals) allow public read; writes require admin or a granted editor.
- Assessment tables are scoped by \`can_view_centre\` / \`can_edit_centre\`.
- \`profiles\` allows a user to read and update only their own record; inserts and deletes are handled by triggers and denied to clients.
- \`audit_logs\` is insert-and-read only — updates and deletes are denied to every client role.
- Every public table also carries explicit GRANTs; RLS alone is not sufficient for the data API.

### 4.4 Storage

Private bucket \`stc-attachments\` holds files uploaded from the STC assessment form and note attachments; access is mediated through signed URLs.

### 4.5 Edge functions

| Function | Purpose |
| --- | --- |
| \`import-data\` | Bulk CSV import into reference tables. |
| \`import-centres\` | Centre-specific import with normalisation. |
| \`get-mapbox-token\` | Serves the public Mapbox token without embedding it in the bundle. |
| \`bulk-create-users\` | Admin tool to create many accounts with roles and assignments in one pass. |
`);

  // Navigation
  parts.push(`---

## 5. Site Navigation

### 5.1 Route map

${mdTable(['Path', 'Page', 'Access', 'Description'], ROUTES.map(r => [r.path, r.name, r.access, r.description]))}

### 5.2 Navigation hierarchy

\`\`\`text
Top navigation (DashboardLayout)
├── Home (/)
├── Sports          -> sports grid on home, then /sport/:sportId
├── Infrastructure  -> /infrastructure
│   ├── Overview (region / state / type view modes)
│   ├── Insights          (/infrastructure/insights)
│   ├── STC Data          (/infrastructure/stc -> /:centreId/form -> /:centreId/report)
│   ├── Hostel Dashboard  (/infrastructure/hostel-dashboard)
│   └── HR Dashboard      (/infrastructure/hr-dashboard)
├── Capacity        (/capacity)
├── Geographic      (/geographic)
├── Medals          (/medals)
├── Global search   (⌘K / Ctrl-K from anywhere)
└── Admin (visible to admins only)  -> /admin
    ├── Dashboard          (/admin/dashboard)
    ├── Data Manager       (/admin/data)
    ├── Export & Docs      (/admin/export)
    ├── Form Builder       (/admin/forms)
    ├── User Management    (/admin/users)
    ├── Region Mapping     (/admin/region-mapping)
    └── Audit Logs         (/admin/audit-logs)

Mobile: the same primary destinations are exposed through a fixed bottom navigation bar.
\`\`\`
`);

  // Design system
  parts.push(`---

## 6. UI / UX Design System

### 6.1 Brand identity

The palette is drawn from the Indian flag and applied through semantic HSL tokens defined in \`src/index.css\` — components never hardcode colour values.

| Token | Light value (HSL) | Hex reference | Usage |
| --- | --- | --- | --- |
| \`--primary\` / \`--saffron\` | 30 100% 60% | #FF9933 | Primary actions, highlights, active states |
| \`--accent\` / \`--india-green\` | 114 89% 28% | #138808 | Success, positive deltas, secondary emphasis |
| \`--navy\` / \`--india-navy\` | 240 100% 25% | #000080 | Informational accents, headings on light surfaces |
| \`--background\` | 35 40% 96% | warm cream | Page background with a subtle saffron tint |
| \`--card\` | 40 30% 99% | near-white | Cards and raised surfaces |
| \`--muted\` / \`--muted-foreground\` | 35 15% 94% / 220 10% 40% | — | Secondary text and quiet surfaces |
| \`--destructive\` | 0 72% 51% | — | Destructive actions and errors |
| \`--gold\` / \`--silver\` / \`--bronze\` | 45 93% 47% / 0 0% 75% / 30 55% 45% | — | Medal visualisations |
| \`--radius\` | 0.75rem | — | Global corner radius |

A dark theme redefines the same tokens; theme state is handled by \`AppThemeProvider\` and persisted locally.

### 6.2 Typography

- Display/heading face used via the \`font-display\` utility for page titles and hero copy.
- Body text uses the sans stack at comfortable measure; fonts are preloaded in \`index.html\`.
- Scale: page titles \`text-3xl\`/\`text-4xl\`, section titles \`text-lg\`/\`text-xl\`, body \`text-sm\`/\`text-base\`, metadata \`text-xs\` in muted foreground.

### 6.3 Layout patterns

- \`DashboardLayout\` provides the shell: top navigation, global search provider, content container and mobile bottom nav.
- Content is card-based: metric cards in responsive grids (2 columns on mobile, 4 on desktop), then charts, then tables.
- Tables scroll horizontally on small screens; long lists are virtualised or paged.
- Dialogs and sheets are used for drill-downs (centre detail, note editor) so context is preserved.
- Empty, loading and error states are explicit: spinners for in-flight work, muted placeholder text for empty results, toasts for outcomes.

### 6.4 Interaction and motion

- Hover elevation and colour shifts on interactive cards; focus rings driven by \`--ring\`.
- Scroll-triggered reveal animations on marketing-style sections (\`useScrollAnimation\`).
- Keyboard support: ⌘K / Ctrl-K opens global search; the STC form supports arrow-key section navigation and swipe on touch devices; presentation decks bind arrow keys and fullscreen.
- Toasts confirm every mutation; destructive actions require confirmation.

### 6.5 Charts

Recharts throughout, always coloured with design tokens (\`hsl(var(--primary))\`, \`hsl(var(--chart-2))\`, medal tokens for medal charts), with 30% opacity grids and responsive containers.

### 6.6 Accessibility

Semantic landmarks, one H1 per page, labelled form controls, ARIA roles on custom widgets, visible focus states, and colour pairings chosen to keep text legible in both themes.
`);

  // Features
  parts.push(`---

## 7. Feature Guide

### 7.1 Global search

A command-palette search (⌘K) backed by an in-memory index built from sports, disciplines, events, centres and regional centres. It matches sport names, states, districts and centre names, groups results by entity type, and routes to the right destination (\`/sport/:id\`, \`/infrastructure?centre=:id\`, \`/geographic?state=:name\`). Available from the home hero and the infrastructure header.

### 7.2 Home dashboard

Countdown to both games, headline ecosystem statistics, medal trend chart, and a searchable sports grid with games-presence badges.

### 7.3 Sport detail

Per-sport view combining event analysis (LA28 / AG2026 / both), disciplines, supporting centres, capacity, medal history, milestone timeline, a readiness indicator, and a notes thread with pinning and attachments.

### 7.4 Infrastructure explorer

Three ways to browse centres — by SAI region, by state, and by centre type — with counts computed on unique \`centre_id\` values, drill-down dialogs, and admin-only mapping controls. All centres are loaded with 1000-row batching so nothing is truncated.

### 7.5 STC assessment form

A ten-section form (identity, disciplines, infrastructure, hostel, staff, medical, equipment, talent, discipline detail/vision, attachments) with:

- sidebar and mobile navigation with per-section progress,
- autosave of partial answers into \`stc_detailed_data\`,
- section-level validation with inline messages,
- derived KPIs, data-quality flags and a scoring engine computed on save,
- a review page before submission,
- blank-form downloads (PDF and Word) for offline collection, and a PDF export of the completed report.

### 7.6 Capacity, geographic and medals analytics

Capacity compares sanctioned versus existing strength for NCOE and STC with utilisation and vacancy. Geographic analytics renders a Mapbox map of India with state-level metrics. Medals presents historical performance with filters, charts and a timeline; sport linkage falls back to \`sport_std\` when \`sport_id\` is unavailable.

### 7.7 Admin back office

Dashboard metrics, Data Manager (browse, inline edit, export), Export & Documentation, Form Builder, User Management (roles, centre/region assignment, access request review, bulk user creation), Region Mapping and Audit Logs.

### 7.8 Presentations

Two self-contained decks — Chintan (3D carousel, capture-mode PDF export) and NADA (technical high-contrast aesthetic, keyboard shortcuts, fullscreen) — served as ordinary routes.
`);

  // Conventions
  parts.push(`---

## 8. Data Conventions & Gotchas

- **Centre counts** must be computed on distinct \`centre_id\`; capacity tables contain one row per discipline, so raw row counts overstate the number of centres (NCOE = 25, STC = 66).
- **Row limits**: the data API caps responses at 1000 rows. All full-dataset reads use range-based batching.
- **State names** are standardised on load; the region roll-up matches either \`display_name\` or \`name\` of a regional centre.
- **Sport identifiers** use the \`SPORT_\` prefix convention and are the join key across every analytics table.
- **Medal linkage** falls back to \`sport_std\` text matching when \`sport_id\` is null on legacy rows.
- **Raw versus standardised columns**: \`*_raw\` columns preserve source values; \`*_std\` columns are the cleaned values used for joins and display.
- **JSON sections** in \`stc_detailed_data\` are the source of truth for form answers; the normalised child tables are derived for analysis and reporting.
- **Caching**: React Query defaults to a 5-minute stale time, so freshly written data may need an explicit invalidation to appear immediately.
`);

  // Export contents
  parts.push(`---

## 9. About This Export

Data exports are produced client-side using the signed-in admin's session, so Row-Level Security still applies to everything written to the archive.

Archive layout:

\`\`\`text
khel-drishti-bundle_<date>.zip
├── README.txt                     table list with row counts
├── KHEL-DRISHTI-DOCUMENTATION.md  this document
└── data/
    ├── sports.csv
    ├── centres.csv
    ├── ... one CSV per table ...
    └── <table>__ERROR.txt         only if a table could not be read
\`\`\`

CSV files are UTF-8 with a header row; JSON columns are serialised as JSON strings; array columns are serialised as JSON arrays.
${counts ? `\n### Row counts at export time\n\n${mdTable(['Table', 'Rows'], Object.entries(counts).map(([t, c]) => [t, c.toLocaleString()]))}\n` : ''}
---

*Khel Drishti — India Sports Analytics Portal. Document generated automatically from the live application.*
`);

  return parts.join('\n');
}

export const DOC_FILENAME = 'KHEL-DRISHTI-DOCUMENTATION.md';
