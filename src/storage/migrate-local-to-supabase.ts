import AsyncStorage from '@react-native-async-storage/async-storage';

import { ensureSupabaseSession } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import type { LocalSnapshot } from '@/storage/local-snapshot.types';

const INSTALLATION_ID_KEY = 'gymcontrol:installation-id';
const MIGRATION_VERSION = 1;

async function getInstallationId() {
  const existing = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
  if (existing) return existing;

  const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, created);
  return created;
}

function assertNoError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export async function migrateLocalToSupabase(snapshot: LocalSnapshot) {
  const session = await ensureSupabaseSession();
  const userId = session.user.id;
  const installationId = await getInstallationId();
  const migrationKey = `gymcontrol:supabase-migration:${userId}:v${MIGRATION_VERSION}`;

  if (await AsyncStorage.getItem(migrationKey)) return;

  if (snapshot.habitItems.length > 0) {
    const { error } = await supabase.from('habit_items').upsert(
      snapshot.habitItems.map((item) => ({ ...item, user_id: userId })),
      { onConflict: 'user_id,id' },
    );
    assertNoError(error, 'Falha ao importar hábitos');
  }

  if (snapshot.dailyTracking.length > 0) {
    const { error } = await supabase.from('daily_tracking').upsert(
      snapshot.dailyTracking.map((tracking) => ({ ...tracking, user_id: userId })),
      { onConflict: 'user_id,date' },
    );
    assertNoError(error, 'Falha ao importar acompanhamento diário');
  }

  if (snapshot.habitCompletions.length > 0) {
    const { error } = await supabase.from('daily_habit_completions').upsert(
      snapshot.habitCompletions.map((completion) => ({ ...completion, user_id: userId })),
      { onConflict: 'user_id,date,habit_id' },
    );
    assertNoError(error, 'Falha ao importar marcações de hábitos');
  }

  if (snapshot.waterSettings) {
    const { id: _id, ...settings } = snapshot.waterSettings;
    const { error } = await supabase
      .from('water_settings')
      .upsert({ ...settings, user_id: userId }, { onConflict: 'user_id' });
    assertNoError(error, 'Falha ao importar preferências de água');
  }

  if (snapshot.goals.length > 0) {
    const { error } = await supabase.from('goal_versions').upsert(
      snapshot.goals.map((goal) => ({ ...goal, user_id: userId })),
      { onConflict: 'user_id,effective_from' },
    );
    assertNoError(error, 'Falha ao importar metas');
  }

  const exerciseIds = new Map<number, number>();
  for (const exercise of snapshot.personalExercises) {
    const sourceId = `${installationId}:exercise:${exercise.id}`;
    const { data, error } = await supabase
      .from('personal_exercises')
      .upsert(
        {
          user_id: userId,
          source_id: sourceId,
          catalog_id: exercise.catalog_id,
          name: exercise.name,
          manual_image_uri: exercise.manual_image_uri,
          personal_load: exercise.personal_load,
          created_at: exercise.created_at,
          updated_at: exercise.updated_at,
        },
        { onConflict: 'user_id,source_id' },
      )
      .select('id')
      .single();
    assertNoError(error, 'Falha ao importar exercício');
    if (!data) throw new Error('Falha ao importar exercício: resposta vazia.');
    exerciseIds.set(exercise.id, Number(data.id));
  }

  const workoutIds = new Map<number, number>();
  for (const workout of snapshot.workouts) {
    const sourceId = `${installationId}:workout:${workout.id}`;
    const { data, error } = await supabase
      .from('workouts')
      .upsert(
        {
          user_id: userId,
          source_id: sourceId,
          name: workout.name,
          created_at: workout.created_at,
          updated_at: workout.updated_at,
        },
        { onConflict: 'user_id,source_id' },
      )
      .select('id')
      .single();
    assertNoError(error, 'Falha ao importar treino');
    if (!data) throw new Error('Falha ao importar treino: resposta vazia.');
    workoutIds.set(workout.id, Number(data.id));
  }

  if (snapshot.workoutExercises.length > 0) {
    const links = snapshot.workoutExercises.flatMap((link) => {
      const workoutId = workoutIds.get(link.workout_id);
      const exerciseId = exerciseIds.get(link.personal_exercise_id);
      return workoutId && exerciseId
        ? [{ user_id: userId, workout_id: workoutId, personal_exercise_id: exerciseId, position: link.position }]
        : [];
    });
    const { error } = await supabase
      .from('workout_exercises')
      .upsert(links, { onConflict: 'user_id,personal_exercise_id' });
    assertNoError(error, 'Falha ao importar exercícios dos treinos');
  }

  if (snapshot.workoutSessions.length > 0) {
    const sessions = snapshot.workoutSessions.flatMap((workoutSession) => {
      const workoutId = workoutIds.get(workoutSession.workout_id);
      return workoutId
        ? [{
            user_id: userId,
            key: `${workoutId}:${workoutSession.date}`,
            workout_id: workoutId,
            date: workoutSession.date,
            completed_at: workoutSession.completed_at,
          }]
        : [];
    });
    const { error } = await supabase
      .from('workout_sessions')
      .upsert(sessions, { onConflict: 'user_id,workout_id,date' });
    assertNoError(error, 'Falha ao importar treinos concluídos');
  }

  await AsyncStorage.setItem(migrationKey, new Date().toISOString());
}
