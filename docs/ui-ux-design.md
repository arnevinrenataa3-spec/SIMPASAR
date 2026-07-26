## UI/UX Design Flow & Wireframe Concept

Untuk mencapai nilai maksimal pada kriteria penilaian **Desain (Kerapihan, Filosofi, Pewarnaan, Alur UI/UX)**, SIMPASAR akan menggunakan pendekatan desain yang modern, interaktif, dan premium.

### 1. Filosofi Tema Visual
- **Tema Utama:** **Premium Dark Mode** dengan efek *Glassmorphism* (latar belakang transparan blur ala iOS/macOS).
- **Pewarnaan (Color Palette):** 
  - Latar belakang gelap (Dark Slate / Charcoal) untuk meminimalisir kelelahan mata petugas (Ergonomi UI).
  - **Emerald Green:** Sebagai warna aksen utama, melambangkan pertumbuhan, keuangan, dan status "Aman/Aktif".
  - **Neon Red / Crimson:** Sebagai warna *alert* yang kontras untuk status "Kedaluwarsa" atau tindakan "Cabut Izin".
- **Tipografi & Estetika:** Menggunakan *font* Sans-Serif modern (seperti Inter atau Plus Jakarta Sans). Tidak ada warna standar (merah/biru generik); semua warna disesuaikan (*curated/tailored*) di Tailwind CSS v4.

### 2. Alur UX Dashboard Petugas (Staff Area)
- **Visual Grid (Peta Denah Petak):** Menggantikan tabel data yang membosankan. Halaman utama menampilkan visualisasi kotak-kotak petak ruang dagang:
  - 🟩 **Hijau:** Petak Terisi & Aktif (Bisa di-*klik* untuk detail/perpanjang).
  - 🟥 **Merah:** Petak Terisi tapi Izin Kedaluwarsa (Menyala *pulse/micro-animation* untuk menarik perhatian penagihan).
  - ⬜ **Abu-abu Gelap:** Petak Kosong (Bisa di-*klik* untuk memunculkan modal form pendaftaran baru).
- **Alur Kerja Interaktif:** Ketika petugas mengklik petak, akan muncul *Modal/Slide-over* *glassmorphism* untuk melakukan aksi (Perpanjang, Cabut, atau Isi Baru).

### 3. Alur UX Halaman Publik (Penghuni / Pedagang)
- **Konsep "Digital ID Card" (Mobile-First):** 
  - Saat penghuni men-*scan* QR Code dari fisik kartu mereka, browser di HP akan membuka halaman cek izin.
  - Tampilan **bukan tabel teks**, melainkan berupa **Kartu ID Digital**.
  - Jika izin aktif: Tepi kartu memiliki *glowing animation* hijau.
  - Jika kedaluwarsa: Tepi kartu berwarna merah statis dengan *banner* besar peringatan "HUBUNGI PENGELOLA".

Desain ini tidak hanya akan terlihat seperti aplikasi *enterprise/startup* sungguhan, tapi juga memperlihatkan penguasaan Tailwind CSS tingkat lanjut dari tim FE (Arnevin & Aditya).

### 4. Tambahan Indikator Surat Peringatan (SP) di Visual Grid
Menyesuaikan alur peneguran lapangan, visual kotak pada denah ruang dagang akan menampilkan indikator tambahan:
- 🟧 **Oranye/Kuning:** Ruang berstatus SP1 atau SP2 (Sudah lewat tenggang waktu 4-5 minggu).
- 🚨 **Merah Pekat Berkedip:** Ruang berstatus SP3 (Tenggang waktu habis, ruang siap ditarik paksa secara sistem).

### 5. Market Scope Selector & Aksesibilitas Keyboard Modal
- **Interactive Scope Selector (Navbar):**
  - Untuk role **Admin**, Navbar menyediakan dropdown selector pasar dengan ikon panah chevron yang memfasilitasi *single-click market switching*.
  - Pemilihan pasar disimpan dalam cookie (`simpasar_scope_pasar`) untuk memfilter data pada *Dashboard*, *Ruang Dagang*, dan *User Management*, serta secara otomatis mengonfigurasi `defaultValue` pada modal form CRUD baru.
  - Untuk role **Petugas**, Navbar menampilkan indikator badge nama pasar tempat petugas ditugaskan.
- **Aksesibilitas Modal Keyboard:**
  - Tombol **Esc** (Escape) otomatis menutup modal dialog aktif.
  - Tombol **Enter** secara cerdas mengeksekusi *form submission* atau aksi utama modal (dengan mengecualikan elemen `<textarea>` untuk baris baru dan tombol `<button>` berfokus).

