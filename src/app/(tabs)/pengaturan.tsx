// src/app/(tabs)/pengaturan.tsx
// Tab Pengaturan: pilihan tema terang/gelap/ikut sistem, tombol keluar.

import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';
import { konfirmasi } from '@/utils/konfirmasi';
import { keluar } from '@/services/authService';
import type { PilihanTema } from '@/services/themeStorage';

// ─── Opsi tema ────────────────────────────────────────────────────────────────

type NamaIonicons = React.ComponentProps<typeof Ionicons>['name'];

const OPSI_TEMA: { nilai: PilihanTema; label: string; ikon: NamaIonicons }[] = [
  { nilai: 'light',  label: 'Terang',      ikon: 'sunny-outline' },
  { nilai: 'dark',   label: 'Gelap',       ikon: 'moon-outline' },
  { nilai: 'system', label: 'Ikut Sistem', ikon: 'phone-portrait-outline' },
];

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function HalamanPengaturan() {
  const { warna, pilihanTema, ubahTema } = useAppTheme();
  const [sedangKeluar, setSedangKeluar] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  async function handleKeluar() {
    const yakin = await konfirmasi('Keluar', 'Kamu akan keluar dari akun. Lanjutkan?');
    if (!yakin) return;
    setSedangKeluar(true);
    try {
      await keluar();
    } catch (err) {
      setPesanError(err instanceof Error ? err.message : 'Gagal keluar. Coba lagi.');
    } finally {
      setSedangKeluar(false);
    }
  }

  return (
    <SafeAreaView style={[gaya.kontainer, { backgroundColor: warna.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={gaya.scroll} showsVerticalScrollIndicator={false}>

        {/* Error banner */}
        {pesanError ? (
          <View style={[gaya.bannerError, { backgroundColor: warna.danger + '22', borderColor: warna.danger }]}>
            <Text style={[gaya.teksBanner, { color: warna.danger }]}>{pesanError}</Text>
          </View>
        ) : null}

        {/* Seksi: Tema */}
        <Text style={[gaya.labelSeksi, { color: warna.textSecondary }]}>Tema Tampilan</Text>
        <View style={[gaya.kartuSeksi, { backgroundColor: warna.card, borderColor: warna.border }]}>
          {OPSI_TEMA.map((opsi, indeks) => {
            const aktif = pilihanTema === opsi.nilai;
            return (
              <TouchableOpacity
                key={opsi.nilai}
                style={[
                  gaya.barisOpsi,
                  indeks < OPSI_TEMA.length - 1 && { borderBottomWidth: 1, borderBottomColor: warna.border },
                  aktif && { backgroundColor: warna.primary + '15' },
                ]}
                onPress={() => ubahTema(opsi.nilai)}
                accessibilityLabel={`Tema ${opsi.label}`}
                accessibilityState={{ selected: aktif }}
              >
                <Ionicons
                  name={opsi.ikon as NamaIonicons}
                  size={20}
                  color={aktif ? warna.primary : warna.textSecondary}
                  style={gaya.ikonOpsi}
                />
                <Text style={[gaya.teksOpsi, { color: warna.text }]}>{opsi.label}</Text>
                {aktif && (
                  <Ionicons name="checkmark-circle" size={20} color={warna.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seksi: Akun */}
        <Text style={[gaya.labelSeksi, { color: warna.textSecondary }]}>Akun</Text>
        <TouchableOpacity
          style={[gaya.tombolKeluar, { borderColor: warna.danger, backgroundColor: warna.card }]}
          onPress={handleKeluar}
          disabled={sedangKeluar}
          accessibilityLabel="Tombol Keluar"
        >
          {sedangKeluar ? (
            <ActivityIndicator color={warna.danger} />
          ) : (
            <View style={gaya.isiTombolKeluar}>
              <Ionicons name="log-out-outline" size={20} color={warna.danger} />
              <Text style={[gaya.teksTombolKeluar, { color: warna.danger }]}>Keluar</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Style ────────────────────────────────────────────────────────────────────

const gaya = StyleSheet.create({
  kontainer: { flex: 1 },
  scroll:    { padding: JARAK.layar, paddingBottom: 32 },

  bannerError: {
    borderWidth: 1,
    borderRadius: JARAK.radius,
    padding: 12,
    marginBottom: JARAK.form,
  },
  teksBanner: { fontSize: UKURAN_FONT.kecil, lineHeight: 20 },

  labelSeksi: {
    fontSize:     UKURAN_FONT.mikro,
    fontWeight:   '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop:    8,
  },
  kartuSeksi: {
    borderWidth:  1,
    borderRadius: JARAK.radius,
    overflow:     'hidden',
    marginBottom: 20,
  },

  barisOpsi: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical:   14,
    paddingHorizontal: 14,
  },
  ikonOpsi: { marginRight: 12, width: 24 },
  teksOpsi: {
    flex:       1,
    fontSize:   UKURAN_FONT.tubuh,
    fontWeight: '500',
  },

  tombolKeluar: {
    height:         JARAK.tombol,
    borderWidth:    1.5,
    borderRadius:   JARAK.radius,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   8,
  },
  isiTombolKeluar: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  teksTombolKeluar: { fontSize: UKURAN_FONT.tubuh, fontWeight: '600' },
});
