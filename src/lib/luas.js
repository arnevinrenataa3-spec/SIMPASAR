/**
 * @description Modul murni untuk hitungan dan format luas Ruang Dagang.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Muhamad Hazmi Alfarizqi
 */

export function hitungLuas(panjang, lebar) {
  if (panjang == null || lebar == null) return null;
  const p = parseFloat(panjang);
  const l = parseFloat(lebar);
  if (isNaN(p) || isNaN(l) || p <= 0 || l <= 0) return null;
  return Math.round(p * l * 100) / 100;
}

export function formatLuas(panjang, lebar, luas) {
  if (panjang == null || lebar == null || luas == null) return null;
  const p = parseFloat(panjang);
  const l = parseFloat(lebar);
  if (isNaN(p) || isNaN(l) || isNaN(luas)) return null;
  return `${p} x ${l} m (${luas} m²)`;
}
