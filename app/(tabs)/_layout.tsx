import { Tabs } from 'expo-router';

import { colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="lecture" options={{ title: 'Lecture' }} />
      <Tabs.Screen name="search" options={{ title: 'Recherche' }} />
    </Tabs>
  );
}
