import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export async function ensureSupabaseSession(): Promise<Session> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (sessionData.session) {
    return sessionData.session;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.session) {
    throw error ?? new Error('Não foi possível criar a sessão do usuário no Supabase.');
  }

  return data.session;
}
