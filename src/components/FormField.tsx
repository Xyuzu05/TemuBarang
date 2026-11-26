// src/components/FormField.tsx
// Komponen input form bertema: latar inputBg, radius 14, ikon Ionicons kiri,
// tombol mata opsional untuk kata sandi, dan pesan error per kolom.

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';

interface PropsFormField extends TextInputProps {
  /** Label di atas input */
  label: string;
  /** Pesan error; jika ada, border berubah merah dan pesan ditampilkan */
  pesanError?: string;
  /** Nama ikon Ionicons di kiri input */
  namaIkon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Tampilkan tombol mata untuk toggle lihat/sembunyikan teks */
  bisaLihatSandi?: boolean;
}

/**
 * Field form dengan label, input bertema (latar abu, tanpa border, radius 14),
 * ikon kiri opsional, tombol mata, dan pesan error.
 */
export default function FormField({
  label,
  pesanError,
  namaIkon,
  bisaLihatSandi = false,
  style,
  secureTextEntry,
  ...props
}: PropsFormField) {
  const { warna } = useAppTheme();
  const [tampilkanSandi, setTampilkanSandi] = useState(false);

  const adaError = !!pesanError;

  return (
    <View style={gaya.pembungkus}>
      <Text style={[gaya.label, { color: warna.text }]}>{label}</Text>
      <View
        style={[
          gaya.kontainerInput,
          { backgroundColor: warna.inputBg },
          adaError ? { borderWidth: 1, borderColor: warna.danger } : undefined,
        ]}
      >
        {namaIkon ? (
          <Ionicons
            name={namaIkon}
            size={20}
            color={warna.textSecondary}
            style={gaya.ikon}
          />
        ) : null}
        <TextInput
          style={[
            gaya.input,
            { color: warna.text },
            !namaIkon ? { paddingLeft: 16 } : undefined,
            style,
          ]}
          placeholderTextColor={warna.textSecondary}
          accessibilityLabel={label}
          secureTextEntry={bisaLihatSandi ? !tampilkanSandi : secureTextEntry}
          {...props}
        />
        {bisaLihatSandi ? (
          <TouchableOpacity
            onPress={() => setTampilkanSandi((v) => !v)}
            style={gaya.tombolMata}
            accessibilityLabel={tampilkanSandi ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
          >
            <Ionicons
              name={tampilkanSandi ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={warna.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {pesanError ? (
        <Text style={[gaya.error, { color: warna.danger }]}>{pesanError}</Text>
      ) : null}
    </View>
  );
}

const gaya = StyleSheet.create({
  pembungkus: { marginBottom: JARAK.form },
  label: {
    fontSize: UKURAN_FONT.kecil,
    fontWeight: '600',
    marginBottom: 8,
  },
  kontainerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: JARAK.radiusInput,
    height: JARAK.tombol,
  },
  ikon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: UKURAN_FONT.tubuh,
  },
  tombolMata: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
  },
  error: {
    fontSize: UKURAN_FONT.mikro,
    marginTop: 4,
  },
});
