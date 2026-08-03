# ADR-0003: Seam Modul Perizinan & Teguran

**Status:** Accepted
**Date:** 2026-07-26
**⚠ Kontradiksi: ADR-0001 (pipeline) — modul ini boleh memakai pipeline, tidak wajib.**
**Implementasi:** sudah tersedia pada `src/lib/perizinan.js` dan adapter database pada `src/db/adapters/perizinan.js`; ADR ini menetapkan interface dan invariant yang harus dipertahankan.

## Context

Modul inti domain — Perizinan (penerbitan, perpanjangan, pencabutan, Surat Peringatan) — telah
dibangun di luar Server Action. Tanpa keputusan seam, aturan domain akan tersebar ke dalam adapter
action dan sulit diuji secara terisolasi.

Aturan yang didefinisikan user stories (`docs/user-stories.md`):
- Terbitkan izin: status ruang dagang berubah kosong → terisi; upsert Pedagang by NIK.
- Perpanjang: baris lama → `diperpanjang`, insert riwayat baru — **satu transaksi**.
- Cabut: status → `dicabut`, ruang → `kosong` kembali.
- SP1/SP2/SP3: telat 4/5/6 minggu dari tanggal kedaluwarsa.
- Halaman publik: pencarian by nomor kartu/QR — status izin + peringatan.

## Decision

### Interface modul Perizinan (bahasa domain)

```
terbitkanIzin({ ruangDagangId, pedagang: {nik, namaLengkap, alamat, nomorHp},
                tanggalTerbit, tanggalKedaluwarsa, nomorKartu, jenisDagangan })
  → { ok: true, perizinan } | { ok: false, reason }
  // Status ruang → 'terisi'. Upsert pedagang by NIK (via modul Pedagang, lihat bawah).
  // Dalam satu transaksi.

perpanjangIzin(perizinanId, { tanggalTerbit, tanggalKedaluwarsa })
  → { ok: true, perizinan } | { ok: false, reason }
  // Baris lama → 'diperpanjang'; insert riwayat baru. Satu transaksi.

cabutIzin(perizinanId)
  → { ok: true } | { ok: false, reason }
  // Status → 'dicabut'; ruang → 'kosong'.
  // Dalam satu transaksi.

statusTeguran(tanggalKedaluwarsa, sekarang)
  → null | 'sp1' | 'sp2' | 'sp3'
  // Fungsi murni — 4 minggu telat = sp1, 5 = sp2, 6 = sp3.

statusPublik(nomorKartu)
  → { nomorRuang, masaBerlaku, status, peringatan? } | null
```

### Aturan keras (tertulis di issue)

1. Logic domain **dilarang** tinggal di server action (`src/app/actions/*`). Action hanya
   adapter tipis: FormData ↔ interface modul. Pipeline ([ADR-0001]) menangani plumbing.
2. Db harus di belakang seam adapter — interface modul tidak mengimpor `db` singleton
   secara langsung, sehingga aturan bisa di-test tanpa Postgres.
3. `terbitkanIzin` dan `cabutIzin` harus dalam satu transaksi (ruang + perizinan).
4. `perpanjangIzin` harus dalam satu transaksi (update baris lama + insert baru).

### Model Surat Peringatan (SP)

**Status teguran dihitung (derived) dari tanggal** — fungsi murni `statusTeguran()`.
**Penerbitan/cetak SP dicatat** di tabel `teguran` terpisah (dibuat di Issue #18).

`terbitkanTeguran(perizinanId, userId)` → `{ ok: true, level } | { ok: false, reason }`
// Cek perizinan aktif, hitung level SP via statusTeguran(), insert ke tabel teguran + update perizinan.statusTeguran.
// Satu transaksi atomik. Menolak jika level yang sama sudah diterbitkan.

Ini menjamin:
- Status SP untuk monitoring selalu konsisten dengan tanggal (tidak mungkin lupa update).
- Setiap penerbitan punya audit trail (siapa, kapan SP dicetak/dikirim).

### Seam Pedagang (dikonsumsi Perizinan, bukan diimplementasi ulang)

Saat `terbitkanIzin` menerima data pedagang, find-or-create-by-NIK terjadi di
balik interface modul Pedagang:

```
temukanAtauBuatPedagang(nik, data) → pedagang
```

Invariant "NIK unik" punya satu rumah di modul Pedagang ([#14](https://github.com/arnevinrenataa3-spec/SIMPASAR/issues/14));
Perizinan ([#15](https://github.com/arnevinrenataa3-spec/SIMPASAR/issues/15)) mengonsumsinya.

## Consequences

- Lima interface mendefinisikan kontrak antara codebase dan modul Perizinan.
- Aturan SP murni → testable tanpa dependensi apa pun (pure function).
- Model derived + recorded menyelesaikan ambiguitas "otomatis/manual" di user stories.
- Seam Pedagang membuat dependency antara issue #14 dan #15 eksplisit.
- Issue #15–#18 menaut ADR ini sebagai spesifikasi interface dan invariant.
