import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseArtwork } from '@/components/exercise-artwork';
import { catalogExercises, matchesExerciseSearch } from '@/data/exercises';
import { colors } from '@/theme/colors';

export default function ExerciseCatalogScreen() {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams<{ workoutId?: string }>();
  const [query, setQuery] = useState('');
  const goBack = () => {
    if (workoutId) {
      router.dismissTo({ pathname: '/workout/[id]', params: { id: workoutId } });
    } else {
      router.dismissTo('/exercises');
    }
  };
  const exercises = catalogExercises
    .filter((exercise) => matchesExerciseSearch(exercise, query))
    .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={goBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Adicionar exercício</Text>
            <Text style={styles.subtitle}>Escolha no catálogo local.</Text>
          </View>
        </View>

        <TextInput
          accessibilityLabel="Buscar no catálogo"
          autoFocus
          onChangeText={setQuery}
          placeholder="Buscar exercício"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          value={query}
        />

        <View style={styles.list}>
          {exercises.map((exercise) => (
            <Pressable
              accessibilityRole="button"
              key={exercise.id}
              onPress={() =>
                router.push({
                  pathname: '/exercise-catalog/[catalogId]',
                  params: { catalogId: exercise.id, ...(workoutId ? { workoutId } : {}) },
                })
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <ExerciseArtwork image={exercise.image} />
              <View style={styles.cardContent}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.metadata}>
                  {[exercise.category, exercise.equipment].filter(Boolean).join(' • ')}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        {exercises.length === 0 ? (
          <Text style={styles.noResults}>Nenhum exercício encontrado no catálogo.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 28, gap: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  headerText: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.textSecondary, fontSize: 13 },
  searchInput: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
  },
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardContent: { flex: 1, gap: 4 },
  exerciseName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  metadata: { color: colors.textSecondary, fontSize: 13 },
  chevron: { color: colors.primary, fontSize: 28, fontWeight: '500' },
  noResults: { color: colors.textSecondary, paddingVertical: 30, textAlign: 'center' },
  pressed: { opacity: 0.68 },
});
