// src/services/supabase.ts
// Klien Supabase tunggal untuk seluruh aplikasi.
// Membaca URL dan kunci dari variabel lingkungan EXPO_PUBLIC_*.

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rawUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const rawKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

export const supabaseTerhubung =
  (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) &&
  !rawUrl.includes('placeholder.supabase.co');

const supabaseUrl = supabaseTerhubung ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnon = rawKey.length > 0 ? rawKey : 'placeholder-anon-key';

if (!supabaseTerhubung || !rawKey) {
  // Peringatan di development; tidak crash agar bisa dibuka tanpa .env
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL atau EXPO_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env'
  );
}

/**
 * Klien Supabase yang siap dipakai.
 * Sesi pengguna disimpan di AsyncStorage supaya tetap login setelah restart.
 * JANGAN pernah memakai service_role key di sini.
 */
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage:          AsyncStorage,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});

