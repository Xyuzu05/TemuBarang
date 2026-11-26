# Referensi gaya kode — dari proyek `orientasi-jelajah-aman`

Repo: https://github.com/Xyuzu05/-orientasi-jelajah-aman-.git (tugas sebelumnya, Expo SDK 57, Expo Router, TypeScript strict).
Tujuan: TemuBarang terasa seperti kelanjutan proyek itu. Ikuti gayanya, tulis ulang untuk domain TemuBarang. Jangan menyalin file mentah. Kalau repo bisa di-clone (read-only, di luar folder proyek), boleh dilihat; kalau tidak, dokumen ini cukup.

## 1. Yang DIPERTAHANKAN dari proyek referensi
- Penamaan Indonesia: `teksCari`, `sedangMemuat`, `pesanError`, `idSaatIni`, `warna`, `temaAktif`; fungsi service berawalan kata kerja: `ambil…`, `simpan…`, `hapus…`, `cari…`.
- Komentar path di baris pertama (`// src/hooks/use-debounce.ts`) dan JSDoc Indonesian di service.
- Struktur `src/{app,components,constants,contexts,hooks,services,types}`, route `(tabs)`, `detail/[param]`, dan layar modal untuk aksi kecil.
- `Tabs` dari `expo-router` dengan ikon `Ionicons` dari `@expo/vector-icons`, warna tab dari tema.
- Tema terang/gelap/ikut sistem lewat `ThemeContext` + `useAppTheme()`.
- Penyimpanan lokal lewat `AsyncStorage` dengan awalan kunci (`"@temubarang:..."`), semua dibungkus try/catch yang diam-diam (gagal simpan tidak boleh merusak alur utama).
- `SafeAreaView` dari `react-native-safe-area-context` untuk layar penuh.

## 2. Yang DIPERBAIKI (jangan ditiru)
- `components/` dan `types/` di root proyek → semua di `src/`.
- Import relatif `../../../components/...` → alias `@/components/...`.
- Sisa template (`explore.tsx`, `animated-icon`, `app-tabs`, `hint-row`, `themed-*`, `web-badge`, `global.css`, `styles.ts` ganda dengan `theme.ts`) → jangan dibawa.
- Komentar "Tugas 1/2/4" di header file → ganti dengan deskripsi singkat isi file.
- `.gitignore` tanpa `.env` → tambahkan.

## 3. Pola kode yang dipakai ulang
**Debounce** (`src/hooks/use-debounce.ts`)
```ts
export function useDebounce<T>(nilai: T, delay: number = 500): T {
  const [nilaiTertunda, setNilaiTertunda] = useState(nilai);
  useEffect(() => {
    const timer = setTimeout(() => setNilaiTertunda(nilai), delay);
    return () => clearTimeout(timer);
  }, [nilai, delay]);
  return nilaiTertunda;
}
```
**Pencegah race condition** di layar yang memuat data (ambil hasil terakhir saja)
```ts
const requestIdRef = useRef(0);
async function muatData() {
  const idSaatIni = ++requestIdRef.current;
  setSedangMemuat(true); setPesanError(null);
  try {
    const hasil = await ambilDaftarLaporan(/* filter */);
    if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
    setDaftar(hasil);
  } catch (err) {
    if (idSaatIni !== requestIdRef.current) return;
    setPesanError(err instanceof Error ? err.message : "Terjadi kesalahan");
  } finally {
    if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
  }
}
```
**Refresh saat layar difokuskan**: `useFocusEffect(useCallback(() => { muatData(); }, [filter]))` dari `expo-router`.
**Batas waktu permintaan**: `AbortController` + `setTimeout` (di referensi 3 detik); untuk Supabase pakai `.abortSignal(controller.signal)` dan pesan error Indonesia: "Permintaan melebihi batas waktu, coba lagi". Service melempar `Error` berpesan Indonesia; layar yang menampilkannya.
**Service lokal** (pola `themeStorage.ts`)
```ts
const KUNCI_TEMA = "@temubarang:tema";
export type PilihanTema = "light" | "dark" | "system";
export async function ambilPilihanTema(): Promise<PilihanTema> {
  try {
    const nilai = await AsyncStorage.getItem(KUNCI_TEMA);
    return nilai === "light" || nilai === "dark" || nilai === "system" ? nilai : "system";
  } catch { return "system"; }
}
```
**ThemeContext**: menyediakan `{ pilihanTema, temaAktif, ubahTema, warna }`; `useAppTheme()` melempar error jika dipakai di luar provider; provider mengembalikan `null` sampai pilihan tema selesai dimuat. Palet `warna`:
| kunci | terang | gelap |
|---|---|---|
| background | #FFFFFF | #0F172A |
| text | #1A1A2E | #F1F5F9 |
| textSecondary | #6B7280 | #94A3B8 |
| card | #F3F4F6 | #1E293B |
| border | #E5E7EB | #334155 |
| primary | #3B82F6 | #60A5FA |
| danger | #EF4444 | #F87171 |
| warning | #F59E0B | #FBBF24 |
Tambahan untuk TemuBarang: `success` (#22C55E terang / #4ADE80 gelap) untuk status "Sudah Dikembalikan".
**Tab**: `<Tabs screenOptions={{ headerShown: true, headerStyle: {backgroundColor: warna.background}, headerTintColor: warna.text, tabBarStyle: {backgroundColor: warna.background, borderTopColor: warna.border}, tabBarActiveTintColor: warna.primary, tabBarInactiveTintColor: warna.textSecondary }}>` dengan `tabBarIcon: ({color,size}) => <Ionicons name="home" size={size} color={color} />`.
**Kotak pencarian**: `TextInput` dengan `placeholderTextColor={warna.textSecondary}`, border `warna.border`, `borderRadius: 10`, latar `warna.card`, dan `accessibilityLabel`.
