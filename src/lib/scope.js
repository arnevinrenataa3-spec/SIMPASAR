/**
 * @description Pusat aturan scope Pasar untuk pembacaan, pemfilteran query, dan penulisan data.
 * @author Muhamad Hazmi Alfarizqi
 */

import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

const SCOPE_COOKIE = 'simpasar_scope_pasar';

/**
 * Menentukan scope Pasar efektif untuk user.
 *
 * @param {object} user - hasil getSession()
 * @returns {Promise<'all'|string>}
 *   'all' = admin default / admin memilih 'all'
 *   string = pasarId (petugas terkunci, atau admin memilih Pasar spesifik)
 * @throws {Error} jika petugas tidak memiliki pasarId
 */
export async function resolveScope(user) {
  if (!user) return 'all';

  if (user.role === 'petugas') {
    // Petugas selalu terkunci ke pasar pada akunnya; cookie tidak boleh memperluas akses ini.
    if (!user.pasarId) {
      throw new Error('Invariant violation: petugas tanpa pasarId');
    }
    return user.pasarId;
  }

  const cookieStore = await cookies();
  const scope = cookieStore.get(SCOPE_COOKIE)?.value;
  return scope && scope !== 'all' ? scope : 'all';
}

/**
 * Membangun kondisi Drizzle untuk membaca data dalam scope.
 *
 * @param {string} scope - nilai scope dari resolveScope()
 * @param {object} column - kolom pasarId entitas (drizzle column ref)
 * @returns {import('drizzle-orm').SQL|undefined}
 *   undefined = tidak ada filter (scope 'all')
 *   kondisi SQL = eq(column, scope)
 */
export function buildScopeFilter(scope, column) {
  if (scope === 'all') return undefined;
  return eq(column, scope);
}

/**
 * Menentukan pasarId untuk penulisan tanpa memercayai nilai form dari browser.
 *
 * @param {object} user - hasil getSession()
 * @param {string|null} requestedPasarId - nilai dari formData
 * @returns {string|null} pasarId efektif untuk ditulis;
 *   null berarti "tanpa pasar" (valid hanya untuk admin membuat admin)
 * @throws {Error} jika petugas tidak memiliki pasarId
 */
export function assertWriteScope(user, requestedPasarId) {
  if (!user) {
    throw new Error('Unauthenticated write attempt');
  }

  if (user.role === 'petugas') {
    // pasarId dari akun menggantikan input form agar petugas tidak menulis ke pasar lain.
    if (!user.pasarId) {
      throw new Error('Invariant violation: petugas tanpa pasarId');
    }
    return user.pasarId;
  }

  return requestedPasarId || null;
}
