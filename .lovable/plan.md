# Add Global Search Bar to Infrastructure Page

## Goal
Add the existing global search trigger to the Infrastructure page so users can search across the entire database (sports, states, districts, centres, events) from the Infrastructure view.

## Changes

### File: `src/pages/Infrastructure.tsx`

1. **Import `GlobalSearchTrigger`** from `@/components/search/GlobalSearchTrigger`
2. **Add search bar to page header** — place `<GlobalSearchTrigger />` in the header section below the page title and description, visible on all three views (By Region, By State, By Type)
3. **Keep existing local search** in the "By Type" view (filters centres by name/state/district within the current list) — the global search serves a different purpose (navigation to any entity across the app)

## Layout
```text
┌─────────────────────────────────────────────────────────────┐
│ Infrastructure                                                │
│ Explore India's sports training ecosystem...                  │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Search centres, states, sports…] ⌘K  │ View Insights    │
├─────────────────────────────────────────────────────────────┤
│ Summary Cards                                               │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

## No database changes required
The global search index already queries existing `sports`, `disciplines`, `events`, `centres`, `regional_centres` tables via `useGlobalSearchIndex` hook.