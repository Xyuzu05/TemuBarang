// src/app/(auth)/login.tsx
// Layar login: header indigo, form email + kata sandi dengan ikon,
// tombol mata, TombolUtama, dan tautan oranye ke halaman daftar.

import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import LayarHeader from '@/components/LayarHeader';
import FormField from '@/components/FormField';
import TombolUtama from '@/components/TombolUtama';
import { masuk } from '@/services/authService';

// ─── Validasi lokal ───────────────────────────────────────────────────────────

interface ErrorForm {
  email?: string;
  kataKunci?: string;
}

function validasiForm(email: string, kataKunci: string): ErrorForm {
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

  return err;
}

// ─── Komponen ────────────────────────────────────────────────────────────────

export default function HalamanLogin() {
  const { warna } = useAppTheme();

  const [email, setEmail]           = useState('');
  const [kataKunci, setKataKunci]   = useState('');
  const [errorForm, setErrorForm]   = useState<ErrorForm>({});
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [sedangProses, setSedangProses] = useState(false);

  async function handleMasuk() {
    // Reset error lama
    setPesanError(null);

    // Validasi lokal
    const err = validasiForm(email, kataKunci);
    setErrorForm(err);
    if (Object.keys(err).length > 0) return;

    setSedangProses(true);
    try {
      await masuk(email.trim(), kataKunci);
      // Navigasi otomatis ditangani oleh PenjagaLogin di _layout.tsx
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSedangProses(false);
    }
  }

  return (
    <LayarHeader
      judul="Selamat Datang Kembali"
      subjudul="Masuk untuk melaporkan barang"
    >
      {/* Error server */}
      {pesanError ? (
        <View style={[gaya.kotakError, { backgroundColor: warna.danger + '14' }]}>
          <Text style={[gaya.teksError, { color: warna.danger }]}>
            {pesanError}
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
        autoComplete="current-password"
        placeholder="Minimal 6 karakter"
        returnKeyType="done"
        onSubmitEditing={handleMasuk}
        editable={!sedangProses}
      />

      {/* Tombol Masuk */}
      <TombolUtama
        label="Masuk"
        onPress={handleMasuk}
        sedangMemuat={sedangProses}
        style={gaya.tombolMasuk}
      />

      {/* Tautan ke Register */}
      <Link href="/(auth)/register" asChild>
        <TouchableOpacity style={gaya.tautan} disabled={sedangProses}>
          <Text style={[gaya.teksTautan, { color: warna.textSecondary }]}>
            Belum punya akun?{' '}
            <Text style={[gaya.teksTautanTebal, { color: warna.accent }]}>Buat akun</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </LayarHeader>
  );
}

const gaya = StyleSheet.create({
  kotakError: {
    borderRadius: JARAK.radiusInput,
    padding: 14,
    marginBottom: JARAK.form,
  },
  teksError: {
    fontSize: UKURAN_FONT.kecil,
    lineHeight: 18,
  },
  tombolMasuk: {
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
