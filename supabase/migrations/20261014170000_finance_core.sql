begin;

create table public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  type text not null check (type in ('income', 'expense')),
  color text,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index finance_categories_user_name_type_idx
  on public.finance_categories (user_id, lower(trim(name)), type);

create table public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  type text not null check (
    type in ('checking', 'savings', 'wallet', 'digital_account', 'credit_card')
  ),
  initial_balance numeric(14, 2) not null default 0,
  credit_limit numeric(14, 2) check (credit_limit is null or credit_limit >= 0),
  closing_day smallint check (closing_day is null or closing_day between 1 and 31),
  due_day smallint check (due_day is null or due_day between 1 and 31),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (
    type = 'credit_card'
    or (credit_limit is null and closing_day is null and due_day is null)
  )
);

create index finance_accounts_user_active_idx
  on public.finance_accounts (user_id, is_active, created_at desc);

create table public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid,
  category_id uuid,
  type text not null check (type in ('income', 'expense')),
  description text not null check (length(trim(description)) between 1 and 160),
  amount numeric(14, 2) not null check (amount > 0),
  transaction_date date not null,
  payment_method text check (
    payment_method is null
    or payment_method in ('cash', 'debit', 'credit', 'pix', 'transfer', 'other')
  ),
  notes text check (notes is null or length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (account_id, user_id)
    references public.finance_accounts(id, user_id) on delete restrict,
  foreign key (category_id, user_id)
    references public.finance_categories(id, user_id) on delete restrict
);

create index finance_transactions_user_date_idx
  on public.finance_transactions (user_id, transaction_date desc, created_at desc);
create index finance_transactions_user_category_idx
  on public.finance_transactions (user_id, category_id, transaction_date desc);

create table public.finance_credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null,
  card_id uuid not null,
  installments_count smallint not null check (installments_count between 1 and 120),
  first_invoice_month date not null check (
    first_invoice_month = date_trunc('month', first_invoice_month)::date
  ),
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (transaction_id),
  foreign key (transaction_id, user_id)
    references public.finance_transactions(id, user_id) on delete cascade,
  foreign key (card_id, user_id)
    references public.finance_accounts(id, user_id) on delete restrict
);

create index finance_credit_purchases_user_card_idx
  on public.finance_credit_purchases (user_id, card_id, first_invoice_month);

create table public.finance_installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purchase_id uuid not null,
  installment_number smallint not null check (installment_number > 0),
  amount numeric(14, 2) not null check (amount > 0),
  invoice_month date not null check (
    invoice_month = date_trunc('month', invoice_month)::date
  ),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (purchase_id, installment_number),
  foreign key (purchase_id, user_id)
    references public.finance_credit_purchases(id, user_id) on delete cascade,
  check (
    (status = 'pending' and paid_at is null)
    or (status = 'paid' and paid_at is not null)
  )
);

create index finance_installments_user_month_idx
  on public.finance_installments (user_id, invoice_month, status);

create table public.finance_recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid,
  category_id uuid,
  type text not null check (type in ('income', 'expense')),
  description text not null check (length(trim(description)) between 1 and 160),
  amount numeric(14, 2) not null check (amount > 0),
  day_of_month smallint not null check (day_of_month between 1 and 31),
  starts_on date not null default current_date,
  ends_on date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (account_id, user_id)
    references public.finance_accounts(id, user_id) on delete restrict,
  foreign key (category_id, user_id)
    references public.finance_categories(id, user_id) on delete restrict,
  check (ends_on is null or ends_on >= starts_on)
);

create index finance_recurring_user_active_idx
  on public.finance_recurring_transactions (user_id, is_active, day_of_month);

alter table public.finance_categories enable row level security;
alter table public.finance_accounts enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_credit_purchases enable row level security;
alter table public.finance_installments enable row level security;
alter table public.finance_recurring_transactions enable row level security;

create policy "Users manage their finance categories"
  on public.finance_categories for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their finance accounts"
  on public.finance_accounts for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their finance transactions"
  on public.finance_transactions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their finance credit purchases"
  on public.finance_credit_purchases for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their finance installments"
  on public.finance_installments for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their recurring finance transactions"
  on public.finance_recurring_transactions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.finance_categories to authenticated;
grant select, insert, update, delete on table public.finance_accounts to authenticated;
grant select, insert, update, delete on table public.finance_transactions to authenticated;
grant select, insert, update, delete on table public.finance_credit_purchases to authenticated;
grant select, insert, update, delete on table public.finance_installments to authenticated;
grant select, insert, update, delete on table public.finance_recurring_transactions to authenticated;

commit;
