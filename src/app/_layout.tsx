// src/app/_layout.tsx
// Root layout: membungkus aplikasi dengan ThemeProvider dan menjaga status login.
// Belum login → arahkan ke /login; sudah login → tampilkan tab utama.

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/use-auth';

/** Komponen dalam yang bisa mengakses tema dan auth */
function PenjagaLogin() {
  const { sesi, sedangMemuat } = useAuth();
  const { temaAktif, warna } = useAppTheme();
  const router = useRouter();
  const segmen = useSegments();

  useEffect(() => {
    if (sedangMemuat) return;

    const diHalamanAuth = segmen[0] === '(auth)';

    if (!sesi && !diHalamanAuth) {
      // Belum login → paksa ke halaman login
      router.replace('/(auth)/login');
    } else if (sesi && diHalamanAuth) {
      // Sudah login → masuk ke beranda
      router.replace('/(tabs)');
    }
  }, [sesi, sedangMemuat, segmen, router]);

  return (
    <>
      <StatusBar style={temaAktif === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle:     { backgroundColor: warna.background },
          headerTintColor: warna.text,
          contentStyle:    { backgroundColor: warna.background },
          headerShown:     false,
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="detail/[id]"
          options={{ headerShown: true, title: 'Detail Barang' }}
        />
        <Stack.Screen
          name="edit/[id]"
          options={{ headerShown: true, title: 'Edit Laporan' }}
        />
      </Stack>
    </>
  );
}

/** Root layout — ThemeProvider harus di luar agar PenjagaLogin bisa pakai useAppTheme */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <PenjagaLogin />
    </ThemeProvider>
  );
}

