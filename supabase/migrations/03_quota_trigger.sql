-- ============================================================================
-- QUOTA ENFORCEMENT: Maximum 5 Active Automations per User Account
-- ============================================================================

create or replace function public.check_active_automation_limit()
returns trigger as $$
declare
  active_count integer;
begin
  -- Only evaluate when an automation is active or being activated
  if new.is_active = true then
    select count(*) into active_count
    from public.automations
    where user_id = new.user_id 
      and is_active = true 
      and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if active_count >= 5 then
      raise exception 'Account Quota Exceeded: You cannot have more than 5 active automations. Please deactivate an existing automation first.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists
drop trigger if exists enforce_automation_quota on public.automations;

-- Attach trigger before insert or update
create trigger enforce_automation_quota
  before insert or update on public.automations
  for each row execute function public.check_active_automation_limit();

