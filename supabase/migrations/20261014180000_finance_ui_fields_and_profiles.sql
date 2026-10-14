begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text check (name is null or length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Permanent users manage their profile"
  on public.profiles for all to authenticated
  using (
    auth.uid() = id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  )
  with check (
    auth.uid() = id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

grant select, insert, update, delete on table public.profiles to authenticated;

alter table public.finance_categories
  add column description text check (description is null or length(description) <= 120);

alter table public.finance_accounts
  add column institution text check (institution is null or length(institution) <= 100),
  add column color text check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  add column icon text check (icon is null or length(icon) <= 40),
  add column linked_payment_account_id uuid;

alter table public.finance_accounts
  add constraint finance_accounts_linked_payment_owner_fk
  foreign key (linked_payment_account_id, user_id)
  references public.finance_accounts(id, user_id)
  on delete restrict;

commit;
