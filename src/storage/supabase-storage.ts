import { ensureSupabaseSession } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import {
  createEmptyDailyTracking,
  type DailyTracking,
  type DailyTrackingStorage,
} from '@/storage/daily-tracking.types';
import type { GoalsStorage, GoalVersion } from '@/storage/goals.types';
import type { HabitCompletion, HabitItem, HabitsStorage } from '@/storage/habits.types';
import type { PersonalExercise, PersonalExercisesStorage } from '@/storage/personal-exercises.types';
import {
  createDefaultWaterSettings,
  type WaterSettings,
  type WaterSettingsStorage,
} from '@/storage/water-settings.types';
import type { Workout, WorkoutSession, WorkoutSummary, WorkoutsStorage } from '@/storage/workouts.types';

async function getUserId() {
  return (await ensureSupabaseSession()).user.id;
}

function requireData<T>(data: T | null, error: { message: string } | null, context: string): T {
  if (error) throw new Error(`${context}: ${error.message}`);
  if (data === null) throw new Error(`${context}: resposta vazia.`);
  return data;
}

function withoutUserId<T extends { user_id?: string }>(value: T) {
  const { user_id: _userId, ...result } = value;
  return result;
}

export const dailyTrackingStorage: DailyTrackingStorage = {
  async getOrCreate(date) {
    const userId = await getUserId();
    const empty = createEmptyDailyTracking(date);
    const { error: insertError } = await supabase
      .from('daily_tracking')
      .upsert({ ...empty, user_id: userId }, { onConflict: 'user_id,date', ignoreDuplicates: true });
    if (insertError) throw new Error(`Falha ao criar acompanhamento diário: ${insertError.message}`);

    const { data, error } = await supabase
      .from('daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    return withoutUserId(requireData(data, error, 'Falha ao carregar acompanhamento diário')) as DailyTracking;
  },

  async listBetween(startDate, endDate) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    return requireData(data, error, 'Falha ao listar acompanhamento diário').map(withoutUserId) as DailyTracking[];
  },

  async changeWater(date, amount) {
    const current = await this.getOrCreate(date);
    const userId = await getUserId();
    const { error } = await supabase
      .from('daily_tracking')
      .update({ water_ml: Math.max(0, current.water_ml + amount), updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('date', date);
    if (error) throw new Error(`Falha ao atualizar água: ${error.message}`);
  },

  async setCompletion(date, column, value) {
    const userId = await getUserId();
    const { error } = await supabase
      .from('daily_tracking')
      .update({ [column]: value, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('date', date);
    if (error) throw new Error(`Falha ao atualizar marcação: ${error.message}`);
  },
};

export const habitsStorage: HabitsStorage = {
  async listItems() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('habit_items')
      .select('*')
      .eq('user_id', userId)
      .order('type')
      .order('sort_order');
    return requireData(data, error, 'Falha ao listar hábitos').map(withoutUserId) as HabitItem[];
  },

  async listCompletions(date) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('daily_habit_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);
    return requireData(data, error, 'Falha ao listar marcações').map(withoutUserId) as HabitCompletion[];
  },

  async listCompletionsBetween(startDate, endDate) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('daily_habit_completions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    return requireData(data, error, 'Falha ao listar marcações').map(withoutUserId) as HabitCompletion[];
  },

  async setCompletion(date, habitId, done) {
    const userId = await getUserId();
    const { error } = await supabase.from('daily_habit_completions').upsert(
      { user_id: userId, date, habit_id: habitId, done, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date,habit_id' },
    );
    if (error) throw new Error(`Falha ao atualizar hábito: ${error.message}`);
  },

  async saveItems(type, items) {
    const userId = await getUserId();
    const current = (await this.listItems()).filter((item) => item.type === type);
    const nextIds = new Set(items.map((item) => item.id));
    const removedIds = current.filter((item) => !nextIds.has(item.id)).map((item) => item.id);
    if (removedIds.length > 0) {
      const { error } = await supabase
        .from('habit_items')
        .delete()
        .eq('user_id', userId)
        .in('id', removedIds);
      if (error) throw new Error(`Falha ao remover hábitos: ${error.message}`);
    }

    if (items.length > 0) {
      const now = new Date().toISOString();
      const createdAtById = new Map(current.map((item) => [item.id, item.created_at]));
      const { error } = await supabase.from('habit_items').upsert(
        items.map((item, sortOrder) => ({
          user_id: userId,
          id: item.id,
          type,
          label: item.label,
          sort_order: sortOrder,
          created_at: createdAtById.get(item.id) ?? now,
        })),
        { onConflict: 'user_id,id' },
      );
      if (error) throw new Error(`Falha ao salvar hábitos: ${error.message}`);
    }
    return this.listItems();
  },
};

export const personalExercisesStorage: PersonalExercisesStorage = {
  async list() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('personal_exercises')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    return requireData(data, error, 'Falha ao listar exercícios').map(withoutUserId) as PersonalExercise[];
  },

  async getById(id) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('personal_exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Falha ao carregar exercício: ${error.message}`);
    return data ? (withoutUserId(data) as PersonalExercise) : null;
  },

  async addFromCatalog(catalogId, name, personalLoad) {
    const userId = await getUserId();
    const { data: existing, error: readError } = await supabase
      .from('personal_exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('catalog_id', catalogId)
      .maybeSingle();
    if (readError) throw new Error(`Falha ao consultar exercício: ${readError.message}`);
    if (existing) return { exercise: withoutUserId(existing) as PersonalExercise, created: false };

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('personal_exercises')
      .insert({ user_id: userId, catalog_id: catalogId, name, personal_load: personalLoad, created_at: now, updated_at: now })
      .select('*')
      .single();
    return { exercise: withoutUserId(requireData(data, error, 'Falha ao adicionar exercício')) as PersonalExercise, created: true };
  },

  async updateLoad(id, personalLoad) {
    const userId = await getUserId();
    const { error } = await supabase
      .from('personal_exercises')
      .update({ personal_load: personalLoad, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', id);
    if (error) throw new Error(`Falha ao atualizar carga: ${error.message}`);
  },
};

export const waterSettingsStorage: WaterSettingsStorage = {
  async get() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('water_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(`Falha ao carregar preferências de água: ${error.message}`);
    if (data) return { ...withoutUserId(data), id: 1 } as WaterSettings;

    const defaults = createDefaultWaterSettings();
    return this.save([defaults.increment_1_ml, defaults.increment_2_ml, defaults.increment_3_ml]);
  },

  async save(increments) {
    const userId = await getUserId();
    const settings: WaterSettings = {
      id: 1,
      increment_1_ml: increments[0],
      increment_2_ml: increments[1],
      increment_3_ml: increments[2],
      updated_at: new Date().toISOString(),
    };
    const { id: _id, ...payload } = settings;
    const { error } = await supabase
      .from('water_settings')
      .upsert({ ...payload, user_id: userId }, { onConflict: 'user_id' });
    if (error) throw new Error(`Falha ao salvar preferências de água: ${error.message}`);
    return settings;
  },
};

export const goalsStorage: GoalsStorage = {
  async list() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('goal_versions')
      .select('*')
      .eq('user_id', userId)
      .order('effective_from');
    return requireData(data, error, 'Falha ao listar metas').map(withoutUserId) as GoalVersion[];
  },

  async save(goal) {
    const userId = await getUserId();
    const saved = { ...goal, created_at: new Date().toISOString() };
    const { error } = await supabase
      .from('goal_versions')
      .upsert({ ...saved, user_id: userId }, { onConflict: 'user_id,effective_from' });
    if (error) throw new Error(`Falha ao salvar metas: ${error.message}`);
    return saved;
  },
};

export const workoutsStorage: WorkoutsStorage = {
  async list() {
    const userId = await getUserId();
    const [{ data: workouts, error }, { data: links, error: linksError }] = await Promise.all([
      supabase.from('workouts').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('workout_exercises').select('workout_id').eq('user_id', userId),
    ]);
    const rows = requireData(workouts, error, 'Falha ao listar treinos');
    const linkRows = requireData(links, linksError, 'Falha ao contar exercícios');
    return rows.map((workout) => ({
      ...withoutUserId(workout),
      exercise_count: linkRows.filter((link) => link.workout_id === workout.id).length,
    })) as WorkoutSummary[];
  },

  async getById(id) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Falha ao carregar treino: ${error.message}`);
    return data ? (withoutUserId(data) as Workout) : null;
  },

  async create(name) {
    const userId = await getUserId();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('workouts')
      .insert({ user_id: userId, name, created_at: now, updated_at: now })
      .select('*')
      .single();
    return withoutUserId(requireData(data, error, 'Falha ao criar treino')) as Workout;
  },

  async remove(id) {
    const userId = await getUserId();
    const { error } = await supabase.from('workouts').delete().eq('user_id', userId).eq('id', id);
    if (error) throw new Error(`Falha ao remover treino: ${error.message}`);
  },

  async listExercises(id) {
    const userId = await getUserId();
    const { data: links, error } = await supabase
      .from('workout_exercises')
      .select('personal_exercise_id,position')
      .eq('user_id', userId)
      .eq('workout_id', id)
      .order('position');
    const rows = requireData(links, error, 'Falha ao listar exercícios do treino');
    if (rows.length === 0) return [];
    const ids = rows.map((link) => link.personal_exercise_id);
    const { data, error: exerciseError } = await supabase
      .from('personal_exercises')
      .select('*')
      .eq('user_id', userId)
      .in('id', ids);
    const exercises = requireData(data, exerciseError, 'Falha ao carregar exercícios').map(withoutUserId) as PersonalExercise[];
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    return ids.flatMap((exerciseId) => byId.get(exerciseId) ?? []);
  },

  async listAvailableExercises(id) {
    const userId = await getUserId();
    const [{ data: exercises, error }, { data: links, error: linksError }] = await Promise.all([
      supabase.from('personal_exercises').select('*').eq('user_id', userId).order('name'),
      supabase.from('workout_exercises').select('workout_id,personal_exercise_id').eq('user_id', userId),
    ]);
    const assignedElsewhere = new Set(
      requireData(links, linksError, 'Falha ao consultar exercícios atribuídos')
        .filter((link) => link.workout_id !== id)
        .map((link) => link.personal_exercise_id),
    );
    return requireData(exercises, error, 'Falha ao listar exercícios')
      .map(withoutUserId)
      .filter((exercise) => !assignedElsewhere.has(exercise.id)) as PersonalExercise[];
  },

  async addExercise(id, exerciseId) {
    const userId = await getUserId();
    const { data: current, error: readError } = await supabase
      .from('workout_exercises')
      .select('position')
      .eq('user_id', userId)
      .eq('workout_id', id);
    const positions = requireData(current, readError, 'Falha ao carregar treino');
    const position = positions.reduce((highest, item) => Math.max(highest, item.position), -1) + 1;
    const { error } = await supabase.from('workout_exercises').upsert(
      { user_id: userId, workout_id: id, personal_exercise_id: exerciseId, position },
      { onConflict: 'user_id,personal_exercise_id' },
    );
    if (error) throw new Error(`Falha ao adicionar exercício ao treino: ${error.message}`);
  },

  async removeExercise(id, exerciseId) {
    const userId = await getUserId();
    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('user_id', userId)
      .eq('workout_id', id)
      .eq('personal_exercise_id', exerciseId);
    if (error) throw new Error(`Falha ao remover exercício do treino: ${error.message}`);
  },

  async setExercises(id, exerciseIds) {
    const userId = await getUserId();
    const { error: deleteError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('user_id', userId)
      .eq('workout_id', id);
    if (deleteError) throw new Error(`Falha ao atualizar treino: ${deleteError.message}`);
    if (exerciseIds.length > 0) {
      const { error } = await supabase.from('workout_exercises').upsert(
        exerciseIds.map((exerciseId, position) => ({ user_id: userId, workout_id: id, personal_exercise_id: exerciseId, position })),
        { onConflict: 'user_id,personal_exercise_id' },
      );
      if (error) throw new Error(`Falha ao salvar exercícios do treino: ${error.message}`);
    }
    const { error: updateError } = await supabase
      .from('workouts')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', id);
    if (updateError) throw new Error(`Falha ao atualizar treino: ${updateError.message}`);
  },

  async listSessionsBetween(startDate, endDate) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    return requireData(data, error, 'Falha ao listar treinos concluídos').map(withoutUserId) as WorkoutSession[];
  },

  async isCompletedOn(id, date) {
    const userId = await getUserId();
    const { count, error } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('workout_id', id)
      .eq('date', date);
    if (error) throw new Error(`Falha ao consultar treino concluído: ${error.message}`);
    return (count ?? 0) > 0;
  },

  async setCompletedOn(id, date, completed) {
    const userId = await getUserId();
    if (!completed) {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('workout_id', id)
        .eq('date', date);
      if (error) throw new Error(`Falha ao remover conclusão: ${error.message}`);
      return;
    }
    const { error } = await supabase.from('workout_sessions').upsert(
      { user_id: userId, key: `${id}:${date}`, workout_id: id, date, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,workout_id,date' },
    );
    if (error) throw new Error(`Falha ao concluir treino: ${error.message}`);
  },
};
