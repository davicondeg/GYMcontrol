export const DEFAULT_WATER_INCREMENTS = [500, 800, 1000] as const;

export type WaterSettings = {
  id: 1;
  increment_1_ml: number;
  increment_2_ml: number;
  increment_3_ml: number;
  updated_at: string;
};

export type WaterSettingsStorage = {
  get(): Promise<WaterSettings>;
  save(increments: [number, number, number]): Promise<WaterSettings>;
};

export function createDefaultWaterSettings(): WaterSettings {
  return {
    id: 1,
    increment_1_ml: DEFAULT_WATER_INCREMENTS[0],
    increment_2_ml: DEFAULT_WATER_INCREMENTS[1],
    increment_3_ml: DEFAULT_WATER_INCREMENTS[2],
    updated_at: new Date().toISOString(),
  };
}

export function getWaterIncrements(settings: WaterSettings): [number, number, number] {
  return [settings.increment_1_ml, settings.increment_2_ml, settings.increment_3_ml];
}
