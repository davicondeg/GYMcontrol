begin;

update public.assistant_modules
set status = 'active', updated_at = now()
where code = 'finance';

insert into public.user_assistant_modules (user_id, module_code)
select user_id, 'finance'
from public.whatsapp_connections
on conflict (user_id, module_code) do update
set enabled = true;

commit;
