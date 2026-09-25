import {
  createDefaultWaterSettings,
  type WaterSettingsStorage,
} from '@/storage/water-settings.types';
import { webDatabasePromise } from '@/storage/web-database';

const storage: WaterSettingsStorage = {
  async get() {
    const database = await webDatabasePromise;
    const existing = await database.get('water_settings', 1);
    if (existing) return existing;

    const settings = createDefaultWaterSettings();
    await database.put('water_settings', settings);
    return settings;
  },

  async save(increments) {
    const database = await webDatabasePromise;
    const settings = {
      id: 1 as const,
      increment_1_ml: increments[0],
      increment_2_ml: increments[1],
      increment_3_ml: increments[2],
      updated_at: new Date().toISOString(),
    };
    await database.put('water_settings', settings);
    return settings;
  },
};

export function useWaterSettingsStorage(): WaterSettingsStorage {
  return storage;
}
