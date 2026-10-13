export type GoalVersion = {
  effective_from: string;
  workout_target_weekly: number;
  water_goal_ml: number;
  meal_target_daily: number;
  supplement_target_daily: number;
  created_at: string;
};

export type GoalsStorage = {
  list(): Promise<GoalVersion[]>;
  save(goal: Omit<GoalVersion, 'created_at'>): Promise<GoalVersion>;
};

export function createDefaultGoals(effectiveFrom: string): GoalVersion {
  return {
    effective_from: effectiveFrom,
    workout_target_weekly: 3,
    water_goal_ml: 3000,
    meal_target_daily: 6,
    supplement_target_daily: 2,
    created_at: new Date().toISOString(),
  };
}
