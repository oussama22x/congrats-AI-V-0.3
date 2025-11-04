-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('TALENT', 'RECRUITER', 'PARTNER_VIEWER');

-- Create app_user table
CREATE TABLE public.app_user (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'TALENT',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_user ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_user
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.app_user
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data (but not role)
CREATE POLICY "Users can update own data"
  ON public.app_user
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Recruiters can read all app_user data
CREATE POLICY "Recruiters can read all users"
  ON public.app_user
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.app_user
      WHERE id = auth.uid() AND role = 'RECRUITER'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_user (id, email, role)
  VALUES (NEW.id, NEW.email, 'TALENT');
  RETURN NEW;
END;
$$;

-- Trigger to automatically create app_user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_app_user_updated_at
  BEFORE UPDATE ON public.app_user
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();