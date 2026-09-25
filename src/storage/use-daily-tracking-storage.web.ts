import {
  type CompletionColumn,
  createEmptyDailyTracking,
  type DailyTrackingStorage,
} from '@/storage/daily-tracking.types';
import { webDatabasePromise } from '@/storage/web-database';

const storage: DailyTrackingStorage = {
  async getOrCreate(date) {
    const database = await webDatabasePromise;
    const existing = await database.get('daily_tracking', date);

    if (existing) return existing;

    const tracking = createEmptyDailyTracking(date);
    await database.add('daily_tracking', tracking);
    return tracking;
  },

  async changeWater(date, amount) {
    const database = await webDatabasePromise;
    const transaction = database.transaction('daily_tracking', 'readwrite');
    const tracking = await transaction.store.get(date);

    if (!tracking) throw new Error('Acompanhamento diário não encontrado.');

    tracking.water_ml = Math.max(0, tracking.water_ml + amount);
    tracking.updated_at = new Date().toISOString();
    await transaction.store.put(tracking);
    await transaction.done;
  },

  async setCompletion(date, column: CompletionColumn, value) {
    const database = await webDatabasePromise;
    const transaction = database.transaction('daily_tracking', 'readwrite');
    const tracking = await transaction.store.get(date);

    if (!tracking) throw new Error('Acompanhamento diário não encontrado.');

    tracking[column] = value;
    tracking.updated_at = new Date().toISOString();
    await transaction.store.put(tracking);
    await transaction.done;
  },
};

export function useDailyTrackingStorage(): DailyTrackingStorage {
  return storage;
}
