import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { WaterSettings, WaterSettingsStorage } from '@/storage/water-settings.types';

export function useWaterSettingsStorage(): WaterSettingsStorage {
  const database = useSQLiteContext();

  return useMemo(
    () => ({
      async get() {
        const settings = await database.getFirstAsync<WaterSettings>(
          `SELECT id, increment_1_ml, increment_2_ml, increment_3_ml, updated_at
           FROM water_settings
           WHERE id = 1`,
        );

        if (!settings) throw new Error('Configuração de água não encontrada.');
        return settings;
      },

      async save(increments) {
        const updatedAt = new Date().toISOString();
        await database.runAsync(
          `UPDATE water_settings
           SET increment_1_ml = ?, increment_2_ml = ?, increment_3_ml = ?, updated_at = ?
           WHERE id = 1`,
          increments[0],
          increments[1],
          increments[2],
          updatedAt,
        );

        return {
          id: 1,
          increment_1_ml: increments[0],
          increment_2_ml: increments[1],
          increment_3_ml: increments[2],
          updated_at: updatedAt,
        };
      },
    }),
    [database],
  );
}
