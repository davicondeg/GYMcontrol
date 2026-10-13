import type { LocalSnapshot } from '@/storage/local-snapshot.types';
import type { PersonalExercise } from '@/storage/personal-exercises.types';
import { webDatabasePromise } from '@/storage/web-database';
import type { Workout } from '@/storage/workouts.types';

export async function loadLocalSnapshot(): Promise<LocalSnapshot> {
  const database = await webDatabasePromise;
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
    database.getAll('daily_tracking'),
    database.getAll('personal_exercises'),
    database.get('water_settings', 1),
    database.getAll('habit_items'),
    database.getAll('daily_habit_completions'),
    database.getAll('workouts'),
    database.getAll('workout_exercises'),
    database.getAll('workout_sessions'),
    database.getAll('goal_versions'),
  ]);

  return {
    dailyTracking,
    personalExercises: personalExercises.filter(
      (exercise): exercise is PersonalExercise => typeof exercise.id === 'number',
    ),
    waterSettings: waterSettings ?? null,
    habitItems,
    habitCompletions,
    workouts: workouts.filter((workout): workout is Workout => typeof workout.id === 'number'),
    workoutExercises,
    workoutSessions,
    goals,
  };
}
