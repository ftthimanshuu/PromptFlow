-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (Extends Supabase auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  telegram_chat_id text,
  discord_webhook_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- 2. AUTOMATIONS TABLE (Stores compiled pipeline JSON)
-- ============================================================================
create table if not exists public.automations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  schedule_cron text default '0 9 * * *', -- Default: Daily at 9:00 AM UTC
  steps jsonb not null,                    -- Array of compiled step definitions
  is_active boolean default true,
  last_run_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- 3. EXECUTION LOGS TABLE (Run history and step-level audit)
-- ============================================================================
create table if not exists public.execution_logs (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references public.automations(id) on delete cascade not null,
  status text check (status in ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED')) default 'PENDING',
  step_results jsonb default '[]'::jsonb, -- Array of execution outputs per step
  error_message text,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- ============================================================================
-- 4. CHAT HISTORY TABLE (Multi-turn session memory)
-- ============================================================================
create table if not exists public.chat_history (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('user', 'model')) not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- ============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.automations enable row level security;
alter table public.execution_logs enable row level security;
alter table public.chat_history enable row level security;

-- Profiles: Users can view and update their own profile
create policy "Users manage own profile" 
  on public.profiles for all 
  using (auth.uid() = id);

-- Automations: Users can view, insert, update, or delete their own automations
create policy "Users manage own automations" 
  on public.automations for all 
  using (auth.uid() = user_id);

-- Execution Logs: Users can view logs of automations they own
create policy "Users view own logs" 
  on public.execution_logs for select 
  using (exists (
    select 1 from public.automations 
    where automations.id = execution_logs.automation_id 
      and automations.user_id = auth.uid()
  ));

-- Execution Logs: Allow service-role or user insertions
create policy "Users insert own execution logs"
  on public.execution_logs for insert
  with check (exists (
    select 1 from public.automations 
    where automations.id = execution_logs.automation_id 
      and automations.user_id = auth.uid()
  ));

-- Chat History: Users can view and append their own chat messages
create policy "Users manage own chat" 
  on public.chat_history for all 
  using (auth.uid() = user_id);

