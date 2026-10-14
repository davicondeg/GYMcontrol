import type { BotContext, ModuleResult, RoutedIntent } from '../types.ts';

type HabitItem = {
  id: string;
  type: 'meal' | 'supplement';
  label: string;
};

type Workout = {
  id: number;
  name: string;
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function habitSearchTerms(habit: HabitItem) {
  const label = normalize(habit.label);
  const aliases: Record<string, string[]> = {
    'cafe da manha': ['cafe da manha', 'cafe', 'tomei cafe'],
    'lanche da manha': ['lanche da manha'],
    almoco: ['almoco', 'almocei'],
    'lanche da tarde': ['lanche da tarde'],
    janta: ['janta', 'jantar', 'jantei'],
    ceia: ['ceia'],
    creatina: ['creatina'],
    whey: ['whey'],
  };
  return [label, ...(aliases[label] ?? [])].sort((a, b) => b.length - a.length);
}

function findHabit(text: string, habits: HabitItem[]) {
  const normalizedText = ` ${normalize(text)} `;
  const matches = habits.flatMap((habit) =>
    habitSearchTerms(habit)
      .filter((term) => normalizedText.includes(` ${term} `))
      .map((term) => ({ habit, score: term.length })),
  );
  return matches.sort((a, b) => b.score - a.score)[0]?.habit ?? null;
}

async function listHabits(context: BotContext): Promise<HabitItem[]> {
  const { data, error } = await context.admin
    .from('habit_items')
    .select('id,type,label')
    .eq('user_id', context.userId)
    .order('type')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

function availableHabitsReply(habits: HabitItem[]) {
  if (habits.length === 0) {
    return 'Você ainda não possui hábitos cadastrados na aba Hoje.';
  }
  return `Não identifiquei qual hábito você quis dizer. Seus hábitos são: ${habits.map(({ label }) => label).join(', ')}.`;
}

async function listWorkouts(context: BotContext): Promise<Workout[]> {
  const { data, error } = await context.admin
    .from('workouts')
    .select('id,name')
    .eq('user_id', context.userId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

function findWorkout(text: string, workouts: Workout[]) {
  const normalizedText = ` ${normalize(text)} `;
  const matches = workouts
    .filter(({ name }) => normalizedText.includes(` ${normalize(name)} `))
    .sort((a, b) => normalize(b.name).length - normalize(a.name).length);
  return matches[0] ?? null;
}

function availableWorkoutsReply(workouts: Workout[]) {
  if (workouts.length === 0) {
    return 'Você ainda não possui treinos cadastrados no GymControl.';
  }
  return `Não identifiquei qual treino você quis dizer. Seus treinos são: ${workouts.map(({ name }) => name).join(', ')}.`;
}

export async function handleGymIntent(
  context: BotContext,
  route: RoutedIntent,
): Promise<ModuleResult> {
  if (route.intent === 'add_water') {
    const amount = Number(route.entities.amountMl);
    const { data: total, error } = await context.admin.rpc('bot_add_water', {
      p_user_id: context.userId,
      p_date: context.date,
      p_amount: amount,
    });
    if (error) throw error;

    return {
      reply: `Registrei ${amount} ml. Seu total de hoje é ${total} ml.`,
      action: 'add_water',
      input: { amount_ml: amount },
      result: { total_ml: total },
    };
  }

  if (route.intent === 'query_water') {
    const { data, error } = await context.admin
      .from('daily_tracking')
      .select('water_ml')
      .eq('user_id', context.userId)
      .eq('date', context.date)
      .maybeSingle();
    if (error) throw error;

    const total = data?.water_ml ?? 0;
    return {
      reply: `Você registrou ${total} ml de água hoje.`,
      action: 'query_water',
      result: { total_ml: total },
    };
  }

  if (route.intent === 'set_habit') {
    const habits = await listHabits(context);
    const habit = findHabit(context.text, habits);
    if (!habit) return { reply: availableHabitsReply(habits) };

    const done = route.entities.done === true ? 1 : 0;
    const { error } = await context.admin.from('daily_habit_completions').upsert({
      user_id: context.userId,
      date: context.date,
      habit_id: habit.id,
      done,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,date,habit_id' });
    if (error) throw error;

    return {
      reply: done === 1
        ? `Marquei “${habit.label}” como concluído hoje.`
        : `Desmarquei “${habit.label}” de hoje.`,
      action: 'set_habit_completion',
      input: { habit_id: habit.id, habit_label: habit.label, done },
      result: { date: context.date },
    };
  }

  if (route.intent === 'query_habit') {
    const habits = await listHabits(context);
    const habit = findHabit(context.text, habits);
    if (!habit) return { reply: availableHabitsReply(habits) };

    const { data, error } = await context.admin
      .from('daily_habit_completions')
      .select('done')
      .eq('user_id', context.userId)
      .eq('date', context.date)
      .eq('habit_id', habit.id)
      .maybeSingle();
    if (error) throw error;

    const done = data?.done === 1;
    return {
      reply: done
        ? `Sim. “${habit.label}” está marcado como concluído hoje.`
        : `Não. “${habit.label}” ainda não está marcado como concluído hoje.`,
      action: 'query_habit_completion',
      input: { habit_id: habit.id, habit_label: habit.label },
      result: { done, date: context.date },
    };
  }

  if (route.intent === 'query_habits_today') {
    const habits = await listHabits(context);
    if (habits.length === 0) return { reply: availableHabitsReply(habits) };

    const { data, error } = await context.admin
      .from('daily_habit_completions')
      .select('habit_id,done')
      .eq('user_id', context.userId)
      .eq('date', context.date);
    if (error) throw error;

    const completedIds = new Set(
      (data ?? []).filter(({ done }: { done: number }) => done === 1).map(({ habit_id }: { habit_id: string }) => habit_id),
    );
    const completed = habits.filter(({ id }) => completedIds.has(id));
    const pending = habits.filter(({ id }) => !completedIds.has(id));
    const parts = [
      completed.length > 0 ? `Concluídos: ${completed.map(({ label }) => label).join(', ')}.` : 'Nenhum hábito concluído.',
      pending.length > 0 ? `Pendentes: ${pending.map(({ label }) => label).join(', ')}.` : 'Nenhum hábito pendente.',
    ];

    return {
      reply: parts.join('\n'),
      action: 'query_habits_today',
      result: { completed: completed.length, pending: pending.length, date: context.date },
    };
  }

  if (route.intent === 'list_workouts' || route.intent === 'workout_today') {
    const workouts = await listWorkouts(context);
    if (workouts.length === 0) return { reply: availableWorkoutsReply(workouts) };

    const { data, error } = await context.admin
      .from('workout_sessions')
      .select('workout_id')
      .eq('user_id', context.userId)
      .eq('date', context.date);
    if (error) throw error;

    const completedIds = new Set((data ?? []).map(({ workout_id }: { workout_id: number }) => workout_id));
    const list = workouts
      .map((workout) => `${completedIds.has(workout.id) ? 'Concluído' : 'Pendente'} — ${workout.name}`)
      .join('\n');
    const introduction = route.intent === 'workout_today'
      ? 'Você ainda não definiu dias da semana para cada treino. Estes são seus treinos e o estado de hoje:'
      : 'Seus treinos hoje:';

    return {
      reply: `${introduction}\n${list}`,
      action: 'list_workouts',
      result: { total: workouts.length, completed_today: completedIds.size, date: context.date },
    };
  }

  if (route.intent === 'set_workout') {
    const workouts = await listWorkouts(context);
    const workout = findWorkout(context.text, workouts);
    if (!workout) return { reply: availableWorkoutsReply(workouts) };

    const done = route.entities.done === true;
    if (done) {
      const { error } = await context.admin.from('workout_sessions').upsert({
        user_id: context.userId,
        key: `${workout.id}:${context.date}`,
        workout_id: workout.id,
        date: context.date,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,workout_id,date' });
      if (error) throw error;
    } else {
      const { error } = await context.admin
        .from('workout_sessions')
        .delete()
        .eq('user_id', context.userId)
        .eq('workout_id', workout.id)
        .eq('date', context.date);
      if (error) throw error;
    }

    return {
      reply: done
        ? `Marquei o treino “${workout.name}” como concluído hoje.`
        : `Desmarquei o treino “${workout.name}” de hoje.`,
      action: 'set_workout_completion',
      input: { workout_id: workout.id, workout_name: workout.name, done },
      result: { date: context.date },
    };
  }

  if (route.intent === 'query_workout') {
    const workouts = await listWorkouts(context);
    const workout = findWorkout(context.text, workouts);
    if (!workout) return { reply: availableWorkoutsReply(workouts) };

    const { data, error } = await context.admin
      .from('workout_sessions')
      .select('workout_id')
      .eq('user_id', context.userId)
      .eq('workout_id', workout.id)
      .eq('date', context.date)
      .maybeSingle();
    if (error) throw error;

    const done = Boolean(data);
    return {
      reply: done
        ? `Sim. O treino “${workout.name}” está concluído hoje.`
        : `Não. O treino “${workout.name}” ainda não está concluído hoje.`,
      action: 'query_workout_completion',
      input: { workout_id: workout.id, workout_name: workout.name },
      result: { done, date: context.date },
    };
  }

  if (route.intent === 'app_link') {
    return context.gymControlUrl
      ? { reply: `Aqui está o GymControl: ${context.gymControlUrl}`, action: 'open_app_link' }
      : { reply: 'O endereço permanente do GymControl ainda não foi configurado no assistente.' };
  }

  return { reply: 'Não consegui realizar essa operação no GymControl.' };
}
