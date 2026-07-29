# User Stories

## Aktor

| Aktor | Hak Akses | Scope |
|-------|-----------|-------|
| **Admin** | Kelola Pasar, User, Ruang Dagang, Pedagang, Perizinan, SP | Semua Pasar (bisa filter via cookie) |
| **Petugas** | Kelola Ruang Dagang, Pedagang, Perizinan, SP | Hanya Pasar tempat bertugas |
| **Penghuni / Pedagang** | Cek status izin via halaman publik (tanpa login) | Hanya izin milik sendiri (by nomor kartu) |

## Pedoman Arsitektur

- **Pipeline Server Action:** Semua aksi CRUD menggunakan `defineAction` dari `src/lib/pipeline.js`. Pipeline menangani: otentikasi → otorisasi (`boleh()`) → scope enforcement → validasi Zod → revalidasi. Lihat [ADR-0001](adr/ADR-0001-pipeline-action.md).
- **Scope & Otorisasi:** Aturan scope pasar & "siapa boleh apa" hidup di `src/lib/scope.js` dan `src/lib/policy.js`. Lihat [ADR-0002](adr/ADR-0002-scope-dan-otorisasi.md).
- **Relasi Pedagang-Pasar bersifat derived:** Tabel `pedagang` tidak memiliki `pasar_id`. Relasi ke Pasar dihitung melalui `pedagang → perizinan → ruang_dagang → pasar`. Pedagang yang belum memiliki Perizinan tidak terkait Pasar mana pun. Lihat [ADR-0003](adr/ADR-0003-seam-perizinan.md).

## Master Data Pedagang

**Sebagai** Petugas, **saya ingin** mencatat data identitas Pedagang (NIK, Nama, Alamat, No HP) **sehingga** data tersebut dapat digunakan saat penerbitan izin.

- NIK bersifat unik global. Satu Pedagang tidak boleh tercatat dua kali.
- Satu Pedagang dapat memiliki izin di beberapa Ruang Dagang, baik dalam Pasar yang sama maupun berbeda.
- Relasi ke Pasar diturunkan dari Perizinan, bukan dari tabel tersendiri.
- Pedagang tanpa Perizinan bersifat global (belum terkait Pasar mana pun).
- Petugas dapat mengelola data Pedagang yang sudah memiliki Perizinan di Pasar-nya.

## Penerbitan Izin Baru

**Sebagai** Petugas, **saya ingin** menerbitkan izin dengan memilih Ruang Dagang kosong di Pasar saya dan mengisi data Pedagang, **sehingga** status ruang berubah menjadi Terisi dan izin tercatat.

1. **Penerimaan Berkas & Syarat:**
   - Pedagang datang membawa syarat-syarat administrasi (KTP, foto, data diri).
   - Petugas memverifikasi kelengkapan berkas.
2. **Pengisian Data ke Sistem:**
   - Petugas memilih Ruang Dagang yang tersedia di Pasar tempat bertugas.
   - Petugas mengisi data Pedagang (NIK, Nama, Alamat, No HP).
   - Petugas mencatat jenis dagangan dan nomor kartu.
   - Petugas memasukkan tanggal terbit dan tanggal kedaluwarsa.
3. **Penyimpanan:**
   - Status Ruang Dagang berubah dari **Kosong** menjadi **Terisi** (dalam satu transaksi dengan Perizinan).
   - Jika NIK sudah ada, data Pedagang digunakan kembali.
   - Data Perizinan baru tercatat untuk pemantauan masa berlaku.

## Perpanjangan & Pencabutan Izin

**Sebagai** Petugas, **saya ingin** memperpanjang atau mencabut izin yang sudah ada **sehingga** data riwayat tetap utuh dan status ruang terkini.

- Perpanjangan: baris lama berstatus `diperpanjang`, baris baru di-insert — **satu transaksi**.
- Pencabutan: status izin menjadi `dicabut`, Ruang Dagang kembali menjadi `kosong` — **satu transaksi**.
- Data lama tidak pernah dihapus (audit trail).

## Pengecekan Publik / Digital ID

**Sebagai** Penghuni, **saya ingin** mengecek status izin melalui halaman publik (tanpa login) menggunakan Nomor Kartu, **sehingga** privasi data saya tetap aman namun saya mudah mengaksesnya.

- Input: nomor kartu.
- Output: nomor ruang, nama pasar, tanggal terbit, kedaluwarsa, status (aktif/kedaluwarsa/dicabut/diperpanjang), peringatan SP.
- Tidak menampilkan NIK, alamat, nomor HP, atau data sensitif lainnya.

## Surat Peringatan (SP)

Jika izin lewat masa berlaku, sistem menghitung status SP berjenjang sebagai fungsi murni dari tanggal:

- **SP1:** 28 hari (4 minggu) setelah tanggal kedaluwarsa.
- **SP2:** 35 hari (5 minggu) setelah tanggal kedaluwarsa.
- **SP3:** 42 hari (6 minggu) setelah tanggal kedaluwarsa.

Status SP dihitung, tidak disimpan — kecuali penerbitan surat fisik yang dicatat di tabel `teguran` (audit trail, Issue #18).
