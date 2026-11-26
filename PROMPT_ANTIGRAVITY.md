# Prompt untuk Antigravity — TemuBarang

## Persiapan (lakukan sekali, manual)
1. Buat folder proyek kosong, salin semua isi kit ini ke dalamnya (`AGENTS.md`, `docs/`, `supabase/`, `.env.example`, file ini), lalu buka foldernya di Antigravity. (Opsional: clone repo referensi `orientasi-jelajah-aman` ke folder LAIN di luar proyek, supaya agent bisa melihatnya.)
2. Buat project di supabase.com. Buka **SQL Editor**, tempel isi `supabase/schema.sql`, klik **Run**.
3. Di Supabase: **Authentication → Providers → Email**, matikan **Confirm email** selama pengembangan (kalau tidak, akun baru tidak bisa langsung login).
4. Di Supabase: **Project Settings → API**, salin **Project URL** dan **anon public key** ke file `.env` (salin dari `.env.example`). Jangan pernah memakai service_role key.
5. Di Antigravity pilih mode **Planning**, baca rencananya dulu sebelum menyetujui.

---

## PROMPT UTAMA (tempel ini pertama kali)

```
Kamu adalah asisten pengembang untuk proyek akhir mahasiswa Informatika: aplikasi mobile "TemuBarang" (barang hilang dan ditemukan di kampus), dibuat dengan React Native + Expo (TypeScript, Expo Router) dan Supabase.

Baca dulu empat file ini sampai selesai sebelum menulis kode:
1. AGENTS.md  (aturan proyek, struktur folder, keamanan)
2. docs/SPEC.md  (fitur, halaman, kriteria penerimaan)
3. supabase/schema.sql  (skema database; nama kolom harus persis sama)
4. docs/REFERENSI_GAYA_KODE.md  (gaya kode dari proyek lamaku; ikuti polanya, tulis ulang untuk TemuBarang, jangan salin file mentah)

Repo referensi milikku: https://github.com/Xyuzu05/-orientasi-jelajah-aman-.git . Kalau perlu melihat kodenya, clone ke folder sementara di luar proyek ini dan hanya baca. Ingat: aplikasi harus jalan di Expo Go DAN di browser tanpa error konsol.

Cara kerja:
- Kerjakan per TAHAP. Sekarang hanya kerjakan TAHAP 1 di bawah. Jangan lanjut ke tahap berikutnya sebelum saya tulis "lanjut".
- Aku mahasiswa dan ingin paham kodenya. Setelah tiap tahap selesai, jelaskan dalam Bahasa Indonesia yang santai: file apa saja yang dibuat dan fungsi tiap file dalam 1–2 kalimat.
- Setelah tiap tahap, jalankan `npx tsc --noEmit`, perbaiki error, lalu beri langkah menguji di Expo Go.
- Jangan menambah fitur atau library di luar AGENTS.md dan SPEC.md. Kalau ada yang ambigu, tanya.

TAHAP 1 — Fondasi
- Cek apakah folder ini sudah proyek Expo. Kalau belum, buat proyek Expo TypeScript di folder ini (bukan di subfolder), dengan struktur `src/app` (Expo Router), lalu bersihkan semua kode contoh bawaan template (jangan sisakan explore, animated-icon, themed-*, dll). Baca dokumentasi Expo sesuai versi SDK yang terpasang sebelum menulis kode. Aktifkan alias `@/*` → `src/*` dan `typedRoutes`.
- Instal dengan `npx expo install`: @supabase/supabase-js, @react-native-async-storage/async-storage, react-native-url-polyfill, expo-image-picker, @expo/vector-icons (kalau belum ada).
- Buat `src/services/supabase.ts` (client Supabase dengan AsyncStorage untuk menyimpan sesi, membaca env EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY).
- Buat `src/types/laporan.ts` (tipe Laporan, JenisLaporan, KategoriBarang, StatusLaporan, LokasiPenyimpanan sesuai schema.sql).
- Buat `src/constants/categories.ts` (daftar kategori + label tampilan) dan `src/constants/theme.ts` (ukuran font dan jarak sederhana).
- Buat `src/contexts/ThemeContext.tsx` + `src/services/themeStorage.ts` (terang/gelap/ikut sistem, default ikut sistem, hook `useAppTheme()`, palet `warna` ada di docs/REFERENSI_GAYA_KODE.md) dan `src/utils/konfirmasi.ts` (dialog konfirmasi yang jalan di native dan web, karena `Alert.alert` tidak berfungsi di web).
- Buat `src/hooks/use-auth.ts` dan root `src/app/_layout.tsx` dengan penjaga login: belum login → /login, sudah login → tab Beranda.
- Tambahkan `.env` ke `.gitignore` (template Expo hanya mengabaikan `.env*.local`).
- Buat layar placeholder (teks saja, warna dari tema) untuk login, register, dan 3 tab (Beranda, Tambah, Riwayat, dengan ikon Ionicons) supaya navigasi sudah bisa dicoba.
Selesai tahap ini: tampilkan ringkasan dan tunggu "lanjut".
```

---

## PROMPT PER TAHAP (tempel satu per satu setelah tahap sebelumnya berhasil dites)

### Tahap 2 — Registrasi dan login
```
lanjut. Kerjakan TAHAP 2 — Autentikasi.
- `src/services/authService.ts`: daftar, masuk, keluar, ambil sesi.
- Layar `(auth)/login.tsx` dan `(auth)/register.tsx` sesuai docs/SPEC.md bagian 4: validasi email dan kata sandi (min. 6 karakter), pesan error ramah dalam Bahasa Indonesia, loading saat proses, tautan pindah antar halaman.
- Komponen reusable `FormField` di `src/components/`.
- Tombol Keluar (dengan konfirmasi) ditaruh sementara di tab Riwayat.
Ikuti aturan "Cara kerja" (ringkasan file, tsc, cara uji, lalu berhenti).
```

### Tahap 3 — Beranda, pencarian, filter, detail
```
lanjut. Kerjakan TAHAP 3 — Beranda dan Detail.
- `src/services/laporanService.ts`: fungsi ambil daftar laporan (parameter: kata kunci nama barang, jenis, kategori; urut terbaru) dan ambil satu laporan by id.
- `src/hooks/use-debounce.ts` untuk pencarian (±400 ms).
- Komponen: SearchBox, FilterChips (jenis + kategori), KartuLaporan, StatusBadge.
- Layar Beranda `(tabs)/index.tsx` dan Detail `detail/[id].tsx` sesuai SPEC bagian 4, lengkap dengan kondisi loading, kosong, error + "Coba lagi", dan tarik untuk refresh.
- Untuk sementara tombol Edit/Ubah Status/Hapus di Detail belum aktif (dikerjakan di tahap 5).
- Karena belum ada fitur tambah laporan, beri aku 3 baris SQL INSERT contoh (hilang, ditemukan, dan satu lagi) untuk dicoba di SQL Editor Supabase. Pakai user_id milik akunku yang sudah terdaftar, jelaskan cara mengambilnya.
Ikuti aturan "Cara kerja".
```

### Tahap 4 — Tambah laporan + foto
```
lanjut. Kerjakan TAHAP 4 — Tambah Laporan dan unggah foto.
- `src/services/storageService.ts`: unggah foto ke bucket `foto-barang` dengan path `<user_id>/<nama-unik>.jpg|png|webp`, kembalikan URL publik; fungsi hapus foto. Validasi tipe dan ukuran (maks 2 MB) sebelum unggah.
- Tambahkan fungsi buat laporan di `laporanService.ts`.
- Layar `(tabs)/tambah.tsx` sesuai SPEC: pilihan jenis, nama barang, kategori, deskripsi, lokasi, tanggal kejadian (tidak boleh masa depan, validasi di aplikasi), nomor WhatsApp (format 08xx / 628xx), foto opsional dari galeri, dan pilihan penyimpanan hanya untuk jenis "Ditemukan".
- Validasi per kolom, tombol Simpan nonaktif saat proses, jika foto gagal laporan tetap bisa disimpan tanpa foto (beri tahu pengguna). Sukses → form dikosongkan dan buka Detail laporan baru.
- Pastikan foto tampil di KartuLaporan dan Detail.
Ikuti aturan "Cara kerja".
```

### Tahap 5 — Riwayat, edit, hapus, ubah status
```
lanjut. Kerjakan TAHAP 5 — Kelola laporan milik sendiri.
- Tambahkan di `laporanService.ts`: ambil laporan milik user, perbarui laporan, ubah status, hapus laporan (hapus juga foto di Storage jika ada).
- Layar Riwayat `(tabs)/riwayat.tsx`: daftar laporan milik sendiri + status, tombol Edit, Hapus (dialog `konfirmasi()`), dan Ubah Status (Aktif / Sudah Ditemukan / Sudah Dikembalikan).
- Layar `edit/[id].tsx`: form terisi data lama, jenis tidak bisa diubah, bisa ganti/hapus foto, hanya pemilik yang bisa membuka.
- Aktifkan tombol Edit/Ubah Status/Hapus di Detail hanya jika laporan milik sendiri.
Ikuti aturan "Cara kerja".
```

### Tahap 6 — Poles, uji, dan dokumentasi
```
lanjut. Kerjakan TAHAP 6 — Poles dan pengujian.
- Cek semua layar: ada loading, error + "Coba lagi", dan kondisi kosong; tidak ada teks Inggris yang tampil ke pengguna; jalankan di Expo Go dan di browser (`npx expo start --web`), tidak ada error di konsol browser maupun terminal.
- Tambahkan catatan di Detail: "Minta pelapor menyebutkan ciri khusus barang sebelum menyerahkan."
- Buat tabel checklist pengujian untuk 11 kriteria penerimaan di docs/SPEC.md bagian 6: langkah uji manual + hasil yang diharapkan, supaya bisa kupakai untuk laporan dan screenshot.
- Uji keamanan RLS: tunjukkan cara membuktikan akun B tidak bisa mengubah/menghapus laporan akun A.
- Buat README.md: deskripsi singkat, teknologi, cara menjalankan (Supabase setup, .env, `npx expo start`), dan struktur folder.
- Siapkan repo untuk GitHub Public: `.gitignore` benar, `.env.example` ada, README menjelaskan cara menyiapkan `.env`.
- Pastikan tidak ada secret di repo (`git grep -i service_role` harus kosong, .env tidak ter-commit).
Ikuti aturan "Cara kerja".
```

---

### Tahap 7 — Modul tambahan (OPSIONAL, hanya jika rubrik tugas meminta)
```
lanjut. Kerjakan TAHAP 7 — Modul tambahan, SPEC bagian 8. Kerjakan satu per satu dan berhenti setelah tiap modul:
(a) Tab Pengaturan: pilihan tema terang/gelap/ikut sistem (pakai ThemeContext yang sudah ada).
(b) Riwayat pencarian terakhir maks. 10 (AsyncStorage, kunci berawalan "@temubarang:"), tap item langsung menjalankan pencarian, hapus per item dan hapus semua.
(c) Cache daftar laporan terakhir + mode offline: banner info saat koneksi gagal, tombol "Hapus cache" dengan konfirmasi di Pengaturan.
(d) Tab Tentang: nama aplikasi, versi, deskripsi singkat, teknologi.
Ikuti pola di docs/REFERENSI_GAYA_KODE.md dan aturan "Cara kerja".
```

---

## Prompt cadangan
**Kalau ada error:**
```
Ada error saat dijalankan. Pesan lengkap: [tempel di sini]. Cari penyebab utamanya, jelaskan singkat kenapa terjadi, lalu perbaiki dengan perubahan sekecil mungkin.
```
**Kalau agent mulai melebar:**
```
Berhenti. Kamu menambah hal di luar tahap ini / di luar docs/SPEC.md. Kembalikan ke ruang lingkup tahap yang sedang dikerjakan dan jelaskan apa yang kamu batalkan.
```
