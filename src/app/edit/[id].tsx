// src/app/edit/[id].tsx
// Layar edit laporan: form terisi data lama, jenis tidak bisa diubah,
// bisa ganti/hapus foto, hanya pemilik yang bisa mengakses.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import { DAFTAR_KATEGORI } from '@/constants/categories';
import FormField from '@/components/FormField';
import { ambilLaporanById, perbaruiLaporan } from '@/services/laporanService';
import { unggahFoto, hapusFoto, pathDariUrl } from '@/services/storageService';
import { supabase } from '@/services/supabase';
import type {
  KategoriBarang,
  Laporan,
  LaporanEdit,
  LokasiPenyimpanan,
} from '@/types/laporan';

// ─── Tipe state form ──────────────────────────────────────────────────────────

interface NilaiForm {
  namaBarang:      string;
  kategori:        KategoriBarang | '';
  deskripsi:       string;
  lokasi:          string;
  tanggalKejadian: string;
  nomorWhatsapp:   string;
  penyimpanan:     LokasiPenyimpanan | '';
}

interface ErrorForm {
  namaBarang?:      string;
  kategori?:        string;
  deskripsi?:       string;
  lokasi?:          string;
  tanggalKejadian?: string;
  nomorWhatsapp?:   string;
  penyimpanan?:     string;
}

// ─── Validasi (sama dengan tambah.tsx) ───────────────────────────────────────

function validasiForm(nilai: NilaiForm, isDitemukan: boolean): ErrorForm {
  const err: ErrorForm = {};
  const nama = nilai.namaBarang.trim();
  if (!nama) err.namaBarang = 'Nama barang wajib diisi.';
  else if (nama.length < 2 || nama.length > 100) err.namaBarang = 'Nama barang harus 2–100 karakter.';

  if (!nilai.kategori) err.kategori = 'Pilih kategori barang.';

  const desk = nilai.deskripsi.trim();
  if (!desk) err.deskripsi = 'Deskripsi / ciri-ciri wajib diisi.';
  else if (desk.length < 5) err.deskripsi = 'Deskripsi minimal 5 karakter.';

  const lok = nilai.lokasi.trim();
  if (!lok) err.lokasi = 'Lokasi wajib diisi.';
  else if (lok.length < 2) err.lokasi = 'Lokasi minimal 2 karakter.';

  if (!nilai.tanggalKejadian) {
    err.tanggalKejadian = 'Tanggal kejadian wajib diisi.';
  } else {
    const tgl = new Date(nilai.tanggalKejadian);
    const hari = new Date(); hari.setHours(0, 0, 0, 0);
    if (isNaN(tgl.getTime())) err.tanggalKejadian = 'Format tanggal tidak valid.';
    else if (tgl > hari) err.tanggalKejadian = 'Tanggal kejadian tidak boleh di masa depan.';
  }

  const wa = nilai.nomorWhatsapp.trim();
  if (!wa) err.nomorWhatsapp = 'Nomor WhatsApp wajib diisi.';
  else if (!/^(08|628)[0-9]{7,12}$/.test(wa)) err.nomorWhatsapp = 'Format: 08xxxxxxxxxx atau 628xxxxxxxxxx.';

  if (isDitemukan && !nilai.penyimpanan) err.penyimpanan = 'Pilih lokasi penyimpanan barang.';

  return err;
}

// ─── Chip pilih ───────────────────────────────────────────────────────────────

