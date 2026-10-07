# Absensi Ekstrakurikuler (PIN 5 menit)

## Cara pasang
1. Buat akun di https://supabase.com, klik **New project** (gratis), beri nama & password database, pilih region Singapore.
2. Buka **SQL Editor** > New query > tempel isi `supabase.sql` > **Run**. Ini membuat tabel, RLS, dan fungsi.
3. **Authentication > Providers > Email**: matikan "Allow new users to sign up" (agar siswa tak bisa mendaftar).
4. **Authentication > Users > Add user**: buat akun pengurus (email + password, centang Auto Confirm).
5. **Project Settings > API**: salin *Project URL* dan *anon public key* ke `config.js`. Jangan pakai service_role key.
6. Ubah `EKSKUL_NAME` di `config.js`.
7. Jalankan: buka `index.html` (siswa) dan `admin.html` (pengurus). Agar bisa diakses semua orang, upload folder ini ke Netlify / Vercel / GitHub Pages (gratis).

## Keamanan
- Siswa hanya bisa memanggil fungsi `submit_attendance`; tidak bisa membaca tabel (RLS).
- Waktu, masa berlaku PIN, dan cek duplikat dilakukan di server.
- Satu nama+kelas per sesi dijaga oleh `unique` di database.
