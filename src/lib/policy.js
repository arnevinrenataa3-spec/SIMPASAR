/**
 * @description Pusat aturan otorisasi untuk menentukan role yang boleh menjalankan operasi.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

const RULES = {
  // Kunci operasi dipakai Server Action agar aturan role tidak tersebar di banyak file.
  'pasar:crud': ['admin'],
  'users:crud': ['admin'],
  'scope:set': ['admin'],
  'ruang-dagang:crud': ['admin', 'petugas'],
  'pedagang:crud': ['admin', 'petugas'],
  'perizinan:ops': ['admin', 'petugas'],
};

/**
 * Cek apakah user boleh melakukan operasi tertentu.
 *
 * @param {object|null} user - hasil getSession(); null = unauthenticated
 * @param {string} operasi - kunci operasi dari tabel RULES
 * @returns {boolean}
 */
export function boleh(user, operasi) {
  // Operasi yang tidak dikenal ditolak secara default untuk mencegah akses terbuka akibat salah ketik.
  if (!user) return false;
  const allowed = RULES[operasi];
  if (!allowed) return false;
  return allowed.includes(user.role);
}
