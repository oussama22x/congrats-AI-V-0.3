-- Create talent_profiles table
CREATE TABLE public.talent_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.app_user(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  years_of_experience INTEGER,
  desired_role TEXT,
  desired_salary_min INTEGER,
  desired_salary_max INTEGER,
  availability_date DATE,
  is_profile_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create talent_experiences table
CREATE TABLE public.talent_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.app_user(id) ON DELETE CASCADE,
  experience_type TEXT NOT NULL CHECK (experience_type IN ('work', 'education', 'project')),
  title TEXT NOT NULL,
  company_or_institution TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create talent_skills table
CREATE TABLE public.talent_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.app_user(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- Create talent_files table for resumes, portfolios, certificates
CREATE TABLE public.talent_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.app_user(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('resume', 'portfolio', 'certificate', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all talent tables
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for talent_profiles
CREATE POLICY "Talents can read own profile"
ON public.talent_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Talents can insert own profile"
ON public.talent_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talents can update own profile"
ON public.talent_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can read all profiles"
ON public.talent_profiles
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'RECRUITER'::app_role);

-- RLS Policies for talent_experiences
CREATE POLICY "Talents can read own experiences"
ON public.talent_experiences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Talents can insert own experiences"
ON public.talent_experiences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talents can update own experiences"
ON public.talent_experiences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talents can delete own experiences"
ON public.talent_experiences
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can read all experiences"
ON public.talent_experiences
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'RECRUITER'::app_role);

-- RLS Policies for talent_skills
CREATE POLICY "Talents can read own skills"
ON public.talent_skills
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Talents can insert own skills"
ON public.talent_skills
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talents can update own skills"
ON public.talent_skills
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talents can delete own skills"
ON public.talent_skills
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can read all skills"
ON public.talent_skills
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'RECRUITER'::app_role);

-- RLS Policies for talent_files
CREATE POLICY "Talents can read own files"
ON public.talent_files
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Talents can insert own files"
ON public.talent_files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talents can delete own files"
ON public.talent_files
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can read all files"
ON public.talent_files
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'RECRUITER'::app_role);

-- Create triggers for updated_at columns
CREATE TRIGGER update_talent_profiles_updated_at
BEFORE UPDATE ON public.talent_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_talent_experiences_updated_at
BEFORE UPDATE ON public.talent_experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_talent_profiles_user_id ON public.talent_profiles(user_id);
CREATE INDEX idx_talent_experiences_user_id ON public.talent_experiences(user_id);
CREATE INDEX idx_talent_skills_user_id ON public.talent_skills(user_id);
CREATE INDEX idx_talent_files_user_id ON public.talent_files(user_id);