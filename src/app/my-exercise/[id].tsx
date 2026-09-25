import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { ExerciseArtwork } from '@/components/exercise-artwork';
import { resolveCatalogExercise } from '@/data/exercises';
import { getExerciseImageCredit } from '@/data/exercise-image-credits';
import type { PersonalExercise } from '@/storage/personal-exercises.types';
import { usePersonalExercisesStorage } from '@/storage/use-personal-exercises-storage';
import { colors } from '@/theme/colors';

export default function PersonalExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const storage = usePersonalExercisesStorage();
  const exerciseId = Number(id);
  const [exercise, setExercise] = useState<PersonalExercise | null>(null);
  const [personalLoad, setPersonalLoad] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/exercises');
  };

  const loadExercise = useCallback(async () => {
    if (!Number.isInteger(exerciseId)) {
      setError('Exercício inválido.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await storage.getById(exerciseId);
      if (!result) {
        setError('Exercício não encontrado.');
      } else {
        setExercise(result);
        setPersonalLoad(result.personal_load);
      }
    } catch {
      setError('Não foi possível carregar o exercício.');
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, storage]);

  useEffect(() => {
    // Personal exercise data lives outside React and is loaded asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadExercise();
  }, [loadExercise]);

  const saveLoad = async () => {
    if (!exercise || isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const nextLoad = personalLoad.trim();
      await storage.updateLoad(exercise.id, nextLoad);
      setExercise({ ...exercise, personal_load: nextLoad, updated_at: new Date().toISOString() });
      setIsEditing(false);
    } catch {
      setError('Não foi possível atualizar a carga.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={goBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const catalogExercise = resolveCatalogExercise(exercise.catalog_id, exercise.name);
  const metadata = [catalogExercise?.category, catalogExercise?.equipment]
    .filter(Boolean)
    .join(' • ');
  const imageCredit = catalogExercise ? getExerciseImageCredit(catalogExercise.id) : undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable
            accessibilityLabel="Voltar"
            onPress={goBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <ExerciseArtwork image={catalogExercise?.image} large />
          {imageCredit ? (
            <Text style={styles.imageCredit}>
              Imagem: {imageCredit.creator} / {imageCredit.sourceName} · {imageCredit.license}
            </Text>
          ) : null}

          <View style={styles.exerciseInfo}>
            <Text style={styles.title}>{exercise.name}</Text>
            {metadata ? <Text style={styles.metadata}>{metadata}</Text> : null}
          </View>

          <View style={styles.loadCard}>
            <Text style={styles.loadLabel}>MINHA CARGA</Text>
            {isEditing ? (
              <TextInput
                accessibilityLabel="Minha carga"
                autoFocus
                onChangeText={setPersonalLoad}
                placeholder="Ex.: 20 kg cada lado"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                value={personalLoad}
              />
            ) : (
              <Text style={styles.loadValue}>{exercise.personal_load || 'Não informada'}</Text>
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isEditing ? (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setPersonalLoad(exercise.personal_load);
                  setIsEditing(false);
                }}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={() => void saveLoad()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (pressed || isSaving) && styles.pressed,
                ]}>
                <Text style={styles.primaryButtonText}>
                  {isSaving ? 'Salvando...' : 'Salvar carga'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsEditing(true)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Editar carga</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.background,
  },
  container: { padding: 16, paddingBottom: 28, gap: 18 },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: { color: colors.text, fontSize: 32, lineHeight: 34 },
  exerciseInfo: { gap: 5 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  metadata: { color: colors.textSecondary, fontSize: 14 },
  imageCredit: { color: colors.textSecondary, marginTop: -12, fontSize: 11 },
  loadCard: {
    gap: 8,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#553035',
    backgroundColor: colors.surface,
  },
  loadLabel: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  loadValue: { color: colors.text, fontSize: 28, fontWeight: '900' },
  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  actions: { flexDirection: 'row', gap: 10 },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryButtonText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  cancelButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  secondaryButton: { paddingHorizontal: 18, paddingVertical: 12 },
  secondaryButtonText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  error: { color: '#FFB4B7', fontSize: 13, textAlign: 'center' },
  pressed: { opacity: 0.68 },
});
