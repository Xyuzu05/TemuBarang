// src/components/SearchBox.tsx
// Kotak pencarian dengan ikon dan aksesibilitas — dipakai di Beranda.

import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';
import { JARAK, UKURAN_FONT } from '@/constants/theme';

interface PropsSearchBox {
  nilai: string;
  onUbah: (teks: string) => void;
  placeholder?: string;
}

/**
 * Kotak pencarian dengan placeholder, ikon kaca pembesar, dan tombol hapus (×)
 * yang muncul saat ada teks. Warna selalu dari tema aktif.
 */
export default function SearchBox({
  nilai,
  onUbah,
  placeholder = 'Cari nama barang...',
}: PropsSearchBox) {
  const { warna } = useAppTheme();

  return (
    <View
      style={[
        gaya.kotak,
        {
          backgroundColor: warna.card,
          borderColor:     warna.border,
        },
      ]}
      accessibilityRole="search"
    >
      <Ionicons
        name="search"
        size={18}
        color={warna.textSecondary}
        style={gaya.ikonKiri}
      />
      <TextInput
        style={[gaya.input, { color: warna.text }]}
        value={nilai}
        onChangeText={onUbah}
        placeholder={placeholder}
        placeholderTextColor={warna.textSecondary}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Kotak pencarian nama barang"
      />
      {nilai.length > 0 && (
        <TouchableOpacity
          onPress={() => onUbah('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Hapus pencarian"
        >
          <Ionicons name="close-circle" size={18} color={warna.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const gaya = StyleSheet.create({
  kotak: {
    flexDirection:  'row',
    alignItems:     'center',
    borderWidth:    1,
    borderRadius:   JARAK.radius,
    paddingHorizontal: 12,
    height:         44,
    marginBottom:   10,
  },
  ikonKiri: { marginRight: 8 },
  input: {
    flex:     1,
    fontSize: UKURAN_FONT.tubuh,
    // Menghilangkan padding default iOS agar teks vertikally centered
    paddingVertical: 0,
  },
});
