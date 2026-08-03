# Domain Context: SIMPASAR

## Ringkasan Proyek
**SIMPASAR (Sistem Informasi Manajemen Pasar)** adalah aplikasi berbasis web untuk mengelola perizinan dan kepemilikan ruang dagang (kios, los, lapak) di pasar. Aplikasi ini berfokus pada pencatatan, perpanjangan, dan peneguran (Surat Peringatan) bagi pedagang yang masa berlaku izinnya telah kedaluwarsa.

## Aktor Utama
1. **Petugas Pengelola (Admin/Staff):** Memiliki akses login. Bertugas menerbitkan izin, memperpanjang izin, mencetak Surat Peringatan (SP), dan mencabut izin.
2. **Penghuni / Pedagang (Publik):** Tidak memiliki akses login. Berinteraksi dengan sistem dengan men-*scan* QR Code atau memasukkan Nomor Kartu di halaman publik untuk melihat status dan masa berlaku izin mereka (berupa ID Card Digital).

### Scope Pasar (Invariant)
- **Admin:** Tidak terikat Pasar. Scope aktif dipilih lewat selector (cookie), default `'all'` (semua Pasar).
- **Petugas:** **Selalu terikat ke tepat satu Pasar** — tidak ada petugas tanpa Pasar. Scope-nya terkunci ke Pasar tersebut dan tidak bisa diganti. Petugas tanpa `pasarId` adalah pelanggaran invariant (bug data), bukan status yang sah.

## Ubiquitous Language (Istilah Domain)
*   **Ruang Dagang:** Petak fisik di pasar. Terdiri dari tipe Kios, Los, dan Lapak. Statusnya hanya bisa 'Kosong' atau 'Terisi'.
*   **Pedagang:** Individu penyewa yang diidentifikasi secara unik menggunakan NIK KTP. Satu pedagang dapat menyewa lebih dari satu Ruang Dagang.
*   **Perizinan:** Entitas transaksional (kontrak) yang menghubungkan Pedagang dan Ruang Dagang. Menyimpan informasi *Tanggal Terbit*, *Tanggal Kedaluwarsa*, dan *Status Izin*. 
*   **Perpanjangan Izin:** Proses memperbarui izin yang lama. Sistem tidak menimpa (*overwrite*) data lama, melainkan mengubah status data lama menjadi 'Diperpanjang' dan membuat baris data riwayat baru.
*   **Surat Peringatan (SP):** Mekanisme peneguran berjenjang saat masa izin habis.
    *   **Status teguran dihitung (derived) dari tanggal kedaluwarsa:** fungsi murni tanpa efek samping.
    *   **SP1:** Muncul jika telat 4 minggu.
    *   **SP2:** Muncul jika telat 5 minggu.
    *   **SP3:** Muncul jika telat 6 minggu (ruang siap ditarik/dikosongkan).
    *   **Penerbitan surat fisik dicatat** di tabel `teguran` terpisah untuk audit trail.
    *   **Perpanjangan Izin:** Operasi multi-tulis dalam satu transaksi — baris lama berubah status
        menjadi 'Diperpanjang', baris riwayat baru di-insert. Data lama tidak dihapus.

## Batasan Arsitektur & Teknologi
*   **Aplikasi:** Monolith (Next.js App Router dengan JavaScript murni, tanpa TypeScript).
*   **Database:** PostgreSQL v18 dengan tipe data **UUIDv7** untuk semua *Primary Key* demi keamanan dan kecepatan *indexing*. Menggunakan **Drizzle ORM**, dengan fokus pemakaian pada schema definition, migration, dan query builder seperti `.select().from()` daripada abstraksi model/entity ORM tingkat tinggi.
*   **UI/UX:** Dibangun dengan Tailwind CSS v4 menggunakan filosofi *Premium Dark Mode/Glassmorphism* dan visualisasi grid peta denah interaktif.

*(Untuk melihat dokumentasi PRD, Database Schema, dan API lengkap, lihat folder `docs/`)*.
