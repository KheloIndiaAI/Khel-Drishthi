-- ============================================================================
-- STEP 1: ADD NEW COLUMNS TO SPORTS TABLE
-- ============================================================================
ALTER TABLE sports ADD COLUMN IF NOT EXISTS category_list TEXT;
ALTER TABLE sports ADD COLUMN IF NOT EXISTS discipline_labels_from_image TEXT;
ALTER TABLE sports ADD COLUMN IF NOT EXISTS present_in_tops_tagg_teams_list BOOLEAN DEFAULT FALSE;
ALTER TABLE sports ADD COLUMN IF NOT EXISTS present_in_asmita_nis_sheet BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- STEP 2: CREATE ECO_CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS eco_categories (
    eco_category_id TEXT PRIMARY KEY,
    eco_category_name TEXT NOT NULL,
    notes TEXT,
    is_ecosystem_category BOOLEAN DEFAULT TRUE,
    present_in_tops_tagg_teams_list BOOLEAN DEFAULT FALSE,
    present_in_asmita_nis_sheet BOOLEAN DEFAULT FALSE,
    present_kic BOOLEAN DEFAULT FALSE,
    present_kisce BOOLEAN DEFAULT FALSE,
    present_stc BOOLEAN DEFAULT FALSE,
    present_ncoe BOOLEAN DEFAULT FALSE,
    has_supply_any BOOLEAN DEFAULT FALSE,
    present_la28 BOOLEAN DEFAULT FALSE,
    present_ag2026 BOOLEAN DEFAULT FALSE,
    present_both_games BOOLEAN DEFAULT FALSE,
    la28_events INTEGER DEFAULT 0,
    ag2026_events INTEGER DEFAULT 0,
    kic_centres INTEGER DEFAULT 0,
    kisce_centres INTEGER DEFAULT 0,
    stc_centres INTEGER DEFAULT 0,
    ncoe_centres INTEGER DEFAULT 0,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on eco_categories
ALTER TABLE eco_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for eco_categories
CREATE POLICY "Eco categories publicly readable" ON eco_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage eco_categories" ON eco_categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));