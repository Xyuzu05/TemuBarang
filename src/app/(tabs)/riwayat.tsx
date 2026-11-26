// src/app/(tabs)/riwayat.tsx
// Tab Riwayat: daftar laporan milik sendiri + tombol Edit, Ubah Status, Hapus.

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
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { konfirmasi } from '@/utils/konfirmasi';
import {
  ambilLaporanSaya,
  hapusLaporan,
  ubahStatusLaporan,
} from '@/services/laporanService';
import { BadgeJenis, BadgeStatus } from '@/components/StatusBadge';
import type { Laporan, StatusLaporan } from '@/types/laporan';

// ─── Pilihan status (siklus ubah status) ─────────────────────────────────────

const OPSI_STATUS: { nilai: StatusLaporan; label: string }[] = [
  { nilai: 'aktif',              label: 'Aktif' },
  { nilai: 'sudah_ditemukan',    label: 'Sudah Ditemukan' },
  { nilai: 'sudah_dikembalikan', label: 'Sudah Dikembalikan' },
];

// ─── Item kartu riwayat ───────────────────────────────────────────────────────

interface PropsItemRiwayat {
  laporan:    Laporan;
  sedangAksi: boolean;
  onEdit:     () => void;
  onStatus:   () => void;
  onHapus:    () => void;
  onTekan:    () => void;
}

