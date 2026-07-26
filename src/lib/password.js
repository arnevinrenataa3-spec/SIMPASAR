/**
 * @description Utility hashing dan komparasi password aman menggunakan Argon2id.
 * @author Muhamad Hazmi Alfarizqi
 */

import argon2 from 'argon2';

export async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
  });
}

export async function verifyPassword(password, hash) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}