function ChipPilih<T extends string>({
  opsi, dipilih, onPilih, label,
}: { opsi: T; dipilih: T | ''; onPilih: (v: T) => void; label: string }) {
  const { warna } = useAppTheme();
  const aktif = dipilih === opsi;
  return (
    <Pressable
      style={[gaya.chipPilih, {
        backgroundColor: aktif ? warna.primary : warna.card,
        borderColor:     aktif ? warna.primary : warna.border,
      }]}
      onPress={() => onPilih(opsi)}
      accessibilityRole="radio"
      accessibilityState={{ selected: aktif }}
      accessibilityLabel={label}
    >
      <Text style={[gaya.teksChip, { color: aktif ? '#FFFFFF' : warna.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function HalamanEdit() {
  const { warna } = useAppTheme();
  const router    = useRouter();
  const { id }    = useLocalSearchParams<{ id: string }>();

  // State loading laporan awal
  const [sedangMuatAwal, setSedangMuatAwal] = useState(true);
  const [errorMuat, setErrorMuat]           = useState<string | null>(null);
  const [laporan, setLaporan]               = useState<Laporan | null>(null);

  // State form
  const [nilai, setNilai]           = useState<NilaiForm>({
    namaBarang: '', kategori: '', deskripsi: '',
    lokasi: '', tanggalKejadian: '', nomorWhatsapp: '', penyimpanan: '',
  });
  const [errorForm, setErrorForm]   = useState<ErrorForm>({});
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [sedangProses, setSedangProses] = useState(false);

  // State foto
  // fotoUrl = URL yang tersimpan di DB (string) atau null (tidak ada / dihapus)
  const [fotoUrl, setFotoUrl]             = useState<string | null>(null);
  // asetFoto = foto baru dipilih dari galeri (menggantikan fotoUrl)
  const [asetFoto, setAsetFoto]           = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [pesanFotoWarn, setPesanFotoWarn] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  // ─── Muat laporan awal ────────────────────────────────────────────────────

  const muatLaporan = useCallback(async () => {
    if (!id) return;
    const idSaatIni = ++requestIdRef.current;
    setSedangMuatAwal(true);
    setErrorMuat(null);

    try {
      const data = await ambilLaporanById(id);
      if (idSaatIni !== requestIdRef.current) return;

      // Cek apakah pengguna adalah pemilik
      const { data: { session } } = await supabase.auth.getSession();
      if (data.user_id !== session?.user?.id) {
        setErrorMuat('Kamu tidak berhak mengedit laporan ini.');
        return;
      }

      setLaporan(data);
      setFotoUrl(data.foto_url);
      setNilai({
        namaBarang:      data.nama_barang,
        kategori:        data.kategori,
        deskripsi:       data.deskripsi,
        lokasi:          data.lokasi,
        tanggalKejadian: data.tanggal_kejadian,
        nomorWhatsapp:   data.nomor_whatsapp,
        penyimpanan:     data.penyimpanan ?? '',
      });
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setErrorMuat(err instanceof Error ? err.message : 'Gagal memuat laporan.');
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMuatAwal(false);
    }
  }, [id]);

  useEffect(() => { muatLaporan(); }, [muatLaporan]);

  // Helper perbarui satu kolom
  function ubahNilai<K extends keyof NilaiForm>(kunci: K, v: NilaiForm[K]) {
    setNilai((prev) => ({ ...prev, [kunci]: v }));
    setErrorForm((prev) => ({ ...prev, [kunci]: undefined }));
  }

  // ─── Pilih foto baru ──────────────────────────────────────────────────────

  async function handlePilihFoto() {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      if (Platform.OS !== 'web') Alert.alert('Izin Diperlukan', 'Aplikasi butuh izin untuk mengakses galeri.');
      return;
    }
    const hasil = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, quality: 0.85, exif: false,
    });
    if (hasil.canceled || hasil.assets.length === 0) return;

    const aset = hasil.assets[0];
    const tipeDiizinkan = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tipeDiizinkan.includes(aset.mimeType ?? '')) {
      setPesanFotoWarn('Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }
    const MAKS = 2 * 1024 * 1024;
    if (aset.fileSize && aset.fileSize > MAKS) {
      setPesanFotoWarn(`Foto terlalu besar (${(aset.fileSize / 1024 / 1024).toFixed(1)} MB). Maks. 2 MB.`);
      return;
    }
    setPesanFotoWarn(null);
    setAsetFoto(aset);
    setFotoUrl(null); // sembunyikan foto lama, tampilkan preview baru
  }

  // Hapus foto (dari state; foto lama di DB dihapus saat simpan)
  function handleHapusFoto() {
    setAsetFoto(null);
    setFotoUrl(null);
    setPesanFotoWarn(null);
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSimpan() {
    if (!laporan) return;
    setPesanError(null);

    const err = validasiForm(nilai, laporan.jenis === 'ditemukan');
    setErrorForm(err);
    if (Object.keys(err).length > 0) return;

    setSedangProses(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('Sesi tidak ditemukan. Silakan login ulang.');

      let fotoUrlBaru: string | null = fotoUrl; // null = dihapus, string = dipertahankan

      // Ada foto baru dipilih → unggah dulu
      if (asetFoto) {
        // Hapus foto lama di Storage jika ada
        if (laporan.foto_url) {
          const pathLama = pathDariUrl(laporan.foto_url);
          if (pathLama) await hapusFoto(pathLama);
        }
        try {
          const { urlPublik } = await unggahFoto(asetFoto, userId);
          fotoUrlBaru = urlPublik;
        } catch (errFoto) {
          // Foto gagal → simpan tanpa foto baru
          setPesanFotoWarn(
            errFoto instanceof Error
              ? `Foto tidak tersimpan: ${errFoto.message} Laporan tetap disimpan.`
              : 'Foto gagal diunggah. Laporan disimpan tanpa foto baru.'
          );
          fotoUrlBaru = null;
        }
      } else if (fotoUrl === null && laporan.foto_url) {
        // Pengguna menghapus foto lama tanpa pilih baru → hapus di Storage
        const pathLama = pathDariUrl(laporan.foto_url);
        if (pathLama) await hapusFoto(pathLama);
      }

      const payload: LaporanEdit = {
        nama_barang:     nilai.namaBarang.trim(),
        kategori:        nilai.kategori as KategoriBarang,
        deskripsi:       nilai.deskripsi.trim(),
        lokasi:          nilai.lokasi.trim(),
        tanggal_kejadian: nilai.tanggalKejadian,
        nomor_whatsapp:  nilai.nomorWhatsapp.trim(),
        penyimpanan:     laporan.jenis === 'ditemukan'
                           ? (nilai.penyimpanan as LokasiPenyimpanan)
                           : null,
        foto_url:        fotoUrlBaru,
        status:          laporan.status,
      };

      await perbaruiLaporan(laporan.id, payload);

      // Kembali ke Detail laporan yang diperbarui
      router.replace(`/detail/${laporan.id}`);
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Gagal menyimpan perubahan. Coba lagi.');
    } finally {
      setSedangProses(false);
    }
  }

  // ─── Kondisi loading / error awal ─────────────────────────────────────────

  if (sedangMuatAwal) {
    return (
      <SafeAreaView style={[gaya.pusatLayar, { backgroundColor: warna.background }]} edges={['bottom']}>
        <ActivityIndicator size="large" color={warna.primary} />
        <Text style={[gaya.teksInfo, { color: warna.textSecondary }]}>Memuat laporan...</Text>
      </SafeAreaView>
    );
  }

  if (errorMuat || !laporan) {
    return (
      <SafeAreaView style={[gaya.pusatLayar, { backgroundColor: warna.background }]} edges={['bottom']}>
        <Text style={gaya.emoji}>⚠️</Text>
        <Text style={[gaya.teksInfo, { color: warna.text }]}>{errorMuat ?? 'Laporan tidak ditemukan.'}</Text>
        <TouchableOpacity
          style={[gaya.tombolCobaLagi, { backgroundColor: warna.primary }]}
          onPress={muatLaporan}
        >
          <Text style={gaya.teksTombol}>Coba Lagi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[gaya.tombolBatal, { borderColor: warna.border }]}
          onPress={() => router.back()}
        >
          <Text style={[gaya.teksBatal, { color: warna.textSecondary }]}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Form edit ────────────────────────────────────────────────────────────

  const isDitemukan = laporan.jenis === 'ditemukan';

  return (
    <SafeAreaView style={[gaya.kontainer, { backgroundColor: warna.background }]} edges={['bottom']}>
      <KeyboardAvoidingView style={gaya.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={gaya.scrollIsi}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Jenis (tidak bisa diubah) */}
          <View style={[gaya.infoJenis, { backgroundColor: warna.card, borderColor: warna.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={warna.textSecondary} />
            <Text style={[gaya.teksInfoJenis, { color: warna.textSecondary }]}>
              Jenis laporan tidak bisa diubah:{' '}
              <Text style={{ color: warna.text, fontWeight: '700' }}>
                {laporan.jenis === 'hilang' ? 'Barang Hilang' : 'Barang Ditemukan'}
              </Text>
            </Text>
          </View>

          {/* Error server */}
          {pesanError ? (
            <Text style={[gaya.pesanError, { color: warna.danger, backgroundColor: warna.card, borderColor: warna.danger }]}>
              {pesanError}
            </Text>
          ) : null}

          {/* Nama Barang */}
          <FormField
            label="Nama Barang"
            value={nilai.namaBarang}
            onChangeText={(t) => ubahNilai('namaBarang', t)}
            pesanError={errorForm.namaBarang}
            placeholder="Contoh: Dompet Kulit Coklat"
            maxLength={100}
            editable={!sedangProses}
          />

          {/* Kategori */}
          <View style={gaya.pembungkusField}>
            <Text style={[gaya.labelField, { color: warna.text }]}>Kategori Barang</Text>
            <View style={gaya.gridKategori}>
              {DAFTAR_KATEGORI.map((kat) => (
                <ChipPilih<KategoriBarang>
                  key={kat.nilai}
                  opsi={kat.nilai} dipilih={nilai.kategori}
                  onPilih={(v) => ubahNilai('kategori', v)} label={kat.label}
                />
              ))}
            </View>
            {errorForm.kategori ? (
              <Text style={[gaya.teksError, { color: warna.danger }]}>{errorForm.kategori}</Text>
            ) : null}
          </View>

          {/* Deskripsi */}
          <FormField
            label="Deskripsi / Ciri-ciri Barang"
            value={nilai.deskripsi}
            onChangeText={(t) => ubahNilai('deskripsi', t)}
            pesanError={errorForm.deskripsi}
            placeholder="Jelaskan ciri-ciri khusus barang..."
            multiline numberOfLines={4}
            style={gaya.inputMultiline}
            editable={!sedangProses}
          />

          {/* Lokasi */}
          <FormField
            label="Lokasi Kejadian"
            value={nilai.lokasi}
            onChangeText={(t) => ubahNilai('lokasi', t)}
            pesanError={errorForm.lokasi}
            placeholder="Contoh: Lab Komputer 2"
            editable={!sedangProses}
          />

          {/* Tanggal */}
          <FormField
            label="Tanggal Kejadian (YYYY-MM-DD)"
            value={nilai.tanggalKejadian}
            onChangeText={(t) => ubahNilai('tanggalKejadian', t)}
            pesanError={errorForm.tanggalKejadian}
            keyboardType="numeric"
            maxLength={10}
            editable={!sedangProses}
          />

          {/* Nomor WA */}
          <FormField
            label="Nomor WhatsApp"
            value={nilai.nomorWhatsapp}
            onChangeText={(t) => ubahNilai('nomorWhatsapp', t)}
            pesanError={errorForm.nomorWhatsapp}
            placeholder="Contoh: 081234567890"
            keyboardType="phone-pad"
            editable={!sedangProses}
          />

          {/* Penyimpanan (hanya ditemukan) */}
          {isDitemukan ? (
            <View style={gaya.pembungkusField}>
              <Text style={[gaya.labelField, { color: warna.text }]}>Barang Disimpan di</Text>
              <View style={gaya.barisChip}>
                <ChipPilih<LokasiPenyimpanan>
                  opsi="diserahkan_ke_petugas" dipilih={nilai.penyimpanan}
                  onPilih={(v) => ubahNilai('penyimpanan', v)} label="Diserahkan ke Petugas"
                />
                <ChipPilih<LokasiPenyimpanan>
                  opsi="disimpan_penemu" dipilih={nilai.penyimpanan}
                  onPilih={(v) => ubahNilai('penyimpanan', v)} label="Disimpan Penemu"
                />
              </View>
              {errorForm.penyimpanan ? (
                <Text style={[gaya.teksError, { color: warna.danger }]}>{errorForm.penyimpanan}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Foto */}
          <View style={gaya.pembungkusField}>
            <Text style={[gaya.labelField, { color: warna.text }]}>Foto Barang (Opsional)</Text>

            {/* Preview foto baru dipilih */}
            {asetFoto ? (
              <View style={gaya.previewWrapper}>
                <Image source={{ uri: asetFoto.uri }} style={gaya.previewFoto} resizeMode="cover" accessibilityLabel="Pratinjau foto baru" />
                <TouchableOpacity style={[gaya.tombolHapusFoto, { backgroundColor: warna.danger }]} onPress={handleHapusFoto}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

            /* Foto lama dari DB */
            ) : fotoUrl ? (
              <View style={gaya.previewWrapper}>
                <Image source={{ uri: fotoUrl }} style={gaya.previewFoto} resizeMode="cover" accessibilityLabel="Foto lama laporan" />
                <TouchableOpacity style={[gaya.tombolHapusFoto, { backgroundColor: warna.danger }]} onPress={handleHapusFoto}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

            /* Tidak ada foto → tombol pilih */
            ) : (
              <TouchableOpacity
                style={[gaya.tombolFoto, { backgroundColor: warna.card, borderColor: warna.border }]}
                onPress={handlePilihFoto}
                disabled={sedangProses}
                accessibilityLabel="Pilih foto dari galeri"
              >
                <Ionicons name="image-outline" size={28} color={warna.primary} />
                <Text style={[gaya.teksTombolFoto, { color: warna.primary }]}>Pilih Foto dari Galeri</Text>
                <Text style={[gaya.teksHintFoto, { color: warna.textSecondary }]}>JPG, PNG, atau WebP — maks. 2 MB</Text>
              </TouchableOpacity>
            )}

            {/* Tombol ganti foto (saat ada foto lama/baru) */}
            {(fotoUrl || asetFoto) ? (
              <TouchableOpacity onPress={handlePilihFoto} style={gaya.tombolGantiFoto} disabled={sedangProses}>
                <Ionicons name="swap-horizontal-outline" size={14} color={warna.primary} />
                <Text style={[gaya.teksGantiFoto, { color: warna.primary }]}>Ganti Foto</Text>
              </TouchableOpacity>
            ) : null}

            {pesanFotoWarn ? (
              <Text style={[gaya.teksError, { color: warna.warning }]}>{pesanFotoWarn}</Text>
            ) : null}
          </View>

          {/* Simpan */}
          <TouchableOpacity
            style={[gaya.tombolSimpan, { backgroundColor: sedangProses ? warna.textSecondary : warna.primary }]}
            onPress={handleSimpan}
            disabled={sedangProses}
            accessibilityLabel="Tombol Simpan Perubahan"
          >
            {sedangProses ? (
              <View style={gaya.barisSpinner}>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={gaya.teksTombolSimpan}>Menyimpan...</Text>
              </View>
            ) : (
              <Text style={gaya.teksTombolSimpan}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Style ────────────────────────────────────────────────────────────────────

const gaya = StyleSheet.create({
  kontainer: { flex: 1 },
  flex:      { flex: 1 },
  scrollIsi: { padding: JARAK.layar, paddingBottom: 32 },

  pusatLayar: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: JARAK.layar },
  emoji:      { fontSize: 48, marginBottom: 12 },
  teksInfo:   { fontSize: UKURAN_FONT.tubuh, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  tombolCobaLagi: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: JARAK.radius, marginBottom: 10 },
  teksTombol:     { color: '#FFFFFF', fontWeight: '600', fontSize: UKURAN_FONT.tubuh },
  tombolBatal:    { paddingHorizontal: 24, paddingVertical: 10, borderRadius: JARAK.radius, borderWidth: 1 },
  teksBatal:      { fontSize: UKURAN_FONT.tubuh },

  infoJenis: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderWidth: 1, borderRadius: JARAK.radius,
    padding: 10, marginBottom: JARAK.form,
  },
  teksInfoJenis: { flex: 1, fontSize: UKURAN_FONT.kecil, lineHeight: 20 },

  pesanError: {
    borderWidth: 1, borderRadius: JARAK.radius,
    padding: 12, marginBottom: JARAK.form,
    fontSize: UKURAN_FONT.kecil, lineHeight: 20,
  },

  pembungkusField: { marginBottom: JARAK.form },
  labelField:      { fontSize: UKURAN_FONT.kecil, fontWeight: '600', marginBottom: 8 },
  teksError:       { fontSize: UKURAN_FONT.mikro, marginTop: 4 },
  gridKategori:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  barisChip:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  chipPilih: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  teksChip:  { fontSize: UKURAN_FONT.kecil, fontWeight: '500' },

  inputMultiline: { height: 100, textAlignVertical: 'top', paddingTop: 10 },

  previewWrapper:  { position: 'relative', alignSelf: 'flex-start', marginBottom: 8 },
  previewFoto:     { width: 160, height: 120, borderRadius: JARAK.radius },
  tombolHapusFoto: {
    position: 'absolute', top: -8, right: -8,
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
  },
  tombolGantiFoto: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  teksGantiFoto:   { fontSize: UKURAN_FONT.kecil },

  tombolFoto: {
    borderWidth: 1, borderRadius: JARAK.radius, borderStyle: 'dashed',
    padding: 20, alignItems: 'center', gap: 6,
  },
  teksTombolFoto: { fontSize: UKURAN_FONT.tubuh, fontWeight: '500' },
  teksHintFoto:   { fontSize: UKURAN_FONT.mikro },

  tombolSimpan: {
    height: JARAK.tombol + 4, borderRadius: JARAK.radius,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  teksTombolSimpan: { color: '#FFFFFF', fontSize: UKURAN_FONT.tubuh, fontWeight: '700' },
  barisSpinner:     { flexDirection: 'row', alignItems: 'center' },
});
