# ADR-0002: Model Scope Pasar & Otorisasi

**Status:** Accepted
**Date:** 2026-07-26

## Context

Konsep scope (pengelompokan data per Pasar) tidak punya pemilik tunggal:
- Nama cookie `simpasar_scope_pasar` ditulis/dibaca di 3 file.
- `layout.js` membaca cookie langsung, mem-bypass `lib/scope.js`.
- Where-clause scope diturunkan ulang per halaman dengan semantik berbeda (users page: `eq OR isNull`;
  ruang-dagang page: `eq` saja).
- Jalur tulis tidak dijaga: petugas bisa mengirim `formData.pasarId` sembarang.

Aturan otorisasi ("siapa boleh apa") dikloning di 5 rumah:
- `checkAuth`/`checkAdminAuth` per action dengan aturan berbeda.
- Guard JSX "Akses Ditolak" per halaman.
- Role-hiding tombol di Client.

Ketidaksetujuan: UI ruang dagang menyembunyikan tombol dari petugas, sementara action menerima
peserta login mana pun, sementara docs menyatakan "Admin". User story (`docs/user-stories.md`)
mewajibkan petugas mengelola Ruang Dagang, Pedagang, dan Perizinan — jadi action-lah yang benar,
UI dan docs yang salah.

## Decision

### Modul Scope (`src/lib/scope.js`)

Satu pemilik konsep scope. Interface:

- `resolveScope(user)` → `'all' | pasarId` — invariant: petugas **pasti punya pasarId** (dijamin saat
  pembuatan; tanpa pasarId = bug data, modul melempar error).
- `scopeFilter(user, kolomPasarId)` → predicate Drizzle siap pakai — `'all'` = tanpa filter
  (undefined); semua where-clause pindah ke dalam modul.
- `assertWriteScope(user, requestedPasarId)` → pasarId efektif — petugas: selalu pasarId-nya sendiri
  (nilai formData diabaikan); admin: requestedPasarId setelah validasi.

Semantik kanonik:
| Aktor | Scope efektif | Dapat diganti? |
|---|---|---|
| petugas | pasarId-nya (terkunci) | tidak |
| admin | cookie, default `'all'` | ya, lewat selector |

`setPasarScopeAction` dijaga admin-only.

Halaman users (**admin-only**) tidak memakai scope filter — petugas selalu terlihat oleh admin
(scope dipakai untuk data domain terpasar: ruang dagang, pedagang, perizinan, KPI dashboard).

### Modul Otorisasi (`src/lib/policy.js`)

Satu rumah aturan "siapa boleh apa". Interface:

```
boleh(actor, operasi) → boolean
```

Tabel aturan kanonik:

| Operasi | Admin | Petugas (scoped) |
|---|---|---|
| Master Pasar (CRUD) | ✅ | ❌ |
| Master Users (CRUD) | ✅ | ❌ |
| Scope cookie (pilih Pasar) | ✅ | ❌ |
| Ruang Dagang (CRUD) | ✅ | ✅ |
| Pedagang (CRUD) | ✅ | ✅ |
| Perizinan (terbit/perpanjang/cabut/SP) | ✅ | ✅ |

Ditegakkan di **seam action** — UI hanya kosmetik. Akibat: tombol di UI ruang dagang dibuka
untuk petugas; error message "Akses Ditolak" diperbarui agar tidak menyebut "hanya Admin".

Modul berdiri sendiri; nanti diserap sebagai policy-seam pipeline ([ADR-0001]).

## Consequences

- Satu konsep scope = satu modul, satu modul otorisasi = satu rumah aturan.
- Jalur tulis tidak bisa bypass scope (derive server-side).
- Cookie scope tidak lagi dibaca langsung di luar modulnya.
- `layout.js`, halaman dashboard/ruang-dagang, dan halaman users melewati modul Scope.
- UI ruang dagang dibuka untuk petugas; docs dikoreksi agar selaras.
