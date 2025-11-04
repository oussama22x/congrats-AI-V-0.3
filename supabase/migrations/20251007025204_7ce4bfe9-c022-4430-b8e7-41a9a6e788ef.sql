-- Drop all RLS policies on role_invite table
DROP POLICY IF EXISTS "Users can view invites they created" ON public.role_invite;
DROP POLICY IF EXISTS "Anyone can view unconsumed invites for redemption" ON public.role_invite;
DROP POLICY IF EXISTS "Authenticated users can create invites" ON public.role_invite;
DROP POLICY IF EXISTS "Invites can be updated when consumed" ON public.role_invite;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_role_invite_token_hash;
DROP INDEX IF EXISTS public.idx_role_invite_created_by;
DROP INDEX IF EXISTS public.idx_role_invite_consumed_by;
DROP INDEX IF EXISTS public.idx_role_invite_is_consumed;

-- Drop the role_invite table
DROP TABLE IF EXISTS public.role_invite;