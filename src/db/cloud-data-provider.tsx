import { type PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { loadLocalSnapshot } from '@/storage/load-local-snapshot';
import { migrateLocalToSupabase } from '@/storage/migrate-local-to-supabase';
import { colors } from '@/theme/colors';

export function CloudDataProvider({ children }: PropsWithChildren) {
  const database = useSQLiteContext();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    void loadLocalSnapshot(database)
      .then(migrateLocalToSupabase)
      .then(() => setStatus('ready'))
      .catch((error) => {
        console.error('Falha ao inicializar o Supabase.', error);
        setStatus('error');
      });
  }, [database]);

  const retry = () => {
    setStatus('loading');
    void loadLocalSnapshot(database)
      .then(migrateLocalToSupabase)
      .then(() => setStatus('ready'))
      .catch((error) => {
        console.error('Falha ao inicializar o Supabase.', error);
        setStatus('error');
      });
  };

  if (status === 'ready') return children;

  return (
    <View style={styles.container}>
      {status === 'loading' ? (
        <>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.text}>Sincronizando seus dados...</Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>Não foi possível conectar ao banco</Text>
          <Text style={styles.text}>Confira sua internet e tente novamente.</Text>
          <Pressable onPress={retry} style={styles.button}>
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  text: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  button: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 12, backgroundColor: colors.primary },
  buttonText: { color: colors.text, fontWeight: '800' },
});
