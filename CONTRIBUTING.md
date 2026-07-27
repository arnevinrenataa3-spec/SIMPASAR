# Contributing to SIMPASAR

Terima kasih atas minat Anda untuk berkontribusi! Panduan ini mencakup alur kerja pengembangan, konvensi kode, dan proses kontribusi.

> **Tip:** Untuk membaca dokumen ini dengan format yang benar, buka langsung di [GitHub](https://github.com/arnevinrenataa3-spec/SIMPASAR/blob/main/CONTRIBUTING.md) atau gunakan preview Markdown bawaan VSCode (`Ctrl+Shift+V` / `Cmd+Shift+V`).

## Prasyarat

- **Node.js** (versi LTS terbaru)
- **PostgreSQL v18**
- **Git**

## Setup Awal

```bash
git clone git@github.com:arnevinrenataa3-spec/SIMPASAR.git
cd SIMPASAR
cp .env.example .env      # Windows (cmd): copy .env.example .env
# isi DATABASE_URL di .env sesuai koneksi PostgreSQL lokal Anda
npm install
npm run dev                # auto-migrate + seed, server di http://localhost:3000
```

Kredensial admin awal: `admin` / `admin123`

Server development akan otomatis menjalankan migrasi database dan seeder saat startup (via `src/instrumentation.js`). Pastikan PostgreSQL v18 sudah berjalan dan `DATABASE_URL` di `.env` sudah benar sebelum menjalankan dev server. Sebagai opsi, `docker compose up -d` tersedia untuk menjalankan PostgreSQL via Docker.

## Alur Kerja Pengembangan

### Branch Strategy

Repository menggunakan **single branch (`main`)**. Semua pekerjaan dilakukan langsung di `main`.

### Commit Messages

Gunakan **conventional commits**:

```
feat: deskripsi singkat tentang fitur baru
fix: deskripsi tentang perbaikan bug
refactor: deskripsi tentang perubahan struktur kode
docs: deskripsi tentang perubahan dokumentasi
style: deskripsi tentang perubahan gaya/tampilan
chore: deskripsi tentang tugas pemeliharaan
```

Referensikan issue terkait bila ada: `closes #12`, `related #15`

### Issue Tracker

Issue dilacak di [GitHub Issues](https://github.com/arnevinrenataa3-spec/SIMPASAR/issues). Lihat [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md) untuk konvensi lengkap.

#### Triage Labels

| Label             | Arti                                             |
| ----------------- | ------------------------------------------------ |
| `needs-triage`    | Perlu evaluasi maintainer                        |
| `needs-info`      | Menunggu informasi dari pelapor                  |
| `ready-for-agent` | Sudah terspesifikasi, siap dikerjakan AI agent   |
| `ready-for-human` | Membutuhkan implementasi manusia                 |
| `wontfix`         | Tidak akan dikerjakan                            |

### Melaporkan Bug

1. Cari issue yang sudah ada — hindari duplikasi
2. Gunakan label yang sesuai
3. Sertakan: langkah reproduksi, perilaku yang diharapkan, perilaku aktual, versi Node.js/PostgreSQL

### Mengusulkan Fitur

1. Buka issue baru yang menjelaskan fitur dan tujuannya
2. Diskusikan dengan maintainer sebelum mengimplementasikan
3. Gunakan label `needs-triage`

## Konvensi Kode

### JavaScript Murni (.js/.jsx)

Proyek ini menggunakan **JavaScript murni — tanpa TypeScript**, sesuai keputusan arsitektur yang didokumentasikan di [docs/system-architecture.md](docs/system-architecture.md).

### JSDoc

Semua source file wajib menyertakan header JSDoc dengan metadata penulis:

```js
/**
 * @description [deskripsi modul]
 * @author Nama Anda
 * @contributor Nama Kontributor (jika ada)
 */
```

Gunakan anotasi JSDoc untuk dokumentasi tipe: `@typedef`, `@param`, `@returns`, `@callback`, dll.

### Komponen

- **Server Components** untuk data fetching — letakkan di `src/app/dashboard/<modul>/page.js`
- **Client Components** untuk UI interaktif — komponen tabel yang dapat di-sort, di-filter, dsb.
- Gunakan direktif `'use client'` atau `'use server'` dengan tepat
- Form menggunakan React 19 `useActionState` untuk integrasi server action
- Modal menggunakan aksesibilitas keyboard (Escape untuk menutup, Enter untuk submit)

### Server Actions & Pipeline

Semua server action CRUD **wajib** menggunakan `defineAction()` dari `src/lib/pipeline.js`:

```
auth → authorization (boleh()) → scope enforcement → Zod validation → execute → revalidatePath()
```

Jangan tulis ad-hoc server action. Selalu gunakan pipeline untuk konsistensi keamanan, validasi, scope enforcement, dan revalidasi. Contoh:

```js
import { defineAction } from '@/lib/pipeline';
import { z } from 'zod';

export const createFooAction = defineAction({
  operasi: 'create:foo',
  scope: 'enforce',                       // hanya jika write scope diperlukan
  schema: z.object({ name: z.string() }),
  async execute(data, ctx) {
    // data: hasil parse Zod | ctx: { user, pasarId }
    // return { message: '...' } atau throw error
  },
});
```

Lihat [docs/adr/ADR-0001-pipeline-action.md](docs/adr/ADR-0001-pipeline-action.md) untuk detail desain.

### Policy & Scope

- **Policy (`src/lib/policy.js`)** — satu-satunya sumber kebenaran aturan RBAC. Gunakan `boleh(user, operasi)`.
- **Scope (`src/lib/scope.js`)** — satu-satunya sumber kebenaran logika scope pasar. Gunakan `resolveScope()`, `buildScopeFilter()`, `assertWriteScope()`.

Jangan duplikasi logika otorisasi atau scope di komponen atau action.

### Styling (Tailwind CSS v4)

- Gunakan Tailwind CSS v4 dengan setup CSS-first (`@import "tailwindcss"`, `@theme inline`)
- Tema **Premium Dark Mode + Glassmorphism**:
  - Background: slate/charcoal gelap (`bg-slate-900/60`, `#020617`)
  - Aksesori: emerald-400/500
  - Peringatan: rose-400/500
  - Glassmorphism: `backdrop-blur-xl border border-slate-800/80 rounded-2xl`
- Tidak ada `tailwind.config.js` — semuanya di `src/app/globals.css`

### Database & Migrasi

**JANGAN PERNAH** menulis DDL langsung (CREATE TABLE, ALTER TABLE, dsb).

1. **Modifikasi schema** di `src/db/schema.js` (satu-satunya source of truth)
2. **Generate migration**: `npm run generate`
3. **Apply migration**: `npm run migrate` atau restart dev server (auto-migrate)

File migrasi di `drizzle/` tidak boleh diedit secara manual.

### Konvensi Penamaan

| Konteks         | Konvensi                                |
| --------------- | --------------------------------------- |
| Primary Keys    | UUIDv7 (via fungsi native PostgreSQL)   |
| Kolom Database  | `snake_case`                            |
| Objek JS        | `camelCase`                             |
| Tabel           | `snake_case` jamak (sesuai domain)      |
| Enum            | `snake_case`                            |
| File Komponen   | `PascalCase.js`                         |
| File Utilitas   | `camelCase.js`                          |

## Testing

Belum ada framework testing yang dikonfigurasi. Untuk saat ini, verifikasi manual:

```bash
npm run lint    # ESLint check
npm run build   # pastikan build production berhasil
npm run dev     # verifikasi manual di browser
```

## Linting

```bash
npm run lint
```

ESLint v9 menggunakan flat config `eslint.config.mjs` dengan plugin `eslint-config-next/core-web-vitals`.

## Scripts Penting

| Script             | Perintah                     | Kegunaan                                    |
| ------------------ | ---------------------------- | ------------------------------------------- |
| `npm run dev`      | `next dev`                   | Memulai dev server (port 3000)              |
| `npm run build`    | `next build`                 | Build production                            |
| `npm run lint`     | `eslint`                     | Menjalankan ESLint                          |
| `npm run migrate`  | `drizzle-kit migrate`        | Menjalankan migrasi database yang pending   |
| `npm run generate` | `drizzle-kit generate`       | Membuat file migrasi SQL dari schema        |
| `npm run studio`   | `drizzle-kit studio`         | Membuka Drizzle Studio (GUI inspeksi DB)    |
| `npm run seed`     | `node --env-file=.env src/db/seed.js` | Menjalankan seeder database         |

## Struktur Proyek

```
SIMPASAR/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── actions/          # Server actions (CRUD, auth, scope)
│   │   ├── dashboard/        # Halaman dashboard (auth-guarded)
│   │   ├── login/            # Halaman login
│   │   ├── layout.js         # Root layout
│   │   └── globals.css       # Tailwind v4 + tema dark
│   ├── components/           # UI components (Modal, Sidebar, Navbar, dsb.)
│   ├── db/                   # Database layer
│   │   ├── schema.js         # Drizzle ORM schema definitions
│   │   ├── index.js          # Koneksi database
│   │   ├── migrate.js        # Programmatic migration runner
│   │   ├── init.js           # Orchestrator migrasi + seed
│   │   └── seed.js           # Data awal (admin user)
│   └── lib/                  # Utilitas & modul bisnis
│       ├── auth.js           # Session management
│       ├── pipeline.js       # defineAction() pipeline
│       ├── policy.js         # RBAC (boleh())
│       ├── scope.js          # Scope pasar
│       ├── password.js       # Argon2id hashing
│       ├── luas.js           # Kalkulasi luas ruang dagang
│       ├── useCrudActions.js # React hook CRUD
│       └── logger.js         # Custom logger
├── drizzle/                  # File migrasi SQL yang di-generate
├── docs/                     # Dokumentasi (ADR, schema, API, user stories)
├── scripts/                  # Utilitas DB (drop, truncate)
├── docker-compose.yaml       # Container PostgreSQL 18 lokal
└── drizzle.config.js         # Konfigurasi Drizzle Kit
```

## Domain Context

SIMPASAR adalah sistem informasi manajemen pasar untuk mengelola perizinan ruang dagang (kios, los, lapak). Baca [CONTEXT.md](CONTEXT.md) untuk memahami ubiquitous language dan batasan domain sebelum menulis kode.

## Dokumentasi

| Dokumen                                                | Isi                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| [database-schema.md](docs/database-schema.md)          | ERD, desain schema, dan relasi antar tabel                    |
| [server-actions-api.md](docs/server-actions-api.md)    | Kontrak API server actions (signature, parameter, return type)|
| [system-architecture.md](docs/system-architecture.md)  | Keputusan tech stack dan arsitektur                           |
| [ui-ux-design.md](docs/ui-ux-design.md)                | Filosofi desain UI/UX, palet warna, glassmorphism             |
| [user-stories.md](docs/user-stories.md)                | User stories, acceptance criteria, alur SP                    |

### Architecture Decision Records (ADR)

| ADR                                                            | Topik             | Keputusan Kunci                                                     |
| -------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| [ADR-0001](docs/adr/ADR-0001-pipeline-action.md)               | Pipeline Action   | Semua server action wajib melewati `defineAction()`                 |
| [ADR-0002](docs/adr/ADR-0002-scope-dan-otorisasi.md)           | Scope & Otorisasi | Satu modul untuk scope (`scope.js`), satu untuk RBAC (`policy.js`)  |
| [ADR-0003](docs/adr/ADR-0003-seam-perizinan.md)                | Seam Perizinan    | Logika domain dilarang di server actions; harus di modul khusus     |

Lihat [CONTEXT.md](CONTEXT.md) untuk ubiquitous language dan batasan domain.

## Proses Pull Request

1. Buka issue terlebih dahulu (jika belum ada)
2. Lakukan perubahan di branch `main`
3. Jalankan `npm run lint` dan `npm run build` — pastikan tidak ada error
4. Uji perubahan secara manual dengan `npm run dev`
5. Buka Pull Request ke `main`
   - Referensikan issue terkait: `Closes #N`
   - Jelaskan apa yang diubah dan mengapa
6. Pull request akan di-review oleh maintainer

## Kode Etik

- Harap bersikap profesional dan saling menghormati
- Ikuti konvensi kode yang sudah ada
- Tanyakan jika ragu — lebih baik bertanya daripada menebak

---

Terima kasih telah berkontribusi pada SIMPASAR.
