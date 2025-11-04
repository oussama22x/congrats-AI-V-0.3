-- ============================================
-- ADD SURVEY COLUMNS TO AUDITION_SUBMISSIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- Add survey columns to audition_submissions table
ALTER TABLE audition_submissions 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback_reason TEXT,
ADD COLUMN IF NOT EXISTS feedback_text TEXT;

-- Add index for survey queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_audition_submissions_rating ON audition_submissions(rating);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'audition_submissions' 
  AND column_name IN ('rating', 'feedback_reason', 'feedback_text');
