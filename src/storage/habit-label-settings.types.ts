export const DEFAULT_MEAL_LABELS = [
  'Café da manhã',
  'Lanche da manhã',
  'Almoço',
  'Lanche da tarde',
  'Janta',
  'Ceia',
] as const;

export const DEFAULT_SUPPLEMENT_LABELS = ['Creatina', 'Whey'] as const;

export type MealLabels = [string, string, string, string, string, string];
export type SupplementLabels = [string, string];

export type HabitLabelSettings = {
  id: 1;
  meal_1_label: string;
  meal_2_label: string;
  meal_3_label: string;
  meal_4_label: string;
  meal_5_label: string;
  meal_6_label: string;
  supplement_1_label: string;
  supplement_2_label: string;
  updated_at: string;
};

export type HabitLabelSettingsStorage = {
  get(): Promise<HabitLabelSettings>;
  saveMeals(labels: MealLabels): Promise<HabitLabelSettings>;
  saveSupplements(labels: SupplementLabels): Promise<HabitLabelSettings>;
};

export function createDefaultHabitLabelSettings(): HabitLabelSettings {
  return {
    id: 1,
    meal_1_label: DEFAULT_MEAL_LABELS[0],
    meal_2_label: DEFAULT_MEAL_LABELS[1],
    meal_3_label: DEFAULT_MEAL_LABELS[2],
    meal_4_label: DEFAULT_MEAL_LABELS[3],
    meal_5_label: DEFAULT_MEAL_LABELS[4],
    meal_6_label: DEFAULT_MEAL_LABELS[5],
    supplement_1_label: DEFAULT_SUPPLEMENT_LABELS[0],
    supplement_2_label: DEFAULT_SUPPLEMENT_LABELS[1],
    updated_at: new Date().toISOString(),
  };
}

export function getMealLabels(settings: HabitLabelSettings): MealLabels {
  return [
    settings.meal_1_label,
    settings.meal_2_label,
    settings.meal_3_label,
    settings.meal_4_label,
    settings.meal_5_label,
    settings.meal_6_label,
  ];
}

export function getSupplementLabels(settings: HabitLabelSettings): SupplementLabels {
  return [settings.supplement_1_label, settings.supplement_2_label];
}
