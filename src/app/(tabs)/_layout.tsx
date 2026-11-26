// src/app/(tabs)/_layout.tsx
// Layout tab utama: Beranda, Tambah, Riwayat, Pengaturan, Tentang — ikon Ionicons, warna dari tema.

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';

type NamaIonicons = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const { warna } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown:             true,
        headerStyle:             { backgroundColor: warna.background },
        headerTintColor:         warna.text,
        headerTitleStyle:        { fontWeight: '700' },
        tabBarStyle:             { backgroundColor: warna.background, borderTopColor: warna.border },
        tabBarActiveTintColor:   warna.primary,
        tabBarInactiveTintColor: warna.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarLabel: 'Beranda',
          headerTitle: 'TemuBarang',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={'home' as NamaIonicons} size={size} color={String(color ?? warna.primary)} />
          ),
        }}
      />
      <Tabs.Screen
        name="tambah"
        options={{
          title: 'Tambah Laporan',
          tabBarLabel: 'Tambah',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={'add-circle' as NamaIonicons} size={size} color={String(color ?? warna.primary)} />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat Saya',
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={'list' as NamaIonicons} size={size} color={String(color ?? warna.primary)} />
          ),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: 'Pengaturan',
          tabBarLabel: 'Pengaturan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={'settings-outline' as NamaIonicons} size={size} color={String(color ?? warna.primary)} />
          ),
        }}
      />
      <Tabs.Screen
        name="tentang"
        options={{
          title: 'Tentang',
          tabBarLabel: 'Tentang',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={'information-circle-outline' as NamaIonicons} size={size} color={String(color ?? warna.primary)} />
          ),
        }}
      />
    </Tabs>
  );
}
