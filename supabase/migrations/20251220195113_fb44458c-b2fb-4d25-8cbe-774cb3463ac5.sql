-- ============================================================================
-- INDIA SPORTS ECOSYSTEM DASHBOARD - COMPLETE DATABASE SCHEMA
-- ============================================================================

-- SECTION 1: MASTER TABLES
-- ============================================================================

-- Table 1: SPORTS (Master)
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

-- SECTION 2: FIRST-LEVEL DEPENDENT TABLES
-- ============================================================================

-- Table 3: DISCIPLINES
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

-- Table 4: CENTRE_SPORT_LINKS
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

-- SECTION 3: SECOND-LEVEL DEPENDENT TABLES
-- ============================================================================

-- Table 8: EVENTS
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
    both_games INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SECTION 4: CAPACITY TABLES
-- ============================================================================

-- Table 9: NCOE_CAPACITY
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

-- SECTION 5: APPLICATION TABLES
-- ============================================================================

-- Table 11: PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    organization TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Table 12: USER_ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Table 13: SPORT_NOTES
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
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by_name TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    attachments TEXT[],
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 14: EVENT_OVERLAP
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

-- SECTION 6: INDEXES
-- ============================================================================

CREATE INDEX idx_sports_la28 ON sports(present_la28);
CREATE INDEX idx_sports_ag2026 ON sports(present_ag2026);
CREATE INDEX idx_sports_category ON sports(sport_category);
CREATE INDEX idx_sports_tops ON sports(is_tops);
CREATE INDEX idx_centres_type ON centres(centre_type);
CREATE INDEX idx_centres_state ON centres(state);
CREATE INDEX idx_centres_active ON centres(is_active);
CREATE INDEX idx_disciplines_sport ON disciplines(sport_id);
CREATE INDEX idx_events_sport ON events(sport_id);
CREATE INDEX idx_events_discipline ON events(discipline_id);
CREATE INDEX idx_events_la28 ON events(present_la28);
CREATE INDEX idx_events_ag2026 ON events(present_ag2026);
CREATE INDEX idx_links_centre ON centre_sport_links(centre_id);
CREATE INDEX idx_links_sport ON centre_sport_links(sport_id);
CREATE INDEX idx_medals_sport ON olympic_medals(sport_id);
CREATE INDEX idx_medals_year ON olympic_medals(year);
CREATE INDEX idx_participation_sport ON olympic_participation(sport_id);
CREATE INDEX idx_participation_year ON olympic_participation(year);
CREATE INDEX idx_notes_sport ON sport_notes(sport_id);
CREATE INDEX idx_notes_type ON sport_notes(note_type);
CREATE INDEX idx_notes_pinned ON sport_notes(is_pinned);
CREATE INDEX idx_ncoe_centre ON ncoe_capacity(centre_id);
CREATE INDEX idx_ncoe_sport ON ncoe_capacity(sport_id);
CREATE INDEX idx_stc_centre ON stc_capacity(centre_id);
CREATE INDEX idx_stc_sport ON stc_capacity(sport_id);

-- SECTION 7: SECURITY
-- ============================================================================

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'viewer');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User roles viewable" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Admins manage roles" ON user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Notes viewable" ON sport_notes FOR SELECT USING (true);
CREATE POLICY "Editors insert notes" ON sport_notes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Update own notes" ON sport_notes FOR UPDATE USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete notes" ON sport_notes FOR DELETE USING (public.has_role(auth.uid(), 'admin'));