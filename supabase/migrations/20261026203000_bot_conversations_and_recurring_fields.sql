begin;

alter table public.finance_recurring_transactions
  add column frequency text not null default 'monthly'
    check (frequency in ('weekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  add column payment_method text
    check (payment_method is null or payment_method in ('cash', 'debit', 'credit', 'pix', 'transfer', 'other'));

create table public.bot_conversations (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_code text not null references public.assistant_modules(code) on delete cascade,
  flow text not null,
  step text not null,
  state jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  expires_at timestamptz not null default now() + interval '24 hours',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, module_code)
);

alter table public.bot_conversations enable row level security;
revoke all on table public.bot_conversations from public, anon, authenticated;

commit;
