// src/types/laporan.ts
// Tipe-tipe data utama TemuBarang sesuai schema.sql

/** Jenis laporan: barang hilang atau ditemukan */
export type JenisLaporan = 'hilang' | 'ditemukan';

/** Kategori barang sesuai constraint di database */
export type KategoriBarang =
  | 'dompet'
  | 'handphone'
  | 'charger'
  | 'flashdisk'
  | 'buku'
  | 'kartu_identitas'
  | 'lainnya';

/** Status laporan */
export type StatusLaporan = 'aktif' | 'sudah_ditemukan' | 'sudah_dikembalikan';

/** Lokasi penyimpanan — hanya untuk laporan ditemukan */
export type LokasiPenyimpanan = 'diserahkan_ke_petugas' | 'disimpan_penemu';

/**
 * Tipe utama laporan barang, sesuai tabel `reports` di Supabase.
 * Nama kolom harus persis sama dengan schema.sql.
 */
export interface Laporan {
  id: string;
  user_id: string;
  jenis: JenisLaporan;
  nama_barang: string;
  kategori: KategoriBarang;
  deskripsi: string;
  lokasi: string;
  tanggal_kejadian: string; // format ISO date: YYYY-MM-DD
  nomor_whatsapp: string;
  penyimpanan: LokasiPenyimpanan | null;
  foto_url: string | null;
  status: StatusLaporan;
  created_at: string;
  updated_at: string;
}

/** Data yang dikirim saat membuat laporan baru (tanpa kolom otomatis) */
export type LaporanBaru = Omit<Laporan, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

/** Data yang dikirim saat mengedit laporan (jenis tidak bisa diubah) */
export type LaporanEdit = Omit<LaporanBaru, 'jenis'>;

