import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ViewModeProvider } from '../src/contexts/ViewModeContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    Notifications.requestPermissionsAsync().catch(() => {
      // Permission prompt failing (e.g. simulator) shouldn't crash the app —
      // local notifications for new quotes/matches simply won't fire.
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ViewModeProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </ViewModeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
