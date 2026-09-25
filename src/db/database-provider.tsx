import { type PropsWithChildren } from 'react';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDatabase } from '@/db/migrate';

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName="gymcontrol.db" onInit={migrateDatabase}>
      {children}
    </SQLiteProvider>
  );
}
