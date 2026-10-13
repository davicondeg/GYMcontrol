import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWorkoutsStorage } from '@/storage/use-workouts-storage';
import type { WorkoutSummary } from '@/storage/workouts.types';
import { colors } from '@/theme/colors';

export default function ExercisesScreen() {
  const router = useRouter();
  const storage = useWorkoutsStorage();
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setWorkouts(await storage.list());
    } catch {
      setError('Não foi possível carregar seus treinos.');
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const createWorkout = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSaving) return;
    setIsSaving(true);
    try {
      const workout = await storage.create(trimmedName);
      setName('');
      setIsCreating(false);
      router.push({ pathname: '/workout/[id]', params: { id: workout.id } });
    } catch {
      setError('Não foi possível criar o treino.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Treinos</Text>
          <Text style={styles.subtitle}>Selecione um treino para ver seus exercícios.</Text>
        </View>

        <Pressable onPress={() => setIsCreating(true)} style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>+ Criar treino</Text>
        </Pressable>

        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!isLoading && !error && workouts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum treino criado</Text>
            <Text style={styles.emptyText}>Crie seu primeiro treino para começar a organizar os exercícios.</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {workouts.map((workout) => (
            <Pressable
              accessibilityRole="button"
              key={workout.id}
              onPress={() => router.push({ pathname: '/workout/[id]', params: { id: workout.id } })}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <View>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutCount}>{workout.exercise_count} {workout.exercise_count === 1 ? 'exercício' : 'exercícios'}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal animationType="fade" onRequestClose={() => setIsCreating(false)} transparent visible={isCreating}>
        <View style={styles.backdrop}><View style={styles.modal}>
          <Text style={styles.modalTitle}>Criar treino</Text>
          <TextInput autoFocus maxLength={40} onChangeText={setName} placeholder="Ex.: Push" placeholderTextColor={colors.textSecondary} style={styles.input} value={name} />
          <View style={styles.actions}>
            <Pressable onPress={() => setIsCreating(false)} style={styles.secondary}><Text style={styles.secondaryText}>Cancelar</Text></Pressable>
            <Pressable disabled={!name.trim() || isSaving} onPress={() => void createWorkout()} style={[styles.primary, (!name.trim() || isSaving) && styles.disabled]}><Text style={styles.primaryText}>Criar</Text></Pressable>
          </View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 28, gap: 16 },
  header: { gap: 3 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { color: colors.textSecondary, fontSize: 14 },
  createButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primary },
  primaryText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  list: { gap: 10 },
  card: { minHeight: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderRadius: 18, borderWidth: 1, borderColor: '#553035', backgroundColor: colors.surface },
  workoutName: { color: colors.text, fontSize: 18, fontWeight: '900' },
  workoutCount: { color: colors.textSecondary, marginTop: 4, fontSize: 13 },
  arrow: { color: colors.primary, fontSize: 32 },
  emptyCard: { gap: 8, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  error: { color: '#FFB4B7', textAlign: 'center' },
  pressed: { opacity: 0.68 },
  disabled: { opacity: 0.45 },
  backdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(7,9,11,0.82)' },
  modal: { gap: 16, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  modalTitle: { color: colors.text, fontSize: 21, fontWeight: '900' },
  input: { minHeight: 48, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, color: colors.text, fontSize: 15 },
  actions: { flexDirection: 'row', gap: 10 },
  secondary: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  secondaryText: { color: colors.textSecondary, fontWeight: '800' },
  primary: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.primary },
});
