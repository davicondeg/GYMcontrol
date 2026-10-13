import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AccountGate } from '@/components/account-gate';
import { DatabaseProvider } from '@/db/database-provider';
import { colors } from '@/theme/colors';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <AccountGate>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AccountGate>
    </DatabaseProvider>
  );
}
