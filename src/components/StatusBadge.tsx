// src/components/StatusBadge.tsx
// Badge kecil untuk menampilkan jenis laporan (Hilang/Ditemukan) dan status.
// Warna: Aktif = accent (oranye), Sudah Ditemukan = primary, Sudah Dikembalikan = success.

import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { UKURAN_FONT } from '@/constants/theme';
import type { JenisLaporan, StatusLaporan } from '@/types/laporan';

// ─── Badge Jenis ─────────────────────────────────────────────────────────────

interface PropsBadgeJenis {
  jenis: JenisLaporan;
}

/** Badge merah untuk Hilang, hijau untuk Ditemukan */
export function BadgeJenis({ jenis }: PropsBadgeJenis) {
  const { warna } = useAppTheme();

  const warnaLatar = jenis === 'hilang' ? warna.danger  : warna.success;
  const teks       = jenis === 'hilang' ? 'Hilang'      : 'Ditemukan';

  return (
    <View style={[gaya.badge, { backgroundColor: warnaLatar + '1A' }]}>
      <Text style={[gaya.teks, { color: warnaLatar }]}>{teks}</Text>
    </View>
  );
}

// ─── Badge Status ─────────────────────────────────────────────────────────────

interface PropsBadgeStatus {
  status: StatusLaporan;
}

const LABEL_STATUS: Record<StatusLaporan, string> = {
  aktif:              'Masih Dicari',
  sudah_ditemukan:    'Sudah Ditemukan',
  sudah_dikembalikan: 'Sudah Dikembalikan',
};

/** Badge warna sesuai status laporan (accent/primary/success) */
export function BadgeStatus({ status }: PropsBadgeStatus) {
  const { warna } = useAppTheme();

  const warnaMap: Record<StatusLaporan, string> = {
    aktif:              warna.accent,
    sudah_ditemukan:    warna.primary,
    sudah_dikembalikan: warna.success,
  };

  const warnaBadge = warnaMap[status];
  const teks       = LABEL_STATUS[status];

  return (
    <View style={[gaya.badge, { backgroundColor: warnaBadge + '1A' }]}>
      <Text style={[gaya.teks, { color: warnaBadge }]}>{teks}</Text>
    </View>
  );
}

// ─── Style bersama ────────────────────────────────────────────────────────────

const gaya = StyleSheet.create({
  badge: {
    alignSelf:    'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },
  teks: {
    fontSize:   UKURAN_FONT.mikro,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
