begin;

alter table public.daily_tracking
  add column if not exists workout_done smallint not null default 0
  check (workout_done in (0, 1));

insert into public.daily_tracking (user_id, date, workout_done, updated_at)
select user_id, date, 1, max(completed_at)
from public.workout_sessions
group by user_id, date
on conflict (user_id, date) do update
set workout_done = 1,
    updated_at = greatest(public.daily_tracking.updated_at, excluded.updated_at);

commit;
