import fs from 'node:fs';

import { createClient } from '@supabase/supabase-js';

const environment = Object.fromEntries(
  fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=');
      const key = line.slice(0, separator);
      const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
      return [key, value];
    }),
);

const supabase = createClient(
  environment.EXPO_PUBLIC_SUPABASE_URL,
  environment.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

const tables = [
  'profiles',
  'daily_tracking',
  'personal_exercises',
  'water_settings',
  'habit_items',
  'daily_habit_completions',
  'workouts',
  'workout_exercises',
  'workout_sessions',
  'goal_versions',
  'finance_categories',
  'finance_accounts',
  'finance_transactions',
  'finance_credit_purchases',
  'finance_installments',
  'finance_recurring_transactions',
];

const { error: loginError } = await supabase.auth.signInAnonymously();

if (loginError) {
  throw loginError;
}

const checks = [];

for (const table of tables) {
  const { error, status } = await supabase.from(table).select('*').limit(1);
  checks.push({ table, status, ok: !error });
}

await supabase.auth.signOut();

const result = {
  anonymousSession: true,
  allTablesReachable: checks.every(({ ok }) => ok),
  checks,
};

console.log(JSON.stringify(result, null, 2));

if (!result.allTablesReachable) {
  process.exitCode = 1;
}
