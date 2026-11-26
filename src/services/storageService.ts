// src/services/storageService.ts
// Layanan unggah dan hapus foto ke bucket 'foto-barang' di Supabase Storage.
// File disimpan di path: <user_id>/<timestamp>-<acak>.<ekstensi>
// Validasi tipe dan ukuran dilakukan sebelum unggah.

import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/services/supabase';

const NAMA_BUCKET    = 'foto-barang';
const MAKS_UKURAN_MB = 2;
const MAKS_UKURAN_BYTE = MAKS_UKURAN_MB * 1024 * 1024; // 2 097 152 byte

/** Tipe MIME yang diizinkan sesuai schema.sql */
const TIPE_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp'] as const;
type TipeDiizinkan = typeof TIPE_DIIZINKAN[number];

// ─── Helper: ekstensi dari MIME type ─────────────────────────────────────────

function ekstensiDariMime(mime: string): string {
  const peta: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
  };
  return peta[mime] ?? 'jpg';
}

// ─── Helper: ambil ArrayBuffer dari URI (native & web) ───────────────────────

async function uriKeArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const respons = await fetch(uri);
  return respons.arrayBuffer();
}

// ─── Helper: dapatkan ukuran file dari URI ────────────────────────────────────
// Expo ImagePicker menyediakan fileSize di aset; jika tidak ada, fetch lalu ukur.

async function ukuranDariUri(uri: string): Promise<number> {
  try {
    const respons = await fetch(uri, { method: 'HEAD' });
    const panjang = respons.headers.get('content-length');
    if (panjang) return parseInt(panjang, 10);
  } catch {
    // HEAD tidak selalu didukung untuk file lokal
  }
  // Fallback: unduh dan ukur
  const buf = await uriKeArrayBuffer(uri);
  return buf.byteLength;
}

// ─── Fungsi utama: unggah foto ────────────────────────────────────────────────

export interface HasilUnggah {
  /** URL publik foto yang sudah diunggah */
  urlPublik: string;
  /** Path file di dalam bucket (dibutuhkan untuk hapus) */
  pathFile: string;
}

/**
 * Memvalidasi dan mengunggah foto ke Supabase Storage.
 * @param aset     - Aset dari expo-image-picker
 * @param userId   - ID pengguna yang sedang login (dipakai sebagai folder)
 * @returns HasilUnggah berisi urlPublik dan pathFile
 * @throws Error dengan pesan Bahasa Indonesia jika gagal
 */
export async function unggahFoto(
  aset: ImagePicker.ImagePickerAsset,
  userId: string,
): Promise<HasilUnggah> {

  // 1. Validasi tipe MIME
  const tipeFile = (aset.mimeType ?? 'image/jpeg') as string;
  if (!TIPE_DIIZINKAN.includes(tipeFile as TipeDiizinkan)) {
    throw new Error('Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.');
  }

  // 2. Validasi ukuran
  let ukuranByte = aset.fileSize ?? 0;
  if (ukuranByte === 0) {
    // expo-image-picker tidak selalu mengisi fileSize — ukur manual
    ukuranByte = await ukuranDariUri(aset.uri);
  }
  if (ukuranByte > MAKS_UKURAN_BYTE) {
    const ukuranMb = (ukuranByte / 1024 / 1024).toFixed(1);
    throw new Error(
      `Ukuran foto terlalu besar (${ukuranMb} MB). Maks. ${MAKS_UKURAN_MB} MB.`
    );
  }

  // 3. Buat nama file unik: <userId>/<timestamp>-<acak>.<ext>
  const ekstensi = ekstensiDariMime(tipeFile);
  const acak     = Math.random().toString(36).slice(2, 8);
  const namaFile = `${Date.now()}-${acak}.${ekstensi}`;
  const pathFile = `${userId}/${namaFile}`;

  // 4. Ambil bytes
  const buffer = await uriKeArrayBuffer(aset.uri);

  // 5. Upload ke Supabase Storage
  const { error } = await supabase.storage
    .from(NAMA_BUCKET)
    .upload(pathFile, buffer, {
      contentType:  tipeFile,
      cacheControl: '3600',
      upsert:       false,
    });

  if (error) {
    throw new Error(`Gagal mengunggah foto: ${error.message}`);
  }

  // 6. Ambil URL publik (bucket sudah diset public di schema.sql)
  const { data } = supabase.storage
    .from(NAMA_BUCKET)
    .getPublicUrl(pathFile);

  return { urlPublik: data.publicUrl, pathFile };
}

/**
 * Menghapus foto dari Supabase Storage berdasarkan path-nya.
 * Gagal hapus diabaikan (tidak melempar error) agar alur utama tidak terganggu.
 * @param pathFile - Path file di bucket, mis. "user-id/1234567890-abc.jpg"
 */
export async function hapusFoto(pathFile: string): Promise<void> {
  try {
    await supabase.storage.from(NAMA_BUCKET).remove([pathFile]);
  } catch {
    // Gagal hapus foto tidak dianggap error kritis
  }
}

/**
 * Mengekstrak path file dari URL publik Supabase Storage.
 * Dibutuhkan saat akan hapus foto lewat URL yang tersimpan di DB.
 * Mengembalikan null jika URL tidak berasal dari bucket foto-barang.
 */
export function pathDariUrl(urlPublik: string): string | null {
  try {
    // Format URL: https://<project>.supabase.co/storage/v1/object/public/foto-barang/<path>
    const penanda = `/object/public/${NAMA_BUCKET}/`;
    const idx = urlPublik.indexOf(penanda);
    if (idx === -1) return null;
    return urlPublik.slice(idx + penanda.length);
  } catch {
    return null;
  }
}
