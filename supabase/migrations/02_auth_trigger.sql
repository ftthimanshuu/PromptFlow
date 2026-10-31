-- ============================================================================
-- AUTOMATED USER PROFILE PROVISIONING TRIGGER
-- ============================================================================
-- When a user registers through Supabase Auth (auth.users), this trigger automatically
-- inserts a corresponding record into public.profiles to satisfy foreign keys.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, created_at, updated_at)
  values (new.id, new.email, now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger on auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
