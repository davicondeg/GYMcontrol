const financeConfig = window.GESTOR_FINANCEIRO_CONFIG || {};
const SUPABASE_URL = financeConfig.supabaseUrl;
const SUPABASE_ANON_KEY = financeConfig.supabaseAnonKey;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Gestor Financeiro sem configuração do Supabase. Execute npm run sync:finance-env na raiz.',
  );
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

window.supabaseClient = supabaseClient;

