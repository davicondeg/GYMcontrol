import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { DailyTracking } from '@/storage/daily-tracking.types';
import type { EditableHabitItem, HabitItem, HabitType } from '@/storage/habits.types';
import { useDailyTrackingStorage } from '@/storage/use-daily-tracking-storage';
import { useHabitsStorage } from '@/storage/use-habits-storage';
import { getWaterIncrements } from '@/storage/water-settings.types';
import { useWaterSettingsStorage } from '@/storage/use-water-settings-storage';
import { useWorkoutsStorage } from '@/storage/use-workouts-storage';
import type { WorkoutSummary } from '@/storage/workouts.types';
import { colors } from '@/theme/colors';

const WATER_GOAL_ML = 3000;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-');

  return `${day}/${month}/${year}`;
}

function formatWaterIncrement(amount: number) {
  return amount % 1000 === 0 ? `+${amount / 1000} L` : `+${amount} ml`;
}

function CheckItem({
  checked,
  disabled,
  isLast,
  label,
  onPress,
}: {
  checked: boolean;
  disabled: boolean;
  isLast: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.checkItem,
        isLast && styles.checkItemLast,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.checkIndicator, checked && styles.checkIndicatorDone]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <Text style={[styles.itemLabel, checked && styles.itemLabelChecked]}>{label}</Text>
    </Pressable>
  );
}

