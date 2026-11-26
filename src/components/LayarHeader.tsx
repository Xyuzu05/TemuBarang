// src/components/LayarHeader.tsx
// Header indigo + judul + tombol kembali opsional + sheet putih melengkung.
// Isi layar diletakkan sebagai children di dalam ScrollView sheet.

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';

interface PropsLayarHeader {
  /** Judul utama di header */
  judul: string;
  /** Subjudul kecil di bawah judul */
  subjudul?: string;
  /** Tampilkan tombol kembali oranye di kiri atas */
  tampilkanKembali?: boolean;
  /** Konten di dalam sheet putih */
  children: React.ReactNode;
  /** Sembunyikan keyboard avoiding (default true) */
  keyboardAvoiding?: boolean;
}

/**
 * Layout header indigo di atas + sheet putih melengkung yang bisa di-scroll.
 * Dipakai di semua layar utama untuk konsistensi tampilan.
 */
export default function LayarHeader({
  judul,
  subjudul,
  tampilkanKembali = false,
  children,
  keyboardAvoiding = true,
}: PropsLayarHeader) {
  const { warna } = useAppTheme();
  const router = useRouter();

  const kontenUtama = (
    <View style={[gaya.kontainer, { backgroundColor: warna.headerBg }]}>
      {/* Area header */}
      <SafeAreaView edges={['top']} style={gaya.headerArea}>
        <View style={gaya.headerKonten}>
          {tampilkanKembali ? (
            <TouchableOpacity
              style={[gaya.tombolKembali, { backgroundColor: warna.accent }]}
              onPress={() => router.back()}
              accessibilityLabel="Kembali"
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={gaya.placeholder} />
          )}
          <View style={gaya.judulArea}>
            <Text style={gaya.judulTeks} numberOfLines={1}>{judul}</Text>
            {subjudul ? (
              <Text style={gaya.subjudulTeks} numberOfLines={2}>{subjudul}</Text>
            ) : null}
          </View>
          <View style={gaya.placeholder} />
        </View>
      </SafeAreaView>

      {/* Sheet putih melengkung */}
      <ScrollView
        style={[gaya.sheet, { backgroundColor: warna.background }]}
        contentContainerStyle={gaya.sheetKonten}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={gaya.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {kontenUtama}
      </KeyboardAvoidingView>
    );
  }

  return kontenUtama;
}

const gaya = StyleSheet.create({
  flex: { flex: 1 },
  kontainer: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: JARAK.layar,
    paddingBottom: 48,
  },
  headerKonten: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  tombolKembali: {
    width: JARAK.tombolKembali,
    height: JARAK.tombolKembali,
    borderRadius: JARAK.radiusKembali,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  placeholder: {
    width: JARAK.tombolKembali,
  },
  judulArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  judulTeks: {
    fontSize: UKURAN_FONT.judul,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subjudulTeks: {
    fontSize: UKURAN_FONT.tubuh,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 4,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: JARAK.radiusSheet,
    borderTopRightRadius: JARAK.radiusSheet,
    marginTop: -24,
  },
  sheetKonten: {
    padding: JARAK.layar,
    paddingTop: 24,
    flexGrow: 1,
  },
});
