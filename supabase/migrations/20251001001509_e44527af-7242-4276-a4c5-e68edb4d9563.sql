-- Add new fields to talent_profiles for enhanced wizard
ALTER TABLE public.talent_profiles
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS work_arrangements TEXT[],
ADD COLUMN IF NOT EXISTS location_preferences TEXT[],
ADD COLUMN IF NOT EXISTS current_city TEXT,
ADD COLUMN IF NOT EXISTS current_country TEXT,
ADD COLUMN IF NOT EXISTS start_timing TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.talent_profiles.experience_level IS 'Experience level: entry, mid-level, senior, expert';
COMMENT ON COLUMN public.talent_profiles.work_arrangements IS 'Preferred work arrangements: full-time, part-time';
COMMENT ON COLUMN public.talent_profiles.location_preferences IS 'Location preferences: east-africa, west-africa, southern-africa, north-africa, outside-africa, global-remote';
COMMENT ON COLUMN public.talent_profiles.current_city IS 'Current city location';
COMMENT ON COLUMN public.talent_profiles.current_country IS 'Current country location';
COMMENT ON COLUMN public.talent_profiles.start_timing IS 'When they can start: immediately, within-1-month, within-3-months, within-6-months, just-exploring';