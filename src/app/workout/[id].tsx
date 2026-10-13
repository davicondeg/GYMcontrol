import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseArtwork } from '@/components/exercise-artwork';
import { resolveCatalogExercise } from '@/data/exercises';
import type { PersonalExercise } from '@/storage/personal-exercises.types';
import { useWorkoutsStorage } from '@/storage/use-workouts-storage';
import type { Workout } from '@/storage/workouts.types';
import { colors } from '@/theme/colors';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workoutId = Number(id);
  const router = useRouter();
  const workoutsStorage = useWorkoutsStorage();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<PersonalExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [nextWorkout, assigned] = await Promise.all([
      workoutsStorage.getById(workoutId),
      workoutsStorage.listExercises(workoutId),
    ]);
    setWorkout(nextWorkout); setExercises(assigned); setIsLoading(false);
  }, [workoutId, workoutsStorage]);

  useEffect(() => {
    // Workout data lives in SQLite/IndexedDB and is loaded asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const goBack = () => router.dismissTo('/exercises');
  const removeExercise = async (exerciseId: number) => {
    if (removingId !== null) return;
    setRemovingId(exerciseId);
    try {
      await workoutsStorage.removeExercise(workoutId, exerciseId);
      setExercises((current) => current.filter((exercise) => exercise.id !== exerciseId));
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) return <SafeAreaView style={styles.center}><ActivityIndicator color={colors.primary} /></SafeAreaView>;
  if (!workout) return <SafeAreaView style={styles.center}><Text style={styles.muted}>Treino não encontrado.</Text></SafeAreaView>;

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={goBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
      <View><Text style={styles.title}>{workout.name}</Text><Text style={styles.muted}>{exercises.length} exercícios</Text></View>
      <Pressable
        onPress={() => router.push({ pathname: '/exercise-catalog', params: { workoutId } })}
        style={styles.primary}>
        <Text style={styles.primaryText}>+ Adicionar exercício</Text>
      </Pressable>
      {exercises.map((exercise) => {
        const catalog = resolveCatalogExercise(exercise.catalog_id, exercise.name);
        return <View key={exercise.id} style={styles.card}>
          <ExerciseArtwork image={catalog?.image} />
          <Pressable onPress={() => router.push({ pathname: '/my-exercise/[id]', params: { id: exercise.id, workoutId } })} style={styles.content}>
            <Text style={styles.name}>{exercise.name}</Text><Text style={styles.load}>{exercise.personal_load || 'Carga não informada'}</Text>
          </Pressable>
          <Pressable disabled={removingId !== null} onPress={() => void removeExercise(exercise.id)} style={styles.removeButton}>
            <Text style={styles.removeText}>{removingId === exercise.id ? 'Removendo...' : 'Remover'}</Text>
          </Pressable>
        </View>;
      })}
      {exercises.length === 0 ? <Text style={styles.empty}>Adicione exercícios da sua biblioteca a este treino.</Text> : null}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.background},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.background},container:{padding:16,gap:14},back:{width:44,height:44,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:colors.surface},backText:{color:colors.text,fontSize:32},title:{color:colors.text,fontSize:28,fontWeight:'900'},muted:{color:colors.textSecondary},primary:{minHeight:48,alignItems:'center',justifyContent:'center',paddingHorizontal:16,borderRadius:12,backgroundColor:colors.primary},primaryText:{color:colors.text,fontWeight:'900'},card:{flexDirection:'row',alignItems:'center',gap:12,padding:12,borderRadius:18,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},content:{flex:1,justifyContent:'center',alignSelf:'stretch'},name:{color:colors.text,fontSize:16,fontWeight:'800'},load:{color:colors.textSecondary,marginTop:5},removeButton:{minHeight:44,justifyContent:'center',paddingHorizontal:8},removeText:{color:colors.primary,fontSize:12,fontWeight:'800'},empty:{color:colors.textSecondary,textAlign:'center',padding:20},
});
