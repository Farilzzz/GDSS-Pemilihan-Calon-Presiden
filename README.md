# GDSS Pemilihan Calon Presiden

Simulasi akademik pengambilan keputusan kelompok menggunakan React + TypeScript, PHP 8, dan MySQL/MariaDB: **SAW → Borda → voting langsung → pengesahan ketua**. Kandidat dan akun seed adalah fiktif, bukan data pemilu atau pengguna nyata.

## Struktur

- `frontend/`: aplikasi React, Vite, Tailwind, tests Vitest/Testing Library, dan lockfile npm.
- `backend/public/`: satu-satunya document root API; jangan expose root backend atau `.env`.
- `backend/src/`: otorisasi, transaksi, SAW/Borda dan workflow voting.
- `backend/tests/`: regression SQLite dan HTTP terisolasi.
- `database/schema.sql`, `database/seed.sql`: sumber utama SQL untuk instalasi baru.
- `backend/database/`: salinan identik untuk kompatibilitas backend; setiap perubahan SQL harus disinkronkan ke kedua lokasi.
- [API lengkap](backend/API_DOCUMENTATION.md), [integrasi](docs/INTEGRATION.md), [hasil pengujian](END_TO_END_TEST_REPORT.md), [atribusi](ATTRIBUTION.md).

## Prasyarat

Windows dengan XAMPP (PHP 8.1+ dan MariaDB; diuji sebelumnya PHP/XAMPP + MariaDB 10.4.32), ekstensi PDO MySQL. PDO SQLite diperlukan hanya untuk regression SQLite. Node.js 20.19+ atau 22 LTS dan npm. Tidak memerlukan Composer.

## Instalasi lokal Windows (XAMPP + Vite)

1. Clone repository ini setelah tersedia di GitHub, atau gunakan salinan lokal yang diberikan:
   ```bash
   git clone https://github.com/Farilzzz/GDSS-Pemilihan-Calon-Presiden.git
   cd GDSS-Pemilihan-Calon-Presiden
   ```
2. Jalankan MySQL dari XAMPP Control Panel. Apache hanya diperlukan bila menggunakan phpMyAdmin atau virtual host; API di langkah 5 memakai PHP built-in server. Jangan hentikan layanan lain yang sudah memakai port.
3. **Hanya untuk instalasi baru:** melalui phpMyAdmin import `database/schema.sql`, lalu `database/seed.sql`. Keduanya memuat nama database `gdss_pemilihan_presiden` secara eksplisit (CREATE/USE). Jangan import pada database aktif berisi data penting. Seed melakukan upsert, mereset password demo dan status penilaian; bukan migrasi produksi.
4. Salin `backend/.env.example` menjadi `backend/.env`; isi DB_USER/DB_PASSWORD sesuai akun MariaDB lokal. Buat APP_KEY acak minimal 32 karakter, misalnya dengan `C:/xampp/php/php.exe -r "echo bin2hex(random_bytes(32)), PHP_EOL;"`, lalu simpan hasilnya hanya di `.env`. Jangan commit atau membagikan key. Tidak perlu `.env` frontend untuk proxy default.
5. Di terminal pertama, dari root repository:
   ```bash
   C:/xampp/php/php.exe -S 127.0.0.1:8080 -t backend/public backend/public/index.php
   ```
6. Di terminal kedua:
   ```bash
   cd frontend
   npm ci
   npm run dev -- --host 127.0.0.1 --strictPort
   ```
7. Buka `http://127.0.0.1:3000`. Vite meneruskan `/api` ke `http://127.0.0.1:8080`. Probe publik: `http://127.0.0.1:3000/api/candidates`. Jika muncul 503, periksa layanan MariaDB, DSN, dan izin user; jika 500 terkait APP_KEY, isi key lokal terlebih dahulu.

