import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const environmentPath = path.resolve('infra/evolution/.env');
const source = fs.readFileSync(environmentPath, 'utf8');
const existing = source.match(/^EVOLUTION_RELAY_SECRET=(.+)$/m)?.[1]?.trim();
const relaySecret = existing || randomBytes(32).toString('base64url');

if (!existing) {
  const separator = source.endsWith('\n') ? '' : '\n';
  fs.appendFileSync(environmentPath, `${separator}EVOLUTION_RELAY_SECRET=${relaySecret}\n`, 'utf8');
}

const result = spawnSync(
  process.execPath,
  ['node_modules/supabase/dist/supabase.js', 'secrets', 'set', `EVOLUTION_RELAY_SECRET=${relaySecret}`],
  { cwd: process.cwd(), stdio: 'inherit' },
);

if (result.status !== 0) {
  throw new Error('Não foi possível configurar o segredo do relay no Supabase.');
}

console.log('Segredo do relay configurado localmente e no Supabase.');
