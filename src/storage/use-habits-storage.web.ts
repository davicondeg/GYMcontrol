import type { HabitCompletion, HabitItem, HabitsStorage } from '@/storage/habits.types';
import { webDatabasePromise } from '@/storage/web-database';

const storage: HabitsStorage = {
  async listItems() {
    const database = await webDatabasePromise;
    const items = await database.getAll('habit_items');
    return items.sort((first, second) =>
      first.type === second.type
        ? first.sort_order - second.sort_order
        : first.type.localeCompare(second.type),
    );
  },

  async listCompletions(date) {
    const database = await webDatabasePromise;
    return database.getAllFromIndex('daily_habit_completions', 'date', date);
  },

  async setCompletion(date, habitId, done) {
    const database = await webDatabasePromise;
    const completion: HabitCompletion = {
      date,
      habit_id: habitId,
      done,
      updated_at: new Date().toISOString(),
    };
    await database.put('daily_habit_completions', completion);
  },

  async saveItems(type, items) {
    const database = await webDatabasePromise;
    const transaction = database.transaction(
      ['habit_items', 'daily_habit_completions'],
      'readwrite',
    );
    const currentItems = (await transaction.objectStore('habit_items').getAll()).filter(
      (item) => item.type === type,
    );
    const nextIds = new Set(items.map((item) => item.id));

    for (const current of currentItems) {
      if (!nextIds.has(current.id)) {
        await transaction.objectStore('habit_items').delete(current.id);
        const completions = await transaction
          .objectStore('daily_habit_completions')
          .index('habit_id')
          .getAllKeys(current.id);
        for (const key of completions) {
          await transaction.objectStore('daily_habit_completions').delete(key);
        }
      }
    }

    const createdAt = new Date().toISOString();
    for (const [index, item] of items.entries()) {
      const existing = await transaction.objectStore('habit_items').get(item.id);
      const nextItem: HabitItem = {
        id: item.id,
        type,
        label: item.label,
        sort_order: index,
        created_at: existing?.created_at ?? createdAt,
      };
      await transaction.objectStore('habit_items').put(nextItem);
    }
    await transaction.done;
    return storage.listItems();
  },
};

export function useHabitsStorage(): HabitsStorage {
  return storage;
}
