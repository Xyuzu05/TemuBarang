// src/constants/theme.ts
// Ukuran font, jarak (spacing), dan radius yang dipakai di seluruh aplikasi

export const UKURAN_FONT = {
  /** Judul halaman utama */
  judul: 24,
  /** Subjudul atau nama barang di kartu */
  subjudul: 16,
  /** Teks isi utama */
  tubuh: 14,
  /** Label form, chip filter */
  kecil: 12,
  /** Teks sangat kecil (timestamp, hint) */
  mikro: 11,
} as const;

export const JARAK = {
  /** Padding tepi layar */
  layar: 16,
  /** Jarak antar kartu di daftar */
  kartu: 16,
  /** Padding di dalam kartu */
  dalamKartu: 16,
  /** Jarak antar elemen form */
  form: 16,
  /** Radius sudut kartu */
  radiusKartu: 18,
  /** Radius sudut input */
  radiusInput: 14,
  /** Radius sudut chip */
  radiusChip: 20,
  /** Radius sudut tombol utama (pil) */
  radiusTombol: 26,
  /** Radius sudut sheet (melengkung di atas) */
  radiusSheet: 28,
  /** Radius sudut tombol kembali */
  radiusKembali: 10,
  /** Tinggi tombol utama */
  tombol: 52,
  /** Ukuran tombol kembali */
  tombolKembali: 32,
  /** Radius lama untuk kompatibilitas */
  radius: 14,
} as const;
