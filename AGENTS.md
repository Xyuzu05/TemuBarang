# TemuBarang — Aturan Proyek untuk Agent

Aplikasi mobile pencarian barang hilang dan ditemukan di lingkungan kampus (tugas pembuatan aplikasi sendiri, mata kuliah Pemrograman Berbasis Platform).
Baca sebelum menulis kode: `docs/SPEC.md` (fitur), `supabase/schema.sql` (database), `docs/REFERENSI_GAYA_KODE.md` (gaya kode yang harus diikuti).

## Tech stack (jangan diganti)
- React Native + Expo (TypeScript strict), Expo Router, `typedRoutes` aktif, path alias `@/*` → `src/*`
- Harus jalan di **Expo Go (Android/iOS) DAN di browser (`expo start --web`)**, tanpa error di konsol
- Supabase: Authentication (email + kata sandi), PostgreSQL, Storage (bucket `foto-barang`)
- Library tambahan yang boleh: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`, `expo-image-picker`, `@expo/vector-icons` (Ionicons). Instal lewat `npx expo install`.
- Jangan menambah library lain tanpa bertanya dulu.
- Expo berubah cepat: baca dokumentasi sesuai versi SDK yang terpasang (`https://docs.expo.dev/versions/<versi-SDK>/`) sebelum memakai API Expo/Expo Router.

## Struktur folder (SEMUA kode di dalam `src/`)
```
src/
  app/
    _layout.tsx             # root layout: ThemeProvider + penjaga login
    (auth)/login.tsx
    (auth)/register.tsx
    (tabs)/_layout.tsx      # tab: Beranda, Tambah, Riwayat (ikon Ionicons)
    (tabs)/index.tsx        # Beranda
    (tabs)/tambah.tsx
    (tabs)/riwayat.tsx
    detail/[id].tsx
    edit/[id].tsx
  components/               # KartuLaporan, SearchBox, FilterChips, FormField, StatusBadge, dll
  contexts/ThemeContext.tsx # terang / gelap / ikut sistem
  services/                 # supabase.ts, authService.ts, laporanService.ts, storageService.ts, themeStorage.ts
  types/laporan.ts
  constants/                # categories.ts, theme.ts
  hooks/                    # use-debounce.ts, use-auth.ts
  utils/konfirmasi.ts       # dialog konfirmasi yang jalan di native DAN web
```
Jangan membuat folder `components/` atau `types/` di root proyek, dan jangan membawa sisa kode contoh template Expo.

## Aturan kode
- Teks tampilan, nama variabel/fungsi/tipe, dan komentar memakai Bahasa Indonesia (mengikuti proyek referensi), mis. `sedangMemuat`, `pesanError`, `ambilDaftarLaporan`. Nama kolom database mengikuti `schema.sql` persis.
- Baris pertama tiap file: komentar path, mis. `// src/services/laporanService.ts`. Fungsi di service diberi komentar JSDoc singkat berbahasa Indonesia.
- Import pakai alias `@/...`, bukan `../../..`.
- Semua akses Supabase lewat `services/`. Layar tidak boleh memanggil `supabase` langsung.
- Warna selalu dari `useAppTheme()` (`warna`), jangan hardcode warna di layar.
- Setiap layar yang memuat data punya 3 kondisi: loading, error (tombol "Coba lagi"), kosong.
- Hapus, keluar, dan hal destruktif lain wajib konfirmasi lewat `konfirmasi()` di `utils/konfirmasi.ts`. JANGAN memakai `Alert.alert` langsung: di web tidak berfungsi.
- Validasi form di aplikasi sebelum kirim; pesan error per kolom.
- Tanpa `any` kecuali terpaksa (beri komentar alasan).

## Keamanan (wajib)
- Hanya `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` yang boleh ada di aplikasi.
- JANGAN PERNAH memakai atau menulis service role key di kode, `.env`, atau chat.
- `.gitignore` template Expo hanya mengabaikan `.env*.local`. TAMBAHKAN baris `.env` ke `.gitignore`; yang di-commit hanya `.env.example`. Repo akan dipublikasikan di GitHub Public.
- Jangan menonaktifkan RLS untuk "mempermudah". Jangan cetak token/sesi ke konsol.

## Cara kerja
- Kerjakan per tahap sesuai `PROMPT_ANTIGRAVITY.md`; jangan lanjut sebelum diminta ("lanjut").
- Akhir tiap tahap: jalankan `npx tsc --noEmit`, lalu tulis (1) file yang dibuat/diubah, (2) fungsi tiap file dalam 1–2 kalimat Bahasa Indonesia, (3) cara uji di Expo Go dan di browser. Lalu berhenti.
- Kalau spesifikasi ambigu, tanya. Jangan menambah fitur di luar `docs/SPEC.md`; fitur "Modul tambahan" (SPEC bagian 8) hanya dikerjakan jika diminta eksplisit.
