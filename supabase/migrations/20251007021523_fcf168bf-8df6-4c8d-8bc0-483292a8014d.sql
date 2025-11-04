-- Create vetting_submissions table
CREATE TABLE public.vetting_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  audio_file_url TEXT NOT NULL,
  audio_duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.vetting_submissions ENABLE ROW LEVEL SECURITY;

-- Talents can insert their own submissions
CREATE POLICY "Talents can insert own submissions"
ON public.vetting_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Talents can read own submissions
CREATE POLICY "Talents can read own submissions"
ON public.vetting_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Recruiters can read all submissions
CREATE POLICY "Recruiters can read all submissions"
ON public.vetting_submissions
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'RECRUITER'::app_role);

-- Add updated_at trigger
CREATE TRIGGER update_vetting_submissions_updated_at
BEFORE UPDATE ON public.vetting_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_vetting_submissions_user_id ON public.vetting_submissions(user_id);
CREATE INDEX idx_vetting_submissions_status ON public.vetting_submissions(status);