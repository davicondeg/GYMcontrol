export type PersonalExercise = {
  id: number;
  catalog_id: string | null;
  name: string;
  manual_image_uri: string | null;
  personal_load: string;
  created_at: string;
  updated_at: string;
};

export type CreateCatalogExerciseResult = {
  exercise: PersonalExercise;
  created: boolean;
};

export type PersonalExercisesStorage = {
  list(): Promise<PersonalExercise[]>;
  getById(id: number): Promise<PersonalExercise | null>;
  addFromCatalog(catalogId: string, name: string, personalLoad: string): Promise<CreateCatalogExerciseResult>;
  updateLoad(id: number, personalLoad: string): Promise<void>;
};
