import type { HabitsStorage } from '@/storage/habits.types';
import { habitsStorage } from '@/storage/supabase-storage';

export function useHabitsStorage(): HabitsStorage {
  return habitsStorage;
}
