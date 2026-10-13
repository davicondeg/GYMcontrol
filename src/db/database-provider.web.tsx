import { type PropsWithChildren } from 'react';

import { CloudDataProvider } from '@/db/cloud-data-provider';

export function DatabaseProvider({ children }: PropsWithChildren) {
  return <CloudDataProvider>{children}</CloudDataProvider>;
}
