import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import {
  type CompletionColumn,
  type DailyTracking,
  type DailyTrackingStorage,
} from '@/storage/daily-tracking.types';

export function useDailyTrackingStorage(): DailyTrackingStorage {
  const database = useSQLiteContext();

  return useMemo(
    () => ({
      async getOrCreate(date: string) {
        await database.runAsync(
          `INSERT INTO daily_tracking (date, updated_at)
           VALUES (?, ?)
           ON CONFLICT(date) DO NOTHING`,
          date,
          new Date().toISOString(),
        );

        const result = await database.getFirstAsync<DailyTracking>(
          `SELECT
            date,
            water_ml,
            breakfast_done,
            morning_snack_done,
            lunch_done,
            afternoon_snack_done,
            dinner_done,
            supper_done,
            creatine_done,
            whey_done,
            updated_at
          FROM daily_tracking
          WHERE date = ?`,
          date,
        );

        if (!result) {
          throw new Error('Não foi possível carregar o acompanhamento diário.');
        }

        return result;
      },

      async changeWater(date: string, amount: number) {
        await database.runAsync(
          `UPDATE daily_tracking
           SET water_ml = MAX(0, water_ml + ?), updated_at = ?
           WHERE date = ?`,
          amount,
          new Date().toISOString(),
          date,
        );
      },

      async setCompletion(date: string, column: CompletionColumn, value: number) {
        await database.runAsync(
          `UPDATE daily_tracking
           SET ${column} = ?, updated_at = ?
           WHERE date = ?`,
          value,
          new Date().toISOString(),
          date,
        );
      },
    }),
    [database],
  );
}