Untuk Apache, gunakan virtual host dengan document root `backend/public`, aktifkan mod_rewrite/AllowOverride, lalu sesuaikan target proxy Vite ke virtual host tersebut. Jangan menganggap URL subfolder Apache otomatis setara dengan proxy default. `npm run build` menghasilkan frontend statis, bukan deployment API; deployment/hosting tidak termasuk cakupan ini.

## Akun dan workflow demo

Seed menyediakan `dm1` (chair), `dm2` dan `dm3` (member), semua dengan password demo **`password123`**. Bcrypt di seed sengaja merupakan fixture akademik publik, bukan credential operasional. Jangan expose instalasi demo ke internet. Ubah password sebelum penggunaan non-demo; `backend/tools/provision.php` memperbarui akun yang cocok dengan username/role (minimal 12 karakter), tetapi argumen CLI bisa tersimpan di history/proses sehingga jalankan hanya pada lingkungan lokal tepercaya.

1. Login tiap DM, simpan 12 nilai (3 kandidat × 4 kriteria, skala 1–5), lalu finalisasi penilaian masing-masing.
2. Lihat hasil SAW individual dan agregasi Borda dari API; frontend tidak menghitung ulang keputusan otoritatif.
3. Ketua membuka voting setelah ketiga DM selesai. Setiap DM memiliki **satu suara per putaran**.
4. Mayoritas **2 dari 3** menghasilkan pemenang; hasil 1–1–1 mengharuskan ketua membuka revote.
5. Ketua mengesahkan hasil mayoritas. Anggota tidak boleh membuka, revote, atau mengesahkan. Final dan history tersedia melalui API. Pendaftaran akun tambahan tidak tersedia pada backend panel tetap ini.

Matriks seed menghasilkan SAW A/B/C: DM1 91/85/79, DM2 86/96/78, DM3 95/76/85; Borda A/B/C 8/6/4. Borda adalah agregasi preferensi, bukan pengganti konsensus voting.

## Pengujian dan keselamatan database

```bash
cd frontend
npm ci
npm test
npm run typecheck
npm run build
```

Dari root, regression backend `C:/xampp/php/php.exe backend/tests/run.php` membuat SQLite **in-memory**, tidak memakai database aplikasi. `http_test.php` dan `comprehensive_integration_test.php` membuat SQLite sementara dan server PHP sendiri; periksa ketersediaan port 8085–8095 / 8089 sebelum menjalankannya. SQLite bukan bukti integrasi MariaDB. Suite HTTP tambahan ini belum dijalankan ulang dalam persiapan publikasi.

Untuk pengujian MariaDB, gunakan database test terpisah dan environment proses terpisah. **Ubah seluruh CREATE DATABASE dan USE dalam salinan SQL ke nama test sebelum import**, kemudian pastikan DSN mengarah hanya ke test. Jangan menjalankan import, reset, atau fixture pada database utama. Tidak ada operasi database/server HTTP dilakukan selama persiapan publikasi ini. Laporan HTTP/MariaDB sebelumnya dibedakan dari hasil regression baru; authenticated browser E2E belum diuji.

## Keamanan dan batasan

- `.env`, token, credential lokal, dependencies, build, log, dump database, dan snapshot bukti lokal tidak termasuk repository.
- APP_KEY dan DB_PASSWORD template kosong; wajib konfigurasi lokal. Jangan memasukkan secret ke variabel `VITE_*` karena akan masuk bundle browser.
- API menggunakan Bearer token, bukan session cookie. Logout menghapus token di klien; token yang sudah diterbitkan tetap berlaku sampai kedaluwarsa. HTTPS, pengelolaan secret, revocation token, dan hardening produksi perlu review tersendiri.
- Kandidat, kriteria, dan beberapa hasil keputusan adalah endpoint publik sesuai router. Ini simulator akademik, bukan sistem pemungutan suara produksi.
- Lihat laporan pengujian untuk warning dan keterbatasan dependencies. Tidak ada push atau deployment yang dilakukan pada tahap persiapan.
