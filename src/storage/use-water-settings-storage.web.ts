import type { WaterSettingsStorage } from '@/storage/water-settings.types';
import { waterSettingsStorage } from '@/storage/supabase-storage';

export function useWaterSettingsStorage(): WaterSettingsStorage {
  return waterSettingsStorage;
}
