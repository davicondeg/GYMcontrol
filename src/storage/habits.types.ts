export type HabitType = 'meal' | 'supplement';

export type HabitItem = {
  id: string;
  type: HabitType;
  label: string;
  sort_order: number;
  created_at: string;
};

export type HabitCompletion = {
  date: string;
  habit_id: string;
  done: number;
  updated_at: string;
};

export type EditableHabitItem = Pick<HabitItem, 'id' | 'label'>;

export type HabitsStorage = {
  listItems(): Promise<HabitItem[]>;
  listCompletions(date: string): Promise<HabitCompletion[]>;
  setCompletion(date: string, habitId: string, done: number): Promise<void>;
  saveItems(type: HabitType, items: EditableHabitItem[]): Promise<HabitItem[]>;
};

export const DEFAULT_HABIT_ITEMS: HabitItem[] = [
  { id: 'meal-1', type: 'meal', label: 'Café da manhã', sort_order: 0, created_at: '' },
  { id: 'meal-2', type: 'meal', label: 'Lanche da manhã', sort_order: 1, created_at: '' },
  { id: 'meal-3', type: 'meal', label: 'Almoço', sort_order: 2, created_at: '' },
  { id: 'meal-4', type: 'meal', label: 'Lanche da tarde', sort_order: 3, created_at: '' },
  { id: 'meal-5', type: 'meal', label: 'Janta', sort_order: 4, created_at: '' },
  { id: 'meal-6', type: 'meal', label: 'Ceia', sort_order: 5, created_at: '' },
  { id: 'supplement-1', type: 'supplement', label: 'Creatina', sort_order: 0, created_at: '' },
  { id: 'supplement-2', type: 'supplement', label: 'Whey', sort_order: 1, created_at: '' },
];
