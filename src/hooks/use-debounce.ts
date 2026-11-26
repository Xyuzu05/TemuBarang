// src/hooks/use-debounce.ts
// Hook debounce: mengembalikan nilai yang baru diperbarui setelah jeda tertentu.
// Digunakan di kotak pencarian Beranda agar tidak memicu query setiap ketukan.

import { useEffect, useState } from 'react';

/**
 * Mengembalikan nilai yang tertunda selama `delay` ms setelah nilai terakhir berubah.
 * @param nilai  - Nilai yang ingin di-debounce (mis. teks pencarian)
 * @param delay  - Jeda dalam milidetik (default 400 ms sesuai SPEC)
 */
export function useDebounce<T>(nilai: T, delay: number = 400): T {
  const [nilaiTertunda, setNilaiTertunda] = useState(nilai);

  useEffect(() => {
    const timer = setTimeout(() => setNilaiTertunda(nilai), delay);
    return () => clearTimeout(timer);
  }, [nilai, delay]);

  return nilaiTertunda;
}

