import type { PersonalExercisesStorage } from '@/storage/personal-exercises.types';
import { personalExercisesStorage } from '@/storage/supabase-storage';

export function usePersonalExercisesStorage(): PersonalExercisesStorage {
  return personalExercisesStorage;
}
