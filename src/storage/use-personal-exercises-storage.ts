import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type {
  PersonalExercise,
  PersonalExercisesStorage,
} from '@/storage/personal-exercises.types';

export function usePersonalExercisesStorage(): PersonalExercisesStorage {
  const database = useSQLiteContext();

  return useMemo(
    () => ({
      list() {
        return database.getAllAsync<PersonalExercise>(
          `SELECT id, catalog_id, name, manual_image_uri, personal_load, created_at, updated_at
           FROM personal_exercises
           ORDER BY name COLLATE NOCASE`,
        );
      },

      getById(id) {
        return database.getFirstAsync<PersonalExercise>(
          `SELECT id, catalog_id, name, manual_image_uri, personal_load, created_at, updated_at
           FROM personal_exercises
           WHERE id = ?`,
          id,
        );
      },

      async addFromCatalog(catalogId, name, personalLoad) {
        const existing = await database.getFirstAsync<PersonalExercise>(
          `SELECT id, catalog_id, name, manual_image_uri, personal_load, created_at, updated_at
           FROM personal_exercises
           WHERE catalog_id = ?`,
          catalogId,
        );

        if (existing) return { exercise: existing, created: false };

        const timestamp = new Date().toISOString();
        const result = await database.runAsync(
          `INSERT INTO personal_exercises
            (catalog_id, name, manual_image_uri, personal_load, created_at, updated_at)
           VALUES (?, ?, NULL, ?, ?, ?)`,
          catalogId,
          name,
          personalLoad,
          timestamp,
          timestamp,
        );
        const exercise = await database.getFirstAsync<PersonalExercise>(
          `SELECT id, catalog_id, name, manual_image_uri, personal_load, created_at, updated_at
           FROM personal_exercises
           WHERE id = ?`,
          result.lastInsertRowId,
        );

        if (!exercise) throw new Error('Não foi possível carregar o exercício adicionado.');
        return { exercise, created: true };
      },

      async updateLoad(id, personalLoad) {
        await database.runAsync(
          `UPDATE personal_exercises
           SET personal_load = ?, updated_at = ?
           WHERE id = ?`,
          personalLoad,
          new Date().toISOString(),
          id,
        );
      },
    }),
    [database],
  );
}
