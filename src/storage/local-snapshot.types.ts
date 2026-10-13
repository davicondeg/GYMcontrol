import type { DailyTracking } from '@/storage/daily-tracking.types';
import type { GoalVersion } from '@/storage/goals.types';
import type { HabitCompletion, HabitItem } from '@/storage/habits.types';
import type { PersonalExercise } from '@/storage/personal-exercises.types';
import type { WaterSettings } from '@/storage/water-settings.types';
import type { Workout, WorkoutSession } from '@/storage/workouts.types';

export type LocalWorkoutExercise = {
  workout_id: number;
  personal_exercise_id: number;
  position: number;
};

export type LocalSnapshot = {
  dailyTracking: DailyTracking[];
  personalExercises: PersonalExercise[];
  waterSettings: WaterSettings | null;
  habitItems: HabitItem[];
  habitCompletions: HabitCompletion[];
  workouts: Workout[];
  workoutExercises: LocalWorkoutExercise[];
  workoutSessions: WorkoutSession[];
  goals: GoalVersion[];
};
