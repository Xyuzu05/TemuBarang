// src/contexts/ThemeContext.tsx
// Konteks tema terang/gelap/ikut-sistem untuk seluruh aplikasi

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  PilihanTema,
  ambilPilihanTema,
  simpanPilihanTema,
} from '@/services/themeStorage';

// ─── Palet warna ────────────────────────────────────────────────────────────

export interface PaletWarna {
  background: string;
  text: string;
  textSecondary: string;
  card: string;
  border: string;
  primary: string;
  danger: string;
  warning: string;
  success: string;
  /** Warna aksen oranye untuk tautan, badge aktif, indikator tab */
  accent: string;
  /** Warna latar header indigo */
  headerBg: string;
  /** Warna latar input dan chip */
  inputBg: string;
}

const WARNA_TERANG: PaletWarna = {
  background: '#FFFFFF',
  text: '#1E1E3F',
  textSecondary: '#9A9CB0',
  card: '#FFFFFF',
  border: '#E6E8F2',
  primary: '#3F4BB8',
  danger: '#EF4444',
  warning: '#F5A623',
  success: '#22C55E',
  accent: '#F5A623',
  headerBg: '#3F4BB8',
  inputBg: '#F3F4F9',
};

const WARNA_GELAP: PaletWarna = {
  background: '#0F1226',
  text: '#F1F3FF',
  textSecondary: '#9AA0C6',
  card: '#1A1F3D',
  border: '#2F3563',
  primary: '#6B78E8',
  danger: '#EF4444',
  warning: '#F5B54A',
  success: '#22C55E',
  accent: '#F5B54A',
  headerBg: '#2A3280',
  inputBg: '#232850',
};

// ─── Tipe konteks ────────────────────────────────────────────────────────────

interface NilaiThemeContext {
  pilihanTema: PilihanTema;
  temaAktif: 'light' | 'dark';
  ubahTema: (pilihan: PilihanTema) => void;
  warna: PaletWarna;
}

const ThemeContext = createContext<NilaiThemeContext | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const skemaSistem = useColorScheme();
  const [pilihanTema, setPilihanTema] = useState<PilihanTema>('system');
  const [sudahMuat, setSudahMuat] = useState(false);

  // Muat pilihan dari AsyncStorage saat pertama kali
  useEffect(() => {
    ambilPilihanTema().then((hasil) => {
      setPilihanTema(hasil);
      setSudahMuat(true);
    });
  }, []);

  const ubahTema = useCallback((pilihan: PilihanTema) => {
    setPilihanTema(pilihan);
    simpanPilihanTema(pilihan);
  }, []);

  // Tentukan tema aktif berdasarkan pilihan
  const temaAktif: 'light' | 'dark' =
    pilihanTema === 'system'
      ? (skemaSistem === 'dark' ? 'dark' : 'light')
      : pilihanTema;

  const warna = temaAktif === 'dark' ? WARNA_GELAP : WARNA_TERANG;

  // Jangan render anak-anak sebelum pilihan tema selesai dimuat
  if (!sudahMuat) return null;

  return (
    <ThemeContext.Provider value={{ pilihanTema, temaAktif, ubahTema, warna }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Gunakan hook ini di semua komponen untuk mengakses tema dan palet warna.
 * Melempar error jika dipakai di luar ThemeProvider.
 */
export function useAppTheme(): NilaiThemeContext {
  const konteks = useContext(ThemeContext);
  if (!konteks) {
    throw new Error('useAppTheme harus dipakai di dalam ThemeProvider');
  }
  return konteks;
}
