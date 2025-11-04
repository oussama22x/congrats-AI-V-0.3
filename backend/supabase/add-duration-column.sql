-- ============================================
-- ADD DURATION COLUMN TO AUDITION_SUBMISSIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- Add duration_seconds column to audition_submissions table
ALTER TABLE audition_submissions 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0;

-- Add index for duration queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_audition_submissions_duration ON audition_submissions(duration_seconds);

-- Verify column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'audition_submissions' 
  AND column_name = 'duration_seconds';
