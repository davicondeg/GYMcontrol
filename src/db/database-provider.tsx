import { type PropsWithChildren } from 'react';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDatabase } from '@/db/migrate';
import { CloudDataProvider } from '@/db/cloud-data-provider';

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName="gymcontrol.db" onInit={migrateDatabase}>
      <CloudDataProvider>{children}</CloudDataProvider>
    </SQLiteProvider>
  );
}