export default function TodayScreen() {
  const storage = useDailyTrackingStorage();
  const habitsStorage = useHabitsStorage();
  const waterSettingsStorage = useWaterSettingsStorage();
  const workoutsStorage = useWorkoutsStorage();
  const [tracking, setTracking] = useState<DailyTracking | null>(null);
  const [waterIncrements, setWaterIncrements] = useState<[number, number, number]>([
    500, 800, 1000,
  ]);
  const [incrementDrafts, setIncrementDrafts] = useState(['500', '800', '1000']);
  const [isCustomizingWater, setIsCustomizingWater] = useState(false);
  const [habitItems, setHabitItems] = useState<HabitItem[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<Record<string, number>>({});
  const [habitDrafts, setHabitDrafts] = useState<EditableHabitItem[]>([]);
  const [customizingHabit, setCustomizingHabit] = useState<'meals' | 'supplements' | null>(null);
  const [waterAdditions, setWaterAdditions] = useState<number[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [completedWorkoutIds, setCompletedWorkoutIds] = useState<Set<number>>(new Set());
  const [updatingWorkoutId, setUpdatingWorkoutId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadToday = useCallback(async () => {
    try {
      const date = getLocalDateKey();
      const [result, waterSettings, items, completions, workoutItems, workoutSessions] = await Promise.all([
        storage.getOrCreate(date),
        waterSettingsStorage.get(),
        habitsStorage.listItems(),
        habitsStorage.listCompletions(date),
        workoutsStorage.list(),
        workoutsStorage.listSessionsBetween(date, date),
      ]);

      setTracking(result);
      const increments = getWaterIncrements(waterSettings);
      setWaterIncrements(increments);
      setIncrementDrafts(increments.map(String));
      setHabitItems(items);
      setHabitCompletions(
        Object.fromEntries(completions.map((completion) => [completion.habit_id, completion.done])),
      );
      setWorkouts(workoutItems);
      setCompletedWorkoutIds(new Set(workoutSessions.map((session) => session.workout_id)));
      setWaterAdditions([]);
    } catch {
      setError('Não foi possível carregar os dados de hoje.');
    }
  }, [habitsStorage, storage, waterSettingsStorage, workoutsStorage]);

  useEffect(() => {
    // SQLite is an external data source; loadToday updates state after its asynchronous read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadToday();
  }, [loadToday]);

  const addWater = async (amount: number) => {
    if (!tracking || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await storage.changeWater(tracking.date, amount);
      setTracking((current) =>
        current ? { ...current, water_ml: current.water_ml + amount } : current,
      );
      setWaterAdditions((current) => [...current, amount]);
    } catch {
      setError('Não foi possível atualizar o consumo de água.');
    } finally {
      setIsSaving(false);
    }
  };

  const undoWater = async () => {
    if (!tracking || isSaving || waterAdditions.length === 0) return;

    const amount = waterAdditions[waterAdditions.length - 1];
    setIsSaving(true);
    setError(null);

    try {
      await storage.changeWater(tracking.date, -amount);
      setTracking((current) =>
        current ? { ...current, water_ml: Math.max(0, current.water_ml - amount) } : current,
      );
      setWaterAdditions((current) => current.slice(0, -1));
    } catch {
      setError('Não foi possível desfazer a última adição.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItem = async (habit: HabitItem) => {
    if (!tracking || isSaving) return;

    const nextValue = habitCompletions[habit.id] === 1 ? 0 : 1;
    setIsSaving(true);
    setError(null);

    try {
      await habitsStorage.setCompletion(tracking.date, habit.id, nextValue);
      setHabitCompletions((current) => ({ ...current, [habit.id]: nextValue }));
    } catch {
      setError('Não foi possível atualizar o item.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWorkout = async (workout: WorkoutSummary) => {
    if (!tracking || updatingWorkoutId !== null) return;
    const nextValue = !completedWorkoutIds.has(workout.id);
    setUpdatingWorkoutId(workout.id);
    setError(null);
    try {
      await workoutsStorage.setCompletedOn(workout.id, tracking.date, nextValue);
      setCompletedWorkoutIds((current) => {
        const next = new Set(current);
        if (nextValue) next.add(workout.id);
        else next.delete(workout.id);
        return next;
      });
    } catch {
      setError('Não foi possível atualizar o treino de hoje.');
    } finally {
      setUpdatingWorkoutId(null);
    }
  };

  const openWaterCustomization = () => {
    setIncrementDrafts(waterIncrements.map(String));
    setError(null);
    setIsCustomizingWater(true);
  };

  const saveWaterCustomization = async () => {
    if (isSaving) return;

    const increments = incrementDrafts.map(Number);
    const isValid = increments.every(
      (value) => Number.isInteger(value) && value >= 50 && value <= 5000,
    );

    if (!isValid) {
      setError('Informe três valores entre 50 e 5.000 ml.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const nextIncrements = increments as [number, number, number];
      await waterSettingsStorage.save(nextIncrements);
      setWaterIncrements(nextIncrements);
      setIsCustomizingWater(false);
    } catch {
      setError('Não foi possível salvar os botões de água.');
    } finally {
      setIsSaving(false);
    }
  };

  const openHabitCustomization = (type: 'meals' | 'supplements') => {
    const itemType: HabitType = type === 'meals' ? 'meal' : 'supplement';
    setHabitDrafts(
      habitItems
        .filter((item) => item.type === itemType)
        .map(({ id, label }) => ({ id, label })),
    );
    setError(null);
    setCustomizingHabit(type);
  };

  const addHabitDraft = () => {
    if (!customizingHabit || habitDrafts.length >= 12) {
      setError('É possível cadastrar até 12 itens por grupo.');
      return;
    }

    const type = customizingHabit === 'meals' ? 'meal' : 'supplement';
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setHabitDrafts((current) => [...current, { id, label: '' }]);
    setError(null);
  };

  const removeHabitDraft = (id: string) => {
    if (habitDrafts.length === 1) {
      setError('Mantenha pelo menos um item neste grupo.');
      return;
    }

    setHabitDrafts((current) => current.filter((item) => item.id !== id));
    setError(null);
  };

  const saveHabitCustomization = async () => {
    if (!customizingHabit || isSaving) return;

    const labels = habitDrafts.map((item) => item.label.trim());
    if (labels.some((label) => label.length === 0 || label.length > 40)) {
      setError('Preencha todos os nomes usando até 40 caracteres.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const type: HabitType = customizingHabit === 'meals' ? 'meal' : 'supplement';
      const nextItems = habitDrafts.map((item, index) => ({ ...item, label: labels[index] }));
      const savedItems = await habitsStorage.saveItems(type, nextItems);
      setHabitItems(savedItems);
      setHabitCompletions((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([habitId]) => savedItems.some(({ id }) => id === habitId)),
        ),
      );
      setCustomizingHabit(null);
    } catch {
      setError('Não foi possível salvar os nomes dos hábitos.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tracking) {
    return (
      <SafeAreaView edges={['top']} style={styles.centeredContainer}>
        {error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              onPress={() => {
                setError(null);
                void loadToday();
              }}
              style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </>
        ) : (
          <ActivityIndicator color={colors.primary} size="large" />
        )}
      </SafeAreaView>
    );
  }

  const waterPercentage = Math.round((tracking.water_ml / WATER_GOAL_ML) * 100);
  const progressWidth = `${Math.min(waterPercentage, 100)}%` as `${number}%`;
  const mealItems = habitItems.filter((item) => item.type === 'meal');
  const supplementItems = habitItems.filter((item) => item.type === 'supplement');
  const completedMeals = mealItems.filter((item) => habitCompletions[item.id] === 1).length;
  const completedSupplements = supplementItems.filter(
    (item) => habitCompletions[item.id] === 1,
  ).length;
  const completedWorkouts = workouts.filter((workout) => completedWorkoutIds.has(workout.id)).length;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.brand}>
            GYM<Text style={styles.brandAccent}>control</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Seu acompanhamento de hoje</Text>
          <Text style={styles.date}>{formatLocalDate(tracking.date)}</Text>
        </View>

        {error ? <Text style={styles.inlineError}>{error}</Text> : null}

        <View style={[styles.card, styles.waterCard]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Água</Text>
            <Text style={styles.cardSubtitle}>Meta diária de 3.000 ml</Text>
            <Pressable
              accessibilityRole="button"
              onPress={openWaterCustomization}
              style={({ pressed }) => [styles.customizeButton, pressed && styles.pressed]}>
              <Text style={styles.customizeButtonText}>Personalizar botões</Text>
            </Pressable>
          </View>
          <Text style={styles.waterPercentage}>{waterPercentage}%</Text>
        </View>

        <View style={styles.waterAmountRow}>
          <Text style={styles.waterAmount}>{tracking.water_ml.toLocaleString('pt-BR')}</Text>
          <Text style={styles.waterUnit}> / 3.000 ml</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <View style={styles.waterActions}>
          {waterIncrements.map((amount, index) => (
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              key={index}
              onPress={() => void addWater(amount)}
              style={({ pressed }) => [
                styles.waterButton,
                (pressed || isSaving) && styles.pressed,
              ]}>
              <Text style={styles.waterButtonText}>{formatWaterIncrement(amount)}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSaving || waterAdditions.length === 0}
          onPress={() => void undoWater()}
          style={({ pressed }) => [styles.undoButton, pressed && styles.pressed]}>
          <Text
            style={[
              styles.undoButtonText,
              waterAdditions.length === 0 && styles.disabledText,
            ]}>
            Desfazer última adição
          </Text>
        </Pressable>
        </View>

        <Modal
          animationType="fade"
          onRequestClose={() => setIsCustomizingWater(false)}
          transparent
          visible={isCustomizingWater}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeading}>
                  <Text style={styles.modalTitle}>Botões de água</Text>
                  <Text style={styles.modalSubtitle}>Informe a capacidade em ml.</Text>
                </View>
                <Pressable
                  accessibilityLabel="Fechar personalização"
                  accessibilityRole="button"
                  onPress={() => setIsCustomizingWater(false)}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.incrementInputs}>
                {incrementDrafts.map((value, index) => (
                  <View key={index} style={styles.incrementField}>
                    <Text style={styles.incrementLabel}>Botão {index + 1}</Text>
                    <View style={styles.incrementInputRow}>
                      <TextInput
                        accessibilityLabel={`Quantidade do botão ${index + 1} em mililitros`}
                        keyboardType="number-pad"
                        maxLength={4}
                        onChangeText={(nextValue) =>
                          setIncrementDrafts((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? nextValue.replace(/\D/g, '') : item,
                            ),
                          )
                        }
                        selectTextOnFocus
                        style={styles.incrementInput}
                        value={value}
                      />
                      <Text style={styles.incrementUnit}>ml</Text>
                    </View>
                  </View>
                ))}
              </View>

              {error ? <Text style={styles.modalError}>{error}</Text> : null}

              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={() => setIsCustomizingWater(false)}
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={() => void saveWaterCustomization()}
                  style={({ pressed }) => [
                    styles.saveButton,
                    (pressed || isSaving) && styles.pressed,
                  ]}>
                  <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          onRequestClose={() => setCustomizingHabit(null)}
          transparent
          visible={customizingHabit !== null}>
          <ScrollView
            contentContainerStyle={styles.habitModalScroll}
            keyboardShouldPersistTaps="handled">
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeading}>
                  <Text style={styles.modalTitle}>
                    {customizingHabit === 'meals' ? 'Itens de alimentação' : 'Suplementos'}
                  </Text>
                  <Text style={styles.modalSubtitle}>Personalize os nomes exibidos na Home.</Text>
                </View>
                <Pressable
                  accessibilityLabel="Fechar personalização"
                  accessibilityRole="button"
                  onPress={() => setCustomizingHabit(null)}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.incrementInputs}>
                {habitDrafts.map((item, index) => (
                  <View key={item.id} style={styles.incrementField}>
                    <Text style={styles.incrementLabel}>Item {index + 1}</Text>
                    <View style={styles.habitEditRow}>
                      <TextInput
                        accessibilityLabel={`Nome do item ${index + 1}`}
                        maxLength={40}
                        onChangeText={(nextValue) =>
                          setHabitDrafts((current) =>
                            current.map((currentItem) =>
                              currentItem.id === item.id
                                ? { ...currentItem, label: nextValue }
                                : currentItem,
                            ),
                          )
                        }
                        selectTextOnFocus
                        style={[styles.incrementInput, styles.habitNameInput]}
                        value={item.label}
                      />
                      <Pressable
                        accessibilityLabel={`Remover item ${index + 1}`}
                        accessibilityRole="button"
                        onPress={() => removeHabitDraft(item.id)}
                        style={({ pressed }) => [styles.removeHabitButton, pressed && styles.pressed]}>
                        <Text style={styles.removeHabitButtonText}>Remover</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={addHabitDraft}
                style={({ pressed }) => [styles.addHabitButton, pressed && styles.pressed]}>
                <Text style={styles.addHabitButtonText}>+ Adicionar item</Text>
              </Pressable>

              {error ? <Text style={styles.modalError}>{error}</Text> : null}

              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={() => setCustomizingHabit(null)}
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={() => void saveHabitCustomization()}
                  style={({ pressed }) => [
                    styles.saveButton,
                    (pressed || isSaving) && styles.pressed,
                  ]}>
                  <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </Modal>

        <View style={[styles.card, styles.compactCard]}>
          <View style={[styles.cardHeader, styles.compactCardHeader]}>
            <View>
              <Text style={styles.sectionTitle}>Treino de hoje</Text>
              <Text style={styles.workoutSectionHint}>Marque os treinos realizados hoje.</Text>
            </View>
            <Text style={styles.counter}>{completedWorkouts}/{workouts.length}</Text>
          </View>

          {workouts.length > 0 ? (
            <View style={styles.checkList}>
              {workouts.map((workout, index) => (
                <CheckItem
                  checked={completedWorkoutIds.has(workout.id)}
                  disabled={updatingWorkoutId !== null}
                  isLast={index === workouts.length - 1}
                  key={workout.id}
                  label={workout.name}
                  onPress={() => void toggleWorkout(workout)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyWorkoutText}>
              Crie um treino na aba Treinos para registrá-lo aqui.
            </Text>
          )}
        </View>

        <View style={[styles.card, styles.compactCard]}>
          <View style={[styles.cardHeader, styles.compactCardHeader]}>
            <View>
              <Text style={styles.sectionTitle}>Alimentação</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => openHabitCustomization('meals')}
                style={({ pressed }) => [styles.customizeHabitButton, pressed && styles.pressed]}>
                <Text style={styles.customizeHabitButtonText}>Personalizar itens</Text>
              </Pressable>
            </View>
            <Text style={styles.counter}>{completedMeals}/{mealItems.length}</Text>
          </View>

          <View style={styles.checkList}>
            {mealItems.map((item, index) => (
              <CheckItem
                checked={habitCompletions[item.id] === 1}
                disabled={isSaving}
                isLast={index === mealItems.length - 1}
                key={item.id}
                label={item.label}
                onPress={() => void toggleItem(item)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.compactCard]}>
          <View style={[styles.cardHeader, styles.compactCardHeader]}>
            <View>
              <Text style={styles.sectionTitle}>Suplementação</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => openHabitCustomization('supplements')}
                style={({ pressed }) => [styles.customizeHabitButton, pressed && styles.pressed]}>
                <Text style={styles.customizeHabitButtonText}>Personalizar itens</Text>
              </Pressable>
            </View>
            <Text style={styles.counter}>{completedSupplements}/{supplementItems.length}</Text>
          </View>

          <View style={styles.checkList}>
            {supplementItems.map((item, index) => (
              <CheckItem
                checked={habitCompletions[item.id] === 1}
                disabled={isSaving}
                isLast={index === supplementItems.length - 1}
                key={item.id}
                label={item.label}
                onPress={() => void toggleItem(item)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.background,
  },
  intro: {
    gap: 2,
    paddingVertical: 4,
  },
  brand: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  brandAccent: {
    color: colors.primary,
  },
  headerSubtitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  card: {
    padding: 16,
    gap: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waterCard: {
    borderColor: '#23466E',
  },
  compactCard: {
    gap: 8,
    paddingVertical: 14,
  },
  compactCardHeader: {
    alignItems: 'center',
    minHeight: 28,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  customizeButton: {
    alignSelf: 'flex-start',
    minHeight: 30,
    justifyContent: 'center',
    marginTop: 4,
  },
  customizeButtonText: {
    color: colors.water,
    fontSize: 12,
    fontWeight: '700',
  },
  customizeHabitButton: {
    alignSelf: 'flex-start',
    minHeight: 26,
    justifyContent: 'center',
    marginTop: 1,
  },
  customizeHabitButtonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  workoutSectionHint: {
    color: colors.textSecondary,
    marginTop: 3,
    fontSize: 11,
  },
  emptyWorkoutText: {
    color: colors.textSecondary,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  waterPercentage: {
    color: colors.water,
    fontSize: 20,
    fontWeight: '800',
  },
  waterAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  waterAmount: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
  },
  waterUnit: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#252A30',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.water,
  },
  waterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  waterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#17375E',
    borderWidth: 1,
    borderColor: '#285B91',
  },
  waterButtonText: {
    color: '#DDEEFF',
    fontSize: 14,
    fontWeight: '800',
  },
  undoButton: {
    alignSelf: 'center',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  undoButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.4,
  },
  counter: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '800',
  },
  checkList: {
    gap: 0,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 42,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  checkItemLast: {
    borderBottomWidth: 0,
  },
  checkIndicator: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  checkIndicatorDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 17,
  },
  itemLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  itemLabelChecked: {
    color: '#B9C2BC',
  },
  pressed: {
    opacity: 0.65,
  },
  inlineError: {
    color: '#FFB4B7',
    paddingHorizontal: 4,
    fontSize: 13,
  },
  errorText: {
    color: '#FFB4B7',
    textAlign: 'center',
    fontSize: 15,
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(7, 9, 11, 0.82)',
  },
  habitModalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(7, 9, 11, 0.82)',
  },
  modalCard: {
    gap: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#23466E',
    backgroundColor: colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalHeading: { flex: 1, gap: 4 },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  modalSubtitle: { color: colors.textSecondary, fontSize: 13 },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: { color: colors.textSecondary, fontSize: 25, lineHeight: 27 },
  incrementInputs: { gap: 12 },
  incrementField: { gap: 6 },
  incrementLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  incrementInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  incrementInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  habitNameInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  habitEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeHabitButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#553035',
  },
  removeHabitButtonText: { color: '#FFB4B7', fontSize: 12, fontWeight: '800' },
  addHabitButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addHabitButtonText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  incrementUnit: { paddingRight: 14, color: colors.textSecondary, fontSize: 14 },
  modalError: { color: '#FFB4B7', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: '800' },
  saveButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.water,
  },
  saveButtonText: { color: '#08111C', fontSize: 14, fontWeight: '900' },
});
