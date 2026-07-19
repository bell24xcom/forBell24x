import { Tabs } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: { backgroundColor: COLORS.navy, borderTopWidth: 0, height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: '🏠 Home' }} />
      <Tabs.Screen name="rfqs" options={{ tabBarLabel: '📋 RFQs' }} />
      <Tabs.Screen name="quotes" options={{ tabBarLabel: '💬 Quotes' }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: '👤 Profile' }} />
    </Tabs>
  );
}
