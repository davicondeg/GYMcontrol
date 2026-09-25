import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { PersonalExercise } from '@/storage/personal-exercises.types';
import type { Workout, WorkoutSummary, WorkoutsStorage } from '@/storage/workouts.types';

export function useWorkoutsStorage(): WorkoutsStorage {
  const database = useSQLiteContext();
  return useMemo(() => ({
    async list() {
      return database.getAllAsync<WorkoutSummary>(`SELECT w.*, COUNT(we.personal_exercise_id) AS exercise_count FROM workouts w LEFT JOIN workout_exercises we ON we.workout_id = w.id GROUP BY w.id ORDER BY w.created_at`);
    },
    async getById(id) {
      return database.getFirstAsync<Workout>('SELECT * FROM workouts WHERE id = ?', id);
    },
    async create(name) {
      const now = new Date().toISOString();
      const result = await database.runAsync('INSERT INTO workouts (name, created_at, updated_at) VALUES (?, ?, ?)', name, now, now);
      return { id: Number(result.lastInsertRowId), name, created_at: now, updated_at: now };
    },
    async remove(id) { await database.runAsync('DELETE FROM workouts WHERE id = ?', id); },
    async listExercises(id) {
      return database.getAllAsync<PersonalExercise>(`SELECT p.* FROM personal_exercises p INNER JOIN workout_exercises we ON we.personal_exercise_id = p.id WHERE we.workout_id = ? ORDER BY we.position`, id);
    },
    async listAvailableExercises(id) {
      return database.getAllAsync<PersonalExercise>(`
        SELECT p.*
        FROM personal_exercises p
        LEFT JOIN workout_exercises we ON we.personal_exercise_id = p.id
        WHERE we.workout_id = ? OR we.workout_id IS NULL
        ORDER BY p.name
      `, id);
    },
    async addExercise(id, exerciseId) {
      await database.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.runAsync(
          'DELETE FROM workout_exercises WHERE personal_exercise_id = ?',
          exerciseId,
        );
        const position = await transaction.getFirstAsync<{ next_position: number }>(
          'SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM workout_exercises WHERE workout_id = ?',
          id,
        );
        await transaction.runAsync(
          'INSERT INTO workout_exercises (workout_id, personal_exercise_id, position) VALUES (?, ?, ?)',
          id,
          exerciseId,
          position?.next_position ?? 0,
        );
      });
    },
    async removeExercise(id, exerciseId) {
      await database.runAsync(
        'DELETE FROM workout_exercises WHERE workout_id = ? AND personal_exercise_id = ?',
        id,
        exerciseId,
      );
    },
    async setExercises(id, exerciseIds) {
      await database.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.runAsync('DELETE FROM workout_exercises WHERE workout_id = ?', id);
        for (const [position, exerciseId] of exerciseIds.entries()) {
          await transaction.runAsync('INSERT INTO workout_exercises (workout_id, personal_exercise_id, position) VALUES (?, ?, ?)', id, exerciseId, position);
        }
        await transaction.runAsync('UPDATE workouts SET updated_at = ? WHERE id = ?', new Date().toISOString(), id);
      });
    },
  }), [database]);
}
