import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
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

import { WhatsAppConnectionCard } from '@/components/whatsapp-connection-card';
import type { DailyTracking } from '@/storage/daily-tracking.types';
import type { HabitCompletion, HabitItem } from '@/storage/habits.types';
import { createDefaultGoals, type GoalVersion } from '@/storage/goals.types';
import { useDailyTrackingStorage } from '@/storage/use-daily-tracking-storage';
import { useGoalsStorage } from '@/storage/use-goals-storage';
import { useHabitsStorage } from '@/storage/use-habits-storage';
import { colors } from '@/theme/colors';

const DAYS_IN_PERIOD = 7;
const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type DaySummary = {
  date: string;
  dayLabel: string;
  dayNumber: string;
  adherence: number;
  trained: boolean;
  waterMl: number;
  completedHabits: number;
};

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatLiters(amount: number) {
  return `${(amount / 1000).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} L`;
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricItem}>
      <View style={styles.metricMark} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function GoalProgress({ label, value, detail }: { label: string; value: number; detail: string }) {
  const percentage = Math.min(100, Math.round(value * 100));
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalRowHeader}>
        <Text style={styles.goalName}>{label}</Text>
        <Text style={styles.goalResult}>{detail}</Text>
      </View>
      <View style={styles.goalTrack}>
        <View style={[styles.goalFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

export default function OverviewScreen() {
  const trackingStorage = useDailyTrackingStorage();
  const habitsStorage = useHabitsStorage();
  const goalsStorage = useGoalsStorage();
  const [trackings, setTrackings] = useState<DailyTracking[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [habitItems, setHabitItems] = useState<HabitItem[]>([]);
  const [goalVersions, setGoalVersions] = useState<GoalVersion[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [goalDrafts, setGoalDrafts] = useState({ workouts: '3', water: '3000', meals: '6', supplements: '2' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const endDate = getLocalDateKey(today);
      const historyStartDate = getLocalDateKey(addDays(today, -364));
      const [trackingHistory, completionHistory, items, goals] = await Promise.all([
        trackingStorage.listBetween(historyStartDate, endDate),
        habitsStorage.listCompletionsBetween(historyStartDate, endDate),
        habitsStorage.listItems(),
        goalsStorage.list(),
      ]);

      setTrackings(trackingHistory);
      setCompletions(completionHistory);
      setHabitItems(items);
      setGoalVersions(goals);
    } catch {
      setError('Não foi possível carregar os dados da visão geral.');
    } finally {
      setIsLoading(false);
    }
  }, [goalsStorage, habitsStorage, trackingStorage]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const metrics = useMemo(() => {
    const today = new Date();
    const todayKey = getLocalDateKey(today);
    const currentGoals = goalVersions.reduce(
      (selected, goal) => goal.effective_from <= todayKey ? goal : selected,
      createDefaultGoals('1970-01-01'),
    );
    const trackingByDate = new Map(trackings.map((tracking) => [tracking.date, tracking]));
    const completedByDate = new Map<string, number>();

    for (const completion of completions) {
      if (completion.done === 1) {
        completedByDate.set(completion.date, (completedByDate.get(completion.date) ?? 0) + 1);
      }
    }

    const days: DaySummary[] = Array.from({ length: DAYS_IN_PERIOD }, (_, index) => {
      const date = addDays(today, index - (DAYS_IN_PERIOD - 1));
      const dateKey = getLocalDateKey(date);
      const completedHabits = completedByDate.get(dateKey) ?? 0;
      const mealIds = new Set(habitItems.filter((item) => item.type === 'meal').map((item) => item.id));
      const supplementIds = new Set(
        habitItems.filter((item) => item.type === 'supplement').map((item) => item.id),
      );
      const dayCompletions = completions.filter(
        (completion) => completion.date === dateKey && completion.done === 1,
      );
      const completedMeals = dayCompletions.filter((item) => mealIds.has(item.habit_id)).length;
      const completedSupplements = dayCompletions.filter((item) => supplementIds.has(item.habit_id)).length;
      const waterMl = trackingByDate.get(dateKey)?.water_ml ?? 0;
      const dailyTarget =
        currentGoals.meal_target_daily + currentGoals.supplement_target_daily +
        (currentGoals.water_goal_ml > 0 ? 1 : 0);
      const dailyCompleted =
        Math.min(completedMeals, currentGoals.meal_target_daily) +
        Math.min(completedSupplements, currentGoals.supplement_target_daily) +
        (currentGoals.water_goal_ml > 0 && waterMl >= currentGoals.water_goal_ml ? 1 : 0);
      const adherence = dailyTarget ? Math.round((dailyCompleted / dailyTarget) * 100) : 100;

      return {
        date: dateKey,
        dayLabel: WEEKDAY_LABELS[date.getDay()],
        dayNumber: String(date.getDate()).padStart(2, '0'),
        adherence,
        trained: trackingByDate.get(dateKey)?.workout_done === 1,
        waterMl,
        completedHabits,
      };
    });

    const periodDates = new Set(days.map((day) => day.date));
    const completedMealsInPeriod = completions.filter(
      (completion) =>
        completion.done === 1 &&
        periodDates.has(completion.date) &&
        habitItems.some((item) => item.id === completion.habit_id && item.type === 'meal'),
    ).length;
    const completedSupplementsInPeriod = completions.filter(
      (completion) =>
        completion.done === 1 &&
        periodDates.has(completion.date) &&
        habitItems.some((item) => item.id === completion.habit_id && item.type === 'supplement'),
    ).length;
    const waterDaysMet = days.filter(
      (day) => currentGoals.water_goal_ml > 0 && day.waterMl >= currentGoals.water_goal_ml,
    ).length;
    const workoutDates = new Set(
      trackings.filter((tracking) => tracking.workout_done === 1).map((tracking) => tracking.date),
    );
    const workoutsCompleted = [...workoutDates].filter((date) => periodDates.has(date)).length;
    const mealTargetTotal = currentGoals.meal_target_daily * DAYS_IN_PERIOD;
    const supplementTargetTotal = currentGoals.supplement_target_daily * DAYS_IN_PERIOD;
    const goalResults = [
      {
        label: 'treinos',
        enabled: currentGoals.workout_target_weekly > 0,
        rate: currentGoals.workout_target_weekly
          ? Math.min(workoutsCompleted / currentGoals.workout_target_weekly, 1)
          : 1,
      },
      {
        label: 'hidratação',
        enabled: currentGoals.water_goal_ml > 0,
        rate: currentGoals.water_goal_ml > 0 ? waterDaysMet / DAYS_IN_PERIOD : 1,
      },
      {
        label: 'alimentação',
        enabled: mealTargetTotal > 0,
        rate: mealTargetTotal ? Math.min(completedMealsInPeriod / mealTargetTotal, 1) : 1,
      },
      {
        label: 'suplementação',
        enabled: supplementTargetTotal > 0,
        rate: supplementTargetTotal
          ? Math.min(completedSupplementsInPeriod / supplementTargetTotal, 1)
          : 1,
      },
    ];
    const activeGoalResults = goalResults.filter((goal) => goal.enabled);
    const totalCompleted = activeGoalResults.filter((goal) => goal.rate >= 1).length;
    const possibleCompletions = activeGoalResults.length;
    const overallAdherence = possibleCompletions
      ? Math.round(
          (activeGoalResults.reduce((sum, goal) => sum + goal.rate, 0) / possibleCompletions) * 100,
        )
      : 100;
    const averageWater = days.reduce((sum, day) => sum + day.waterMl, 0) / DAYS_IN_PERIOD;
    const activeDays = days.filter(
      (day) => day.completedHabits > 0 || day.waterMl > 0 || workoutDates.has(day.date),
    ).length;

    const categoryRates = [...activeGoalResults].sort((first, second) => second.rate - first.rate);

    const insight = categoryRates.length > 0 && categoryRates[0].rate > 0
      ? `Sua maior consistência nesta semana foi em ${categoryRates[0].label}.`
      : 'Continue registrando seus hábitos para receber análises semanais.';

    let currentStreak = 0;
    for (let offset = 0; offset < 365; offset += 1) {
      const dateKey = getLocalDateKey(addDays(today, -offset));
      const hasActivity =
        (completedByDate.get(dateKey) ?? 0) > 0 ||
        (trackingByDate.get(dateKey)?.water_ml ?? 0) > 0 ||
        workoutDates.has(dateKey);
      if (!hasActivity) break;
      currentStreak += 1;
    }

    return {
      days,
      totalCompleted,
      possibleCompletions,
      overallAdherence,
      averageWater,
      activeDays,
      currentStreak,
      insight,
      currentGoals,
      completedMealsInPeriod,
      completedSupplementsInPeriod,
      waterDaysMet,
      workoutsCompleted,
    };
  }, [completions, goalVersions, habitItems, trackings]);

  const selectedDay = metrics.days.find((day) => day.date === selectedDate) ?? null;

  const openGoals = () => {
    setGoalDrafts({
      workouts: String(metrics.currentGoals.workout_target_weekly),
      water: String(metrics.currentGoals.water_goal_ml),
      meals: String(metrics.currentGoals.meal_target_daily),
      supplements: String(metrics.currentGoals.supplement_target_daily),
    });
    setError(null);
    setIsEditingGoals(true);
  };

  const saveGoals = async () => {
    if (isSavingGoals) return;
    const values = {
      workouts: Number(goalDrafts.workouts),
      water: Number(goalDrafts.water),
      meals: Number(goalDrafts.meals),
      supplements: Number(goalDrafts.supplements),
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

    setIsSavingGoals(true);
    try {
      await goalsStorage.save({
        effective_from: getLocalDateKey(new Date()),
        workout_target_weekly: values.workouts,
        water_goal_ml: values.water,
        meal_target_daily: values.meals,
        supplement_target_daily: values.supplements,
      });
      setIsEditingGoals(false);
      await load();
    } catch {
      setError('Não foi possível salvar suas metas.');
    } finally {
      setIsSavingGoals(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Visão geral</Text>
          <Text style={styles.subtitle}>Seu desempenho nos últimos 7 dias.</Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void load()} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Resumo da semana</Text>
                <Text style={styles.periodBadge}>7 dias</Text>
              </View>
              <View style={styles.adherenceBlock}>
                <Text style={styles.adherenceValue}>{metrics.overallAdherence}%</Text>
                <Text style={styles.adherenceLabel}>adesão geral</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${metrics.overallAdherence}%` }]} />
              </View>
              <Text style={styles.summaryDetail}>
                {metrics.totalCompleted} de {metrics.possibleCompletions} metas concluídas
              </Text>
            </View>

            <View style={styles.metricsCard}>
              <MetricItem label="Sequência" value={`${metrics.currentStreak}d`} />
              <View style={styles.metricDivider} />
              <MetricItem label="Água média" value={formatLiters(metrics.averageWater)} />
              <View style={styles.metricDivider} />
              <MetricItem label="Dias ativos" value={`${metrics.activeDays}/7`} />
            </View>

            <View style={styles.goalsCard}>
              <View style={styles.goalsHeader}>
                <View style={styles.chartHeading}>
                  <Text style={styles.chartTitle}>Progresso por meta</Text>
                  <Text style={styles.chartSubtitle}>Resultados comparados às suas escolhas</Text>
                </View>
                <Pressable onPress={openGoals} style={styles.editGoalsButton}>
                  <Text style={styles.editGoalsText}>Editar</Text>
                </Pressable>
              </View>
              <GoalProgress
                detail={`${metrics.workoutsCompleted}/${metrics.currentGoals.workout_target_weekly}`}
                label="Treinos"
                value={metrics.currentGoals.workout_target_weekly ? metrics.workoutsCompleted / metrics.currentGoals.workout_target_weekly : 1}
              />
              <GoalProgress
                detail={`${metrics.waterDaysMet}/7 dias`}
                label="Água"
                value={metrics.currentGoals.water_goal_ml ? metrics.waterDaysMet / 7 : 1}
              />
              <GoalProgress
                detail={`${metrics.completedMealsInPeriod}/${metrics.currentGoals.meal_target_daily * 7}`}
                label="Alimentação"
                value={metrics.currentGoals.meal_target_daily ? metrics.completedMealsInPeriod / (metrics.currentGoals.meal_target_daily * 7) : 1}
              />
              <GoalProgress
                detail={`${metrics.completedSupplementsInPeriod}/${metrics.currentGoals.supplement_target_daily * 7}`}
                label="Suplementação"
                value={metrics.currentGoals.supplement_target_daily ? metrics.completedSupplementsInPeriod / (metrics.currentGoals.supplement_target_daily * 7) : 1}
              />
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={styles.chartHeading}>
                  <Text style={styles.chartTitle}>Adesão diária</Text>
                  <Text style={styles.chartSubtitle}>Percentual de hábitos concluídos</Text>
                </View>
                <Text style={styles.chartHint}>Toque nas barras</Text>
              </View>

              <View style={styles.chartFeedback}>
                <Text style={styles.chartFeedbackText}>
                  {selectedDay
                    ? `${selectedDay.dayLabel}, dia ${selectedDay.dayNumber}  •  Treino: ${selectedDay.trained ? 'sim' : 'não'}  •  ${selectedDay.adherence}% de adesão`
                    : 'Selecione um dia para ver o resultado'}
                </Text>
              </View>

              <View style={styles.chart}>
                {metrics.days.map((day, index) => {
                  const isToday = index === metrics.days.length - 1;
                  const isSelected = selectedDate === day.date;
                  return (
                  <Pressable
                    accessibilityLabel={`${day.dayLabel}, dia ${day.dayNumber}: ${day.adherence}% de adesão`}
                    accessibilityRole="button"
                    key={day.date}
                    onPress={() => setSelectedDate(day.date)}
                    style={({ pressed }) => [styles.chartColumn, pressed && styles.pressed]}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          (isToday || isSelected) && styles.barFillActive,
                          {
                            height:
                              day.adherence === 0
                                ? 0
                                : Math.max(4, Math.round((day.adherence / 100) * 120)),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                      {day.dayLabel.slice(0, 1)}
                    </Text>
                    <Text style={[styles.dayNumber, isToday && styles.dayLabelToday]}>
                      {day.dayNumber}
                    </Text>
                  </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Insight da semana</Text>
                <Text style={styles.insightText}>{metrics.insight}</Text>
              </View>
            </View>

            <WhatsAppConnectionCard />
          </>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsEditingGoals(false)}
        transparent
        visible={isEditingGoals}>
        <ScrollView contentContainerStyle={styles.modalBackdrop} keyboardShouldPersistTaps="handled">
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.chartHeading}>
                <Text style={styles.modalTitle}>
                  Minhas metas
                </Text>
                <Text style={styles.chartSubtitle}>
                  Os novos valores passam a valer a partir de hoje.
                </Text>
              </View>
              <Pressable onPress={() => setIsEditingGoals(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            {[
              { key: 'workouts' as const, label: 'Treinos por semana', unit: 'treinos' },
              { key: 'water' as const, label: 'Meta diária de água', unit: 'ml' },
              { key: 'meals' as const, label: 'Refeições por dia', unit: 'refeições' },
              { key: 'supplements' as const, label: 'Suplementos por dia', unit: 'itens' },
            ].map((field) => (
              <View key={field.key} style={styles.goalField}>
                <Text style={styles.goalFieldLabel}>{field.label}</Text>
                <View style={styles.goalInputRow}>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={(value) => setGoalDrafts((current) => ({
                      ...current,
                      [field.key]: value.replace(/\D/g, ''),
                    }))}
                    selectTextOnFocus
                    style={styles.goalInput}
                    value={goalDrafts[field.key]}
                  />
                  <Text style={styles.goalUnit}>{field.unit}</Text>
                </View>
              </View>
            ))}

            {error ? <Text style={styles.modalError}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable
                disabled={isSavingGoals}
                onPress={() => setIsEditingGoals(false)}
                style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable disabled={isSavingGoals} onPress={() => void saveGoals()} style={styles.saveButton}>
                <Text style={styles.saveText}>
                  {isSavingGoals ? 'Salvando...' : 'Salvar metas'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, paddingBottom: 28, gap: 16 },
  header: { gap: 3 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { color: colors.textSecondary, fontSize: 14 },
  summaryCard: {
    gap: 14,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#553035',
    backgroundColor: colors.surface,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  adherenceBlock: { alignItems: 'center', paddingVertical: 2 },
  adherenceValue: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  adherenceLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  progressTrack: {
    height: 9,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#252A30',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  summaryDetail: { color: colors.textSecondary, textAlign: 'center', fontSize: 12 },
  metricsCard: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  metricItem: { flex: 1, alignItems: 'center', gap: 3, paddingHorizontal: 3 },
  metricMark: { width: 18, height: 3, borderRadius: 999, backgroundColor: colors.primary },
  metricValue: { color: colors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  metricLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  metricDivider: { width: 1, height: 44, backgroundColor: colors.border },
  goalsCard: {
    gap: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  editGoalsButton: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#553035',
  },
  editGoalsText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  goalRow: { gap: 7 },
  goalRowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalName: { color: colors.text, fontSize: 13, fontWeight: '800' },
  goalResult: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  goalTrack: { height: 7, overflow: 'hidden', borderRadius: 999, backgroundColor: '#252A30' },
  goalFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  chartCard: {
    gap: 14,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  chartHeading: { flex: 1, gap: 3 },
  chartTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  chartSubtitle: { color: colors.textSecondary, fontSize: 12 },
  chartHint: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  periodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: 'hidden',
    borderRadius: 999,
    color: colors.primary,
    backgroundColor: '#3A1F22',
    fontSize: 11,
    fontWeight: '800',
  },
  chartFeedback: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  chartFeedbackText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  chart: { height: 176, flexDirection: 'row', alignItems: 'flex-end', gap: 5 },
  chartColumn: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: {
    width: '68%',
    height: 120,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 7,
    backgroundColor: '#252A30',
  },
  barFill: { width: '100%', borderRadius: 7, backgroundColor: '#733438' },
  barFillActive: { backgroundColor: colors.primary },
  dayLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '800' },
  dayNumber: { color: colors.textSecondary, fontSize: 9 },
  dayLabelToday: { color: colors.primary },
  pressed: { opacity: 0.65 },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  insightContent: { flex: 1, gap: 3 },
  insightLabel: { color: colors.text, fontSize: 13, fontWeight: '900' },
  insightText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  modalBackdrop: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(7, 9, 11, 0.86)',
  },
  modalCard: {
    gap: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: { color: colors.textSecondary, fontSize: 24, lineHeight: 26 },
  goalField: { gap: 6 },
  goalFieldLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  goalInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  goalUnit: { paddingRight: 14, color: colors.textSecondary, fontSize: 12 },
  modalError: { color: '#FFB4B7', fontSize: 12 },
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
  cancelText: { color: colors.textSecondary, fontSize: 13, fontWeight: '800' },
  saveButton: {
    flex: 1.3,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  saveText: { color: colors.text, fontSize: 13, fontWeight: '900' },
  errorCard: {
    gap: 14,
    alignItems: 'center',
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  errorText: { color: '#FFB4B7', textAlign: 'center', fontSize: 14 },
  retryButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryText: { color: colors.text, fontSize: 13, fontWeight: '800' },
});
