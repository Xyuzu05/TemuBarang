// src/app/(tabs)/index.tsx
// Tab Beranda: pencarian debounce, filter jenis + kategori, daftar laporan,
// tarik-untuk-refresh, kondisi loading / kosong / error.

import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import { useDebounce } from '@/hooks/use-debounce';
import { ambilDaftarLaporan, type FilterLaporan } from '@/services/laporanService';
import SearchBox from '@/components/SearchBox';
import { FilterJenis, FilterKategori } from '@/components/FilterChips';
import KartuLaporan from '@/components/KartuLaporan';
import type { JenisLaporan, KategoriBarang, Laporan } from '@/types/laporan';

export default function HalamanBeranda() {
  const { warna }  = useAppTheme();
  const router     = useRouter();

  // ─── State filter ──────────────────────────────────────────────────────────
  const [teksCari, setTeksCari]       = useState('');
  const [jenis, setJenis]             = useState<JenisLaporan | undefined>(undefined);
  const [kategori, setKategori]       = useState<KategoriBarang | undefined>(undefined);

  // Debounce 400 ms sesuai SPEC
  const teksCariTertunda = useDebounce(teksCari, 400);

  // ─── State data ────────────────────────────────────────────────────────────
  const [daftar, setDaftar]           = useState<Laporan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [sedangRefresh, setSedangRefresh] = useState(false);
  const [pesanError, setPesanError]   = useState<string | null>(null);

  // Pencegah race condition: hanya ambil hasil dari permintaan terakhir
  const requestIdRef = useRef(0);

  // ─── Fungsi muat data ──────────────────────────────────────────────────────
  const muatData = useCallback(
    async (refresh = false) => {
      const idSaatIni = ++requestIdRef.current;

      if (refresh) {
        setSedangRefresh(true);
      } else {
        setSedangMemuat(true);
      }
      setPesanError(null);

      const controller = new AbortController();

      try {
        const filter: FilterLaporan = {
          kataCari: teksCariTertunda,
          jenis,
          kategori,
        };
        const hasil = await ambilDaftarLaporan(filter, controller.signal);

        if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
        setDaftar(hasil);
      } catch (err) {
        if (idSaatIni !== requestIdRef.current) return;
        if (err instanceof Error && err.message === 'Permintaan dibatalkan.') return;
        setPesanError(
          err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'
        );
      } finally {
        if (idSaatIni === requestIdRef.current) {
          setSedangMemuat(false);
          setSedangRefresh(false);
        }
      }
    },
    [teksCariTertunda, jenis, kategori],
  );

  // Muat ulang setiap kali layar difokuskan atau filter berubah
  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData]),
  );

  // ─── Render item daftar ────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Laporan }) => (
      <KartuLaporan
        laporan={item}
        onTekan={() => router.push(`/detail/${item.id}`)}
      />
    ),
    [router],
  );

  // ─── Komponen kondisi khusus ───────────────────────────────────────────────

  /** Tampilan loading pertama kali (sebelum ada data) */
  const TampilanMemuat = () => (
    <View style={gaya.pusatLayar}>
      <ActivityIndicator size="large" color={warna.primary} />
      <Text style={[gaya.teksInfoPusat, { color: warna.textSecondary }]}>
        Memuat laporan...
      </Text>
    </View>
  );

  /** Tampilan error dengan tombol Coba Lagi */
  const TampilanError = () => (
    <View style={gaya.pusatLayar}>
      <Text style={gaya.emojiInfo}>⚠️</Text>
      <Text style={[gaya.teksInfoPusat, { color: warna.text }]}>
        {pesanError}
      </Text>
      <TouchableOpacity
        style={[gaya.tombolCobaLagi, { backgroundColor: warna.primary }]}
        onPress={() => muatData()}
      >
        <Text style={gaya.teksTombolCobaLagi}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );

  /** Tampilan kosong saat tidak ada laporan */
  const TampilanKosong = () => (
    <View style={gaya.pusatLayar}>
      <Text style={gaya.emojiInfo}>🔍</Text>
      <Text style={[gaya.teksInfoPusat, { color: warna.text }]}>
        {teksCariTertunda || jenis || kategori
          ? 'Tidak ada laporan yang sesuai filter.'
          : 'Belum ada laporan.'}
      </Text>
    </View>
  );

  // ─── Render utama ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={[gaya.kontainer, { backgroundColor: warna.background }]}
      edges={['bottom']}
    >
      {/* Header filter — selalu tampil */}
      <View style={[gaya.headerFilter, { borderBottomColor: warna.border }]}>
        <SearchBox
          nilai={teksCari}
          onUbah={setTeksCari}
        />
        <FilterJenis dipilih={jenis} onPilih={setJenis} />
        <FilterKategori dipilih={kategori} onPilih={setKategori} />
      </View>

      {/* Konten utama */}
      {sedangMemuat && daftar.length === 0 ? (
        <TampilanMemuat />
      ) : pesanError && daftar.length === 0 ? (
        <TampilanError />
      ) : (
        <FlatList
          data={daftar}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            gaya.daftar,
            daftar.length === 0 && gaya.daftarKosong,
          ]}
          ListEmptyComponent={<TampilanKosong />}
          refreshing={sedangRefresh}
          onRefresh={() => muatData(true)}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Banner error ringan saat ada data tapi refresh gagal */}
      {pesanError && daftar.length > 0 ? (
        <View style={[gaya.bannerError, { backgroundColor: warna.danger + '22', borderTopColor: warna.danger }]}>
          <Text style={[gaya.teksBanner, { color: warna.danger }]} numberOfLines={2}>
            {pesanError}
          </Text>
          <TouchableOpacity onPress={() => muatData()} accessibilityLabel="Coba lagi">
            <Text style={[gaya.teksBannerAksi, { color: warna.danger }]}>Coba lagi</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const gaya = StyleSheet.create({
  kontainer:   { flex: 1 },
  headerFilter: {
    paddingHorizontal: JARAK.layar,
    paddingTop:        JARAK.layar,
    paddingBottom:     8,
    borderBottomWidth: 1,
  },
  daftar:      { padding: JARAK.layar, paddingTop: JARAK.kartu },
  daftarKosong: { flex: 1 },
  pusatLayar:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: JARAK.layar },
  emojiInfo:   { fontSize: 48, marginBottom: 12 },
  teksInfoPusat: {
    fontSize:   UKURAN_FONT.tubuh,
    textAlign:  'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  tombolCobaLagi: {
    paddingHorizontal: 24,
    paddingVertical:   10,
    borderRadius:      JARAK.radius,
  },
  teksTombolCobaLagi: { color: '#FFFFFF', fontWeight: '600', fontSize: UKURAN_FONT.tubuh },
  bannerError: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: JARAK.layar,
    paddingVertical:   10,
    borderTopWidth:    1,
  },
  teksBanner:      { flex: 1, fontSize: UKURAN_FONT.kecil },
  teksBannerAksi:  { fontSize: UKURAN_FONT.kecil, fontWeight: '700', marginLeft: 8 },
});
