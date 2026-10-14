-- =========================================================
-- Gestor Financeiro
-- Schema inicial para execução manual no SQL Editor do Supabase
-- Ordem: profiles -> categories -> transactions -> recurring_transactions
-- =========================================================

-- Garante disponibilidade da função gen_random_uuid()
create extension if not exists pgcrypto;

-- =========================================================
-- 1. profiles
-- Perfil complementar do usuário autenticado no Supabase Auth
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

comment on table public.profiles is 'Perfil complementar vinculado ao usuário do Supabase Auth.';

-- =========================================================
-- 2. categories
-- Categorias de receitas e despesas criadas por usuário
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text check (type in ('income', 'expense')),
  created_at timestamptz default now()
);

comment on table public.categories is 'Categorias financeiras de receitas e despesas.';

-- =========================================================
-- 3. transactions
-- Lançamentos financeiros principais do sistema
-- =========================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  type text check (type in ('income', 'expense')) not null,
  description text not null,
  amount numeric(12,2) not null,
  transaction_date date not null,
  notes text,
  created_at timestamptz default now()
);

comment on table public.transactions is 'Movimentações financeiras cadastradas pelo usuário.';

-- =========================================================
-- 4. recurring_transactions
-- Receitas e despesas recorrentes mensais
-- =========================================================
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  type text check (type in ('income', 'expense')) not null,
  description text not null,
  amount numeric(12,2) not null,
  frequency text check (frequency in ('monthly')) default 'monthly',
  day_of_month int not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

comment on table public.recurring_transactions is 'Lançamentos recorrentes mensais do usuário.';
