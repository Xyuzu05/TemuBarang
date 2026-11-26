// src/components/KondisiKosong.tsx
// Komponen kondisi kosong/error: lingkaran berikon Ionicons, judul, teks deskripsi,
// dan tombol "Coba lagi" opsional. Dipakai di semua layar untuk state kosong dan error.

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';
import { UKURAN_FONT } from '@/constants/theme';

interface PropsKondisiKosong {
  /** Nama ikon Ionicons di dalam lingkaran */
  namaIkon: React.ComponentProps<typeof Ionicons>['name'];
  /** Judul singkat */
  judul: string;
  /** Deskripsi tambahan */
  deskripsi?: string;
  /** Label tombol aksi (misalnya "Coba lagi") */
  labelTombol?: string;
  /** Callback tombol aksi */
  onTekan?: () => void;
}

/**
 * Tampilan kosong/error yang konsisten di seluruh aplikasi.
 * Menampilkan lingkaran dengan ikon, judul, deskripsi, dan tombol opsional.
 */
export default function KondisiKosong({
  namaIkon,
  judul,
  deskripsi,
  labelTombol,
  onTekan,
}: PropsKondisiKosong) {
  const { warna } = useAppTheme();

  return (
    <View style={gaya.kontainer}>
      <View style={[gaya.lingkaran, { backgroundColor: warna.inputBg }]}>
        <Ionicons name={namaIkon} size={40} color={warna.textSecondary} />
      </View>
      <Text style={[gaya.judul, { color: warna.text }]}>{judul}</Text>
      {deskripsi ? (
        <Text style={[gaya.deskripsi, { color: warna.textSecondary }]}>
          {deskripsi}
        </Text>
      ) : null}
      {labelTombol && onTekan ? (
        <TouchableOpacity
          style={[gaya.tombol, { backgroundColor: warna.primary }]}
          onPress={onTekan}
          accessibilityLabel={labelTombol}
        >
          <Text style={gaya.teksTombol}>{labelTombol}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const gaya = StyleSheet.create({
  kontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  lingkaran: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  judul: {
    fontSize: UKURAN_FONT.subjudul,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  deskripsi: {
    fontSize: UKURAN_FONT.tubuh,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  tombol: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  teksTombol: {
    color: '#FFFFFF',
    fontSize: UKURAN_FONT.tubuh,
    fontWeight: '600',
  },
});
