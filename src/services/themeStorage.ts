// src/services/themeStorage.ts
// Menyimpan dan membaca pilihan tema dari AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

const KUNCI_TEMA = '@temubarang:tema';

export type PilihanTema = 'light' | 'dark' | 'system';

/** Membaca pilihan tema yang tersimpan; default 'system' jika belum ada */
export async function ambilPilihanTema(): Promise<PilihanTema> {
  try {
    const nilai = await AsyncStorage.getItem(KUNCI_TEMA);
    if (nilai === 'light' || nilai === 'dark' || nilai === 'system') {
      return nilai;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

/** Menyimpan pilihan tema ke AsyncStorage; gagal simpan tidak merusak alur utama */
export async function simpanPilihanTema(pilihan: PilihanTema): Promise<void> {
  try {
    await AsyncStorage.setItem(KUNCI_TEMA, pilihan);
  } catch {
    // gagal simpan diabaikan — tidak memengaruhi tampilan
  }
}

