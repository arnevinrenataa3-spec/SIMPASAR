/**
 * @description Utilitas hashing dan perbandingan password aman menggunakan Argon2id.
 * @author Muhamad Hazmi Alfarizqi
 */

import argon2 from 'argon2';

export async function hashPassword(password) {
  // Argon2id menyimpan salt dan parameter hashing di dalam string hash hasilnya.
  return await argon2.hash(password, {
    type: argon2.argon2id,
  });
}

export async function verifyPassword(password, hash) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    // Hash rusak dianggap tidak cocok agar kesalahan format tidak membocorkan detail autentikasi.
    return false;
  }
}
