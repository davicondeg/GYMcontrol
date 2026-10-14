begin;

create table public.assistant_modules (
  code text primary key check (code ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  status text not null default 'planned' check (status in ('active', 'planned', 'disabled')),
  app_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.assistant_modules (code, name, status)
values
  ('gym', 'GymControl', 'active'),
  ('agenda', 'Agenda', 'planned'),
  ('finance', 'Financeiro', 'planned');

create table public.user_assistant_modules (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_code text not null references public.assistant_modules(code) on delete cascade,
  enabled boolean not null default true,
  connected_at timestamptz not null default now(),
  primary key (user_id, module_code)
);

insert into public.user_assistant_modules (user_id, module_code)
select user_id, 'gym'
from public.whatsapp_connections
on conflict do nothing;

alter table public.bot_messages
  add column module_code text references public.assistant_modules(code),
  add column intent_confidence numeric(4, 3)
    check (intent_confidence between 0 and 1);

alter table public.bot_actions
  add column module_code text references public.assistant_modules(code),
  add column intent text;

create index bot_messages_module_created_idx
  on public.bot_messages(module_code, created_at desc);

create index bot_actions_user_module_created_idx
  on public.bot_actions(user_id, module_code, created_at desc);

alter table public.assistant_modules enable row level security;
alter table public.user_assistant_modules enable row level security;

grant select on table public.assistant_modules to authenticated;
grant select on table public.user_assistant_modules to authenticated;

create policy "Authenticated users read assistant modules"
  on public.assistant_modules for select
  to authenticated
  using (true);

create policy "Users read their enabled assistant modules"
  on public.user_assistant_modules for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.bot_link_whatsapp(
  p_code text,
  p_wa_id text,
  p_display_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  linked_user_id uuid;
  normalized_code text := regexp_replace(upper(trim(p_code)), '^(GYM|APP)-', '');
begin
  select user_id into linked_user_id
  from public.whatsapp_link_codes
  where code_hash = encode(digest(normalized_code, 'sha256'), 'hex')
    and expires_at > now()
  for update;

  if linked_user_id is null then
    return null;
  end if;

  delete from public.whatsapp_connections
  where wa_id = p_wa_id or user_id = linked_user_id;

  insert into public.whatsapp_connections (user_id, wa_id, display_phone)
  values (linked_user_id, p_wa_id, p_display_phone);

  insert into public.user_assistant_modules (user_id, module_code)
  values (linked_user_id, 'gym')
  on conflict (user_id, module_code) do update
    set enabled = true;

  delete from public.whatsapp_link_codes where user_id = linked_user_id;
  return linked_user_id;
end;
$$;

revoke all on function public.bot_link_whatsapp(text, text, text)
  from public, anon, authenticated;
grant execute on function public.bot_link_whatsapp(text, text, text)
  to service_role;

commit;
