import type { PersonalExercise } from '@/storage/personal-exercises.types';

export type Workout = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type WorkoutSummary = Workout & { exercise_count: number };

export type WorkoutsStorage = {
  list(): Promise<WorkoutSummary[]>;
  getById(id: number): Promise<Workout | null>;
  create(name: string): Promise<Workout>;
  remove(id: number): Promise<void>;
  listExercises(id: number): Promise<PersonalExercise[]>;
  listAvailableExercises(id: number): Promise<PersonalExercise[]>;
  addExercise(id: number, exerciseId: number): Promise<void>;
  removeExercise(id: number, exerciseId: number): Promise<void>;
  setExercises(id: number, exerciseIds: number[]): Promise<void>;
};
