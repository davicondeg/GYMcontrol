import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const environmentPath = path.join(root, '.env');
const outputPath = path.join(root, 'apps', 'financeiro', 'frontend', 'src', 'config.js');

const environment = Object.fromEntries(
  fs
    .readFileSync(environmentPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=');
      const key = line.slice(0, separator);
      const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
      return [key, value];
    }),
);

const url = environment.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = environment.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('As variáveis públicas do Supabase não foram encontradas no .env da raiz.');
}

const source = `window.GESTOR_FINANCEIRO_CONFIG = ${JSON.stringify({
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
}, null, 2)};\n`;

fs.writeFileSync(outputPath, source, 'utf8');
console.log(`Configuração financeira sincronizada em ${path.relative(root, outputPath)}.`);
