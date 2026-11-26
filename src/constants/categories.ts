// src/constants/categories.ts
// Daftar kategori barang beserta label tampilan dalam Bahasa Indonesia

import { KategoriBarang } from '@/types/laporan';

/** Pasangan nilai kategori (untuk database) dan label tampilan */
export interface InfoKategori {
  nilai: KategoriBarang;
  label: string;
}

/** Daftar semua kategori barang yang tersedia */
export const DAFTAR_KATEGORI: InfoKategori[] = [
  { nilai: 'dompet',         label: 'Dompet' },
  { nilai: 'handphone',      label: 'Handphone' },
  { nilai: 'charger',        label: 'Charger' },
  { nilai: 'flashdisk',      label: 'Flashdisk' },
  { nilai: 'buku',           label: 'Buku' },
  { nilai: 'kartu_identitas', label: 'Kartu Identitas' },
  { nilai: 'lainnya',        label: 'Lainnya' },
];

/** Ambil label tampilan berdasarkan nilai kategori */
export function labelKategori(nilai: KategoriBarang): string {
  return DAFTAR_KATEGORI.find((k) => k.nilai === nilai)?.label ?? nilai;
}

