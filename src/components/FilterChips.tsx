// src/components/FilterChips.tsx
// Chip filter jenis laporan dan kategori barang untuk Beranda.

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import { DAFTAR_KATEGORI } from '@/constants/categories';
import type { JenisLaporan, KategoriBarang } from '@/types/laporan';

// ─── Chip Jenis ───────────────────────────────────────────────────────────────

interface PropsFilterJenis {
  dipilih: JenisLaporan | undefined;
  onPilih: (jenis: JenisLaporan | undefined) => void;
}

const PILIHAN_JENIS: { nilai: JenisLaporan | undefined; label: string }[] = [
  { nilai: undefined,    label: 'Semua' },
  { nilai: 'hilang',     label: 'Hilang' },
  { nilai: 'ditemukan',  label: 'Ditemukan' },
];

/** Baris chip untuk memilih jenis laporan: Semua | Hilang | Ditemukan */
export function FilterJenis({ dipilih, onPilih }: PropsFilterJenis) {
  const { warna } = useAppTheme();

  return (
    <View style={gaya.baris}>
      {PILIHAN_JENIS.map((item) => {
        const aktif = item.nilai === dipilih;
        return (
          <TouchableOpacity
            key={item.label}
            style={[
              gaya.chip,
              {
                backgroundColor: aktif ? warna.primary : warna.card,
                borderColor:     aktif ? warna.primary : warna.border,
              },
            ]}
            onPress={() => onPilih(item.nilai)}
            accessibilityLabel={`Filter jenis ${item.label}`}
            accessibilityState={{ selected: aktif }}
          >
            <Text
              style={[
                gaya.teksChip,
                { color: aktif ? '#FFFFFF' : warna.textSecondary },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Chip Kategori ────────────────────────────────────────────────────────────

interface PropsFilterKategori {
  dipilih: KategoriBarang | undefined;
  onPilih: (kategori: KategoriBarang | undefined) => void;
}

/** Baris chip horizontal scrollable untuk memilih kategori barang */
export function FilterKategori({ dipilih, onPilih }: PropsFilterKategori) {
  const { warna } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={gaya.scrollIsi}
      style={gaya.scroll}
    >
      {/* Chip "Semua" */}
      {(() => {
        const aktif = dipilih === undefined;
        return (
          <TouchableOpacity
            style={[
              gaya.chip,
              {
                backgroundColor: aktif ? warna.primary : warna.card,
                borderColor:     aktif ? warna.primary : warna.border,
              },
            ]}
            onPress={() => onPilih(undefined)}
            accessibilityLabel="Filter kategori Semua"
            accessibilityState={{ selected: aktif }}
          >
            <Text style={[gaya.teksChip, { color: aktif ? '#FFFFFF' : warna.textSecondary }]}>
              Semua
            </Text>
          </TouchableOpacity>
        );
      })()}

      {DAFTAR_KATEGORI.map((kat) => {
        const aktif = kat.nilai === dipilih;
        return (
          <TouchableOpacity
            key={kat.nilai}
            style={[
              gaya.chip,
              {
                backgroundColor: aktif ? warna.primary : warna.card,
                borderColor:     aktif ? warna.primary : warna.border,
              },
            ]}
            onPress={() => onPilih(kat.nilai)}
            accessibilityLabel={`Filter kategori ${kat.label}`}
            accessibilityState={{ selected: aktif }}
          >
            <Text
              style={[
                gaya.teksChip,
                { color: aktif ? '#FFFFFF' : warna.textSecondary },
              ]}
            >
              {kat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Style ────────────────────────────────────────────────────────────────────

const gaya = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginBottom:  10,
  },
  scroll:    { marginBottom: 10 },
  scrollIsi: { paddingRight: JARAK.layar, gap: 6 },
  chip: {
    borderWidth:       1,
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   6,
  },
  teksChip: { fontSize: UKURAN_FONT.kecil, fontWeight: '500' },
});
