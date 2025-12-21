-- Drop the restrictive check constraint
ALTER TABLE sports DROP CONSTRAINT IF EXISTS sports_sport_category_check;

-- Add updated check constraint that includes 'Unknown'
ALTER TABLE sports ADD CONSTRAINT sports_sport_category_check 
CHECK (sport_category = ANY (ARRAY['Demand+Supply'::text, 'DemandOnly'::text, 'SupplyOnly'::text, 'Unknown'::text]));