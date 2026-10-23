import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';
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

import { createDefaultGoals } from '@/storage/goals.types';
import { useGoalsStorage } from '@/storage/use-goals-storage';
import { colors } from '@/theme/colors';

const initialDrafts = {
  workouts: '3',
  water: '3000',
  meals: '6',
  supplements: '2',
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function GoalsOnboardingGate({ children }: PropsWithChildren) {
  const goalsStorage = useGoalsStorage();
  const [drafts, setDrafts] = useState(initialDrafts);
  const [isChecking, setIsChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkGoals = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const goals = await goalsStorage.list();
      setNeedsOnboarding(goals.length === 0);
    } catch {
      setError('Não foi possível verificar suas metas. Tente novamente.');
    } finally {
      setIsChecking(false);
    }
  }, [goalsStorage]);

  useEffect(() => {
    // Supabase is an external data source; checkGoals updates state after its asynchronous read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkGoals();
  }, [checkGoals]);

  const saveGoals = async (useSuggestions = false) => {
    if (isSaving) return;
    const date = getLocalDateKey();
    const suggestions = createDefaultGoals(date);
    const values = {
      workouts: useSuggestions ? suggestions.workout_target_weekly : Number(drafts.workouts),
      water: useSuggestions ? suggestions.water_goal_ml : Number(drafts.water),
      meals: useSuggestions ? suggestions.meal_target_daily : Number(drafts.meals),
      supplements: useSuggestions ? suggestions.supplement_target_daily : Number(drafts.supplements),
    };
    const isValid =
      Number.isInteger(values.workouts) && values.workouts >= 0 && values.workouts <= 14 &&
      Number.isInteger(values.water) && values.water >= 0 && values.water <= 10000 &&
      Number.isInteger(values.meals) && values.meals >= 0 && values.meals <= 20 &&
      Number.isInteger(values.supplements) && values.supplements >= 0 && values.supplements <= 20;

    if (!isValid) {
      setError('Revise os valores informados para suas metas.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await goalsStorage.save({
        effective_from: date,
        workout_target_weekly: values.workouts,
        water_goal_ml: values.water,
        meal_target_daily: values.meals,
        supplement_target_daily: values.supplements,
      });
      setNeedsOnboarding(false);
    } catch {
      setError('Não foi possível salvar suas metas. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!needsOnboarding && !error) return children;

  if (!needsOnboarding) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={() => void checkGoals()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Tentar novamente</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}><View style={styles.brandLine} /></View>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>PRIMEIROS PASSOS</Text>
            <Text style={styles.title}>Defina suas metas</Text>
            <Text style={styles.subtitle}>
              Elas serão usadas para acompanhar seu progresso e mostrar se você cumpriu seus objetivos.
            </Text>
          </View>

          <View style={styles.card}>
            {[
              { key: 'workouts' as const, label: 'Treinos por semana', unit: 'treinos' },
              { key: 'water' as const, label: 'Meta diária de água', unit: 'ml' },
              { key: 'meals' as const, label: 'Refeições por dia', unit: 'refeições' },
              { key: 'supplements' as const, label: 'Suplementos por dia', unit: 'itens' },
            ].map((field) => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={(value) => setDrafts((current) => ({
                      ...current,
                      [field.key]: value.replace(/\D/g, ''),
                    }))}
                    selectTextOnFocus
                    style={styles.input}
                    value={drafts[field.key]}
                  />
                  <Text style={styles.unit}>{field.unit}</Text>
                </View>
              </View>
            ))}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable disabled={isSaving} onPress={() => void saveGoals()} style={[styles.primaryButton, isSaving && styles.disabled]}>
              <Text style={styles.primaryButtonText}>{isSaving ? 'Salvando...' : 'Salvar e começar'}</Text>
            </Pressable>
            <Pressable disabled={isSaving} onPress={() => void saveGoals(true)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Usar metas sugeridas</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 22, gap: 22 },
  brandMark: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.primary },
  brandLine: { width: 22, height: 4, borderRadius: 999, backgroundColor: colors.text },
  heading: { gap: 7 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.7 },
  subtitle: { maxWidth: 520, color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  card: { width: '100%', maxWidth: 560, gap: 15, padding: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface },
  field: { gap: 6 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.background },
  input: { flex: 1, minHeight: 48, paddingHorizontal: 14, color: colors.text, fontSize: 17, fontWeight: '900' },
  unit: { paddingRight: 14, color: colors.textSecondary, fontSize: 12 },
  error: { color: '#FFB4B7', textAlign: 'center', fontSize: 12 },
  primaryButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, borderRadius: 12, backgroundColor: colors.primary },
  primaryButtonText: { color: colors.text, fontSize: 14, fontWeight: '900' },
  secondaryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  secondaryButtonText: { color: colors.textSecondary, fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.55 },
});
