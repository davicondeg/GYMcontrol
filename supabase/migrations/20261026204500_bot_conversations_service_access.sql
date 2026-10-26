begin;

grant select, insert, update, delete on table public.bot_conversations to service_role;

commit;
