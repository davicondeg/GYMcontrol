import type { PersonalExercise } from '@/storage/personal-exercises.types';
import { webDatabasePromise } from '@/storage/web-database';
import type { Workout, WorkoutsStorage } from '@/storage/workouts.types';

const storage: WorkoutsStorage = {
  async list() {
    const database = await webDatabasePromise;
    const [workouts, links] = await Promise.all([
      database.getAll('workouts'),
      database.getAll('workout_exercises'),
    ]);
    return workouts.map((workout) => ({
      ...(workout as Workout),
      exercise_count: links.filter((link) => link.workout_id === workout.id).length,
    }));
  },
  async getById(id) {
    const database = await webDatabasePromise;
    return (await database.get('workouts', id) as Workout | undefined) ?? null;
  },
  async create(name) {
    const database = await webDatabasePromise;
    const now = new Date().toISOString();
    const value = { name, created_at: now, updated_at: now };
    const id = await database.add('workouts', value);
    return { id, ...value };
  },
  async remove(id) {
    const database = await webDatabasePromise;
    const transaction = database.transaction(['workouts', 'workout_exercises'], 'readwrite');
    await transaction.objectStore('workouts').delete(id);
    const keys = await transaction.objectStore('workout_exercises').index('workout_id').getAllKeys(id);
    for (const key of keys) await transaction.objectStore('workout_exercises').delete(key);
    await transaction.done;
  },
  async listExercises(id) {
    const database = await webDatabasePromise;
    const links = await database.getAllFromIndex('workout_exercises', 'workout_id', id);
    links.sort((a, b) => a.position - b.position);
    const exercises = await Promise.all(links.map((link) => database.get('personal_exercises', link.personal_exercise_id)));
    return exercises.filter((exercise): exercise is PersonalExercise => Boolean(exercise?.id)) as PersonalExercise[];
  },
  async listAvailableExercises(id) {
    const database = await webDatabasePromise;
    const [exercises, links] = await Promise.all([
      database.getAll('personal_exercises'),
      database.getAll('workout_exercises'),
    ]);
    const assignedElsewhere = new Set(
      links.filter((link) => link.workout_id !== id).map((link) => link.personal_exercise_id),
    );
    return exercises
      .filter((exercise): exercise is PersonalExercise => Boolean(exercise.id))
      .filter((exercise) => !assignedElsewhere.has(exercise.id))
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  },
  async addExercise(id, exerciseId) {
    const database = await webDatabasePromise;
    const transaction = database.transaction(['workouts', 'workout_exercises'], 'readwrite');
    const store = transaction.objectStore('workout_exercises');
    const existingKeys = await store.index('personal_exercise_id').getAllKeys(exerciseId);
    for (const key of existingKeys) await store.delete(key);
    const currentLinks = await store.index('workout_id').getAll(id);
    const nextPosition = currentLinks.reduce((highest, link) => Math.max(highest, link.position), -1) + 1;
    await store.put({ key: `${id}:${exerciseId}`, workout_id: id, personal_exercise_id: exerciseId, position: nextPosition });
    await transaction.done;
  },
  async removeExercise(id, exerciseId) {
    const database = await webDatabasePromise;
    await database.delete('workout_exercises', `${id}:${exerciseId}`);
  },
  async setExercises(id, exerciseIds) {
    const database = await webDatabasePromise;
    const transaction = database.transaction(['workouts', 'workout_exercises'], 'readwrite');
    const store = transaction.objectStore('workout_exercises');
    const oldKeys = await store.index('workout_id').getAllKeys(id);
    for (const key of oldKeys) await store.delete(key);
    for (const [position, exerciseId] of exerciseIds.entries()) {
      const existingKeys = await store.index('personal_exercise_id').getAllKeys(exerciseId);
      for (const key of existingKeys) await store.delete(key);
      await store.put({ key: `${id}:${exerciseId}`, workout_id: id, personal_exercise_id: exerciseId, position });
    }
    const workout = await transaction.objectStore('workouts').get(id);
    if (workout) await transaction.objectStore('workouts').put({ ...workout, updated_at: new Date().toISOString() });
    await transaction.done;
  },
};

export function useWorkoutsStorage(): WorkoutsStorage { return storage; }
