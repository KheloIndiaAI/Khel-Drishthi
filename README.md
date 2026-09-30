# Khel Drishti

Create an India Sports Ecosystem Dashboard with Lovable Cloud as the backend database.




FIRST, create the database with this SQL schema:



-- ============================================================================
-- INDIA SPORTS ECOSYSTEM DASHBOARD - DATABASE SCHEMA
-- ============================================================================
-- Run this schema FIRST before importing any CSV data
-- Tables are ordered: Master tables first, then dependent tables
-- ============================================================================

-- ============================================================================
-- SECTION 1: MASTER TABLES (No Foreign Keys)
-- ============================================================================

-- Table 1: SPORTS (Master)
-- Primary reference table for all sports
CREATE TABLE sports (
    sport_id TEXT PRIMARY KEY,
    sport_name TEXT NOT NULL,
    present_la28 BOOLEAN DEFAULT FALSE,
    present_ag2026 BOOLEAN DEFAULT FALSE,
    la28_events INTEGER DEFAULT 0,
    ag2026_events INTEGER DEFAULT 0,
    kic_centres INTEGER DEFAULT 0,
    kisce_centres INTEGER DEFAULT 0,
    stc_centres INTEGER DEFAULT 0,
    ncoe_centres INTEGER DEFAULT 0,
    existing_athletes INTEGER DEFAULT 0,
    sanctioned_capacity INTEGER DEFAULT 0,
    is_tops BOOLEAN DEFAULT FALSE,
    is_tagg BOOLEAN DEFAULT FALSE,
    is_teams BOOLEAN DEFAULT FALSE,
    nis_diploma_status TEXT,
    asmita_league_status TEXT,
    sport_category TEXT CHECK (sport_category IN ('Demand+Supply', 'DemandOnly', 'SupplyOnly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: CENTRES (Master)
-- All training centres across India
CREATE TABLE centres (
    centre_id TEXT PRIMARY KEY,
    centre_type TEXT NOT NULL CHECK (centre_type IN ('KIC', 'KISCE', 'STC', 'NCOE')),
    centre_name TEXT NOT NULL,
    centre_name_raw TEXT,
    state TEXT NOT NULL,
    district TEXT,
    region_unit TEXT,
    programme_subtype TEXT,
    operational_status TEXT,
    source_dataset TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 2: FIRST-LEVEL DEPENDENT TABLES (FK to Master Tables)
-- ============================================================================

-- Table 3: DISCIPLINES
-- Sub-categories within sports
CREATE TABLE disciplines (
    discipline_id TEXT PRIMARY KEY,
    sport_id TEXT NOT NULL REFERENCES sports(sport_id) ON DELETE CASCADE,
    discipline_std TEXT NOT NULL,
    discipline_raw TEXT,
    present_la28 INTEGER DEFAULT 0,
    present_ag2026 INTEGER DEFAULT 0,
    la28_event_count INTEGER DEFAULT 0,
    ag2026_event_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: CENTRE_SPORT_LINKS (Junction Table)
-- Many-to-many relationship between centres and sports
CREATE TABLE centre_sport_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bridge_id TEXT UNIQUE,
    centre_id TEXT NOT NULL REFERENCES centres(centre_id) ON DELETE CASCADE,
    sport_id TEXT NOT NULL REFERENCES sports(sport_id) ON DELETE CASCADE,
    centre_type TEXT,
    state TEXT,
    district TEXT,
    sport_name TEXT,
    discipline_id TEXT,
    discipline_name TEXT,
    source_dataset TEXT,
    programme_subtype TEXT,
    operational_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(centre_id, sport_id)
);

-- Table 5: OLYMPIC_MEDALS
-- Historical medal records
CREATE TABLE olympic_medals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    year_raw INTEGER,
    games_name TEXT,
    athlete_or_team TEXT NOT NULL,
    medal TEXT NOT NULL CHECK (medal IN ('Gold', 'Silver', 'Bronze')),
    sport_id TEXT REFERENCES sports(sport_id) ON DELETE SET NULL,
    sport_raw TEXT,
    sport_std TEXT,
    event_raw TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 6: OLYMPIC_PARTICIPATION
-- Athletes sent to each Olympics by sport
CREATE TABLE olympic_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    year_raw INTEGER,
    games_name TEXT,
    sport_id TEXT REFERENCES sports(sport_id) ON DELETE SET NULL,
    sport_raw TEXT,
    sport_std TEXT,
    athletes INTEGER DEFAULT 0,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 7: OLYMPIC_TIMELINE
-- Historical milestones
CREATE TABLE olympic_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    years_raw TEXT,
    year_start INTEGER,
    years_list TEXT,
    milestone_title TEXT NOT NULL,
    milestone_description TEXT,
    sport_id TEXT REFERENCES sports(sport_id) ON DELETE SET NULL,
    sport_guess_raw TEXT,
    sport_std TEXT,
    source TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 3: SECOND-LEVEL DEPENDENT TABLES
-- ============================================================================

-- Table 8: EVENTS
-- Individual medal events
CREATE TABLE events (
    event_id TEXT PRIMARY KEY,
    sport_id TEXT NOT NULL REFERENCES sports(sport_id) ON DELETE CASCADE,
    discipline_id TEXT REFERENCES disciplines(discipline_id) ON DELETE SET NULL,
    event_std TEXT NOT NULL,
    event_raw TEXT,
    gender_std TEXT CHECK (gender_std IN ('Men', 'Women', 'Mixed', 'Open')),
    event_type_std TEXT,
    participant_type TEXT,
    present_la28 INTEGER DEFAULT 0,
    present_ag2026 INTEGER DEFAULT 0,
    la28_men INTEGER DEFAULT 0,
    la28_women INTEGER DEFAULT 0,
    la28_total INTEGER DEFAULT 0,
    ag2026_men INTEGER DEFAULT 0,
    ag2026_women INTEGER DEFAULT 0,
    ag2026_total INTEGER DEFAULT 0,
    both INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: CAPACITY TABLES
-- ============================================================================

-- Table 9: NCOE_CAPACITY
-- National Centre of Excellence athlete capacity
CREATE TABLE ncoe_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id TEXT REFERENCES centres(centre_id) ON DELETE CASCADE,
    centre_name TEXT,
    region TEXT,
    state TEXT,
    sport_id TEXT REFERENCES sports(sport_id) ON DELETE CASCADE,
    discipline_raw TEXT,
    san_res_boys INTEGER DEFAULT 0,
    san_res_girls INTEGER DEFAULT 0,
    san_res_total INTEGER DEFAULT 0,
    san_nonres_boys INTEGER DEFAULT 0,
    san_nonres_girls INTEGER DEFAULT 0,
    san_nonres_total INTEGER DEFAULT 0,
    san_grand_total INTEGER DEFAULT 0,
    ex_res_boys INTEGER DEFAULT 0,
    ex_res_girls INTEGER DEFAULT 0,
    ex_res_total INTEGER DEFAULT 0,
    ex_nonres_boys INTEGER DEFAULT 0,
    ex_nonres_girls INTEGER DEFAULT 0,
    ex_nonres_total INTEGER DEFAULT 0,
    ex_grand_total INTEGER DEFAULT 0,
    is_para BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 10: STC_CAPACITY
-- SAI Training Centre athlete capacity
CREATE TABLE stc_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id TEXT REFERENCES centres(centre_id) ON DELETE CASCADE,
    centre_name TEXT,
    region TEXT,
    state TEXT,
    sport_id TEXT REFERENCES sports(sport_id) ON DELETE CASCADE,
    discipline_raw TEXT,
    san_res_boys INTEGER DEFAULT 0,
    san_res_girls INTEGER DEFAULT 0,
    san_res_total INTEGER DEFAULT 0,
    san_nonres_boys INTEGER DEFAULT 0,
    san_nonres_girls INTEGER DEFAULT 0,
    san_nonres_total INTEGER DEFAULT 0,
    san_grand_total INTEGER DEFAULT 0,
    ex_res_boys INTEGER DEFAULT 0,
    ex_res_girls INTEGER DEFAULT 0,
    ex_res_total INTEGER DEFAULT 0,
    ex_nonres_boys INTEGER DEFAULT 0,
    ex_nonres_girls INTEGER DEFAULT 0,
    ex_nonres_total INTEGER DEFAULT 0,
    ex_grand_total INTEGER DEFAULT 0,
    is_para BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 5: APPLICATION TABLES (User-Generated Content)
-- ============================================================================

-- Table 11: USERS
-- User authentication and roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    organization TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Table 12: SPORT_NOTES
-- Knowledge base notes for each sport
CREATE TABLE sport_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id TEXT NOT NULL REFERENCES sports(sport_id) ON DELETE CASCADE,
    note_type TEXT NOT NULL CHECK (note_type IN (
        'catchment_area', 
        'sports_science', 
        'notable_personalities', 
        'infrastructure', 
        'training_methodology',
        'competition_calendar',
        'qualification_pathway',
        'general'
    )),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_name TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    attachments TEXT[],
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 13: EVENT_OVERLAP (Derived/Analytical Table)
-- Pre-computed overlap analysis
CREATE TABLE event_overlap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id TEXT REFERENCES sports(sport_id) ON DELETE CASCADE,
    sport_std TEXT,
    events_total INTEGER DEFAULT 0,
    la28_events INTEGER DEFAULT 0,
    ag_events INTEGER DEFAULT 0,
    both_events INTEGER DEFAULT 0,
    only_la28 INTEGER DEFAULT 0,
    only_ag INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 6: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Sports indexes
CREATE INDEX idx_sports_la28 ON sports(present_la28);
CREATE INDEX idx_sports_ag2026 ON sports(present_ag2026);
CREATE INDEX idx_sports_category ON sports(sport_category);
CREATE INDEX idx_sports_tops ON sports(is_tops);

-- Centres indexes
CREATE INDEX idx_centres_type ON centres(centre_type);
CREATE INDEX idx_centres_state ON centres(state);
CREATE INDEX idx_centres_active ON centres(is_active);

-- Disciplines indexes
CREATE INDEX idx_disciplines_sport ON disciplines(sport_id);

-- Events indexes
CREATE INDEX idx_events_sport ON events(sport_id);
CREATE INDEX idx_events_discipline ON events(discipline_id);
CREATE INDEX idx_events_la28 ON events(present_la28);
CREATE INDEX idx_events_ag2026 ON events(present_ag2026);

-- Centre-Sport links indexes
CREATE INDEX idx_links_centre ON centre_sport_links(centre_id);
CREATE INDEX idx_links_sport ON centre_sport_links(sport_id);

-- Olympic indexes
CREATE INDEX idx_medals_sport ON olympic_medals(sport_id);
CREATE INDEX idx_medals_year ON olympic_medals(year);
CREATE INDEX idx_participation_sport ON olympic_participation(sport_id);
CREATE INDEX idx_participation_year ON olympic_participation(year);

-- Notes indexes
CREATE INDEX idx_notes_sport ON sport_notes(sport_id);
CREATE INDEX idx_notes_type ON sport_notes(note_type);
CREATE INDEX idx_notes_pinned ON sport_notes(is_pinned);

-- Capacity indexes
CREATE INDEX idx_ncoe_centre ON ncoe_capacity(centre_id);
CREATE INDEX idx_ncoe_sport ON ncoe_capacity(sport_id);
CREATE INDEX idx_stc_centre ON stc_capacity(centre_id);
CREATE INDEX idx_stc_sport ON stc_capacity(sport_id);

-- ============================================================================
-- SECTION 7: ROW LEVEL SECURITY (RLS) - Optional but Recommended
-- ============================================================================

-- Enable RLS on notes table
ALTER TABLE sport_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read notes
CREATE POLICY "Notes are viewable by everyone" ON sport_notes
    FOR SELECT USING (true);

-- Policy: Editors and admins can insert notes
CREATE POLICY "Editors can insert notes" ON sport_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'editor')
        )
    );

-- Policy: Users can update their own notes, admins can update all
CREATE POLICY "Users can update own notes" ON sport_notes
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy: Only admins can delete notes
CREATE POLICY "Admins can delete notes" ON sport_notes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================




After creating the tables, confirm which tables were created successfully.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kheldrishti2.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9524e9e4-8c68-445b-8614-88550a1898cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
