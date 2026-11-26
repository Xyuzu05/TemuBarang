// src/services/laporanService.ts
// Layanan untuk membaca dan menulis data laporan ke Supabase.
// Semua fungsi melempar Error berpesan Bahasa Indonesia; layar yang menampilkannya.

import { supabase } from '@/services/supabase';
import { hapusFoto, pathDariUrl } from '@/services/storageService';
import type { Laporan, LaporanBaru, LaporanEdit, JenisLaporan, KategoriBarang, StatusLaporan } from '@/types/laporan';

/** Parameter filter untuk fungsi ambilDaftarLaporan */
export interface FilterLaporan {
  /** Kata kunci pencarian nama barang (ilike, boleh kosong) */
  kataCari?: string;
  /** Filter jenis: 'hilang' | 'ditemukan' | undefined = semua */
  jenis?: JenisLaporan;
  /** Filter kategori; undefined = semua */
  kategori?: KategoriBarang;
}

const BATAS_WAKTU_MS = 8000; // 8 detik

/**
 * Mengambil daftar laporan dari database, diurutkan terbaru dulu.
 * Mendukung pencarian nama barang (ilike), filter jenis, dan filter kategori.
 */
export async function ambilDaftarLaporan(
  filter: FilterLaporan = {},
  signal?: AbortSignal,
): Promise<Laporan[]> {
  const { kataCari, jenis, kategori } = filter;

  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  // Filter nama barang — ilike untuk case-insensitive
  if (kataCari && kataCari.trim().length > 0) {
    query = query.ilike('nama_barang', `%${kataCari.trim()}%`);
  }

  // Filter jenis laporan
  if (jenis) {
    query = query.eq('jenis', jenis);
  }

  // Filter kategori
  if (kategori) {
    query = query.eq('kategori', kategori);
  }

  // Abort signal untuk membatalkan permintaan yang sudah basi
  if (signal) {
    query = query.abortSignal(signal);
  }

  const { data, error } = await query;

  if (error) {
    if (error.message?.includes('aborted') || error.name === 'AbortError') {
      throw new Error('Permintaan dibatalkan.');
    }
    throw new Error('Gagal memuat daftar laporan. Periksa koneksimu dan coba lagi.');
  }

  // Supabase returns null saat baris kosong
  return (data ?? []) as Laporan[];
}

/**
 * Mengambil satu laporan berdasarkan id.
 * Melempar error jika laporan tidak ditemukan.
 */
export async function ambilLaporanById(id: string): Promise<Laporan> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .abortSignal(controller.signal)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Laporan tidak ditemukan.');
      }
      if (error.message?.includes('aborted')) {
        throw new Error('Permintaan melebihi batas waktu, coba lagi.');
      }
      throw new Error('Gagal memuat laporan. Periksa koneksimu dan coba lagi.');
    }

    return data as Laporan;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Membuat laporan baru di database.
 * user_id diisi otomatis oleh Supabase (via RLS auth.uid()).
 * Melempar error jika gagal.
 * @returns Laporan yang baru dibuat (dengan id dan timestamps dari server)
 */
export async function buatLaporan(data: LaporanBaru): Promise<Laporan> {
  const { data: baris, error } = await supabase
    .from('reports')
    .insert(data)
    .select()
    .single();

  if (error) {
    // Tangkap pelanggaran constraint database
    if (error.code === '23514') {
      throw new Error('Data laporan tidak valid. Periksa kembali semua kolom.');
    }
    if (error.code === '23505') {
      throw new Error('Laporan sudah ada di sistem.');
    }
    throw new Error('Gagal menyimpan laporan. Periksa koneksimu dan coba lagi.');
  }

  return baris as Laporan;
}

/**
 * Mengambil semua laporan milik pengguna yang sedang login, terbaru dulu.
 * RLS Supabase memastikan hanya baris user_id = auth.uid() yang dikembalikan
 * oleh query .eq('user_id', userId).
 */
export async function ambilLaporanSaya(userId: string): Promise<Laporan[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Gagal memuat riwayat laporan. Periksa koneksimu dan coba lagi.');
  }
  return (data ?? []) as Laporan[];
}

/**
 * Memperbarui data laporan milik sendiri (jenis tidak bisa diubah).
 * Jika ada foto baru diunggah sebelum memanggil ini, kirim foto_url baru di payload.
 * Jika foto dihapus oleh pengguna, kirim foto_url: null.
 */
export async function perbaruiLaporan(id: string, data: LaporanEdit): Promise<Laporan> {
  const { data: baris, error } = await supabase
    .from('reports')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23514') {
      throw new Error('Data tidak valid. Periksa kembali semua kolom.');
    }
    throw new Error('Gagal memperbarui laporan. Periksa koneksimu dan coba lagi.');
  }
  return baris as Laporan;
}

/**
 * Mengubah status laporan milik sendiri.
 * Nilai yang valid: 'aktif' | 'sudah_ditemukan' | 'sudah_dikembalikan'
 */
export async function ubahStatusLaporan(
  id: string,
  status: StatusLaporan,
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id);

  if (error) {
    throw new Error('Gagal mengubah status. Periksa koneksimu dan coba lagi.');
  }
}

/**
 * Menghapus laporan milik sendiri.
 * Jika laporan punya foto, hapus juga file di Storage sebelum hapus baris DB.
 * Gagal hapus foto tidak mencegah penghapusan baris (baris tetap dihapus).
 */
export async function hapusLaporan(laporan: Laporan): Promise<void> {
  // Hapus foto di Storage jika ada
  if (laporan.foto_url) {
    const path = pathDariUrl(laporan.foto_url);
    if (path) await hapusFoto(path);
  }

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', laporan.id);

  if (error) {
    throw new Error('Gagal menghapus laporan. Periksa koneksimu dan coba lagi.');
  }
}
