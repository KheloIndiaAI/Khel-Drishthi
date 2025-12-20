-- Drop the existing unique constraint that prevents Para/non-Para variants
ALTER TABLE public.centre_sport_links 
DROP CONSTRAINT IF EXISTS centre_sport_links_centre_id_sport_id_key;

-- Add new unique constraint that includes discipline_name to allow Para variants
ALTER TABLE public.centre_sport_links 
ADD CONSTRAINT centre_sport_links_centre_sport_discipline_key 
UNIQUE (centre_id, sport_id, discipline_name);