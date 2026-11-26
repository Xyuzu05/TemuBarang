// src/app/detail/[id].tsx
// Halaman detail laporan: foto, nama barang, badge jenis & status, semua info,
// catatan keamanan, dan tombol aksi milik sendiri (aktif di Tahap 5).

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import { ambilLaporanById, hapusLaporan, ubahStatusLaporan } from '@/services/laporanService';
import { BadgeJenis, BadgeStatus } from '@/components/StatusBadge';
import { labelKategori } from '@/constants/categories';
import { konfirmasi } from '@/utils/konfirmasi';
import { useAuth } from '@/hooks/use-auth';
import type { Laporan, StatusLaporan } from '@/types/laporan';

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatTanggal(tanggalIso: string): string {
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const [tahun, bln, hari] = tanggalIso.split('T')[0].split('-');
  return `${parseInt(hari)} ${namaBulan[parseInt(bln) - 1]} ${tahun}`;
}

const LABEL_PENYIMPANAN: Record<string, string> = {
  diserahkan_ke_petugas: 'Diserahkan ke petugas',
  disimpan_penemu:       'Disimpan oleh penemu',
};

const OPSI_STATUS: { nilai: StatusLaporan; label: string }[] = [
  { nilai: 'aktif',              label: 'Aktif' },
  { nilai: 'sudah_ditemukan',    label: 'Sudah Ditemukan' },
  { nilai: 'sudah_dikembalikan', label: 'Sudah Dikembalikan' },
];

// ─── Baris info ───────────────────────────────────────────────────────────────

