import type { SQLiteDatabase } from 'expo-sqlite';

import type { DailyTracking } from '@/storage/daily-tracking.types';
import type { GoalVersion } from '@/storage/goals.types';
import type { HabitCompletion, HabitItem } from '@/storage/habits.types';
import type { LocalSnapshot, LocalWorkoutExercise } from '@/storage/local-snapshot.types';
import type { PersonalExercise } from '@/storage/personal-exercises.types';
import type { WaterSettings } from '@/storage/water-settings.types';
import type { Workout, WorkoutSession } from '@/storage/workouts.types';

export async function loadLocalSnapshot(database?: SQLiteDatabase): Promise<LocalSnapshot> {
  if (!database) throw new Error('Banco de dados local indisponível.');
  const [
    dailyTracking,
    personalExercises,
    waterSettings,
    habitItems,
    habitCompletions,
    workouts,
    workoutExercises,
    workoutSessions,
    goals,
  ] = await Promise.all([
    database.getAllAsync<DailyTracking>('SELECT * FROM daily_tracking'),
    database.getAllAsync<PersonalExercise>('SELECT * FROM personal_exercises'),
    database.getFirstAsync<WaterSettings>('SELECT * FROM water_settings WHERE id = 1'),
    database.getAllAsync<HabitItem>('SELECT * FROM habit_items'),
    database.getAllAsync<HabitCompletion>('SELECT * FROM daily_habit_completions'),
    database.getAllAsync<Workout>('SELECT * FROM workouts'),
    database.getAllAsync<LocalWorkoutExercise>('SELECT * FROM workout_exercises'),
    database.getAllAsync<WorkoutSession>('SELECT * FROM workout_sessions'),
    database.getAllAsync<GoalVersion>('SELECT * FROM goal_versions'),
  ]);

  return {
    dailyTracking,
    personalExercises,
    waterSettings,
    habitItems,
    habitCompletions,
    workouts,
    workoutExercises,
    workoutSessions,
    goals,
  };
}
