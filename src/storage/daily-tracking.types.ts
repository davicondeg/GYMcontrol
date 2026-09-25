export type CompletionColumn =
  | 'breakfast_done'
  | 'morning_snack_done'
  | 'lunch_done'
  | 'afternoon_snack_done'
  | 'dinner_done'
  | 'supper_done'
  | 'creatine_done'
  | 'whey_done';

export type DailyTracking = Record<CompletionColumn, number> & {
  date: string;
  water_ml: number;
  updated_at: string;
};

export type DailyTrackingStorage = {
  getOrCreate(date: string): Promise<DailyTracking>;
  changeWater(date: string, amount: number): Promise<void>;
  setCompletion(date: string, column: CompletionColumn, value: number): Promise<void>;
};

export function createEmptyDailyTracking(date: string): DailyTracking {
  return {
    date,
    water_ml: 0,
    breakfast_done: 0,
    morning_snack_done: 0,
    lunch_done: 0,
    afternoon_snack_done: 0,
    dinner_done: 0,
    supper_done: 0,
    creatine_done: 0,
    whey_done: 0,
    updated_at: new Date().toISOString(),
  };
}
