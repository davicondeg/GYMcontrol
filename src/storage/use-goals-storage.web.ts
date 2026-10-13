import type { GoalsStorage } from '@/storage/goals.types';
import { goalsStorage } from '@/storage/supabase-storage';

export function useGoalsStorage(): GoalsStorage {
  return goalsStorage;
}
