# SPEC — TemuBarang (MVP)

Aplikasi mobile untuk melaporkan dan mencari barang hilang/ditemukan di lingkungan kampus.
Pengguna utama: mahasiswa. Hanya pengguna yang sudah login yang bisa melihat dan membuat laporan.
Platform: Expo Go (Android/iOS) dan browser (web), tanpa error di konsol.

## 1. Fitur MVP
1. Registrasi dan login (email + kata sandi, Supabase Auth), logout.
2. Daftar laporan hilang dan ditemukan, terbaru di atas.
3. Tambah laporan barang hilang.
4. Tambah laporan barang ditemukan.
5. Detail laporan.
6. Pencarian berdasarkan nama barang.
7. Filter berdasarkan jenis laporan dan kategori.
8. Edit dan hapus laporan milik sendiri.
9. Ubah status laporan.
10. Unggah satu foto barang (opsional diisi pengguna).

## 2. Di luar MVP (JANGAN dibuat)
Filter lokasi, tombol hubungi via WhatsApp otomatis (nomor cukup ditampilkan sebagai teks), notifikasi, verifikasi kepemilikan, halaman admin, penggunaan di luar kampus, banyak foto, chat, peta.

## 3. Model data (tabel `reports`, lihat `supabase/schema.sql`)
| Kolom | Keterangan |
|---|---|
| id, user_id | otomatis; user_id = pemilik laporan |
| jenis | `hilang` / `ditemukan` |
| nama_barang | wajib, 2–100 karakter |
| kategori | `dompet`, `handphone`, `charger`, `flashdisk`, `buku`, `kartu_identitas`, `lainnya` |
| deskripsi | wajib, min. 5 karakter (ciri-ciri barang) |
| lokasi | wajib, teks bebas (mis. "Lab Komputer 2") |
| tanggal_kejadian | wajib, tidak boleh masa depan |
| nomor_whatsapp | wajib, format `08xxxxxxxxxx` atau `628xxxxxxxxxx` |
| penyimpanan | khusus `ditemukan` (wajib): `diserahkan_ke_petugas` / `disimpan_penemu`; untuk `hilang` kosong |
| foto_url | opsional, URL publik dari Storage |
| status | `aktif` (default), `sudah_ditemukan`, `sudah_dikembalikan` |
| created_at, updated_at | otomatis |

Label tampilan: kategori "Kartu Identitas", status "Masih Dicari/Aktif", "Sudah Ditemukan", "Sudah Dikembalikan", penyimpanan "Diserahkan ke petugas" / "Disimpan oleh penemu".

## 4. Halaman dan perilaku
**Login / Registrasi** (`(auth)/login`, `(auth)/register`)
- Form email + kata sandi (min. 6 karakter), tombol Masuk / Buat Akun, tautan pindah antar halaman.
- Pesan error ramah dalam Bahasa Indonesia (email salah format, sandi salah, email sudah terdaftar).
- Pengguna yang sudah login langsung masuk ke Beranda; yang belum login selalu diarahkan ke Login.

**Beranda** (`(tabs)/index`)
- Header: nama aplikasi "TemuBarang".
- Kolom pencarian nama barang (debounce ±400 ms, `ilike`).
- Pilihan jenis: Semua | Hilang | Ditemukan.
- Chip kategori (Semua + 7 kategori), bisa dikombinasikan dengan pencarian dan jenis.
- Daftar laporan terbaru (kartu: foto kecil jika ada, nama barang, badge jenis, kategori, lokasi, tanggal, badge status). Tap kartu → Detail.
- Tarik untuk refresh; kondisi loading, kosong ("Belum ada laporan"), dan error + "Coba lagi".

**Tambah Laporan** (`(tabs)/tambah`)
- Pilihan jenis (Hilang / Ditemukan) di bagian atas.
- Kolom: nama barang, kategori, deskripsi dan ciri-ciri, lokasi, tanggal kejadian, nomor WhatsApp, foto (opsional, dari galeri; maks. 2 MB; jpg/png/webp).
- Jika jenis = Ditemukan, tampil pilihan "Barang disimpan di mana?" (wajib).
- Tombol "Simpan Laporan" nonaktif saat proses; tampilkan error per kolom; setelah sukses → kosongkan form dan buka Detail laporan tersebut.

