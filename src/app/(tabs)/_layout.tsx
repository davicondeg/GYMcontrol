import { Tabs } from 'expo-router';
import { type ColorValue, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

function TodayIcon({ color }: { color: ColorValue }) {
  return (
    <View style={[styles.calendar, { borderColor: color }]}>
      <View style={[styles.calendarTop, { backgroundColor: color }]} />
      <View style={[styles.calendarDot, { backgroundColor: color }]} />
    </View>
  );
}

function ExercisesIcon({ color }: { color: ColorValue }) {
  return (
    <View style={styles.dumbbell}>
      <View style={[styles.dumbbellWeight, { borderColor: color }]} />
      <View style={[styles.dumbbellBar, { backgroundColor: color }]} />
      <View style={[styles.dumbbellWeight, { borderColor: color }]} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(insets.bottom, 7),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarItemStyle: {
          minHeight: 50,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Hoje',
          tabBarLabel: 'Hoje',
          tabBarIcon: ({ color }) => <TodayIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercícios',
          tabBarLabel: 'Exercícios',
          tabBarIcon: ({ color }) => <ExercisesIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  calendar: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.7,
    borderRadius: 6,
  },
  calendarTop: {
    position: 'absolute',
    top: 4,
    width: 13,
    height: 1.5,
    borderRadius: 1,
  },
  calendarDot: {
    width: 4,
    height: 4,
    marginTop: 5,
    borderRadius: 2,
  },
  dumbbell: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dumbbellWeight: {
    width: 6,
    height: 17,
    borderWidth: 1.7,
    borderRadius: 3,
  },
  dumbbellBar: {
    width: 12,
    height: 2,
  },
});
