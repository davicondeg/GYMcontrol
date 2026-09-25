import type {
  PersonalExercise,
  PersonalExercisesStorage,
} from '@/storage/personal-exercises.types';
import {
  type StoredPersonalExercise,
  webDatabasePromise,
} from '@/storage/web-database';

function toPersonalExercise(exercise: StoredPersonalExercise | undefined): PersonalExercise | null {
  if (!exercise || typeof exercise.id !== 'number') return null;
  return { ...exercise, id: exercise.id };
}

const storage: PersonalExercisesStorage = {
  async list() {
    const database = await webDatabasePromise;
    const exercises = await database.getAll('personal_exercises');
    return exercises
      .map(toPersonalExercise)
      .filter((exercise): exercise is PersonalExercise => exercise !== null)
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
  },

  async getById(id) {
    const database = await webDatabasePromise;
    return toPersonalExercise(await database.get('personal_exercises', id));
  },

  async addFromCatalog(catalogId, name, personalLoad) {
    const database = await webDatabasePromise;
    const existing = await database.getFromIndex('personal_exercises', 'catalog_id', catalogId);

    const personalExercise = toPersonalExercise(existing);
    if (personalExercise) return { exercise: personalExercise, created: false };

    const timestamp = new Date().toISOString();
    const id = await database.add('personal_exercises', {
      catalog_id: catalogId,
      name,
      manual_image_uri: null,
      personal_load: personalLoad,
      created_at: timestamp,
      updated_at: timestamp,
    });
    const exercise = toPersonalExercise(await database.get('personal_exercises', id));

    if (!exercise) throw new Error('Não foi possível carregar o exercício adicionado.');
    return { exercise, created: true };
  },

  async updateLoad(id, personalLoad) {
    const database = await webDatabasePromise;
    const exercise = await database.get('personal_exercises', id);

    if (!exercise) throw new Error('Exercício não encontrado.');

    await database.put('personal_exercises', {
      ...exercise,
      personal_load: personalLoad,
      updated_at: new Date().toISOString(),
    });
  },
};

export function usePersonalExercisesStorage(): PersonalExercisesStorage {
  return storage;
}
