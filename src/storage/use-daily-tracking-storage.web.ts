import type { DailyTrackingStorage } from '@/storage/daily-tracking.types';
import { dailyTrackingStorage } from '@/storage/supabase-storage';

export function useDailyTrackingStorage(): DailyTrackingStorage {
  return dailyTrackingStorage;
}
