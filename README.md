# Nihongo SRS — Tutorial dari Nol

Aplikasi belajar bahasa Jepang ala Anki: role Admin (kelola kartu kotoba) & User
(belajar hiragana + review kotoba dengan spaced repetition), plus dashboard chart.

**Stack:** Next.js 14 (App Router, TypeScript) · PostgreSQL · Prisma ORM ·
NextAuth.js (role-based) · TailwindCSS · Recharts.

---

## 1. Prasyarat

- Node.js 20+ (`node -v`)
- PostgreSQL sudah terinstall (lokal atau server kecilmu)
- npm atau pnpm

## 2. Install Dependency

```bash
cd jp-anki-app
npm install
```

## 3. Siapkan Database PostgreSQL

Di server, buat database baru:

```bash
sudo -u postgres psql
CREATE DATABASE nihongo_srs;
CREATE USER nihongo_user WITH ENCRYPTED PASSWORD 'password_kuat';
GRANT ALL PRIVILEGES ON DATABASE nihongo_srs TO nihongo_user;
\q
```

## 4. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://nihongo_user:password_kuat@localhost:5432/nihongo_srs"
NEXTAUTH_SECRET="<hasil openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

## 5. Migrasi Skema & Seed Admin

```bash
npx prisma migrate dev --name init
npm run seed
```

Ini otomatis membuat 1 akun admin:
- email: `admin@nihongo-srs.local`
- password: `admin12345` (**ganti setelah login pertama** — buat halaman ganti
  password sendiri, atau update langsung lewat `npx prisma studio`)

## 6. Jalankan Development Server

```bash
npm run dev
```

Buka `http://localhost:3000`.

## 7. Alur Pemakaian

1. **Admin login** (`/login`) → masuk `/admin/kotoba` → tambah kartu kotoba
   (kanji/kana, furigana, romaji, arti, contoh kalimat, level N5–N1).
2. **User baru register** di `/register` → login → otomatis role `USER`.
3. User buka `/belajar/kana` untuk belajar **hiragana & katakana**, masing-masing
   punya 3 grup: Dasar (gojuon), Dakuten (゛→ ga/za/da/ba), dan Handakuten
   (゜→ pa). Ada tabel referensi dan mode kuis pilihan ganda yang mengacak dari
   seluruh set (termasuk dakuten/handakuten).
4. User buka `/belajar/kotoba` → sistem ambil kartu yang **jatuh tempo**
   (SM-2, algoritma sama yang dipakai Anki) → user flip kartu → pilih
   Lupa/Susah/Bagus/Mudah → interval berikutnya dihitung otomatis.
5. `/dashboard` menampilkan chart: progress review 14 hari, distribusi level
   kartu, dan akurasi kuis hiragana.

## 8. Struktur Folder Penting

```
app/
  api/            <- semua REST endpoint (Route Handlers)
  admin/kotoba/   <- halaman CRUD khusus admin
  belajar/kana/      <- tabel + kuis hiragana & katakana (dasar/dakuten/handakuten)
  belajar/kotoba/    <- flashcard review (Anki-style)
  dashboard/      <- chart & analytics
lib/
  auth.ts         <- konfigurasi NextAuth + role
  srs.ts          <- algoritma spaced repetition (SM-2)
  prisma.ts       <- Prisma client singleton
prisma/
  schema.prisma   <- skema database
  seed.ts         <- bikin akun admin pertama
middleware.ts     <- proteksi route berdasar role/login
```

## 9. Build untuk Production

```bash
npm run build
npm run start
```

`next.config.js` sudah diset `output: "standalone"` supaya build hasilnya
minim dependency saat dijalankan di server kecil.

## 10. Deploy ke Server Kecil (VPS 1–2GB RAM)

1. Install Node.js LTS + PostgreSQL di server.
2. Clone/upload project, `npm ci && npm run build`.
3. Jalankan dengan process manager biar auto-restart:
   ```bash
   npm install -g pm2
   pm2 start npm --name "nihongo-srs" -- start
   pm2 save
   pm2 startup
   ```
4. Pasang Nginx sebagai reverse proxy ke port 3000 + certbot untuk HTTPS.
5. Set `shared_buffers` PostgreSQL secukupnya (misal 128–256MB) sesuai RAM
   server — jangan pakai default kalau RAM di bawah 1GB.