function InfoBaris({
  ikon,
  label,
  nilai,
}: {
  ikon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  nilai: string;
}) {
  const { warna } = useAppTheme();
  return (
    <View style={gaya.infoBaris}>
      <Ionicons name={ikon} size={16} color={warna.primary} style={gaya.ikonInfo} />
      <View style={gaya.infoTeks}>
        <Text style={[gaya.infoLabel, { color: warna.textSecondary }]}>{label}</Text>
        <Text style={[gaya.infoNilai, { color: warna.text }]}>{nilai}</Text>
      </View>
    </View>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function HalamanDetail() {
  const { warna }   = useAppTheme();
  const router      = useRouter();
  const { id }      = useLocalSearchParams<{ id: string }>();
  const { sesi }    = useAuth();

  const [laporan, setLaporan]         = useState<Laporan | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanError, setPesanError]   = useState<string | null>(null);
  const [sedangAksi, setSedangAksi]   = useState(false);
  const [modalStatus, setModalStatus] = useState(false);

  const requestIdRef = useRef(0);

  const muatDetail = useCallback(async () => {
    if (!id) return;
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilLaporanById(id);
      if (idSaatIni !== requestIdRef.current) return;
      setLaporan(data);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setPesanError(
        err instanceof Error ? err.message : 'Gagal memuat laporan. Coba lagi.'
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }, [id]);

  useEffect(() => {
    muatDetail();
  }, [muatDetail]);

  // Apakah laporan ini milik pengguna yang sedang login?
  const adalahMilikSendiri =
    sesi?.user?.id != null && laporan?.user_id === sesi.user.id;

  // ─── Hapus laporan ─────────────────────────────────────────────────────────
  async function handleHapus() {
    if (!laporan) return;
    const yakin = await konfirmasi(
      'Hapus Laporan',
      `Yakin ingin menghapus "${laporan.nama_barang}"?${laporan.foto_url ? '\nFoto juga akan dihapus.' : ''}`,
    );
    if (!yakin) return;
    setSedangAksi(true);
    try {
      await hapusLaporan(laporan);
      router.replace('/(tabs)');
    } catch (err) {
      setPesanError(err instanceof Error ? err.message : 'Gagal menghapus laporan.');
    } finally {
      setSedangAksi(false);
    }
  }

  // ─── Ubah status ───────────────────────────────────────────────────────────
  async function handleUbahStatus(statusBaru: StatusLaporan) {
    if (!laporan || laporan.status === statusBaru) { setModalStatus(false); return; }
    setModalStatus(false);
    setSedangAksi(true);
    try {
      await ubahStatusLaporan(laporan.id, statusBaru);
      setLaporan({ ...laporan, status: statusBaru });
    } catch (err) {
      setPesanError(err instanceof Error ? err.message : 'Gagal mengubah status.');
    } finally {
      setSedangAksi(false);
    }
  }

  // ─── Kondisi loading ───────────────────────────────────────────────────────
  if (sedangMemuat) {
    return (
      <SafeAreaView style={[gaya.pusatLayar, { backgroundColor: warna.background }]} edges={['bottom']}>
        <ActivityIndicator size="large" color={warna.primary} />
        <Text style={[gaya.teksInfo, { color: warna.textSecondary }]}>Memuat detail...</Text>
      </SafeAreaView>
    );
  }

  // ─── Kondisi error ─────────────────────────────────────────────────────────
  if (pesanError || !laporan) {
    return (
      <SafeAreaView style={[gaya.pusatLayar, { backgroundColor: warna.background }]} edges={['bottom']}>
        <Text style={gaya.emoji}>⚠️</Text>
        <Text style={[gaya.teksInfo, { color: warna.text }]}>
          {pesanError ?? 'Laporan tidak ditemukan.'}
        </Text>
        <TouchableOpacity
          style={[gaya.tombolCobaLagi, { backgroundColor: warna.primary }]}
          onPress={muatDetail}
        >
          <Text style={gaya.teksTombol}>Coba Lagi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[gaya.tombolKembali, { borderColor: warna.border }]}
          onPress={() => router.back()}
        >
          <Text style={[gaya.teksTombolKembali, { color: warna.textSecondary }]}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Konten detail ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[gaya.kontainer, { backgroundColor: warna.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={gaya.scrollIsi} showsVerticalScrollIndicator={false}>

        {/* Foto */}
        {laporan.foto_url ? (
          <Image
            source={{ uri: laporan.foto_url }}
            style={gaya.foto}
            resizeMode="cover"
            accessibilityLabel={`Foto ${laporan.nama_barang}`}
          />
        ) : (
          <View style={[gaya.fotoPlaceholder, { backgroundColor: warna.card }]}>
            <Ionicons name="image-outline" size={48} color={warna.textSecondary} />
            <Text style={[gaya.teksFotoPlaceholder, { color: warna.textSecondary }]}>
              Tidak ada foto
            </Text>
          </View>
        )}

        <View style={gaya.konten}>
          {/* Nama barang */}
          <Text style={[gaya.namaBarang, { color: warna.text }]}>
            {laporan.nama_barang}
          </Text>

          {/* Badge jenis + status */}
          <View style={gaya.bariBadge}>
            <BadgeJenis jenis={laporan.jenis} />
            <View style={{ width: 8 }} />
            <BadgeStatus status={laporan.status} />
          </View>

          {/* Garis pemisah */}
          <View style={[gaya.pemisah, { backgroundColor: warna.border }]} />

          {/* Info detail */}
          <InfoBaris ikon="pricetag-outline"  label="Kategori"           nilai={labelKategori(laporan.kategori)} />
          <InfoBaris ikon="document-text-outline" label="Deskripsi / Ciri-ciri" nilai={laporan.deskripsi} />
          <InfoBaris ikon="location-outline"  label="Lokasi"             nilai={laporan.lokasi} />
          <InfoBaris ikon="calendar-outline"  label="Tanggal Kejadian"   nilai={formatTanggal(laporan.tanggal_kejadian)} />

          {/* Penyimpanan — hanya untuk ditemukan */}
          {laporan.jenis === 'ditemukan' && laporan.penyimpanan ? (
            <InfoBaris
              ikon="cube-outline"
              label="Barang Disimpan di"
              nilai={LABEL_PENYIMPANAN[laporan.penyimpanan] ?? laporan.penyimpanan}
            />
          ) : null}

          {/* Kontak pelapor */}
          <InfoBaris
            ikon="logo-whatsapp"
            label="Kontak Pelapor (WhatsApp)"
            nilai={laporan.nomor_whatsapp}
          />

          {/* Garis pemisah */}
          <View style={[gaya.pemisah, { backgroundColor: warna.border }]} />

          {/* Catatan keamanan (SPEC §7) */}
          <View style={[gaya.kotak, { backgroundColor: warna.warning + '22', borderColor: warna.warning }]}>
            <Text style={[gaya.teksKotakJudul, { color: warna.warning }]}>⚠️  Catatan Keamanan</Text>
            <Text style={[gaya.teksKotak, { color: warna.text }]}>
              Minta pelapor menyebutkan ciri khusus barang sebelum menyerahkan.
            </Text>
          </View>

          {/* Tombol aksi — hanya untuk pemilik */}
          {adalahMilikSendiri ? (
            <View style={gaya.grupTombol}>
              <TouchableOpacity
                style={[gaya.tombolAksi, { backgroundColor: warna.primary }]}
                onPress={() => router.push(`/edit/${laporan.id}`)}
                disabled={sedangAksi}
                accessibilityLabel="Tombol Edit"
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                <Text style={gaya.teksTombolAksi}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[gaya.tombolAksi, { backgroundColor: warna.warning }]}
                onPress={() => setModalStatus(true)}
                disabled={sedangAksi}
                accessibilityLabel="Tombol Ubah Status"
              >
                {sedangAksi ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="swap-horizontal-outline" size={16} color="#FFFFFF" />
                    <Text style={gaya.teksTombolAksi}>Ubah Status</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[gaya.tombolAksi, { backgroundColor: warna.danger }]}
                onPress={handleHapus}
                disabled={sedangAksi}
                accessibilityLabel="Tombol Hapus"
              >
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={gaya.teksTombolAksi}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Modal ubah status */}
      {modalStatus && laporan ? (
        <View style={gaya.overlay}>
          <TouchableOpacity style={gaya.overlayBg} onPress={() => setModalStatus(false)} accessibilityLabel="Tutup modal" />
          <View style={[gaya.sheet, { backgroundColor: warna.card, borderTopColor: warna.border }]}>
            <Text style={[gaya.sheetJudul, { color: warna.text }]}>Ubah Status Laporan</Text>
            {OPSI_STATUS.map((opsi) => {
              const aktif = laporan.status === opsi.nilai;
              return (
                <TouchableOpacity
                  key={opsi.nilai}
                  style={[gaya.opsiStatus, {
                    backgroundColor: aktif ? warna.primary + '22' : 'transparent',
                    borderColor: aktif ? warna.primary : warna.border,
                  }]}
                  onPress={() => handleUbahStatus(opsi.nilai)}
                >
                  <Text style={[gaya.teksOpsi, { color: aktif ? warna.primary : warna.text }]}>
                    {opsi.label}
                  </Text>
                  {aktif && <Ionicons name="checkmark-circle" size={18} color={warna.primary} />}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[gaya.tombolBatalModal, { borderColor: warna.border }]}
              onPress={() => setModalStatus(false)}
            >
              <Text style={[gaya.teksBatalModal, { color: warna.textSecondary }]}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ─── Style ────────────────────────────────────────────────────────────────────

const gaya = StyleSheet.create({
  kontainer:  { flex: 1 },
  pusatLayar: {
    flex: 1,
    justifyContent: 'center',
    alignItems:     'center',
    padding:        JARAK.layar,
  },
  emoji:    { fontSize: 48, marginBottom: 12 },
  teksInfo: { fontSize: UKURAN_FONT.tubuh, textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  tombolCobaLagi: {
    paddingHorizontal: 24,
    paddingVertical:   10,
    borderRadius:      JARAK.radius,
    marginBottom:      10,
  },
  tombolKembali: {
    paddingHorizontal: 24,
    paddingVertical:   10,
    borderRadius:      JARAK.radius,
    borderWidth:       1,
  },
  teksTombol:        { color: '#FFFFFF', fontWeight: '600', fontSize: UKURAN_FONT.tubuh },
  teksTombolKembali: { fontSize: UKURAN_FONT.tubuh },

  scrollIsi: { paddingBottom: 32 },
  foto: {
    width:  '100%',
    height: 220,
  },
  fotoPlaceholder: {
    width:          '100%',
    height:         160,
    justifyContent: 'center',
    alignItems:     'center',
  },
  teksFotoPlaceholder: { fontSize: UKURAN_FONT.kecil, marginTop: 8 },

  konten:    { padding: JARAK.layar },
  namaBarang: {
    fontSize:   UKURAN_FONT.judul,
    fontWeight: '800',
    marginBottom: 10,
  },
  bariBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  pemisah:   { height: 1, marginVertical: 14 },

  infoBaris: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  ikonInfo:  { marginTop: 2, marginRight: 10, width: 20 },
  infoTeks:  { flex: 1 },
  infoLabel: { fontSize: UKURAN_FONT.mikro, marginBottom: 2 },
  infoNilai: { fontSize: UKURAN_FONT.tubuh, lineHeight: 22 },

  kotak: {
    borderWidth:  1,
    borderRadius: JARAK.radius,
    padding:      12,
    marginBottom: 20,
  },
  teksKotakJudul: { fontSize: UKURAN_FONT.kecil, fontWeight: '700', marginBottom: 6 },
  teksKotak:      { fontSize: UKURAN_FONT.kecil, lineHeight: 20 },

  grupTombol: {
    flexDirection: 'row',
    gap:           8,
    flexWrap:      'wrap',
  },
  tombolAksi: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderRadius:   JARAK.radius,
  },
  teksTombolAksi: { color: '#FFFFFF', fontSize: UKURAN_FONT.kecil, fontWeight: '600' },

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
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: JARAK.layar,
    paddingBottom: 32,
  },
  sheetJudul: {
    fontSize: UKURAN_FONT.subjudul,
    fontWeight: '700',
    marginBottom: 16,
  },
  opsiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: JARAK.radius,
    padding: 14,
    marginBottom: 8,
  },
  teksOpsi: {
    fontSize: UKURAN_FONT.tubuh,
    fontWeight: '500',
  },
  tombolBatalModal: {
    height: JARAK.tombol,
    borderWidth: 1,
    borderRadius: JARAK.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  teksBatalModal: {
    fontSize: UKURAN_FONT.tubuh,
  },
});
