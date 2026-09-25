import { openDB, type DBSchema } from 'idb';

import type { DailyTracking } from '@/storage/daily-tracking.types';
import type { HabitLabelSettings } from '@/storage/habit-label-settings.types';
import { createDefaultHabitLabelSettings } from '@/storage/habit-label-settings.types';
import type { HabitCompletion, HabitItem, HabitType } from '@/storage/habits.types';
import type { PersonalExercise } from '@/storage/personal-exercises.types';
import type { WaterSettings } from '@/storage/water-settings.types';
import type { Workout } from '@/storage/workouts.types';

export type StoredPersonalExercise = Omit<PersonalExercise, 'id'> & { id?: number };

interface GymcontrolDatabase extends DBSchema {
  daily_tracking: {
    key: string;
    value: DailyTracking;
  };
  personal_exercises: {
    key: number;
    value: StoredPersonalExercise;
    indexes: { catalog_id: string };
  };
  water_settings: {
    key: number;
    value: WaterSettings;
  };
  habit_label_settings: {
    key: number;
    value: HabitLabelSettings;
  };
  habit_items: {
    key: string;
    value: HabitItem;
    indexes: { type: HabitType };
  };
  daily_habit_completions: {
    key: [string, string];
    value: HabitCompletion;
    indexes: { date: string; habit_id: string };
  };
  workouts: { key: number; value: Omit<Workout, 'id'> & { id?: number } };
  workout_exercises: {
    key: string;
    value: { key: string; workout_id: number; personal_exercise_id: number; position: number };
    indexes: { workout_id: number; personal_exercise_id: number };
  };
}

export const webDatabasePromise = openDB<GymcontrolDatabase>('gymcontrol', 7, {
  async upgrade(database, oldVersion, _newVersion, transaction) {
    if (!database.objectStoreNames.contains('daily_tracking')) {
      database.createObjectStore('daily_tracking', { keyPath: 'date' });
    }

    if (!database.objectStoreNames.contains('personal_exercises')) {
      const store = database.createObjectStore('personal_exercises', {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('catalog_id', 'catalog_id', { unique: true });
    }

    if (!database.objectStoreNames.contains('water_settings')) {
      database.createObjectStore('water_settings', { keyPath: 'id' });
    }

    if (!database.objectStoreNames.contains('habit_label_settings')) {
      database.createObjectStore('habit_label_settings', { keyPath: 'id' });
    }

    if (!database.objectStoreNames.contains('habit_items')) {
      const store = database.createObjectStore('habit_items', { keyPath: 'id' });
      store.createIndex('type', 'type');
    }

    if (!database.objectStoreNames.contains('daily_habit_completions')) {
      const store = database.createObjectStore('daily_habit_completions', {
        keyPath: ['date', 'habit_id'],
      });
      store.createIndex('date', 'date');
      store.createIndex('habit_id', 'habit_id');
    }

    if (!database.objectStoreNames.contains('workouts')) {
      database.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
    }
    if (!database.objectStoreNames.contains('workout_exercises')) {
      const store = database.createObjectStore('workout_exercises', { keyPath: 'key' });
      store.createIndex('workout_id', 'workout_id');
      store.createIndex('personal_exercise_id', 'personal_exercise_id', { unique: true });
    } else if (oldVersion < 7) {
      const store = transaction.objectStore('workout_exercises');
      const links = await store.getAll();
      const assignedExerciseIds = new Set<number>();
      for (const link of links) {
        if (assignedExerciseIds.has(link.personal_exercise_id)) {
          await store.delete(link.key);
        } else {
          assignedExerciseIds.add(link.personal_exercise_id);
        }
      }
      store.deleteIndex('personal_exercise_id');
      store.createIndex('personal_exercise_id', 'personal_exercise_id', { unique: true });
    }

    if (oldVersion < 5) {
      const labelSettings =
        (await transaction.objectStore('habit_label_settings').get(1)) ??
        createDefaultHabitLabelSettings();
      const createdAt = new Date().toISOString();
      const items: HabitItem[] = [
        { id: 'meal-1', type: 'meal', label: labelSettings.meal_1_label, sort_order: 0, created_at: createdAt },
        { id: 'meal-2', type: 'meal', label: labelSettings.meal_2_label, sort_order: 1, created_at: createdAt },
        { id: 'meal-3', type: 'meal', label: labelSettings.meal_3_label, sort_order: 2, created_at: createdAt },
        { id: 'meal-4', type: 'meal', label: labelSettings.meal_4_label, sort_order: 3, created_at: createdAt },
        { id: 'meal-5', type: 'meal', label: labelSettings.meal_5_label, sort_order: 4, created_at: createdAt },
        { id: 'meal-6', type: 'meal', label: labelSettings.meal_6_label, sort_order: 5, created_at: createdAt },
        { id: 'supplement-1', type: 'supplement', label: labelSettings.supplement_1_label, sort_order: 0, created_at: createdAt },
        { id: 'supplement-2', type: 'supplement', label: labelSettings.supplement_2_label, sort_order: 1, created_at: createdAt },
      ];
      for (const item of items) {
        await transaction.objectStore('habit_items').put(item);
      }

      const trackingRecords = await transaction.objectStore('daily_tracking').getAll();
      for (const tracking of trackingRecords) {
        const values = [
          tracking.breakfast_done,
          tracking.morning_snack_done,
          tracking.lunch_done,
          tracking.afternoon_snack_done,
          tracking.dinner_done,
          tracking.supper_done,
          tracking.creatine_done,
          tracking.whey_done,
        ];
        for (const [index, item] of items.entries()) {
          await transaction.objectStore('daily_habit_completions').put({
            date: tracking.date,
            habit_id: item.id,
            done: values[index],
            updated_at: tracking.updated_at,
          });
        }
      }
    }
  },
});
