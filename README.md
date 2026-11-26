# TemuBarang 📦

Aplikasi mobile **barang hilang dan ditemukan di lingkungan kampus**, dibuat sebagai tugas akhir mata kuliah Pemrograman Berbasis Platform.

Pengguna bisa melaporkan barang yang hilang atau yang berhasil ditemukan, mencari laporan berdasarkan kata kunci/kategori, melihat detail kontak pelapor, dan mengelola laporan miliknya sendiri (edit, ubah status, hapus).

---

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo SDK 58](https://docs.expo.dev/) |
| Routing | [Expo Router 5](https://docs.expo.dev/router/introduction/) (file-based) |
| Bahasa | TypeScript (strict) |
| Backend | [Supabase](https://supabase.com/) — Auth, PostgreSQL, Storage |
| State tema | Context API + AsyncStorage |
| Ikon | `@expo/vector-icons` (Ionicons) |

---

## Prasyarat

- Node.js ≥ 18
- Expo Go (Android / iOS) — unduh dari Play Store / App Store
- Akun [Supabase](https://supabase.com/) (gratis)

---

## 1. Siapkan Supabase

1. Buat proyek baru di [https://app.supabase.com](https://app.supabase.com).
2. Buka **SQL Editor** → klik **New query** → tempel seluruh isi file [`supabase/schema.sql`](supabase/schema.sql) → klik **Run**.
   - Ini akan membuat tabel `reports`, kebijakan RLS, dan bucket storage `foto-barang`.
3. Buka **Project Settings → API** dan catat dua nilai berikut:
   - **Project URL** (kolom `URL`)
   - **anon public key** (kolom `anon` / `public`) — **bukan** `service_role`

---

## 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Buka `.env` dan isi nilai yang sudah dicatat:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!CAUTION]
> Jangan pernah menggunakan atau menyimpan `service_role` key di dalam kode atau `.env`.
> File `.env` sudah masuk `.gitignore` — **jangan di-commit**.

---

## 3. Instalasi & Menjalankan

```bash
# Instal dependensi
npm install

# Jalankan di Expo Go (Android/iOS) — scan QR dengan aplikasi Expo Go
npx expo start

# Jalankan di browser
npx expo start --web
```

---

## Struktur Folder

```
temubarang-kit/
├── src/
│   ├── app/
│   │   ├── _layout.tsx          # Root layout: ThemeProvider + penjaga login
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx        # Layar login
│   │   │   └── register.tsx     # Layar daftar akun
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx      # Tab bar: Beranda, Tambah, Riwayat
│   │   │   ├── index.tsx        # Tab Beranda (daftar + pencarian)
│   │   │   ├── tambah.tsx       # Tab Tambah laporan
│   │   │   └── riwayat.tsx      # Tab Riwayat laporan milik sendiri
│   │   ├── detail/[id].tsx      # Detail laporan
│   │   └── edit/[id].tsx        # Edit laporan milik sendiri
│   ├── components/
│   │   ├── FormField.tsx        # Input berlabel dengan pesan error
│   │   ├── KartuLaporan.tsx     # Kartu ringkasan laporan di daftar
│   │   ├── SearchBox.tsx        # Kolom pencarian
│   │   ├── FilterChips.tsx      # Filter jenis & kategori
│   │   └── StatusBadge.tsx      # Badge jenis (Hilang/Ditemukan) & status
│   ├── constants/
│   │   ├── categories.ts        # Daftar 8 kategori barang
│   │   └── theme.ts             # Ukuran font dan jarak
│   ├── contexts/
│   │   └── ThemeContext.tsx     # Provider tema terang/gelap/sistem
│   ├── hooks/
│   │   ├── use-auth.ts          # Hook monitor sesi Supabase
│   │   └── use-debounce.ts      # Debounce 400 ms untuk pencarian
│   ├── services/
│   │   ├── supabase.ts          # Inisialisasi Supabase client
│   │   ├── authService.ts       # Daftar, masuk, keluar, ambil sesi
│   │   ├── laporanService.ts    # CRUD laporan (Supabase)
│   │   ├── storageService.ts    # Upload/hapus foto (Supabase Storage)
│   │   └── themeStorage.ts      # Simpan preferensi tema ke AsyncStorage
│   ├── types/
│   │   └── laporan.ts           # Tipe TypeScript sesuai schema database
│   └── utils/
│       └── konfirmasi.ts        # Dialog konfirmasi/notifikasi (native + web)
├── supabase/
│   └── schema.sql               # Skema database + RLS + bucket storage
├── docs/
│   ├── SPEC.md                  # Spesifikasi fitur aplikasi
│   └── REFERENSI_GAYA_KODE.md  # Panduan gaya kode
├── .env.example                 # Contoh variabel environment
├── .gitignore
├── app.json
├── package.json
└── tsconfig.json
```

---

## Catatan Pengembangan

- Aplikasi berjalan di **Expo Go** (Android & iOS) maupun di **browser** (`--web`) tanpa error konsol.
- Semua teks tampilan, nama variabel, fungsi, dan komentar menggunakan **Bahasa Indonesia**.
- Keamanan data dijaga oleh **Row Level Security (RLS)** Supabase — pengguna hanya bisa mengubah/menghapus laporan miliknya sendiri.
- Warna selalu diambil dari `useAppTheme()` sehingga tema terang/gelap bekerja konsisten.
