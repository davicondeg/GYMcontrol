import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
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
import { getCatalogExercise } from '@/data/exercises';
import { getExerciseImageCredit } from '@/data/exercise-image-credits';
import { usePersonalExercisesStorage } from '@/storage/use-personal-exercises-storage';
import { useWorkoutsStorage } from '@/storage/use-workouts-storage';
import { colors } from '@/theme/colors';

export default function AddCatalogExerciseScreen() {
  const { catalogId, workoutId } = useLocalSearchParams<{ catalogId: string; workoutId?: string }>();
  const router = useRouter();
  const storage = usePersonalExercisesStorage();
  const workoutsStorage = useWorkoutsStorage();
  const exercise = getCatalogExercise(catalogId);
  const imageCredit = getExerciseImageCredit(catalogId);
  const [personalLoad, setPersonalLoad] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/exercise-catalog',
        params: workoutId ? { workoutId } : {},
      });
    }
  };

  if (!exercise) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>Exercício não encontrado.</Text>
        <Pressable onPress={goBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const saveExercise = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await storage.addFromCatalog(exercise.id, exercise.name, personalLoad.trim());

      if (workoutId) {
        await workoutsStorage.addExercise(Number(workoutId), result.exercise.id);
        router.dismissTo({ pathname: '/workout/[id]', params: { id: workoutId } });
        return;
      }

      if (!result.created) {
        setMessage('Este exercício já está em Meus exercícios.');
        return;
      }

      router.dismissTo('/exercises');
    } catch {
      setMessage('Não foi possível adicionar o exercício.');
    } finally {
      setIsSaving(false);
    }
  };

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

          <ExerciseArtwork image={exercise.image} large />
          {imageCredit ? (
            <Text style={styles.imageCredit}>
              Imagem: {imageCredit.creator} / {imageCredit.sourceName} · {imageCredit.license}
            </Text>
          ) : null}

          <View style={styles.exerciseInfo}>
            <Text style={styles.title}>{exercise.name}</Text>
            <Text style={styles.metadata}>
              {[exercise.category, exercise.equipment].filter(Boolean).join(' • ')}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Minha carga</Text>
            <TextInput
              accessibilityLabel="Minha carga"
              autoCapitalize="sentences"
              onChangeText={setPersonalLoad}
              placeholder="Ex.: 20 kg cada lado"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={personalLoad}
            />
            <Text style={styles.hint}>Você poderá alterar esta informação depois.</Text>
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={() => void saveExercise()}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isSaving) && styles.pressed,
            ]}>
            <Text style={styles.primaryButtonText}>
              {isSaving
                ? 'Adicionando...'
                : workoutId
                  ? 'Adicionar ao treino'
                  : 'Adicionar aos Meus exercícios'}
            </Text>
          </Pressable>
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
  form: { gap: 8 },
  label: { color: colors.text, fontSize: 15, fontWeight: '800' },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 17,
  },
  hint: { color: colors.textSecondary, fontSize: 12 },
  message: { color: '#FFB4B7', fontSize: 13, textAlign: 'center' },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryButtonText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  secondaryButton: { paddingHorizontal: 18, paddingVertical: 12 },
  secondaryButtonText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  error: { color: '#FFB4B7', fontSize: 15 },
  pressed: { opacity: 0.68 },
});
