## System Architecture & Tech Stack

Berdasarkan diskusi tim, berikut adalah tumpukan teknologi (Tech Stack) yang akan digunakan untuk SIMPASAR guna memenuhi kriteria penilaian tugas secara aman dan maksimal:

### 1. Application Architecture (Monolith)
- Aplikasi akan dibangun secara *Monolithic* (Backend dan Frontend berada dalam satu *codebase* dan proses).
- Pendekatan ini dipilih untuk mempercepat waktu pengembangan, dimana antarmuka pengguna dirender langsung dari server.

### 2. Framework (Next.js - Pure JavaScript)
- Menggunakan **Next.js (App Router)** sebagai framework utama.
- Next.js akan bertindak sebagai penyedia UI (React Server Components) sekaligus menampung logika *Backend* melalui **Server Actions** dan Route Handlers.
- Server Actions dikelola melalui **pipeline terpusat** (`src/lib/pipeline.js` — `defineAction`) untuk konsistensi keamanan, validasi Zod, scope enforcement, dan revalidasi di seluruh modul. Lihat [ADR-0001](adr/ADR-0001-pipeline-action.md).
- Untuk mengamankan nilai tugas dari dosen, kita **bermain aman dengan murni JavaScript (.js/.jsx)** dan tidak menggunakan TypeScript.

### 3. Database Layer (PostgreSQL v18 & Drizzle ORM)
- **Database Engine:** Menggunakan **PostgreSQL v18**. Versi terbaru ini dipilih karena memiliki dukungan fungsi *native* `uuidv7()` yang luar biasa untuk meng-*generate* UUID secara efisien tanpa membebani aplikasi.
- **ORM dan Query Builder:** Menggunakan paket **Drizzle ORM** melalui `drizzle-orm/postgres-js`. Dalam proyek ini, fitur yang dipakai difokuskan pada definisi schema, migration melalui Drizzle Kit, dan query builder SQL seperti `.select().from()`, `.insert()`, `.update()`, serta `.delete()`. Proyek tidak menggunakan abstraksi model/entity ORM tingkat tinggi karena fokus pembelajaran adalah memahami query dan relasi database secara eksplisit.

### 4. UI & Styling (Tailwind CSS v4)
- Untuk memukau penguji pada kriteria penilaian Desain (Kerapihan, Filosofi Pewarnaan), proyek akan menggunakan **Tailwind CSS versi 4**.
- Memungkinkan pembuatan UI modern yang responsif dan sangat kencang menggunakan mesin CSS *native* (tanpa `tailwind.config.js` gaya lama).

### Kesimpulan
Kombinasi *Tech Stack* ini (**Next.js JS + Drizzle ORM Query Builder + Postgres v18 + Tailwind v4**) mendukung pembelajaran query database, arsitektur server, dan pengembangan UI, serta tetap mematuhi syarat tugas untuk menggunakan JavaScript (bukan TypeScript).
