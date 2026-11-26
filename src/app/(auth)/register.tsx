// src/app/(auth)/register.tsx
// Layar registrasi: header indigo, form email + kata sandi + konfirmasi,
// tombol mata, TombolUtama, dan tautan oranye ke halaman login.

import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import LayarHeader from '@/components/LayarHeader';
import FormField from '@/components/FormField';
import TombolUtama from '@/components/TombolUtama';
import { daftar } from '@/services/authService';

// ─── Validasi lokal ───────────────────────────────────────────────────────────

interface ErrorForm {
  email?: string;
  kataKunci?: string;
  konfirmasiKataKunci?: string;
}

function validasiForm(email: string, kataKunci: string, konfirmasi: string): ErrorForm {
  const err: ErrorForm = {};

  if (!email.trim()) {
    err.email = 'Email wajib diisi.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    err.email = 'Format email tidak valid.';
  }

  if (!kataKunci) {
    err.kataKunci = 'Kata sandi wajib diisi.';
  } else if (kataKunci.length < 6) {
    err.kataKunci = 'Kata sandi minimal 6 karakter.';
  }

  if (!konfirmasi) {
    err.konfirmasiKataKunci = 'Konfirmasi kata sandi wajib diisi.';
  } else if (konfirmasi !== kataKunci) {
    err.konfirmasiKataKunci = 'Kata sandi tidak cocok.';
  }

  return err;
}

// ─── Komponen ────────────────────────────────────────────────────────────────

export default function HalamanRegister() {
  const { warna } = useAppTheme();
  const router    = useRouter();

  const [email, setEmail]                 = useState('');
  const [kataKunci, setKataKunci]         = useState('');
  const [konfirmasi, setKonfirmasi]       = useState('');
  const [errorForm, setErrorForm]         = useState<ErrorForm>({});
  const [pesanError, setPesanError]       = useState<string | null>(null);
  const [pesanSukses, setPesanSukses]     = useState<string | null>(null);
  const [sedangProses, setSedangProses]   = useState(false);

  async function handleDaftar() {
    setPesanError(null);
    setPesanSukses(null);

    const err = validasiForm(email, kataKunci, konfirmasi);
    setErrorForm(err);
    if (Object.keys(err).length > 0) return;

    setSedangProses(true);
    try {
      await daftar(email.trim(), kataKunci);
      // Supabase mungkin mengirim email konfirmasi; beri tahu pengguna
      setPesanSukses(
        'Akun berhasil dibuat! Cek email kamu untuk konfirmasi, lalu masuk.'
      );
      // Setelah 2.5 detik, arahkan ke login
      setTimeout(() => router.replace('/(auth)/login'), 2500);
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSedangProses(false);
    }
  }

  return (
    <LayarHeader
      judul="Buat Akun"
      subjudul="Daftar untuk mulai melaporkan barang"
    >
      {/* Pesan error server */}
      {pesanError ? (
        <View style={[gaya.kotakPesan, { backgroundColor: warna.danger + '14' }]}>
          <Text style={[gaya.teksPesan, { color: warna.danger }]}>
            {pesanError}
          </Text>
        </View>
      ) : null}

      {/* Pesan sukses */}
      {pesanSukses ? (
        <View style={[gaya.kotakPesan, { backgroundColor: warna.success + '14' }]}>
          <Text style={[gaya.teksPesan, { color: warna.success }]}>
            {pesanSukses}
          </Text>
        </View>
      ) : null}

      {/* Form */}
      <FormField
        label="Email"
        value={email}
        onChangeText={(t) => { setEmail(t); setErrorForm((e) => ({ ...e, email: undefined })); }}
        pesanError={errorForm.email}
        namaIkon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="contoh@email.com"
        returnKeyType="next"
        editable={!sedangProses}
      />

      <FormField
        label="Kata Sandi"
        value={kataKunci}
        onChangeText={(t) => { setKataKunci(t); setErrorForm((e) => ({ ...e, kataKunci: undefined })); }}
        pesanError={errorForm.kataKunci}
        namaIkon="lock-closed-outline"
        bisaLihatSandi
        autoComplete="new-password"
        placeholder="Minimal 6 karakter"
        returnKeyType="next"
        editable={!sedangProses}
      />

      <FormField
        label="Konfirmasi Kata Sandi"
        value={konfirmasi}
        onChangeText={(t) => { setKonfirmasi(t); setErrorForm((e) => ({ ...e, konfirmasiKataKunci: undefined })); }}
        pesanError={errorForm.konfirmasiKataKunci}
        namaIkon="lock-closed-outline"
        bisaLihatSandi
        autoComplete="new-password"
        placeholder="Ulangi kata sandi"
        returnKeyType="done"
        onSubmitEditing={handleDaftar}
        editable={!sedangProses}
      />

      {/* Tombol Buat Akun */}
      <TombolUtama
        label="Buat Akun"
        onPress={handleDaftar}
        sedangMemuat={sedangProses}
        style={gaya.tombolDaftar}
      />

      {/* Tautan ke Login */}
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={gaya.tautan} disabled={sedangProses}>
          <Text style={[gaya.teksTautan, { color: warna.textSecondary }]}>
            Sudah punya akun?{' '}
            <Text style={[gaya.teksTautanTebal, { color: warna.accent }]}>Masuk</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </LayarHeader>
  );
}

const gaya = StyleSheet.create({
  kotakPesan: {
    borderRadius: JARAK.radiusInput,
    padding: 14,
    marginBottom: JARAK.form,
  },
  teksPesan: {
    fontSize: UKURAN_FONT.kecil,
    lineHeight: 18,
  },
  tombolDaftar: {
    marginTop: 8,
    marginBottom: JARAK.form,
  },
  tautan: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  teksTautan: {
    fontSize: UKURAN_FONT.tubuh,
  },
  teksTautanTebal: {
    fontWeight: '700',
  },
});
