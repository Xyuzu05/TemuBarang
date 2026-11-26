// src/app/(tabs)/tambah.tsx
// Form tambah laporan: jenis, nama barang, kategori, deskripsi, lokasi,
// tanggal kejadian, nomor WhatsApp, foto (opsional), penyimpanan (ditemukan).
// Validasi per kolom, foto gagal laporan tetap tersimpan, sukses → buka Detail.

import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import { DAFTAR_KATEGORI } from '@/constants/categories';
import FormField from '@/components/FormField';
import { buatLaporan } from '@/services/laporanService';
import { unggahFoto } from '@/services/storageService';
import { supabase } from '@/services/supabase';
import { peringatan } from '@/utils/konfirmasi';
import type {
  JenisLaporan,
  KategoriBarang,
  LaporanBaru,
  LokasiPenyimpanan,
} from '@/types/laporan';

// ─── Tipe state form ──────────────────────────────────────────────────────────

interface NilaiForm {
  namaBarang:       string;
  kategori:         KategoriBarang | '';
  deskripsi:        string;
  lokasi:           string;
  tanggalKejadian:  string; // YYYY-MM-DD
  nomorWhatsapp:    string;
  penyimpanan:      LokasiPenyimpanan | '';
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

const FORM_AWAL: NilaiForm = {
  namaBarang:      '',
  kategori:        '',
  deskripsi:       '',
  lokasi:          '',
  tanggalKejadian: '',
  nomorWhatsapp:   '',
  penyimpanan:     '',
};

// ─── Validasi ─────────────────────────────────────────────────────────────────

function validasiForm(nilai: NilaiForm, jenis: JenisLaporan): ErrorForm {
  const err: ErrorForm = {};

  const nama = nilai.namaBarang.trim();
  if (!nama) {
    err.namaBarang = 'Nama barang wajib diisi.';
  } else if (nama.length < 2 || nama.length > 100) {
    err.namaBarang = 'Nama barang harus 2–100 karakter.';
  }

  if (!nilai.kategori) {
    err.kategori = 'Pilih kategori barang.';
  }

  const desk = nilai.deskripsi.trim();
  if (!desk) {
    err.deskripsi = 'Deskripsi / ciri-ciri wajib diisi.';
  } else if (desk.length < 5) {
    err.deskripsi = 'Deskripsi minimal 5 karakter.';
  }

  const lok = nilai.lokasi.trim();
  if (!lok) {
    err.lokasi = 'Lokasi wajib diisi.';
  } else if (lok.length < 2) {
    err.lokasi = 'Lokasi minimal 2 karakter.';
  }

  if (!nilai.tanggalKejadian) {
    err.tanggalKejadian = 'Tanggal kejadian wajib diisi.';
  } else {
    const tgl  = new Date(nilai.tanggalKejadian);
    const hari = new Date();
    hari.setHours(0, 0, 0, 0);
    if (isNaN(tgl.getTime())) {
      err.tanggalKejadian = 'Format tanggal tidak valid.';
    } else if (tgl > hari) {
      err.tanggalKejadian = 'Tanggal kejadian tidak boleh di masa depan.';
    }
  }

  const wa = nilai.nomorWhatsapp.trim();
  if (!wa) {
    err.nomorWhatsapp = 'Nomor WhatsApp wajib diisi.';
  } else if (!/^(08|628)[0-9]{7,12}$/.test(wa)) {
    err.nomorWhatsapp = 'Format: 08xxxxxxxxxx atau 628xxxxxxxxxx.';
  }

  if (jenis === 'ditemukan' && !nilai.penyimpanan) {
    err.penyimpanan = 'Pilih lokasi penyimpanan barang.';
  }

  return err;
}

// ─── Helper tanggal ───────────────────────────────────────────────────────────

/** Mengembalikan tanggal hari ini sebagai string YYYY-MM-DD (timezone lokal) */
function hariIniString(): string {
  const d = new Date();
  const thn = d.getFullYear();
  const bln = String(d.getMonth() + 1).padStart(2, '0');
  const hr  = String(d.getDate()).padStart(2, '0');
  return `${thn}-${bln}-${hr}`;
}

// ─── Komponen pilih satu opsi (chip) ─────────────────────────────────────────

function ChipPilih<T extends string>({
  opsi,
  dipilih,
  onPilih,
  label,
}: {
  opsi: T;
  dipilih: T | '';
  onPilih: (v: T) => void;
  label: string;
}) {
  const { warna } = useAppTheme();
  const aktif = dipilih === opsi;
  return (
    <Pressable
      style={[
        gaya.chipPilih,
        {
          backgroundColor: aktif ? warna.primary : warna.card,
          borderColor:     aktif ? warna.primary : warna.border,
        },
      ]}
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

export default function HalamanTambah() {
  const { warna } = useAppTheme();
  const router    = useRouter();

  // State form
  const [jenis, setJenis]           = useState<JenisLaporan>('hilang');
  const [nilai, setNilai]           = useState<NilaiForm>(FORM_AWAL);
  const [errorForm, setErrorForm]   = useState<ErrorForm>({});
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [sedangProses, setSedangProses] = useState(false);

  // State foto
  const [asetFoto, setAsetFoto]     = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [pesanFotoWarn, setPesanFotoWarn] = useState<string | null>(null);

  // Helper perbarui satu kolom
  function ubahNilai<K extends keyof NilaiForm>(kunci: K, v: NilaiForm[K]) {
    setNilai((prev) => ({ ...prev, [kunci]: v }));
    setErrorForm((prev) => ({ ...prev, [kunci]: undefined }));
  }

  // ─── Pilih foto dari galeri ─────────────────────────────────────────────────
  async function handlePilihFoto() {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      // Di web, expo-image-picker tidak memerlukan izin eksplisit
      if (Platform.OS !== 'web') {
        await peringatan('Izin Diperlukan', 'Aplikasi butuh izin untuk mengakses galeri.');
      }
      return;
    }

    const hasil = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
      exif: false,
    });

    if (hasil.canceled || hasil.assets.length === 0) return;

    const aset = hasil.assets[0];

    // Validasi tipe di sini (sebelum simpan ke state)
    const tipeDiizinkan = ['image/jpeg', 'image/png', 'image/webp'];
    const tipe = aset.mimeType ?? '';
    if (!tipeDiizinkan.includes(tipe)) {
      setPesanFotoWarn('Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    // Validasi ukuran (fileSize mungkin undefined, cek jika ada)
    const MAKS = 2 * 1024 * 1024;
    if (aset.fileSize && aset.fileSize > MAKS) {
      const mb = (aset.fileSize / 1024 / 1024).toFixed(1);
      setPesanFotoWarn(`Foto terlalu besar (${mb} MB). Maks. 2 MB.`);
      return;
    }

    setPesanFotoWarn(null);
    setAsetFoto(aset);
  }

  function hapusFotoTerpilih() {
    setAsetFoto(null);
    setPesanFotoWarn(null);
  }

  // ─── Submit form ────────────────────────────────────────────────────────────
  async function handleSimpan() {
    setPesanError(null);

    const err = validasiForm(nilai, jenis);
    setErrorForm(err);
    if (Object.keys(err).length > 0) return;

    setSedangProses(true);

    try {
      // Ambil user_id sesi aktif
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('Sesi tidak ditemukan. Silakan login ulang.');

      // Coba unggah foto (opsional — laporan tetap tersimpan jika foto gagal)
      let fotoUrl: string | null = null;
      if (asetFoto) {
        try {
          const { urlPublik } = await unggahFoto(asetFoto, userId);
          fotoUrl = urlPublik;
        } catch (errFoto) {
          // Foto gagal — simpan laporan tanpa foto, beri tahu pengguna
          setPesanFotoWarn(
            errFoto instanceof Error
              ? `Foto tidak tersimpan: ${errFoto.message} Laporan tetap disimpan.`
              : 'Foto gagal diunggah. Laporan tetap disimpan tanpa foto.'
          );
        }
      }

      // Susun payload sesuai tipe LaporanBaru
      const payload: LaporanBaru = {
        jenis,
        nama_barang:     nilai.namaBarang.trim(),
        kategori:        nilai.kategori as KategoriBarang,
        deskripsi:       nilai.deskripsi.trim(),
        lokasi:          nilai.lokasi.trim(),
        tanggal_kejadian: nilai.tanggalKejadian,
        nomor_whatsapp:  nilai.nomorWhatsapp.trim(),
        penyimpanan:     jenis === 'ditemukan'
                           ? (nilai.penyimpanan as LokasiPenyimpanan)
                           : null,
        foto_url:        fotoUrl,
        status:          'aktif',
      };

      const laporanBaru = await buatLaporan(payload);

      // Reset form
      setNilai(FORM_AWAL);
      setJenis('hilang');
      setAsetFoto(null);
      setErrorForm({});

      // Navigasi ke Detail laporan baru
      router.push(`/detail/${laporanBaru.id}`);
    } catch (e) {
      setPesanError(
        e instanceof Error ? e.message : 'Gagal menyimpan laporan. Coba lagi.'
      );
    } finally {
      setSedangProses(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[gaya.kontainer, { backgroundColor: warna.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={gaya.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={gaya.scrollIsi}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Pilih Jenis ── */}
          <Text style={[gaya.labelSeksi, { color: warna.text }]}>Jenis Laporan</Text>
          <View style={gaya.barisChip}>
            <ChipPilih<JenisLaporan>
              opsi="hilang" dipilih={jenis} onPilih={setJenis} label="Barang Hilang"
            />
            <ChipPilih<JenisLaporan>
              opsi="ditemukan" dipilih={jenis} onPilih={setJenis} label="Barang Ditemukan"
            />
          </View>

          {/* ── Error server ── */}
          {pesanError ? (
            <Text style={[gaya.pesanError, { color: warna.danger, backgroundColor: warna.card, borderColor: warna.danger }]}>
              {pesanError}
            </Text>
          ) : null}

          {/* ── Nama Barang ── */}
          <FormField
            label="Nama Barang"
            value={nilai.namaBarang}
            onChangeText={(t) => ubahNilai('namaBarang', t)}
            pesanError={errorForm.namaBarang}
            placeholder="Contoh: Dompet Kulit Coklat"
            maxLength={100}
            editable={!sedangProses}
          />

          {/* ── Kategori ── */}
          <View style={gaya.pembungkusField}>
            <Text style={[gaya.labelField, { color: warna.text }]}>Kategori Barang</Text>
            <View style={gaya.gridKategori}>
              {DAFTAR_KATEGORI.map((kat) => (
                <ChipPilih<KategoriBarang>
                  key={kat.nilai}
                  opsi={kat.nilai}
                  dipilih={nilai.kategori}
                  onPilih={(v) => ubahNilai('kategori', v)}
                  label={kat.label}
                />
              ))}
            </View>
            {errorForm.kategori ? (
              <Text style={[gaya.teksError, { color: warna.danger }]}>{errorForm.kategori}</Text>
            ) : null}
          </View>

          {/* ── Deskripsi ── */}
          <FormField
            label="Deskripsi / Ciri-ciri Barang"
            value={nilai.deskripsi}
            onChangeText={(t) => ubahNilai('deskripsi', t)}
            pesanError={errorForm.deskripsi}
            placeholder="Jelaskan ciri-ciri khusus barang..."
            multiline
            numberOfLines={4}
            style={gaya.inputMultiline}
            editable={!sedangProses}
          />

          {/* ── Lokasi ── */}
          <FormField
            label="Lokasi Kejadian"
            value={nilai.lokasi}
            onChangeText={(t) => ubahNilai('lokasi', t)}
            pesanError={errorForm.lokasi}
            placeholder="Contoh: Lab Komputer 2, Gedung A Lantai 3"
            editable={!sedangProses}
          />

          {/* ── Tanggal Kejadian ── */}
          <FormField
            label="Tanggal Kejadian (YYYY-MM-DD)"
            value={nilai.tanggalKejadian}
            onChangeText={(t) => ubahNilai('tanggalKejadian', t)}
            pesanError={errorForm.tanggalKejadian}
            placeholder={hariIniString()}
            keyboardType="numeric"
            maxLength={10}
            editable={!sedangProses}
          />

          {/* ── Nomor WhatsApp ── */}
          <FormField
            label="Nomor WhatsApp"
            value={nilai.nomorWhatsapp}
            onChangeText={(t) => ubahNilai('nomorWhatsapp', t)}
            pesanError={errorForm.nomorWhatsapp}
            placeholder="Contoh: 081234567890"
            keyboardType="phone-pad"
            editable={!sedangProses}
          />

          {/* ── Penyimpanan (hanya untuk ditemukan) ── */}
          {jenis === 'ditemukan' ? (
            <View style={gaya.pembungkusField}>
              <Text style={[gaya.labelField, { color: warna.text }]}>Barang Disimpan di</Text>
              <View style={gaya.barisChip}>
                <ChipPilih<LokasiPenyimpanan>
                  opsi="diserahkan_ke_petugas"
                  dipilih={nilai.penyimpanan}
                  onPilih={(v) => ubahNilai('penyimpanan', v)}
                  label="Diserahkan ke Petugas"
                />
                <ChipPilih<LokasiPenyimpanan>
                  opsi="disimpan_penemu"
                  dipilih={nilai.penyimpanan}
                  onPilih={(v) => ubahNilai('penyimpanan', v)}
                  label="Disimpan Penemu"
                />
              </View>
              {errorForm.penyimpanan ? (
                <Text style={[gaya.teksError, { color: warna.danger }]}>{errorForm.penyimpanan}</Text>
              ) : null}
            </View>
          ) : null}

          {/* ── Foto (opsional) ── */}
          <View style={gaya.pembungkusField}>
            <Text style={[gaya.labelField, { color: warna.text }]}>Foto Barang (Opsional)</Text>

            {asetFoto ? (
              /* Preview foto terpilih */
              <View style={gaya.previewFotoWrapper}>
                <Image
                  source={{ uri: asetFoto.uri }}
                  style={gaya.previewFoto}
                  resizeMode="cover"
                  accessibilityLabel="Pratinjau foto yang dipilih"
                />
                <TouchableOpacity
                  style={[gaya.tombolHapusFoto, { backgroundColor: warna.danger }]}
                  onPress={hapusFotoTerpilih}
                  accessibilityLabel="Hapus foto yang dipilih"
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              /* Tombol pilih foto */
              <TouchableOpacity
                style={[gaya.tombolFoto, { backgroundColor: warna.card, borderColor: warna.border }]}
                onPress={handlePilihFoto}
                disabled={sedangProses}
                accessibilityLabel="Pilih foto dari galeri"
              >
                <Ionicons name="image-outline" size={28} color={warna.primary} />
                <Text style={[gaya.teksTombolFoto, { color: warna.primary }]}>
                  Pilih Foto dari Galeri
                </Text>
                <Text style={[gaya.teksHintFoto, { color: warna.textSecondary }]}>
                  JPG, PNG, atau WebP — maks. 2 MB
                </Text>
              </TouchableOpacity>
            )}

            {/* Peringatan foto (gagal validasi / gagal unggah) */}
            {pesanFotoWarn ? (
              <Text style={[gaya.teksError, { color: warna.warning }]}>{pesanFotoWarn}</Text>
            ) : null}
          </View>

          {/* ── Tombol Simpan ── */}
          <TouchableOpacity
            style={[
              gaya.tombolSimpan,
              { backgroundColor: sedangProses ? warna.textSecondary : warna.primary },
            ]}
            onPress={handleSimpan}
            disabled={sedangProses}
            accessibilityLabel="Tombol Simpan Laporan"
          >
            {sedangProses ? (
              <View style={gaya.barisSpinner}>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={gaya.teksTombolSimpan}>Menyimpan...</Text>
              </View>
            ) : (
              <Text style={gaya.teksTombolSimpan}>Simpan Laporan</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Style ────────────────────────────────────────────────────────────────────

const gaya = StyleSheet.create({
  kontainer:  { flex: 1 },
  flex:       { flex: 1 },
  scrollIsi:  { padding: JARAK.layar, paddingBottom: 32 },

  labelSeksi:  { fontSize: UKURAN_FONT.kecil, fontWeight: '600', marginBottom: 8 },
  barisChip:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: JARAK.form },
  gridKategori:{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  chipPilih: {
    borderWidth:       1,
    borderRadius:      20,
    paddingHorizontal: 14,
    paddingVertical:   7,
  },
  teksChip: { fontSize: UKURAN_FONT.kecil, fontWeight: '500' },

  pembungkusField: { marginBottom: JARAK.form },
  labelField:      { fontSize: UKURAN_FONT.kecil, fontWeight: '600', marginBottom: 8 },
  teksError:       { fontSize: UKURAN_FONT.mikro, marginTop: 4 },

  pesanError: {
    borderWidth:  1,
    borderRadius: JARAK.radius,
    padding:      12,
    marginBottom: JARAK.form,
    fontSize:     UKURAN_FONT.kecil,
    lineHeight:   20,
  },

  inputMultiline: {
    height:      100,
    textAlignVertical: 'top',
    paddingTop:  10,
  },

  previewFotoWrapper: { position: 'relative', alignSelf: 'flex-start' },
  previewFoto: {
    width:        160,
    height:       120,
    borderRadius: JARAK.radius,
  },
  tombolHapusFoto: {
    position:     'absolute',
    top:          -8,
    right:        -8,
    width:        26,
    height:       26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems:   'center',
  },

  tombolFoto: {
    borderWidth:    1,
    borderRadius:   JARAK.radius,
    borderStyle:    'dashed',
    padding:        20,
    alignItems:     'center',
    gap:            6,
  },
  teksTombolFoto: { fontSize: UKURAN_FONT.tubuh, fontWeight: '500' },
  teksHintFoto:   { fontSize: UKURAN_FONT.mikro },

  tombolSimpan: {
    height:         JARAK.tombol + 4,
    borderRadius:   JARAK.radius,
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      8,
  },
  teksTombolSimpan: { color: '#FFFFFF', fontSize: UKURAN_FONT.tubuh, fontWeight: '700' },
  barisSpinner:     { flexDirection: 'row', alignItems: 'center' },
});
