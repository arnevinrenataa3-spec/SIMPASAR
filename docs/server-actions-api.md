## Server Actions Specification

Karena aplikasi dibangun menggunakan **Next.js v16**, kita menggunakan **Server Actions** sebagai pengganti REST API konvensional. Pendekatan ini stabil, dan mempercepat interaksi *Client-Server* tanpa perlu mengelola *state* yang rumit di sisi *client*.

### Standar Keamanan (Security Guidelines)
*Server Actions* di Next.js sangat aman dari *security issues* bawaan, asalkan kita sebagai *developer* tidak lupa melakukan dua hal ini pada setiap fungsinya:
1. **Otorisasi:** Mengecek sesi pengguna di baris pertama fungsi (apakah *user* sudah *login* sebagai petugas).
2. **Validasi Input:** Memvalidasi *payload* menggunakan alat seperti `Zod` (atau validasi manual) sebelum berinteraksi dengan database untuk mencegah injeksi data kotor.

---

### Daftar Server Actions (Contract Backend & Frontend)

#### 1. `checkPermitStatus(nomor_kartu)`
- **Aktor:** Penghuni (Publik / Tanpa Login)
- **Tujuan:** Mengecek status izin berdasarkan hasil *scan* QR / input manual.
- **Input:** `nomor_kartu` (String, ex: 'SPTB-2026-001')
- **Output (Sukses):** JSON/Objek berisi detail ruang dagang, masa berlaku, dan indikator `status` (Aktif/Kedaluwarsa).
- **Output (Gagal):** `null` atau `{ error: 'Tidak ditemukan' }`

#### 2. `createPerizinan(formData)`
- **Aktor:** Petugas (Wajib Login)
- **Tujuan:** Menerbitkan izin baru, mengecek NIK (jika baru di-*insert*, jika sudah ada digunakan ulang), dan mengunci `status` ruang dagang menjadi 'Terisi'.
- **Input:** 
  - `kode_ruang` (UUID)
  - Data Pedagang: `nik`, `nama_lengkap`, `alamat`, `no_hp`
  - Data Izin: `jenis_dagangan`, `tanggal_terbit`, `tanggal_kedaluwarsa`
- **Output:** `{ success: true, nomor_kartu: '...' }`

#### 3. `renewPerizinan(formData)`
- **Aktor:** Petugas (Wajib Login)
- **Tujuan:** Memperpanjang kartu (membuat baris riwayat baru di DB) untuk pedagang yang sama di petak yang sama.
- **Input:** `ruang_dagang_id`, `pedagang_id`, `tanggal_kedaluwarsa_baru`
- **Output:** `{ success: true, message: 'Izin diperpanjang' }`

#### 4. `revokePerizinan(ruang_dagang_id)`
- **Aktor:** Petugas (Wajib Login)
- **Tujuan:** Mencabut izin aktif dan mengembalikan `status` ruang dagang ke 'Kosong'.
- **Input:** `ruang_dagang_id` (UUID)
- **Output:** `{ success: true }`

#### 5. `issueWarningLetter(ruang_dagang_id, tingkatan_sp)`
- **Aktor:** Petugas (Wajib Login) / Sistem Automasi
- **Tujuan:** Menerbitkan Surat Peringatan (SP1, SP2, SP3) berdasarkan waktu kedaluwarsa yang telah lewat (4 minggu, 5 minggu, 6 minggu).
- **Input:** `ruang_dagang_id` (UUID), `tingkatan_sp` (String)
- **Output:** `{ success: true, message: 'SP Berhasil Diterbitkan' }`

---

### Manajemen Master Data (Admin & Petugas)

#### 6. `createPasarAction(formData)` / `updatePasarAction(formData)` / `deletePasarAction(formData)`
- **Aktor:** Admin
- **Tujuan:** Mengelola data master Pasar (Nama, Nomor, Alamat).
- **Input:** `namaPasar`, `nomorPasar`, `alamat` (beserta `id` untuk update/delete)
- **Output:** `{ success: true, message: '...' }` atau `{ error: '...' }`

#### 7. `createRuangDagangAction(formData)` / `updateRuangDagangAction(formData)` / `deleteRuangDagangAction(formData)`
- **Aktor:** Admin
- **Tujuan:** Mengelola data master Ruang Dagang (Kios, Meja, Lapak, Toko).
- **Input:** `pasarId`, `kodeRuang`, `jenis`, `panjang`, `lebar`, `status` (beserta `id` untuk update/delete)
- **Output:** `{ success: true, message: '...' }` atau `{ error: '...' }`

#### 8. `createUserAction(formData)` / `updateUserAction(formData)` / `deleteUserAction(formData)`
- **Aktor:** Admin
- **Tujuan:** Mengelola akun pengguna (Admin & Petugas) dan penempatan petugas ke Pasar.
- **Input:** `name`, `username`, `password`, `role`, `pasarId` (untuk petugas)
- **Output:** `{ success: true, message: '...' }` atau `{ error: '...' }`