## 13. Tiga Mode Belajar (Update Terbaru)

Sekarang ada halaman hub **`/belajar`** yang menampung 3 mode terpisah:

1. **Hiragana & Katakana** (`/belajar/kana`) — tabel referensi + kuis.
2. **Latihan JLPT** (`/latihan`) — active recall, dinilai otomatis (FSRS),
   filter level/bab, gap analysis. Cakupan: Kotoba, Kanji, Grammar.
3. **Flashcard Anki klasik** (`/belajar/flashcard`) — **fitur original tetap
   dipertahankan**: flip kartu, lalu kamu sendiri yang menekan tombol
   Again/Hard/Good/Easy (bukan dinilai otomatis oleh sistem). Sumber soal:
   Kotoba, tetap pakai penjadwalan FSRS yang sama (`lib/fsrs.ts`, fungsi
   `scheduleWithRating`), jadi progress-nya konsisten dengan mode Latihan
   JLPT — cuma cara menilainya yang beda (manual vs otomatis).

Dashboard sekarang cuma punya satu link "Menu Belajar" yang mengarah ke hub
ini.

Modul `/latihan` menggantikan flashcard pasif dengan **active recall**:

- **Bukan flashcard klik "show answer"** — user mengetik jawaban sendiri (mode
  Teks) atau memilih dari opsi standar (mode Pilihan Ganda).
- **Cakupan materi**: Kotoba, Kanji, dan Grammar — masing-masing punya model
  & CRUD sendiri di panel admin (`/admin/kotoba`, `/admin/kanji`,
  `/admin/grammar`), dan semuanya di-tag `level` (N5–N1) dan `bab` (nomor bab
  buku Minna no Nihongo).
- **Spaced Repetition pakai FSRS asli** — lewat library `ts-fsrs` (lihat
  `lib/fsrs.ts`), bukan SM-2 manual lagi.
- **Penilaian otomatis (objektif)** — user tidak menekan tombol
  Again/Hard/Good/Easy sendiri. Sistem menghitungnya otomatis dari:
  - Salah → **Again**
  - Benar tapi lambat (≥8 detik) → **Hard**
  - Benar dengan waktu normal (<8 detik) → **Good**
  - Benar & cepat (<3 detik) → **Easy**

  Logika ini ada di `autoRating()` dalam `lib/fsrs.ts` — silakan sesuaikan
  ambang waktunya sesuai kebutuhan.
- **Latihan per bab tertentu**: di halaman `/latihan`, pilih bab spesifik
  (misal cuma Bab 5) — mode ini mengabaikan jadwal SRS dan menyajikan semua
  soal di bab tsb sebagai latihan bebas (tetap ikut memperbarui progress
  FSRS di belakang layar).
- **Kontrol sesi**: jumlah soal (10/20/50/semua) dan batas waktu (tanpa
  batas, per-soal, atau total sesi) diatur sebelum menekan **Mulai Sesi**.
  Satu sesi = satu batch soal dengan skor akhir sendiri; tekan "Mulai Sesi
  Baru" untuk sesi baru dari nol.
- **Gap Analysis** — di akhir sesi, sistem mengelompokkan kesalahan per
  bab+tipe materi dan menampilkan rekomendasi ("pelajari kembali Minna no
  Nihongo Bab X"), diurutkan dari yang paling banyak salah.
- **Log `QuizAttempt`** tersimpan di DB untuk setiap jawaban (tipe materi,
  bab, benar/salah, waktu respons) — saat ini dipakai untuk gap analysis
  per sesi; bisa dikembangkan lagi jadi laporan historis jangka panjang di
  dashboard kalau diperlukan.

### Setelah update ini, migrasi ulang:
```bash
npx prisma migrate dev --name add-jlpt-fsrs
npm run seed
```

### Fitur admin tambahan
- `/admin` — hub dengan ringkasan statistik (total user, kotoba, kanji,
  grammar, kana).
- `/admin/users` — lihat semua user + jumlah materi yang sudah dipelajari,
  ubah role, hapus akun.
- Tombol kembali (mobile-friendly) dan ikon profil ada di setiap halaman
  lewat komponen `components/PageHeader.tsx`.
- `/profile` — ganti nama & password, tombol keluar.

