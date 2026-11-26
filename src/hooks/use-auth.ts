// src/hooks/use-auth.ts
// Hook untuk memantau status autentikasi pengguna secara real-time.

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface HasilUseAuth {
  /** Sesi aktif, null jika belum login */
  sesi:         Session | null;
  /** True selama status auth belum diketahui (pertama kali load) */
  sedangMemuat: boolean;
}

/**
 * Memantau perubahan sesi Supabase dan mengembalikan status login pengguna.
 * Gunakan di root layout untuk menentukan halaman awal.
 */
export function useAuth(): HasilUseAuth {
  const [sesi, setSesi]               = useState<Session | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  useEffect(() => {
    // Ambil sesi yang sudah ada (dari AsyncStorage)
    supabase.auth.getSession().then(({ data }) => {
      setSesi(data.session);
      setSedangMemuat(false);
    });

    // Pantau perubahan status auth (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_acara, sesiTerbaru) => {
        setSesi(sesiTerbaru);
        setSedangMemuat(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { sesi, sedangMemuat };
}

