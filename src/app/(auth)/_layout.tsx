// src/app/(auth)/_layout.tsx
// Layout grup autentikasi — Stack tanpa header karena login/register punya header sendiri

import { Stack } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function AuthLayout() {
  const { warna } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown:  false,
        contentStyle: { backgroundColor: warna.background },
      }}
    />
  );
}

