// src/components/TombolUtama.tsx
// Tombol utama pil penuh (tinggi 52, radius 26, primary, teks putih tebal).
// Mendukung status loading (spinner) dan disabled.

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';

interface PropsTombolUtama {
  /** Teks label tombol */
  label: string;
  /** Callback saat ditekan */
  onPress: () => void;
  /** Tampilkan spinner dan nonaktifkan */
  sedangMemuat?: boolean;
  /** Nonaktifkan tombol */
  nonaktif?: boolean;
  /** Variasi: 'primary' (default), 'outline-primary', 'outline-danger' */
  variasi?: 'primary' | 'outline-primary' | 'outline-danger';
  /** Style tambahan untuk kontainer */
  style?: ViewStyle;
}

/**
 * Tombol pil utama yang konsisten di seluruh aplikasi.
 * Gunakan variasi 'outline-primary' atau 'outline-danger' untuk tombol sekunder.
 */
export default function TombolUtama({
  label,
  onPress,
  sedangMemuat = false,
  nonaktif = false,
  variasi = 'primary',
  style,
}: PropsTombolUtama) {
  const { warna } = useAppTheme();

  const tidakBisa = sedangMemuat || nonaktif;

  let warnaLatar: string;
  let warnaTeks: string;
  let warnaBorder: string | undefined;

  if (variasi === 'primary') {
    warnaLatar = tidakBisa ? warna.textSecondary : warna.primary;
    warnaTeks = '#FFFFFF';
  } else if (variasi === 'outline-primary') {
    warnaLatar = 'transparent';
    warnaTeks = warna.primary;
    warnaBorder = warna.primary;
  } else {
    warnaLatar = 'transparent';
    warnaTeks = warna.danger;
    warnaBorder = warna.danger;
  }

  return (
    <TouchableOpacity
      style={[
        gaya.tombol,
        { backgroundColor: warnaLatar },
        warnaBorder ? { borderWidth: 1.5, borderColor: warnaBorder } : undefined,
        style,
      ]}
      onPress={onPress}
      disabled={tidakBisa}
      accessibilityLabel={label}
    >
      {sedangMemuat ? (
        <ActivityIndicator color={warnaTeks} />
      ) : (
        <Text style={[gaya.teks, { color: warnaTeks }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const gaya = StyleSheet.create({
  tombol: {
    height: JARAK.tombol,
    borderRadius: JARAK.radiusTombol,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teks: {
    fontSize: UKURAN_FONT.subjudul,
    fontWeight: '700',
  },
});
