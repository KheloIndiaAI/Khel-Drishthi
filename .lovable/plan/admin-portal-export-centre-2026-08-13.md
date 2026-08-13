# Admin Portal Export Centre

Add one place in the admin panel to download everything: all portal data as CSVs, plus a full written documentation file (Markdown) covering the database schema, UI/UX design system, navigation map, roles/permissions and feature descriptions.

## What the user gets

A new admin page **Export & Documentation** (`/admin/export`), reachable from a card on the admin dashboard, with three actions:

1. **Download all data (ZIP)** — every public table exported as CSV, complete rows (not just the visible page), plus a `README.txt` listing tables and row counts.
2. **Download portal documentation (.md)** — a single comprehensive Markdown file describing the whole portal.
3. **Download complete bundle (ZIP)** — data CSVs + the documentation file together, one click.

Existing export buttons on the Data Manager page stay as they are.

## What goes into the documentation file

- Portal overview and purpose (LA28 / AG2026 readiness tracking).
- Database schema: every table grouped by domain (core sports, infrastructure, capacity, STC assessment, performance/history, auth & collaboration, admin/audit), with columns, types, primary keys, foreign keys, and a plain-language description per table.
- Relationships map (parent → child, join key, cardinality) plus an ASCII entity diagram.
- Row counts snapshot taken at download time.
- Security model: roles (admin/editor/viewer), the role table pattern, RLS approach, and the access helper functions (centre/region assignment logic).
- Site navigation: full route table (public, infrastructure, analytics, admin, forms), what each page does, and the nav/tab hierarchy.
- UI/UX design system: colour tokens and brand palette (saffron/green/navy), typography, component library (shadcn/ui), layout patterns, dark mode, responsive and mobile bottom-nav behaviour, animation and chart conventions.
- Feature guides: global search, STC data-collection form (sections, autosave, scoring, exports), infrastructure explorer, capacity and medals analytics, form builder, user management, audit logs, region mapping.
- Data conventions and gotchas: unique-centre counting rules, 1000-row batching, state name standardisation, sport ID format, medal fallback logic.
- Operational notes: import paths, storage bucket, edge functions.

## Technical approach

- `src/pages/AdminExport.tsx` — new page, admin-guarded with the same role check pattern used by the other admin pages; route added in `src/App.tsx`; entry card added to `src/pages/AdminDashboard.tsx`.
- `src/lib/exportAllData.ts` — shared helper: table list, 1000-row batched fetch, row-to-CSV conversion (quote escaping, null handling), JSZip bundling. Data Manager's existing export is refactored to call this helper so there is one implementation.
- `src/lib/portalDocumentation.ts` — builds the Markdown document as a template string; takes the live row-count snapshot as input so counts are current. Schema, routes, design tokens and feature text are authored as structured constants so the file stays editable.
- No backend or schema changes; everything runs client-side using the existing authenticated session, so RLS still applies to what an admin can read.
- Downloads use blob URLs; ZIP via the already-installed `jszip`.

## Notes

- Export covers all tables the admin role can read; any table that errors is recorded in the ZIP as an `__ERROR.txt` entry rather than failing the whole download.
- Large exports show progress (table N of M) and a spinner on the button.
