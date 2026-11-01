-- ============================================================================
-- 04_USER_PROFILE_METADATA.SQL
-- Add full_name and support Telegram Chat ID & Discord Webhook in Auth Trigger
-- ============================================================================

-- 1. Add full_name column to public.profiles if not present
alter table public.profiles add column if not exists full_name text;

-- 2. Update the handle_new_user function to automatically extract
-- full_name, telegram_chat_id, and discord_webhook_url from auth.users metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name,
    telegram_chat_id, 
    discord_webhook_url, 
    created_at, 
    updated_at
  )
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null),
    new.raw_user_meta_data->>'telegram_chat_id',
    new.raw_user_meta_data->>'discord_webhook_url',
    now(), 
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    telegram_chat_id = coalesce(excluded.telegram_chat_id, public.profiles.telegram_chat_id),
    discord_webhook_url = coalesce(excluded.discord_webhook_url, public.profiles.discord_webhook_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 3. Re-ensure the trigger on auth.users is active
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

