## Server Actions Specification

> Status implementasi: nama fungsi di bawah ini mengikuti source code saat ini. Dokumen ini sebelumnya memakai nama kontrak konseptual seperti `createPerizinan` dan `renewPerizinan`; implementasi aktual memakai adapter Server Action dengan suffix `Action`.

Karena aplikasi dibangun menggunakan **Next.js v16**, kita menggunakan **Server Actions** sebagai pengganti REST API konvensional. Pendekatan ini stabil, dan mempercepat interaksi *Client-Server* tanpa perlu mengelola *state* yang rumit di sisi *client*.

### Standar Keamanan (Security Guidelines)
*Server Actions* di Next.js sangat aman dari *security issues* bawaan, asalkan kita sebagai *developer* tidak lupa melakukan dua hal ini pada setiap fungsinya:
1. **Otorisasi:** Mengecek sesi pengguna di baris pertama fungsi (apakah *user* sudah *login* sebagai petugas).
2. **Validasi Input:** Memvalidasi *payload* menggunakan alat seperti `Zod` (atau validasi manual) sebelum berinteraksi dengan database untuk mencegah injeksi data kotor.

---

### Daftar Server Actions (Contract Backend & Frontend)

#### 1. `checkStatusPublik(prevState, formData)`
- **Aktor:** Penghuni (Publik / Tanpa Login)
- **Tujuan:** Mengecek status izin berdasarkan hasil *scan* QR / input manual.
- **Input:** `nomor_kartu` (String, ex: 'SPTB-2026-001')
- **Output (Sukses):** JSON/Objek berisi detail ruang dagang, masa berlaku, dan indikator `status` (Aktif/Kedaluwarsa).
- **Output (Gagal):** `null` atau `{ error: 'Tidak ditemukan' }`

#### 2. `terbitkanIzinAction(prevState, formData)`
- **Aktor:** Petugas (Wajib Login)
- **Tujuan:** Menerbitkan izin baru, mengecek NIK (jika baru di-*insert*, jika sudah ada digunakan ulang), dan mengunci `status` ruang dagang menjadi 'Terisi'.
- **Input:** 
  - `kode_ruang` (UUID)
  - Data Pedagang: `nik`, `nama_lengkap`, `alamat`, `no_hp`
  - Data Izin: `jenis_dagangan`, `tanggal_terbit`, `tanggal_kedaluwarsa`
- **Output:** `{ success: true, nomor_kartu: '...' }`

#### 3. `perpanjangIzinAction(prevState, formData)`
- **Aktor:** Petugas (Wajib Login)
- **Tujuan:** Memperpanjang kartu (membuat baris riwayat baru di DB) untuk pedagang yang sama di petak yang sama.
- **Input:** `ruang_dagang_id`, `pedagang_id`, `tanggal_kedaluwarsa_baru`
- **Output:** `{ success: true, message: 'Izin diperpanjang' }`

#### 4. `cabutIzinAction(prevState, formData)`
- **Aktor:** Petugas (Wajib Login)
- **Tujuan:** Mencabut izin aktif dan mengembalikan `status` ruang dagang ke 'Kosong'.
- **Input:** `ruang_dagang_id` (UUID)
- **Output:** `{ success: true }`

#### 5. `terbitkanTeguranAction(prevState, formData)`
- **Aktor:** Petugas (Wajib Login) / Sistem Automasi
- **Tujuan:** Menerbitkan Surat Peringatan (SP1, SP2, SP3) berdasarkan waktu kedaluwarsa yang telah lewat (4 minggu, 5 minggu, 6 minggu).
- **Input:** `ruang_dagang_id` (UUID), `tingkatan_sp` (String)
- **Output:** `{ success: true, message: 'SP Berhasil Diterbitkan' }`

---

### Manajemen Master Data (Admin & Petugas)

Operasi master data menggunakan `defineAction()` untuk auth, policy, validasi, eksekusi, dan revalidasi. Operasi perizinan bukan CRUD murni: action menjadi adapter tipis menuju fungsi domain yang mengatur invariant dan transaksi.

#### 6. `createPasarAction(formData)` / `updatePasarAction(formData)` / `deletePasarAction(formData)`
- **Aktor:** Admin
- **Tujuan:** Mengelola data master Pasar (Nama, Nomor, Alamat).
- **Input:** `namaPasar`, `nomorPasar`, `alamat` (beserta `id` untuk update/delete)
- **Output:** `{ success: true, message: '...' }` atau `{ error: '...' }`

#### 7. `createRuangDagangAction(formData)` / `updateRuangDagangAction(formData)` / `deleteRuangDagangAction(formData)`
- **Aktor:** Admin, Petugas (scoped ke Pasar-nya — pasarId di-derive server-side, formData diabaikan untuk Petugas)
- **Tujuan:** Mengelola data master Ruang Dagang (Kios, Meja, Lapak, Toko).
- **Input:** `pasarId` (Admin), `kodeRuang`, `jenis`, `panjang`, `lebar`, `status` (beserta `id` untuk update/delete)
- **Output:** `{ success: true, message: '...' }` atau `{ error: '...' }`

#### 8. `createUserAction(formData)` / `updateUserAction(formData)` / `deleteUserAction(formData)`
- **Aktor:** Admin
- **Tujuan:** Mengelola akun pengguna (Admin & Petugas) dan penempatan petugas ke Pasar. Halaman ini **tanpa scope** — menampilkan seluruh pengguna.
- **Input:** `name`, `username`, `password`, `role`, `pasarId` (untuk petugas)
- **Output:** `{ success: true, message: '...' }` atau `{ error: '...' }`

#### 9. `setPasarScopeAction(pasarId)`
- **Aktor:** Admin
- **Tujuan:** Mengubah dan menyimpan cookie `simpasar_scope_pasar` untuk mengontrol scope aktif seluruh dashboard & CRUD.
- **Input:** `pasarId` ('all' atau UUID pasar spesifik)
- **Output:** Memicu `revalidatePath('/dashboard', 'layout')` untuk perbaruan data otomatis.

### Pola Pipeline (`src/lib/pipeline.js`)
Semua server action pengelolaan data maupun operasi domain menggunakan `defineAction({ operasi, scope?, schema?, revalidate, execute })` dari modul pipeline. Pipeline menangani: getSession → cek `boleh()` → scope enforcement (derive server-side) → validasi Zod → eksekusi handler → revalidatePath. Lihat **ADR-0001** untuk spesifikasi lengkap.

### Otorisasi (`src/lib/policy.js`)
Aturan "siapa boleh apa" hidup di satu modul `boleh(user, operasi)`. Lihat **ADR-0002** untuk tabel aturan lengkap (Admin/Petugas per operasi).

### Modul Perizinan (Issue #15–#18)
Interface modul Perizinan didefinisikan oleh **ADR-0003**: `terbitkanIzin`, `perpanjangIzin`, `cabutIzin`, `statusTeguran` (murni), `statusPublik`. Implementasi milik anggota kelompok — action hanya adapter FormData ↔ interface. Handler logic dilarang tinggal di action.
