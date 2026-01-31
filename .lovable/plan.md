

# Event Analysis Section Enhancement Plan

## Overview
Enhance the Sport Detail page's Events Analysis section to provide clearer, more detailed event information grouped by discipline with better comparison views between LA 2028 Olympics and Asian Games 2026.

---

## Part 1: Add Discipline Breakdown View

### New Feature: Events by Discipline Section

**Location:** After the Gender Distribution section in the Events Analysis card

**Data Source:** Join `events` table with `disciplines` table using `discipline_id`

**Display:**
- Accordion-style view where each discipline can be expanded
- Shows discipline name with event counts per game
- When expanded, lists all events with their game presence

```text
+------------------------------------------+
| Swimming (20 LA28 | 22 AG26)        [v]  |
|   100m Freestyle      Men    LA28  AG26  |
|   100m Freestyle      Women  LA28  AG26  |
|   200m Backstroke     Men    LA28  AG26  |
|   ...                                    |
+------------------------------------------+
| Diving (8 LA28 | 10 AG26)           [>]  |
+------------------------------------------+
| Artistic Swimming (2 LA28 | 2 AG26) [>]  |
+------------------------------------------+
```

---

## Part 2: Add Event Type Breakdown

### New Feature: Event Type Distribution

**Location:** Below Gender Distribution section

**Display:** Three cards showing:
- Individual Events count
- Team Events count
- Duet Events count

**Styling:** Similar to Gender Distribution with distinct colors

---

## Part 3: Enhanced Comparison Table View

### New Tab: "Compare" Tab

**Location:** Add as 5th tab in the Event Details tabs

**Features:**
- Side-by-side table showing LA28 vs AG26 events
- Grouped by discipline
- Visual indicators:
  - Green checkmark for events in both
  - Orange (LA28 only)
  - Green (AG26 only)

**Table Structure:**
| Discipline | Event | Gender | LA28 | AG26 |
|------------|-------|--------|------|------|
| Swimming | 100m Freestyle | Men | ✓ | ✓ |
| Swimming | 100m Freestyle | Women | ✓ | ✓ |
| Diving | 1m Springboard | Men | - | ✓ |

---

## Part 4: Fetch Disciplines Data

### Code Changes to `SportDetail.tsx`

**Add new query:**
```typescript
const { data: disciplines } = useQuery({
  queryKey: ["sport-disciplines", sportId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("disciplines")
      .select("*")
      .eq("sport_id", sportId)
      .order("discipline_std");
    if (error) throw error;
    return data;
  },
  enabled: !!sportId,
});
```

---

## Part 5: Computed Data for Display

### New Computed Values

```typescript
// Group events by discipline
const eventsByDiscipline = useMemo(() => {
  if (!events || !disciplines) return {};
  
  return disciplines.reduce((acc, disc) => {
    const discEvents = events.filter(e => e.discipline_id === disc.discipline_id);
    acc[disc.discipline_id] = {
      name: disc.discipline_std,
      events: discEvents,
      la28Count: discEvents.filter(e => e.present_la28 === 1).length,
      ag26Count: discEvents.filter(e => e.present_ag2026 === 1).length,
      bothCount: discEvents.filter(e => e.present_la28 === 1 && e.present_ag2026 === 1).length
    };
    return acc;
  }, {});
}, [events, disciplines]);

// Event type breakdown
const individualEvents = events?.filter(e => e.event_type_std === "Individual") || [];
const teamEvents = events?.filter(e => e.event_type_std === "Team") || [];
const duetEvents = events?.filter(e => e.event_type_std === "Duet") || [];
```

---

## Part 6: UI Component Structure

### Updated Events Analysis Card Structure

```text
Events Analysis Card
├── Header: "Events Analysis" with Trophy icon
│
├── Section 1: Games Breakdown (existing - LA28/AG26/Common cards)
│
├── Section 2: Gender Distribution (existing)
│
├── Section 3: Event Type Distribution (NEW)
│   └── 3 cards: Individual | Team | Duet
│
├── Section 4: Events by Discipline (NEW)
│   └── Accordion with expandable discipline rows
│
└── Section 5: Event Details Tabs (enhanced)
    └── Tabs: Common | LA28 Only | AG26 Only | Compare | All
```

---

## Implementation Files

| File | Changes |
|------|---------|
| `src/pages/SportDetail.tsx` | Add disciplines query, computed values, new UI sections |

---

## Visual Mockup: Events by Discipline

```text
┌─────────────────────────────────────────────────────────────┐
│  Events by Discipline                                       │
├─────────────────────────────────────────────────────────────┤
│  ▼ Swimming                           20 LA28 | 22 AG26     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Event                  │ Gender │ Type       │ Games    ││
│  │ 100m Freestyle         │ Men    │ Individual │ ●● Both  ││
│  │ 100m Freestyle         │ Women  │ Individual │ ●● Both  ││
│  │ 100m Backstroke        │ Men    │ Individual │ ●● Both  ││
│  │ 100m Backstroke        │ Women  │ Individual │ ● AG26   ││
│  └─────────────────────────────────────────────────────────┘│
│  ▶ Diving                              8 LA28 | 10 AG26     │
│  ▶ Artistic Swimming                    2 LA28 |  2 AG26    │
│  ▶ Water Polo                           2 LA28 |  2 AG26    │
│  ▶ Open Water Swimming                  2 LA28 |  0 AG26    │
└─────────────────────────────────────────────────────────────┘
```

---

## Legend for Game Indicators

- `●●` (Saffron + Green dots) = Event in both LA28 and AG26
- `●` (Saffron only) = LA28 exclusive
- `●` (Green only) = AG26 exclusive

---

## Summary of Enhancements

1. **Discipline Grouping** - Events organized by Swimming, Diving, etc.
2. **Event Type Breakdown** - Individual/Team/Duet distribution
3. **Compare Tab** - Side-by-side LA28 vs AG26 comparison table
4. **Expandable Accordion** - Clean UI to explore events by discipline
5. **Enhanced Visual Indicators** - Clear game presence markers

**Total Files Modified:** 1 (`src/pages/SportDetail.tsx`)

