begin;

create or replace function public.request_whatsapp_link_code()
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  generated_code text;
  expiration timestamptz := now() + interval '10 minutes';
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Permanent account required';
  end if;

  generated_code := lpad((floor(random() * 1000000))::integer::text, 6, '0');

  insert into public.whatsapp_link_codes (user_id, code_hash, expires_at, created_at)
  values (auth.uid(), encode(digest(generated_code, 'sha256'), 'hex'), expiration, now())
  on conflict (user_id) do update
    set code_hash = excluded.code_hash,
        expires_at = excluded.expires_at,
        created_at = excluded.created_at;

  return query select 'GYM-' || generated_code, expiration;
end;
$$;

revoke all on function public.request_whatsapp_link_code() from public;
grant execute on function public.request_whatsapp_link_code() to authenticated;

commit;
