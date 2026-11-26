// src/utils/konfirmasi.ts
// Dialog konfirmasi dan notifikasi yang berjalan di platform native (iOS/Android) DAN web.
// Jangan pakai Alert.alert langsung — tidak berfungsi di browser.

import { Platform } from 'react-native';

/**
 * Menampilkan dialog konfirmasi dengan judul dan pesan.
 * Mengembalikan Promise<boolean>: true jika pengguna mengonfirmasi.
 *
 * Di web  → window.confirm (bawaan browser).
 * Di native → Alert.alert dari react-native (aman di Android/iOS).
 */
export async function konfirmasi(judul: string, pesan?: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const teks = pesan ? `${judul}\n\n${pesan}` : judul;
    return window.confirm(teks);
  }

  // Di native, bungkus Alert.alert dalam Promise
  const { Alert } = await import('react-native');
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      judul,
      pesan,
      [
        {
          text: 'Batal',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Ya',
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/**
 * Menampilkan notifikasi informasi (tanpa tombol batal).
 * Di web  → window.alert.
 * Di native → Alert.alert dengan satu tombol OK.
 */
export async function peringatan(judul: string, pesan?: string): Promise<void> {
  if (Platform.OS === 'web') {
    const teks = pesan ? `${judul}\n\n${pesan}` : judul;
    window.alert(teks);
    return;
  }

  const { Alert } = await import('react-native');
  return new Promise<void>((resolve) => {
    Alert.alert(judul, pesan, [{ text: 'OK', onPress: () => resolve() }]);
  });
}

