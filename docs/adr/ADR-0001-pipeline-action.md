# ADR-0001: Pipeline Server Action Tunggal

**Status:** Accepted
**Date:** 2026-07-26

## Context

Setiap server action di `src/app/actions/*` menulis ulang urutan:
guard → parse FormData → validasi → operasi db → revalidatePath → bentuk result `{ success / error }`.

Ini ~60 baris plumbing per action. `prevState` mati di 9 signature (tidak ada yang membacanya).
Bentuk result hanya konvensi: 26 literal `{ error: '...' }` tersebar di 5 file, tidak ada field-level
errors. Path revalidasi diingat di kepala masing-masing penulis.

Issue #14–#19 akan menambah 6+ modul fitur. Tanpa seam, plumbing akan digandakan lagi.

## Decision

Satu modul pipeline di `src/lib/pipeline.js` dengan interface:

```
defineAction({ role, scope, schema, revalidate, execute })
```

Pipeline memiliki:
- `getSession()` untuk mendapatkan actor.
- Cek `boleh(actor, operasi)` dari modul policy ([ADR-0002]).
- Scope enforcement (`assertWriteScope`) dari modul scope ([ADR-0002]).
- Parse + validasi FormData via `schema` (Zod).
- Revalidate via `revalidatePath`.
- Bentuk result seragam: `{ success: true, message? } | { success: false, error, fieldErrors? }`.

Action menyusut menjadi deklarasi policy + handler. Handler hanya berisi logic domain.

Validasi pakai Zod — satu rumah untuk enum/allowed-values; Client bisa mengimpor schema yang sama.

Semua form Client menggunakan `useActionState` (React 19), bukan `useTransition` + state manual.
`prevState` menjadi hidup — membawa `fieldErrors` kembali ke UI.

## Consequences

- Interface action menyusut: 9 `(prevState, formData)` → deklarasi policy.
- Enum berhenti ter-triplikasi di schema / action / client.
- Deletion test: kompleksitas plumbing hilang dari setiap file action.
- 6+ modul mendatang tinggal menambahkan policy; tidak menulis ulang plumbing.
- Zod menjadi dependensi; docs sudah meresepkannya (`docs/server-actions-api.md`).
- Client harus bermigrasi dari `useTransition` ke `useActionState`.
