
# Global Search Upgrade — Home Page Search Bar

## Current State
The search input in `src/components/home/SportsGrid.tsx` only filters the on-page sports cards by `sport_name`. It does not search states, districts, centres, disciplines, or events.

## Goal
Turn the home search bar into a **global, command-palette style search** that indexes every major entity in our database and lets the user jump directly to the relevant page.

---

## What Will Be Searchable

| Entity | Source Table | Result Action |
|--------|--------------|---------------|
| Sport | `sports` (sport_name) | Navigate to `/sport/:sport_id` |
| Discipline | `disciplines` (discipline_std) | Navigate to parent sport detail |
| Event | `events` (event_std) | Navigate to parent sport (Events tab) |
| Centre (NCOE / STC / KISCE / KIC) | `centres` (centre_name, centre_id) | Open centre detail dialog / Infrastructure page |
| State | `centres.state` + `region_state_mappings.state_name` (distinct) | Navigate to `/geographic-analytics?state=...` |
| District | `centres.district` (distinct) | Navigate to Infrastructure filtered by district |
| Regional Centre | `regional_centres` (display_name) | Navigate to Infrastructure regional view |

Each result row shows: icon + name + entity-type badge + secondary line (e.g. state for a centre, sport for a discipline).

---

## UX Design

### 1. Replace the inline "Search sports..." input
- The current input in `SportsGrid` becomes a **trigger button** ("Search anything — sports, states, centres…") with a `⌘K` hint on desktop.
- Clicking it (or pressing `⌘K` / `Ctrl+K` / `/`) opens a full **Command Palette dialog** (shadcn `CommandDialog`, already in repo at `src/components/ui/command.tsx`).

### 2. Command palette layout
```text
┌────────────────────────────────────────────────────┐
│ 🔍  Search sports, states, centres, events…       │
├────────────────────────────────────────────────────┤
│ SPORTS (3)                                         │
│  🏹  Archery                       Olympic · TOPS  │
│  🏊  Aquatics                      Olympic         │
│ DISCIPLINES (2)                                    │
│  •  Swimming               under Aquatics          │
│ EVENTS (4)                                         │
│  •  100m Freestyle Men     Aquatics · LA28 + AG26  │
│ CENTRES (5)                                        │
│  🏟  NCOE Rohtak            Haryana · NCOE         │
│ STATES (2)                                         │
│  📍 Haryana                42 centres              │
│ DISTRICTS (2)                                      │
│  📍 Rohtak, Haryana        3 centres               │
└────────────────────────────────────────────────────┘
Recent searches shown when query is empty.
```

### 3. Mobile
Bottom-sheet style full-screen search opened from the same trigger button. No keyboard shortcut hint.

---

## Technical Implementation

### A. New hook: `src/hooks/useGlobalSearchIndex.ts`
- Single `useQuery` (key `["global-search-index"]`, `staleTime: 5 min`) that fetches in parallel:
  - `sports` (sport_id, sport_name, present_la28, present_ag2026, is_tops, is_tagg)
  - `disciplines` (discipline_id, discipline_std, sport_id)
  - `events` (event_id, event_std, sport_id, present_la28, present_ag2026) — capped at first 1000 (DB default limit; we'll page if needed)
  - `centres` (centre_id, centre_name, centre_type, state, district)
  - `regional_centres`
- Builds a flat in-memory index:  
  `{ id, type, label, sublabel, keywords, route, payload }[]`
- Derives distinct `states` and `districts` from `centres` rows.
- Returns `{ index, isLoading }`.

### B. New component: `src/components/search/GlobalSearch.tsx`
- Uses shadcn `CommandDialog` + `CommandInput` + `CommandList` + grouped `CommandGroup`s by entity type.
- Fuzzy matching: simple case-insensitive `includes` on `label + keywords` is sufficient (the index is small — a few thousand rows). If perf becomes an issue we can swap to `fuse.js` later.
- Caps each group at 6 results with a "Show all" footer (optional v2).
- Keyboard shortcuts: `⌘K` / `Ctrl+K` / `/` to open, `Esc` to close, arrows + enter to navigate.
- Persists last 5 queries in `localStorage` for "Recent searches".

### C. Wire-up points
- `src/components/home/SportsGrid.tsx` — replace the `<Input>` block with a `<GlobalSearchTrigger />` button. Keep the **filter chips** (All / Olympic / TOPS etc.) since they filter the grid below.
- `src/components/layout/DashboardLayout.tsx` — mount `<GlobalSearch />` once at the layout level so `⌘K` works on every page (the dialog itself lives there; the home trigger just opens it via a shared context or zustand-free `useState` in layout, exposed through a tiny `SearchContext`).
- `src/components/layout/MobileBottomNav.tsx` — add a Search icon entry that opens the same dialog.

### D. Routing per result type
| Type | Route |
|------|-------|
| sport / discipline / event | `/sport/${sport_id}` (events/disciplines append `?tab=events` or `?discipline=...`) |
| centre | `/infrastructure?centre=${centre_id}` (opens existing `CentreDetailDialog`) |
| state | `/geographic-analytics?state=${encodeURIComponent(state)}` |
| district | `/infrastructure?district=${encodeURIComponent(district)}` |
| regional_centre | `/infrastructure?region=${name}` |

The target pages already accept most of these filters; minor reading of query-params will be added where missing (Infrastructure page).

---

## Files

### New
- `src/hooks/useGlobalSearchIndex.ts`
- `src/components/search/GlobalSearch.tsx` (dialog + provider)
- `src/components/search/GlobalSearchTrigger.tsx` (button used on home + layout header)

### Modified
- `src/components/home/SportsGrid.tsx` — swap input for trigger; remove local `search` state but keep filter chips.
- `src/components/layout/DashboardLayout.tsx` — mount provider + dialog, add `⌘K` listener.
- `src/components/layout/MobileBottomNav.tsx` — add search entry (optional).
- `src/pages/Infrastructure.tsx` — read `?centre=`, `?district=`, `?region=` query params and apply.

No database or schema changes required — everything reads from existing tables via the public-read RLS policies already in place.

---

## Out of Scope (can be follow-ups)
- Server-side full-text search (Postgres `tsvector`) — only needed if index grows past ~10k rows.
- Searching athletes (KIA) — will plug in automatically once the `kia_athletes` table from the previously approved plan is created; the index hook just needs one more query added.
- Search analytics / "popular searches".
