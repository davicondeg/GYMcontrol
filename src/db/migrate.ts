import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

const DATABASE_VERSION = 8;

type UserVersionResult = {
  user_version: number;
};

function runMigrationTransaction(
  database: SQLiteDatabase,
  task: (transaction: SQLiteDatabase) => Promise<void>,
) {
  if (Platform.OS === 'web') {
    return database.withTransactionAsync(() => task(database));
  }

  return database.withExclusiveTransactionAsync(task);
}

export async function migrateDatabase(database: SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  const result = await database.getFirstAsync<UserVersionResult>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `A versão do banco (${currentVersion}) é mais recente que a versão suportada (${DATABASE_VERSION}).`,
    );
  }

  if (currentVersion === 0) {
    await runMigrationTransaction(database, async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE daily_tracking (
          date TEXT PRIMARY KEY NOT NULL,
          water_ml INTEGER NOT NULL DEFAULT 0 CHECK (water_ml >= 0),
          breakfast_done INTEGER NOT NULL DEFAULT 0 CHECK (breakfast_done IN (0, 1)),
          morning_snack_done INTEGER NOT NULL DEFAULT 0 CHECK (morning_snack_done IN (0, 1)),
          lunch_done INTEGER NOT NULL DEFAULT 0 CHECK (lunch_done IN (0, 1)),
          afternoon_snack_done INTEGER NOT NULL DEFAULT 0 CHECK (afternoon_snack_done IN (0, 1)),
          dinner_done INTEGER NOT NULL DEFAULT 0 CHECK (dinner_done IN (0, 1)),
          supper_done INTEGER NOT NULL DEFAULT 0 CHECK (supper_done IN (0, 1)),
          creatine_done INTEGER NOT NULL DEFAULT 0 CHECK (creatine_done IN (0, 1)),
          whey_done INTEGER NOT NULL DEFAULT 0 CHECK (whey_done IN (0, 1)),
          updated_at TEXT NOT NULL
        );

        CREATE TABLE personal_exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          catalog_source TEXT NOT NULL,
          external_id TEXT NOT NULL,
          name TEXT NOT NULL,
          image_local_file TEXT,
          personal_load TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (catalog_source, external_id)
        );

        PRAGMA user_version = 1;
      `);
    });

    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await runMigrationTransaction(database, async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE personal_exercises_v2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          catalog_id TEXT,
          name TEXT NOT NULL,
          manual_image_uri TEXT,
          personal_load TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (catalog_id)
        );

        INSERT INTO personal_exercises_v2 (
          id,
          catalog_id,
          name,
          manual_image_uri,
          personal_load,
          created_at,
          updated_at
        )
        SELECT
          id,
          NULL,
          name,
          image_local_file,
          personal_load,
          created_at,
          updated_at
        FROM personal_exercises;

        DROP TABLE personal_exercises;

        ALTER TABLE personal_exercises_v2
        RENAME TO personal_exercises;

        PRAGMA user_version = 2;
      `);
    });

    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await runMigrationTransaction(database, async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE water_settings (
          id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
          increment_1_ml INTEGER NOT NULL CHECK (increment_1_ml > 0),
          increment_2_ml INTEGER NOT NULL CHECK (increment_2_ml > 0),
          increment_3_ml INTEGER NOT NULL CHECK (increment_3_ml > 0),
          updated_at TEXT NOT NULL
        );

        INSERT INTO water_settings (
          id,
          increment_1_ml,
          increment_2_ml,
          increment_3_ml,
          updated_at
        ) VALUES (1, 500, 800, 1000, CURRENT_TIMESTAMP);

        PRAGMA user_version = 3;
      `);
    });

    currentVersion = 3;
  }

  if (currentVersion === 3) {
    await runMigrationTransaction(database, async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE habit_label_settings (
          id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
          meal_1_label TEXT NOT NULL,
          meal_2_label TEXT NOT NULL,
          meal_3_label TEXT NOT NULL,
          meal_4_label TEXT NOT NULL,
          meal_5_label TEXT NOT NULL,
          meal_6_label TEXT NOT NULL,
          supplement_1_label TEXT NOT NULL,
          supplement_2_label TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        INSERT INTO habit_label_settings (
          id,
          meal_1_label,
          meal_2_label,
          meal_3_label,
          meal_4_label,
          meal_5_label,
          meal_6_label,
          supplement_1_label,
          supplement_2_label,
          updated_at
        ) VALUES (
          1,
          'Café da manhã',
          'Lanche da manhã',
          'Almoço',
          'Lanche da tarde',
          'Janta',
          'Ceia',
          'Creatina',
          'Whey',
          CURRENT_TIMESTAMP
        );

        PRAGMA user_version = 4;
      `);
    });

    currentVersion = 4;
  }

  if (currentVersion === 4) {
    await runMigrationTransaction(database, async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE habit_items (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('meal', 'supplement')),
          label TEXT NOT NULL CHECK (length(trim(label)) > 0),
          sort_order INTEGER NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE daily_habit_completions (
          date TEXT NOT NULL,
          habit_id TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
          updated_at TEXT NOT NULL,
          PRIMARY KEY (date, habit_id),
          FOREIGN KEY (habit_id) REFERENCES habit_items(id) ON DELETE CASCADE
        );

        INSERT INTO habit_items (id, type, label, sort_order, created_at)
        SELECT 'meal-1', 'meal', meal_1_label, 0, CURRENT_TIMESTAMP FROM habit_label_settings
        UNION ALL SELECT 'meal-2', 'meal', meal_2_label, 1, CURRENT_TIMESTAMP FROM habit_label_settings
        UNION ALL SELECT 'meal-3', 'meal', meal_3_label, 2, CURRENT_TIMESTAMP FROM habit_label_settings
        UNION ALL SELECT 'meal-4', 'meal', meal_4_label, 3, CURRENT_TIMESTAMP FROM habit_label_settings
        UNION ALL SELECT 'meal-5', 'meal', meal_5_label, 4, CURRENT_TIMESTAMP FROM habit_label_settings
        UNION ALL SELECT 'meal-6', 'meal', meal_6_label, 5, CURRENT_TIMESTAMP FROM habit_label_settings
        UNION ALL SELECT 'supplement-1', 'supplement', supplement_1_label, 0, CURRENT_TIMESTAMP FROM habit_label_settings
        UNION ALL SELECT 'supplement-2', 'supplement', supplement_2_label, 1, CURRENT_TIMESTAMP FROM habit_label_settings;

        INSERT INTO daily_habit_completions (date, habit_id, done, updated_at)
        SELECT date, 'meal-1', breakfast_done, updated_at FROM daily_tracking
        UNION ALL SELECT date, 'meal-2', morning_snack_done, updated_at FROM daily_tracking
        UNION ALL SELECT date, 'meal-3', lunch_done, updated_at FROM daily_tracking
        UNION ALL SELECT date, 'meal-4', afternoon_snack_done, updated_at FROM daily_tracking
        UNION ALL SELECT date, 'meal-5', dinner_done, updated_at FROM daily_tracking
        UNION ALL SELECT date, 'meal-6', supper_done, updated_at FROM daily_tracking
        UNION ALL SELECT date, 'supplement-1', creatine_done, updated_at FROM daily_tracking
        UNION ALL SELECT date, 'supplement-2', whey_done, updated_at FROM daily_tracking;

        PRAGMA user_version = 5;
      `);
    });

    currentVersion = 5;
  }

  if (currentVersion === 5) {
    await runMigrationTransaction(database, async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL CHECK (length(trim(name)) > 0),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE workout_exercises (
          workout_id INTEGER NOT NULL,
          personal_exercise_id INTEGER NOT NULL,
          position INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (workout_id, personal_exercise_id),
          FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
          FOREIGN KEY (personal_exercise_id) REFERENCES personal_exercises(id) ON DELETE CASCADE
        );

        PRAGMA user_version = 6;
      `);
    });

    currentVersion = 6;
  }

  if (currentVersion === 6) {
    await runMigrationTransaction(database, async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE workout_exercises_v7 (
          workout_id INTEGER NOT NULL,
          personal_exercise_id INTEGER NOT NULL UNIQUE,
          position INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (workout_id, personal_exercise_id),
          FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
          FOREIGN KEY (personal_exercise_id) REFERENCES personal_exercises(id) ON DELETE CASCADE
        );

        INSERT INTO workout_exercises_v7 (workout_id, personal_exercise_id, position)
        SELECT workout_id, personal_exercise_id, position
        FROM workout_exercises
        WHERE rowid IN (
          SELECT MIN(rowid)
          FROM workout_exercises
          GROUP BY personal_exercise_id
        );

        DROP TABLE workout_exercises;

        ALTER TABLE workout_exercises_v7
        RENAME TO workout_exercises;

        PRAGMA user_version = 7;
      `);
    });

    currentVersion = 7;
  }

  if (currentVersion === 7) {
    await runMigrationTransaction(database, async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE workout_sessions (
          key TEXT PRIMARY KEY NOT NULL,
          workout_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          completed_at TEXT NOT NULL,
          FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
        );

        CREATE INDEX workout_sessions_date_idx ON workout_sessions(date);

        CREATE TABLE goal_versions (
          effective_from TEXT PRIMARY KEY NOT NULL,
          workout_target_weekly INTEGER NOT NULL CHECK (workout_target_weekly BETWEEN 0 AND 14),
          water_goal_ml INTEGER NOT NULL CHECK (water_goal_ml BETWEEN 0 AND 10000),
          meal_target_daily INTEGER NOT NULL CHECK (meal_target_daily BETWEEN 0 AND 20),
          supplement_target_daily INTEGER NOT NULL CHECK (supplement_target_daily BETWEEN 0 AND 20),
          created_at TEXT NOT NULL
        );

        PRAGMA user_version = 8;
      `);
    });
  }
}
