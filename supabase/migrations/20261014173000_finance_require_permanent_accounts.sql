begin;

drop policy "Users manage their finance categories" on public.finance_categories;
drop policy "Users manage their finance accounts" on public.finance_accounts;
drop policy "Users manage their finance transactions" on public.finance_transactions;
drop policy "Users manage their finance credit purchases" on public.finance_credit_purchases;
drop policy "Users manage their finance installments" on public.finance_installments;
drop policy "Users manage their recurring finance transactions" on public.finance_recurring_transactions;

create policy "Permanent users manage their finance categories"
  on public.finance_categories for all to authenticated
  using (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  )
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

create policy "Permanent users manage their finance accounts"
  on public.finance_accounts for all to authenticated
  using (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  )
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

create policy "Permanent users manage their finance transactions"
  on public.finance_transactions for all to authenticated
  using (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  )
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

create policy "Permanent users manage their finance credit purchases"
  on public.finance_credit_purchases for all to authenticated
  using (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  )
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

create policy "Permanent users manage their finance installments"
  on public.finance_installments for all to authenticated
  using (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  )
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

create policy "Permanent users manage their recurring finance transactions"
  on public.finance_recurring_transactions for all to authenticated
  using (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  )
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

commit;
