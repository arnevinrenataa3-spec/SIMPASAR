/**
 * @description Satu-satunya rumah aturan "siapa boleh apa" di seam action.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

const RULES = {
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
  if (!user) return false;
  const allowed = RULES[operasi];
  if (!allowed) return false;
  return allowed.includes(user.role);
}
