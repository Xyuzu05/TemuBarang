// src/app/(tabs)/tentang.tsx
// Tab Tentang: nama aplikasi, versi, deskripsi singkat, teknologi yang digunakan.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';

// ─── Data teknologi ───────────────────────────────────────────────────────────

type NamaIonicons = React.ComponentProps<typeof Ionicons>['name'];

const DAFTAR_TEKNOLOGI: { nama: string; ikon: NamaIonicons }[] = [
  { nama: 'React Native + Expo SDK 58', ikon: 'phone-portrait-outline' },
  { nama: 'TypeScript (strict)',         ikon: 'code-slash-outline' },
  { nama: 'Expo Router 5',              ikon: 'navigate-outline' },
  { nama: 'Supabase (Auth + DB + Storage)', ikon: 'server-outline' },
  { nama: 'AsyncStorage',               ikon: 'save-outline' },
];

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function HalamanTentang() {
  const { warna } = useAppTheme();

  return (
    <SafeAreaView style={[gaya.kontainer, { backgroundColor: warna.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={gaya.scroll} showsVerticalScrollIndicator={false}>

        {/* Logo / judul */}
        <View style={gaya.header}>
          <Text style={gaya.emoji}>📦</Text>
          <Text style={[gaya.namaAplikasi, { color: warna.primary }]}>TemuBarang</Text>
          <Text style={[gaya.versi, { color: warna.textSecondary }]}>Versi 1.0.0</Text>
        </View>

        {/* Deskripsi */}
        <View style={[gaya.kartu, { backgroundColor: warna.card, borderColor: warna.border }]}>
          <Text style={[gaya.deskripsi, { color: warna.text }]}>
            Aplikasi mobile untuk melaporkan dan mencari barang hilang atau ditemukan di lingkungan kampus.
            Dibuat sebagai tugas akhir mata kuliah Pemrograman Berbasis Platform.
          </Text>
        </View>

        {/* Teknologi */}
        <Text style={[gaya.labelSeksi, { color: warna.textSecondary }]}>Teknologi</Text>
        <View style={[gaya.kartu, { backgroundColor: warna.card, borderColor: warna.border }]}>
          {DAFTAR_TEKNOLOGI.map((item, indeks) => (
            <View
              key={item.nama}
              style={[
                gaya.barisTech,
                indeks < DAFTAR_TEKNOLOGI.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: warna.border,
                },
              ]}
            >
              <Ionicons
                name={item.ikon as NamaIonicons}
                size={18}
                color={warna.primary}
                style={gaya.ikonTech}
              />
              <Text style={[gaya.teksTech, { color: warna.text }]}>{item.nama}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={[gaya.footer, { color: warna.textSecondary }]}>
          © 2026 — Tugas Pemrograman Berbasis Platform
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Style ────────────────────────────────────────────────────────────────────

const gaya = StyleSheet.create({
  kontainer: { flex: 1 },
  scroll:    { padding: JARAK.layar, paddingBottom: 32 },

  header: {
    alignItems:   'center',
    marginTop:    16,
    marginBottom: 24,
  },
  emoji:        { fontSize: 56, marginBottom: 12 },
  namaAplikasi: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  versi:        { fontSize: UKURAN_FONT.kecil },

  labelSeksi: {
    fontSize:      UKURAN_FONT.mikro,
    fontWeight:    '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  8,
    marginTop:     8,
  },

  kartu: {
    borderWidth:  1,
    borderRadius: JARAK.radius,
    overflow:     'hidden',
    marginBottom: 20,
  },
  deskripsi: {
    fontSize:   UKURAN_FONT.tubuh,
    lineHeight: 24,
    padding:    14,
  },

  barisTech: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   12,
    paddingHorizontal: 14,
  },
  ikonTech: { marginRight: 12, width: 24 },
  teksTech: { fontSize: UKURAN_FONT.kecil, flex: 1 },

  footer: {
    textAlign:  'center',
    fontSize:   UKURAN_FONT.mikro,
    marginTop:  8,
  },
});
