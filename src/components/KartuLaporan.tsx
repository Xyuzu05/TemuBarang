// src/components/KartuLaporan.tsx
// Kartu laporan yang ditampilkan di daftar Beranda.
// Menampilkan: foto kecil (jika ada), nama barang, badge jenis & status,
// kategori, lokasi, dan tanggal kejadian.

import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import { BadgeJenis, BadgeStatus } from '@/components/StatusBadge';
import { labelKategori } from '@/constants/categories';
import type { Laporan } from '@/types/laporan';

interface PropsKartuLaporan {
  laporan: Laporan;
  onTekan: () => void;
}

/** Memformat tanggal ISO (YYYY-MM-DD) ke format Indonesia (mis. "14 Nov 2026") */
function formatTanggal(tanggalIso: string): string {
  const bulan = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  // Ambil bagian tanggal saja tanpa konversi timezone
  const [tahun, bln, hari] = tanggalIso.split('T')[0].split('-');
  return `${parseInt(hari)} ${bulan[parseInt(bln) - 1]} ${tahun}`;
}

/** Kartu ringkas laporan untuk daftar di Beranda */
export default function KartuLaporan({ laporan, onTekan }: PropsKartuLaporan) {
  const { warna } = useAppTheme();

  return (
    <TouchableOpacity
      style={[gaya.kartu, { backgroundColor: warna.card, borderColor: warna.border }]}
      onPress={onTekan}
      accessibilityRole="button"
      accessibilityLabel={`Laporan ${laporan.jenis}: ${laporan.nama_barang}`}
      activeOpacity={0.75}
    >
      {/* Thumbnail foto */}
      {laporan.foto_url ? (
        <Image
          source={{ uri: laporan.foto_url }}
          style={gaya.foto}
          resizeMode="cover"
          accessibilityLabel={`Foto ${laporan.nama_barang}`}
        />
      ) : (
        <View style={[gaya.fotoPlaceholder, { backgroundColor: warna.border }]}>
          <Ionicons name="image-outline" size={24} color={warna.textSecondary} />
        </View>
      )}

      {/* Konten teks */}
      <View style={gaya.isi}>
        {/* Nama barang */}
        <Text
          style={[gaya.namaBarang, { color: warna.text }]}
          numberOfLines={1}
        >
          {laporan.nama_barang}
        </Text>

        {/* Badge jenis + status */}
        <View style={gaya.bariBadge}>
          <BadgeJenis jenis={laporan.jenis} />
          <View style={gaya.jarakBadge} />
          <BadgeStatus status={laporan.status} />
        </View>

        {/* Meta info */}
        <View style={gaya.metaBaris}>
          <Ionicons name="pricetag-outline" size={12} color={warna.textSecondary} />
          <Text style={[gaya.teksMetaKanan, { color: warna.textSecondary }]}>
            {labelKategori(laporan.kategori)}
          </Text>
        </View>

        <View style={gaya.metaBaris}>
          <Ionicons name="location-outline" size={12} color={warna.textSecondary} />
          <Text
            style={[gaya.teksMetaKanan, { color: warna.textSecondary }]}
            numberOfLines={1}
          >
            {laporan.lokasi}
          </Text>
        </View>

        <View style={gaya.metaBaris}>
          <Ionicons name="calendar-outline" size={12} color={warna.textSecondary} />
          <Text style={[gaya.teksMetaKanan, { color: warna.textSecondary }]}>
            {formatTanggal(laporan.tanggal_kejadian)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const gaya = StyleSheet.create({
  kartu: {
    flexDirection: 'row',
    borderWidth:   1,
    borderRadius:  JARAK.radius,
    marginBottom:  JARAK.kartu,
    overflow:      'hidden',
  },
  foto: {
    width:  90,
    height: 90,
  },
  fotoPlaceholder: {
    width:          90,
    height:         90,
    justifyContent: 'center',
    alignItems:     'center',
  },
  isi: {
    flex:    1,
    padding: JARAK.dalamKartu,
    gap:     4,
  },
  namaBarang: {
    fontSize:   UKURAN_FONT.tubuh,
    fontWeight: '700',
    marginBottom: 2,
  },
  bariBadge: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  2,
  },
  jarakBadge: { width: 6 },
  metaBaris: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  teksMetaKanan: { fontSize: UKURAN_FONT.mikro, flex: 1 },
});
