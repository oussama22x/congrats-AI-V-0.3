-- Change desired_role from TEXT to TEXT[] to support multiple target job titles
ALTER TABLE talent_profiles 
  DROP COLUMN IF EXISTS desired_role;

ALTER TABLE talent_profiles 
  ADD COLUMN desired_roles TEXT[] DEFAULT NULL;

-- Create index for better query performance
CREATE INDEX idx_talent_profiles_desired_roles ON talent_profiles USING GIN(desired_roles);