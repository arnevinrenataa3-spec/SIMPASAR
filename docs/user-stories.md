# USER STORY

### Update Khusus: Pengelompokan Berdasarkan Pasar (Multi-Pasar)
Berdasarkan perubahan struktural terbaru, seluruh modul utama dalam SIMPASAR kini di-*scope* (dikelompokkan) berdasarkan **Pasar**.
- **Admin** dapat mengelola data master Pasar (Nama, Nomor, Alamat).
- **Ruang Dagang** kini terikat secara langsung dengan sebuah Pasar.
- **Petugas** wajib ditugaskan ke salah satu Pasar tertentu dan (nantinya) hanya dapat mengelola Ruang Dagang, Pedagang, dan Perizinan yang berada di Pasar tempatnya bertugas.

### User Story: Pengelolaan & Perpanjangan Kartu Pasar oleh Petugas
* **Sebagai:** Petugas Pengelola Pasar,
* **Saya ingin:** Bisa memproses permohonan penerbitan atau perpanjangan kartu pasar (seperti SPTB atau SSTU) dengan cara menginput data persyaratan dari pedagang,
* **Sehingga:** Sistem dapat mencatat kepemilikan ruang dagang dengan valid dan memantau masa berlaku kartu secara akurat.

### Skenario Alur Kerja (Sesuai Praktik di Lapangan):
1. **Penerimaan Berkas & Syarat:**
   * Pedagang datang membawa syarat-syarat administrasi (seperti salinan KTP, foto, atau data diri lainnya).
   * Petugas memverifikasi kelengkapan berkas tersebut.
2. **Pengisian Data ke Sistem (Form Input):**
   * **Memilih Ruang Dagang:** Petugas memilih nomor ruang atau petak yang tersedia di Pasar tempat ia bertugas.
   * **Input Data Pedagang:** Petugas memasukkan data diri pedagang sesuai KTP (seperti NIK, Nama Lengkap, Alamat, dan Nomor HP).
   * **Input Detail Usaha & Legalitas:** Petugas mencatat jenis dagangan (misalnya: Beras) serta Nomor Surat / SK Izin resmi.
   * **Pencatatan Masa Berlaku:** Petugas memasukkan tanggal terbit kartu dan menentukan tanggal kedaluwarsa (akhir masa berlaku kartu).
3. **Penyimpanan & Perubahan Status:**
   * Setelah form disubmit, sistem akan menyimpan data perizinan tersebut secara permanen ke database.
   * Status ruang dagang yang tadinya **"Kosong"** akan otomatis berubah menjadi **"Terisi"** agar tidak bisa disewa atau dipakai orang lain.
   * Data pemegang kartu akan langsung masuk ke tabel monitoring/riwayat agar masa berlakunya bisa dipantau (terutama saat nanti kartu tersebut harus diperpanjang kembali).

### Acceptance Criteria & Aturan Bisnis (Technical Requirements):

1. **Relasi Pedagang & Ruang Dagang (One-to-Many):**
   - Satu pedagang (berdasarkan NIK KTP yang unik) dapat mendaftar dan menyewa **lebih dari satu** Ruang Dagang. Sistem tidak boleh menduplikasi data master pedagang, melainkan menambah relasi perizinan baru untuk NIK tersebut.

2. **Perpanjangan Kartu (Renewal History):**
   - Saat dilakukan perpanjangan kartu (SPTB/SSTU), sistem harus membuat *record* riwayat baru (*insert*) untuk mendata siklus perpanjangan (tanggal mulai & kedaluwarsa yang baru). Data perpanjangan sebelumnya tidak dihapus untuk keperluan audit/riwayat.

3. **Status Ruang Dagang & Kedaluwarsa:**
   - Jika masa berlaku kartu telah lewat, ruang dagang **tidak otomatis** dikembalikan ke status "Kosong" (untuk mentolerir keterlambatan pembayaran/perpanjangan).
   - Sebaliknya, sistem memberikan indikator visual "Kedaluwarsa / Menunggak" (Warna Merah) di tabel *monitoring*.
   - Pencabutan izin sehingga ruang menjadi "Kosong" kembali, hanya bisa dilakukan secara manual oleh Petugas.

4. **Validasi Ketersediaan:**
   - Ruang Dagang yang berstatus "Terisi" tidak akan pernah muncul dan tidak bisa dipilih pada saat petugas membuka form "Penerbitan Izin Baru".

### User Story Khusus Sisi Penghuni (Pedagang / Publik):

1. Sebagai **Penghuni**, saya ingin **mengecek status izin melalui halaman publik (tanpa login) menggunakan Nomor Kartu/QR Code**, sehingga privasi data saya tetap aman namun saya mudah mengaksesnya.
2. Sebagai **Penghuni**, saya ingin **melihat detail izin saya (Nomor Ruang, Masa Berlaku, Status Aktif)**, sehingga saya yakin data saya tercatat dengan valid di pengelola pasar.
3. Sebagai **Penghuni**, saya ingin **melihat peringatan mencolok (warna merah) beserta instruksi ke kantor jika izin saya telah kedaluwarsa**, sehingga saya tahu bahwa saya harus segera mengurus perpanjangan.

### Update Khusus: Alur Surat Peringatan (SP)
Berdasarkan masukan lapangan, jika izin lewat masa berlaku, sistem akan menerapkan status Surat Peringatan berjenjang:
- **SP1:** Dikeluarkan secara otomatis/manual setelah lewat 4 minggu dari tanggal kedaluwarsa.
- **SP2:** Dikeluarkan setelah lewat 1 minggu dari SP1 (total 5 minggu kedaluwarsa).
- **SP3:** Dikeluarkan setelah lewat 1 minggu dari SP2 (total 6 minggu kedaluwarsa).
