alter table public.personal_exercises
  add column source_id text;

alter table public.personal_exercises
  add constraint personal_exercises_user_source_key unique (user_id, source_id);

alter table public.workouts
  add column source_id text;

alter table public.workouts
  add constraint workouts_user_source_key unique (user_id, source_id);
