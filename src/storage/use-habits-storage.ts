import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { HabitCompletion, HabitItem, HabitsStorage } from '@/storage/habits.types';

export function useHabitsStorage(): HabitsStorage {
  const database = useSQLiteContext();

  return useMemo(
    () => ({
      async listItems() {
        return database.getAllAsync<HabitItem>(
          `SELECT id, type, label, sort_order, created_at
           FROM habit_items
           ORDER BY type, sort_order`,
        );
      },

      async listCompletions(date) {
        return database.getAllAsync<HabitCompletion>(
          `SELECT date, habit_id, done, updated_at
           FROM daily_habit_completions
           WHERE date = ?`,
          date,
        );
      },

      async setCompletion(date, habitId, done) {
        await database.runAsync(
          `INSERT INTO daily_habit_completions (date, habit_id, done, updated_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(date, habit_id)
           DO UPDATE SET done = excluded.done, updated_at = excluded.updated_at`,
          date,
          habitId,
          done,
          new Date().toISOString(),
        );
      },

      async saveItems(type, items) {
        await database.withExclusiveTransactionAsync(async (transaction) => {
          const currentItems = await transaction.getAllAsync<Pick<HabitItem, 'id'>>(
            'SELECT id FROM habit_items WHERE type = ?',
            type,
          );
          const nextIds = new Set(items.map((item) => item.id));

          for (const current of currentItems) {
            if (!nextIds.has(current.id)) {
              await transaction.runAsync('DELETE FROM habit_items WHERE id = ?', current.id);
            }
          }

          const createdAt = new Date().toISOString();
          for (const [index, item] of items.entries()) {
            await transaction.runAsync(
              `INSERT INTO habit_items (id, type, label, sort_order, created_at)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET label = excluded.label, sort_order = excluded.sort_order`,
              item.id,
              type,
              item.label,
              index,
              createdAt,
            );
          }
        });

        return database.getAllAsync<HabitItem>(
          `SELECT id, type, label, sort_order, created_at
           FROM habit_items
           ORDER BY type, sort_order`,
        );
      },
    }),
    [database],
  );
}
