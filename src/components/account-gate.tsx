import type { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type PropsWithChildren, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ensureSupabaseSession } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

type Screen = 'protect' | 'confirmation' | 'password' | 'login';
const PUBLIC_APP_URL = 'https://davicondeg.github.io/GYMcontrol/';
const ACCOUNT_SETUP_PENDING_KEY = 'gymcontrol:account-setup-pending';

function messageFromError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'Este e-mail já possui uma conta. Use a opção de entrar.';
  }
  if (message.includes('password')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (message.includes('manual linking')) return 'A vinculação de contas precisa ser habilitada no Supabase.';

  return 'Não foi possível concluir. Confira os dados e tente novamente.';
}

export function AccountGate({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void ensureSupabaseSession()
      .then(async (currentSession) => {
        if (!active) return;
        setSession(currentSession);
        const isSetupPending = await AsyncStorage.getItem(ACCOUNT_SETUP_PENDING_KEY);
        if (active && !currentSession.user.is_anonymous && isSetupPending) setScreen('password');
      })
      .catch(() => {
        if (active) setError('Não foi possível iniciar sua sessão.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active || !nextSession) return;
      setSession(nextSession);
      if (!nextSession.user.is_anonymous) {
        void AsyncStorage.getItem(ACCOUNT_SETUP_PENDING_KEY).then((isSetupPending) => {
          if (active && isSetupPending) setScreen('password');
        });
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isPermanent = Boolean(session && !session.user.is_anonymous);

  const sendConfirmation = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (submitting) return;
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser(
      { email: normalizedEmail },
      { emailRedirectTo: PUBLIC_APP_URL },
    );
    if (updateError) {
      setError(messageFromError(updateError));
    } else {
      setEmail(normalizedEmail);
      await AsyncStorage.setItem(ACCOUNT_SETUP_PENDING_KEY, normalizedEmail);
      setScreen('confirmation');
    }
    setSubmitting(false);
  };

  const checkConfirmation = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    await supabase.auth.refreshSession();
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data.user) {
      setError(messageFromError(userError));
    } else if (data.user.is_anonymous) {
      setError('O e-mail ainda não foi confirmado. Abra o link recebido e tente novamente.');
    } else {
      setSession((current) => current ? { ...current, user: data.user } : current);
      setScreen('password');
    }
    setSubmitting(false);
  };

  const savePassword = async () => {
    if (password.length < 6 || submitting) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('As senhas informadas não são iguais.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user || userData.user.is_anonymous) {
      setError('Confirme seu e-mail antes de criar a senha.');
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(messageFromError(updateError));
    } else {
      await AsyncStorage.removeItem(ACCOUNT_SETUP_PENDING_KEY);
      setPassword('');
      setPasswordConfirmation('');
      setScreen('login');
    }
    setSubmitting(false);
  };

  const signIn = async () => {
    if (!email.trim() || password.length < 6 || submitting) {
      setError('Informe seu e-mail e uma senha de pelo menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) setError(messageFromError(signInError));
    else if (data.session) setSession(data.session);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isPermanent && screen !== 'confirmation' && screen !== 'password') return children;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}><View style={styles.brandLine} /></View>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>GYMCONTROL</Text>
            <Text style={styles.title}>
              {screen === 'protect' && 'Crie sua conta'}
              {screen === 'confirmation' && 'Confirme seu e-mail'}
              {screen === 'password' && 'Crie sua senha'}
              {screen === 'login' && 'Entre na sua conta'}
            </Text>
            <Text style={styles.subtitle}>
              {screen === 'protect' && 'Cadastre seu e-mail sem perder o histórico que já registrou.'}
              {screen === 'confirmation' && `Enviamos um link para ${email}. Abra-o e volte para continuar.`}
              {screen === 'password' && 'Escolha uma senha para acessar esta conta em outros dispositivos.'}
              {screen === 'login' && 'Use os mesmos dados cadastrados anteriormente.'}
            </Text>
          </View>

          {screen === 'protect' || screen === 'login' ? (
            <View style={styles.form}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="voce@email.com"
                placeholderTextColor="#656B70"
                style={styles.input}
                value={email}
              />
              {screen === 'login' ? (
                <>
                  <Text style={styles.label}>Senha</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="current-password"
                    onChangeText={setPassword}
                    placeholder="Sua senha"
                    placeholderTextColor="#656B70"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                  />
                </>
              ) : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable disabled={submitting} onPress={() => void (screen === 'login' ? signIn() : sendConfirmation())} style={[styles.primaryButton, submitting && styles.disabled]}>
                <Text style={styles.primaryButtonText}>{submitting ? 'Aguarde...' : screen === 'login' ? 'Entrar' : 'Continuar'}</Text>
              </Pressable>
              {screen === 'login' ? (
                <>
                  <Pressable onPress={() => { setError(null); setPassword(''); setScreen('protect'); }} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Criar minha conta</Text>
                  </Pressable>
                  <Text style={styles.note}>Ao criar sua conta, os registros atuais deste dispositivo serão mantidos.</Text>
                </>
              ) : (
                <Pressable onPress={() => { setError(null); setScreen('login'); }} style={styles.backButton}>
                  <Text style={styles.backText}>Voltar para entrar</Text>
                </Pressable>
              )}
            </View>
          ) : null}

          {screen === 'confirmation' ? (
            <View style={styles.actions}>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable disabled={submitting} onPress={() => void checkConfirmation()} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{submitting ? 'Verificando...' : 'Já confirmei meu e-mail'}</Text>
              </Pressable>
              <Pressable onPress={() => setScreen('protect')} style={styles.backButton}>
                <Text style={styles.backText}>Corrigir e-mail</Text>
              </Pressable>
            </View>
          ) : null}

          {screen === 'password' ? (
            <View style={styles.form}>
              <Text style={styles.label}>Nova senha</Text>
              <TextInput autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} placeholder="Mínimo de 6 caracteres" placeholderTextColor="#656B70" secureTextEntry style={styles.input} value={password} />
              <Text style={styles.label}>Confirme a nova senha</Text>
              <TextInput autoCapitalize="none" autoComplete="new-password" onChangeText={setPasswordConfirmation} placeholder="Digite a senha novamente" placeholderTextColor="#656B70" secureTextEntry style={styles.input} value={passwordConfirmation} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable disabled={submitting} onPress={() => void savePassword()} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{submitting ? 'Salvando...' : 'Salvar e acessar'}</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingBottom: 36 },
  brandMark: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 28, borderRadius: 15, backgroundColor: colors.primary },
  brandLine: { width: 24, height: 5, borderRadius: 999, backgroundColor: colors.text },
  heading: { gap: 8, marginBottom: 28 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  title: { maxWidth: 340, color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -0.8, lineHeight: 37 },
  subtitle: { maxWidth: 390, color: colors.textSecondary, fontSize: 15, lineHeight: 22 },
  actions: { gap: 12 },
  form: { gap: 10 },
  label: { marginTop: 4, color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
  input: { minHeight: 52, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 14, color: colors.text, backgroundColor: colors.surface, fontSize: 16 },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.primary },
  primaryButtonText: { color: colors.text, fontSize: 15, fontWeight: '900' },
  secondaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  secondaryButtonText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  backButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.textSecondary, fontSize: 14, fontWeight: '800' },
  note: { marginTop: 4, color: colors.textSecondary, textAlign: 'center', fontSize: 12, lineHeight: 18 },
  error: { color: '#FFB4B7', fontSize: 12, lineHeight: 18 },
  disabled: { opacity: 0.55 },
});
