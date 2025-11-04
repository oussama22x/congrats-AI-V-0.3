-- Add wizard-related fields to talent_profiles
ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS wizard_step INTEGER NOT NULL DEFAULT 1;

-- Create storage bucket for talent files (resumes, certificates, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'talent-files',
  'talent-files',
  false,
  5242880, -- 5MB in bytes
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for talent-files bucket
CREATE POLICY "Talents can view own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'talent-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Talents can upload own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'talent-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Talents can update own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'talent-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Talents can delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'talent-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create index for wizard_step for faster queries
CREATE INDEX IF NOT EXISTS idx_talent_profiles_wizard_step 
ON public.talent_profiles(wizard_step) 
WHERE onboarding_completed = false;