function ItemRiwayat({
  laporan,
  sedangAksi,
  onEdit,
  onStatus,
  onHapus,
  onTekan,
}: PropsItemRiwayat) {
  const { warna } = useAppTheme();

  return (
    <TouchableOpacity
      style={[gaya.kartu, { backgroundColor: warna.card, borderColor: warna.border }]}
      onPress={onTekan}
      activeOpacity={0.75}
      accessibilityLabel={`Laporan: ${laporan.nama_barang}`}
    >
      {/* Info */}
      <View style={gaya.kartuHeader}>
        <Text style={[gaya.namaBarang, { color: warna.text }]} numberOfLines={1}>
          {laporan.nama_barang}
        </Text>
        <View style={gaya.bariBadge}>
          <BadgeJenis jenis={laporan.jenis} />
          <View style={{ width: 6 }} />
          <BadgeStatus status={laporan.status} />
        </View>
        <View style={gaya.metaBaris}>
          <Ionicons name="location-outline" size={12} color={warna.textSecondary} />
          <Text style={[gaya.teksMeta, { color: warna.textSecondary }]} numberOfLines={1}>
            {laporan.lokasi}
          </Text>
        </View>
      </View>

      {/* Tombol aksi */}
      <View style={[gaya.kartuAksi, { borderTopColor: warna.border }]}>
        <TouchableOpacity
          style={[gaya.tombolAksi, { borderColor: warna.primary }]}
          onPress={onEdit}
          disabled={sedangAksi}
          accessibilityLabel={`Edit laporan ${laporan.nama_barang}`}
        >
          <Ionicons name="create-outline" size={14} color={warna.primary} />
          <Text style={[gaya.teksTombolAksi, { color: warna.primary }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[gaya.tombolAksi, { borderColor: warna.warning }]}
          onPress={onStatus}
          disabled={sedangAksi}
          accessibilityLabel={`Ubah status laporan ${laporan.nama_barang}`}
        >
          <Ionicons name="swap-horizontal-outline" size={14} color={warna.warning} />
          <Text style={[gaya.teksTombolAksi, { color: warna.warning }]}>Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[gaya.tombolAksi, { borderColor: warna.danger }]}
          onPress={onHapus}
          disabled={sedangAksi}
          accessibilityLabel={`Hapus laporan ${laporan.nama_barang}`}
        >
          {sedangAksi ? (
            <ActivityIndicator size="small" color={warna.danger} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={14} color={warna.danger} />
              <Text style={[gaya.teksTombolAksi, { color: warna.danger }]}>Hapus</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Modal ubah status (bottom-sheet sederhana) ───────────────────────────────

interface PropsModalStatus {
  laporan: Laporan;
  warna:   ReturnType<typeof useAppTheme>['warna'];
  onPilih: (status: StatusLaporan) => void;
  onTutup: () => void;
}

function ModalUbahStatus({ laporan, warna, onPilih, onTutup }: PropsModalStatus) {
  return (
    <View style={[gaya.overlay]}>
      <TouchableOpacity style={gaya.overlayBg} onPress={onTutup} accessibilityLabel="Tutup" />
      <View style={[gaya.sheet, { backgroundColor: warna.card, borderTopColor: warna.border }]}>
        <Text style={[gaya.sheetJudul, { color: warna.text }]}>Ubah Status Laporan</Text>
        <Text style={[gaya.sheetSub, { color: warna.textSecondary }]} numberOfLines={1}>
          {laporan.nama_barang}
        </Text>
        {OPSI_STATUS.map((opsi) => {
          const aktif = laporan.status === opsi.nilai;
          return (
            <TouchableOpacity
              key={opsi.nilai}
              style={[
                gaya.opsiStatus,
                {
                  backgroundColor: aktif ? warna.primary + '22' : 'transparent',
                  borderColor:     aktif ? warna.primary : warna.border,
                },
              ]}
              onPress={() => onPilih(opsi.nilai)}
              accessibilityLabel={`Set status ${opsi.label}`}
              accessibilityState={{ selected: aktif }}
            >
              <Text style={[gaya.teksOpsiStatus, { color: aktif ? warna.primary : warna.text }]}>
                {opsi.label}
              </Text>
              {aktif && (
                <Ionicons name="checkmark-circle" size={18} color={warna.primary} />
              )}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[gaya.tombolBatal, { borderColor: warna.border }]}
          onPress={onTutup}
        >
          <Text style={[gaya.teksBatal, { color: warna.textSecondary }]}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function HalamanRiwayat() {
  const { warna }  = useAppTheme();
  const router     = useRouter();
  const { sesi }   = useAuth();

  const [daftar, setDaftar]           = useState<Laporan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [sedangRefresh, setSedangRefresh] = useState(false);
  const [pesanError, setPesanError]   = useState<string | null>(null);
  // ID laporan yang sedang diproses aksi (hapus/status)
  const [idProses, setIdProses]       = useState<string | null>(null);
  // Laporan yang akan diubah statusnya (tampilkan modal)
  const [laporanStatusModal, setLaporanStatusModal] = useState<Laporan | null>(null);

  const requestIdRef = useRef(0);

  // ─── Muat data riwayat ────────────────────────────────────────────────────

  const muatRiwayat = useCallback(
    async (refresh = false) => {
      const userId = sesi?.user?.id;
      if (!userId) return;

      const idSaatIni = ++requestIdRef.current;
      if (refresh) setSedangRefresh(true);
      else setSedangMemuat(true);
      setPesanError(null);

      try {
        const hasil = await ambilLaporanSaya(userId);
        if (idSaatIni !== requestIdRef.current) return;
        setDaftar(hasil);
      } catch (err) {
        if (idSaatIni !== requestIdRef.current) return;
        setPesanError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      } finally {
        if (idSaatIni === requestIdRef.current) {
          setSedangMemuat(false);
          setSedangRefresh(false);
        }
      }
    },
    [sesi?.user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      muatRiwayat();
    }, [muatRiwayat]),
  );

  // ─── Hapus laporan ────────────────────────────────────────────────────────

  async function handleHapus(laporan: Laporan) {
    const yakin = await konfirmasi(
      'Hapus Laporan',
      `Yakin ingin menghapus laporan "${laporan.nama_barang}"?${laporan.foto_url ? '\nFoto juga akan dihapus.' : ''}`,
    );
    if (!yakin) return;

    setIdProses(laporan.id);
    try {
      await hapusLaporan(laporan);
      setDaftar((prev) => prev.filter((l) => l.id !== laporan.id));
    } catch (err) {
      setPesanError(err instanceof Error ? err.message : 'Gagal menghapus laporan.');
    } finally {
      setIdProses(null);
    }
  }

  // ─── Ubah status laporan ──────────────────────────────────────────────────

  async function handleUbahStatus(laporan: Laporan, statusBaru: StatusLaporan) {
    setLaporanStatusModal(null);
    if (laporan.status === statusBaru) return;

    setIdProses(laporan.id);
    try {
      await ubahStatusLaporan(laporan.id, statusBaru);
      setDaftar((prev) =>
        prev.map((l) => (l.id === laporan.id ? { ...l, status: statusBaru } : l))
      );
    } catch (err) {
      setPesanError(err instanceof Error ? err.message : 'Gagal mengubah status.');
    } finally {
      setIdProses(null);
    }
  }

  // ─── Render kondisi ───────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: Laporan }) => (
      <ItemRiwayat
        laporan={item}
        sedangAksi={idProses === item.id}
        onTekan={() => router.push(`/detail/${item.id}`)}
        onEdit={() => router.push(`/edit/${item.id}`)}
        onStatus={() => setLaporanStatusModal(item)}
        onHapus={() => handleHapus(item)}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idProses, router],
  );

  return (
    <SafeAreaView style={[gaya.kontainer, { backgroundColor: warna.background }]} edges={['bottom']}>

      {/* Error banner */}
      {pesanError ? (
        <View style={[gaya.bannerError, { backgroundColor: warna.danger + '22', borderBottomColor: warna.danger }]}>
          <Text style={[gaya.teksBanner, { color: warna.danger }]} numberOfLines={2}>{pesanError}</Text>
          <TouchableOpacity onPress={() => setPesanError(null)}>
            <Ionicons name="close" size={16} color={warna.danger} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Konten utama */}
      {sedangMemuat && daftar.length === 0 ? (
        <View style={gaya.pusatLayar}>
          <ActivityIndicator size="large" color={warna.primary} />
          <Text style={[gaya.teksInfo, { color: warna.textSecondary }]}>Memuat riwayat...</Text>
        </View>
      ) : pesanError && daftar.length === 0 ? (
        <View style={gaya.pusatLayar}>
          <Text style={gaya.emoji}>⚠️</Text>
          <Text style={[gaya.teksInfo, { color: warna.text }]}>{pesanError}</Text>
          <TouchableOpacity
            style={[gaya.tombolCobaLagi, { backgroundColor: warna.primary }]}
            onPress={() => muatRiwayat()}
          >
            <Text style={gaya.teksTombol}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={daftar}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[gaya.daftar, daftar.length === 0 && gaya.daftarKosong]}
          ListEmptyComponent={
            <View style={gaya.pusatLayar}>
              <Text style={gaya.emoji}>📂</Text>
              <Text style={[gaya.teksInfo, { color: warna.text }]}>Belum ada laporan.</Text>
            </View>
          }
          refreshing={sedangRefresh}
          onRefresh={() => muatRiwayat(true)}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal Ubah Status */}
      {laporanStatusModal ? (
        <ModalUbahStatus
          laporan={laporanStatusModal}
          warna={warna}
          onPilih={(s) => handleUbahStatus(laporanStatusModal, s)}
          onTutup={() => setLaporanStatusModal(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

// ─── Style ────────────────────────────────────────────────────────────────────

const gaya = StyleSheet.create({
  kontainer:  { flex: 1 },
  daftar:     { padding: JARAK.layar, paddingBottom: 16 },
  daftarKosong: { flex: 1 },

  pusatLayar: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: JARAK.layar },
  emoji:      { fontSize: 48, marginBottom: 12 },
  teksInfo:   { fontSize: UKURAN_FONT.tubuh, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  tombolCobaLagi: {
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: JARAK.radius,
  },
  teksTombol: { color: '#FFFFFF', fontWeight: '600', fontSize: UKURAN_FONT.tubuh },

  bannerError: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: JARAK.layar, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  teksBanner: { flex: 1, fontSize: UKURAN_FONT.kecil, marginRight: 8 },

  // Kartu riwayat
  kartu: {
    borderWidth: 1, borderRadius: JARAK.radius,
    marginBottom: JARAK.kartu, overflow: 'hidden',
  },
  kartuHeader: { padding: JARAK.dalamKartu, gap: 4 },
  namaBarang:  { fontSize: UKURAN_FONT.tubuh, fontWeight: '700' },
  bariBadge:   { flexDirection: 'row', alignItems: 'center' },
  metaBaris:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  teksMeta:    { fontSize: UKURAN_FONT.mikro, flex: 1 },

  kartuAksi: {
    flexDirection: 'row', borderTopWidth: 1,
    paddingHorizontal: JARAK.dalamKartu, paddingVertical: 8, gap: 8,
  },
  tombolAksi: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: JARAK.radius,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  teksTombolAksi: { fontSize: UKURAN_FONT.mikro, fontWeight: '600' },

  // Modal ubah status
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: JARAK.layar, paddingBottom: 32,
  },
  sheetJudul:   { fontSize: UKURAN_FONT.subjudul, fontWeight: '700', marginBottom: 4 },
  sheetSub:     { fontSize: UKURAN_FONT.kecil, marginBottom: 16 },
  opsiStatus: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: JARAK.radius,
    padding: 14, marginBottom: 8,
  },
  teksOpsiStatus: { fontSize: UKURAN_FONT.tubuh, fontWeight: '500' },
  tombolBatal:  {
    height: JARAK.tombol, borderWidth: 1, borderRadius: JARAK.radius,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  teksBatal: { fontSize: UKURAN_FONT.tubuh },
});
