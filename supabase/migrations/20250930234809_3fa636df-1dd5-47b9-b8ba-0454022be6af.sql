-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Recruiters can read all users" ON public.app_user;

-- Create a security definer function to check user roles without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.app_user WHERE id = _user_id;
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Recruiters can read all users"
ON public.app_user
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'RECRUITER'::app_role);