**Detail Barang** (`detail/[id]`)
- Foto (jika ada), nama barang, badge jenis dan status, kategori, deskripsi, lokasi, tanggal kejadian, penyimpanan (jika ditemukan), kontak pelapor (nomor WhatsApp sebagai teks).
- Jika laporan milik sendiri: tampil tombol Edit, Ubah Status, Hapus.

**Riwayat Laporan** (`(tabs)/riwayat`)
- Daftar laporan milik pengguna + status.
- Tiap item: tombol Edit, Hapus, dan Ubah Status (Aktif → Sudah Ditemukan / Sudah Dikembalikan, bisa dikembalikan ke Aktif).
- Tombol Keluar (logout) dengan konfirmasi.

**Edit Laporan** (`edit/[id]`)
- Form sama dengan Tambah, terisi data lama; jenis tidak bisa diubah. Hanya pemilik yang bisa membuka.

**Hapus**: wajib konfirmasi (`konfirmasi()` dari `utils/konfirmasi.ts`, jalan di native dan web). Jika laporan punya foto, hapus juga file di Storage.

## 5. Alur navigasi
```
Login / Registrasi
   ↓
Beranda (tab)
 ├── Pencarian / Filter → Detail Barang
 ├── Tambah Laporan (tab) → Simpan → Detail Barang
 └── Riwayat Laporan (tab) → Detail / Edit / Hapus / Ubah Status
```

## 6. Kriteria penerimaan (harus lulus semua)
| No | Fungsi | Kriteria |
|---|---|---|
| 1 | Registrasi dan login | Bisa buat akun dan masuk dengan email dan kata sandi valid |
| 2 | Tambah laporan | Tersimpan hanya jika semua kolom wajib terisi |
| 3 | Daftar laporan | Menampilkan laporan dari database |
| 4 | Pencarian | Hasil sesuai kata kunci |
| 5 | Filter | Bisa menampilkan berdasarkan jenis dan kategori |
| 6 | Detail | Menampilkan informasi lengkap laporan terpilih |
| 7 | Edit | Pemilik bisa memperbarui laporannya |
| 8 | Hapus | Laporan sendiri bisa dihapus setelah konfirmasi |
| 9 | Status | Pemilik bisa ubah ke sudah ditemukan / sudah dikembalikan |
| 10 | Foto | Foto terunggah dan tampil di kartu serta detail |
| 11 | Keamanan | Pengguna A tidak bisa mengubah/menghapus laporan pengguna B (dicek lewat RLS) |

## 7. Penanganan risiko (harus ada di aplikasi)
- Koneksi putus → pesan error + tombol "Coba lagi".
- Foto gagal → validasi tipe dan ukuran sebelum unggah; laporan tetap bisa disimpan tanpa foto.
- Salah operasi → konfirmasi sebelum hapus dan sebelum logout.
- Laporan palsu/klaim salah → di detail tampilkan catatan: "Minta pelapor menyebutkan ciri khusus barang sebelum menyerahkan."

## 8. Modul tambahan (OPSIONAL — mengikuti pola praktikum)
Kerjakan hanya setelah semua kriteria bagian 6 lulus, dan hanya jika rubrik tugas memintanya. Pola kodenya ada di `docs/REFERENSI_GAYA_KODE.md`.
1. **Tema** terang / gelap / ikut sistem, dipilih di tab Pengaturan, disimpan di AsyncStorage (infrastruktur `ThemeContext` sudah ada sejak Tahap 1).
2. **Riwayat pencarian terakhir**: maks. 10 kata kunci, ditampilkan di bawah kotak pencarian, tap langsung menjalankan pencarian, ada tombol hapus per item dan hapus semua.
3. **Cache dan mode offline**: daftar laporan terakhir yang berhasil dimuat disimpan lokal; saat koneksi gagal tampilkan data tersimpan + banner "Tidak ada koneksi, menampilkan data tersimpan"; tombol "Hapus cache" (dengan konfirmasi).
4. **Tab Pengaturan dan Tentang**: Pengaturan (tema, hapus cache, riwayat pencarian), Tentang (nama aplikasi, versi, deskripsi singkat, teknologi).
