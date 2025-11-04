-- Create role_invite table for managing role assignment invites
create table if not exists public.role_invite (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  role app_role not null,
  email text check (email is null or position('@' in email) > 1),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  consumed_by uuid references auth.users(id) on delete set null,
  consumed_at timestamptz,
  expires_at timestamptz not null,
  is_consumed boolean default false not null
);

-- Create indexes for performance
create index if not exists idx_role_invite_token_hash on public.role_invite(token_hash);
create index if not exists idx_role_invite_created_by on public.role_invite(created_by);
create index if not exists idx_role_invite_consumed_by on public.role_invite(consumed_by);
create index if not exists idx_role_invite_is_consumed on public.role_invite(is_consumed);

-- Enable RLS
alter table public.role_invite enable row level security;

-- Policy: Users can view their own created invites
create policy "Users can view invites they created"
on public.role_invite
for select
using (auth.uid() = created_by);

-- Policy: Users can view unconsumed invites (for redemption)
create policy "Anyone can view unconsumed invites for redemption"
on public.role_invite
for select
using (is_consumed = false and expires_at > now());

-- Policy: Authenticated users can create invites (demo mode - we'll add proper admin checks in edge function)
create policy "Authenticated users can create invites"
on public.role_invite
for insert
with check (auth.uid() = created_by);

-- Policy: System can update invites (for consumption tracking)
create policy "Invites can be updated when consumed"
on public.role_invite
for update
using (is_consumed = false and expires_at > now());