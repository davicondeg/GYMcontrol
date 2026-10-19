import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const source = fs.readFileSync('.env', 'utf8');
const apiKey = source.match(/^GEMINI_API_KEY=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');

if (!apiKey || apiKey === 'COLE_SUA_CHAVE_AQUI' || apiKey === 'sua_chave_aqui') {
  throw new Error('GEMINI_API_KEY não foi configurada no .env da raiz.');
}

const result = spawnSync(
  process.execPath,
  [
    'node_modules/supabase/dist/supabase.js',
    'secrets',
    'set',
    `GEMINI_API_KEY=${apiKey}`,
    'GEMINI_MODEL=gemini-flash-lite-latest',
  ],
  { cwd: process.cwd(), stdio: 'inherit' },
);

if (result.status !== 0) throw new Error('Não foi possível configurar o Gemini no Supabase.');
console.log('Gemini configurado no cofre de segredos do Supabase.');
