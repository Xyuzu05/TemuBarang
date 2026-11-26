// src/services/authService.ts
// Layanan autentikasi: daftar, masuk, keluar, ambil sesi.
// Semua fungsi melempar Error berpesan Bahasa Indonesia; layar yang menampilkannya.

import { Session } from '@supabase/supabase-js';
import { supabase, supabaseTerhubung } from '@/services/supabase';

/** Mendaftarkan akun baru dengan email dan kata sandi */
export async function daftar(email: string, kataKunci: string): Promise<void> {
  if (!supabaseTerhubung) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL belum diisi di file .env. Silakan isi URL Supabase kamu lalu restart server Expo.');
  }
  const { error } = await supabase.auth.signUp({ email, password: kataKunci });
  if (error) throw new Error(terjemahkanError(error.message));
}

/** Masuk dengan email dan kata sandi yang sudah terdaftar */
export async function masuk(email: string, kataKunci: string): Promise<void> {
  if (!supabaseTerhubung) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL belum diisi di file .env. Silakan isi URL Supabase kamu lalu restart server Expo.');
  }
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: kataKunci,
  });
  if (error) throw new Error(terjemahkanError(error.message));
}

/** Keluar dari sesi aktif */
export async function keluar(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error('Gagal keluar. Coba lagi.');
}

/** Mengambil sesi yang sedang aktif, atau null jika belum login */
export async function ambilSesi(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

// ─── Penerjemah pesan error Supabase → Bahasa Indonesia ──────────────────────

function terjemahkanError(pesanAsli: string): string {
  const p = pesanAsli.toLowerCase();

  if (p.includes('invalid login credentials') || p.includes('invalid email or password')) {
    return 'Email atau kata sandi salah. Periksa kembali dan coba lagi.';
  }
  if (p.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek kotak masuk email kamu.';
  }
  if (p.includes('user already registered') || p.includes('already been registered')) {
    return 'Email ini sudah terdaftar. Coba masuk atau gunakan email lain.';
  }
  if (p.includes('invalid email')) {
    return 'Format email tidak valid. Pastikan email sudah benar.';
  }
  if (p.includes('password should be at least')) {
    return 'Kata sandi terlalu pendek. Minimal 6 karakter.';
  }
  if (p.includes('signup is disabled')) {
    return 'Pendaftaran sementara dinonaktifkan. Coba lagi nanti.';
  }
  if (p.includes('unexpected token') || p.includes('<!doctype') || p.includes('server is down') || p.includes('521')) {
    return 'Server Supabase sedang memulai ulang (cold start). Silakan tunggu 10–30 detik lalu coba lagi.';
  }
  if (p.includes('network') || p.includes('fetch')) {
    if (!supabaseTerhubung) {
      return 'EXPO_PUBLIC_SUPABASE_URL belum diisi di file .env. Silakan isi URL Supabase kamu lalu restart server Expo.';
    }
    return 'Tidak dapat terhubung ke server Supabase. Server mungkin sedang cold start, silakan tunggu beberapa detik dan coba lagi.';
  }
  if (p.includes('rate limit') || p.includes('too many requests')) {
    return 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.';
  }

  // Fallback jika tidak ada yang cocok
  return 'Terjadi kesalahan. Coba lagi.';
}
