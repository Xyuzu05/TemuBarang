-- =====================================================================
-- TemuBarang — skema database Supabase
-- Cara pakai: Supabase Dashboard > SQL Editor > New query > tempel > Run
-- =====================================================================

-- 1. Tabel laporan ----------------------------------------------------
create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid()
                     references auth.users(id) on delete cascade,
  jenis            text not null check (jenis in ('hilang', 'ditemukan')),
  nama_barang      text not null check (char_length(trim(nama_barang)) between 2 and 100),
  kategori         text not null check (kategori in
                     ('dompet','handphone','charger','flashdisk','buku','kartu_identitas','lainnya')),
  deskripsi        text not null check (char_length(trim(deskripsi)) >= 5),
  lokasi           text not null check (char_length(trim(lokasi)) >= 2),
  tanggal_kejadian date not null,  -- tidak boleh di masa depan: dicek di aplikasi (zona waktu WIB)
  nomor_whatsapp   text not null check (nomor_whatsapp ~ '^(08|628)[0-9]{7,12}$'),
  -- hanya diisi untuk laporan 'ditemukan'
  penyimpanan      text check (penyimpanan in ('diserahkan_ke_petugas', 'disimpan_penemu')),
  foto_url         text,
  status           text not null default 'aktif'
                     check (status in ('aktif', 'sudah_ditemukan', 'sudah_dikembalikan')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint penyimpanan_sesuai_jenis check (
    (jenis = 'ditemukan' and penyimpanan is not null) or
    (jenis = 'hilang'    and penyimpanan is null)
  )
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_jenis_idx      on public.reports (jenis);
create index if not exists reports_kategori_idx   on public.reports (kategori);
create index if not exists reports_user_id_idx    on public.reports (user_id);

-- 2. updated_at otomatis ---------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- 3. Row Level Security ----------------------------------------------
alter table public.reports enable row level security;

-- Semua pengguna yang sudah login boleh melihat semua laporan
drop policy if exists "reports_select_login" on public.reports;
create policy "reports_select_login" on public.reports
  for select to authenticated using (true);

-- Hanya boleh membuat laporan atas nama sendiri
drop policy if exists "reports_insert_sendiri" on public.reports;
create policy "reports_insert_sendiri" on public.reports
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Hanya pemilik yang boleh mengubah
drop policy if exists "reports_update_sendiri" on public.reports;
create policy "reports_update_sendiri" on public.reports
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Hanya pemilik yang boleh menghapus
drop policy if exists "reports_delete_sendiri" on public.reports;
create policy "reports_delete_sendiri" on public.reports
  for delete to authenticated using (user_id = (select auth.uid()));

-- 4. Storage untuk foto barang ---------------------------------------
-- Bucket public: foto bisa dibuka lewat URL publik tanpa policy select.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto-barang', 'foto-barang', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- File harus disimpan di folder bernama user id: <user_id>/<nama-file>
drop policy if exists "foto_select_sendiri" on storage.objects;
create policy "foto_select_sendiri" on storage.objects
  for select to authenticated
  using (bucket_id = 'foto-barang' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "foto_insert_sendiri" on storage.objects;
create policy "foto_insert_sendiri" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'foto-barang' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "foto_update_sendiri" on storage.objects;
create policy "foto_update_sendiri" on storage.objects
  for update to authenticated
  using (bucket_id = 'foto-barang' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "foto_delete_sendiri" on storage.objects;
create policy "foto_delete_sendiri" on storage.objects
  for delete to authenticated
  using (bucket_id = 'foto-barang' and (storage.foldername(name))[1] = (select auth.uid())::text);
