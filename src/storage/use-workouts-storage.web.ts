import type { WorkoutsStorage } from '@/storage/workouts.types';
import { workoutsStorage } from '@/storage/supabase-storage';

export function useWorkoutsStorage(): WorkoutsStorage {
  return workoutsStorage;
}
