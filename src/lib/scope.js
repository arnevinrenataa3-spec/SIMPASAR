/**
 * @description Satu-satunya pemilik konsep scope Pasar — resolve, predicate query, penjaga tulis.
 * @author Muhamad Hazmi Alfarizqi
 */

import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

const SCOPE_COOKIE = 'simpasar_scope_pasar';

/**
 * Resolve scope efektif untuk user.
 *
 * @param {object} user - hasil getSession()
 * @returns {Promise<'all'|string>}
 *   'all' = admin default / admin memilih 'all'
 *   string = pasarId (petugas terkunci, atau admin memilih Pasar spesifik)
 * @throws {Error} invariant violation: petugas tanpa pasarId
 */
export async function resolveScope(user) {
  if (!user) return 'all';

  if (user.role === 'petugas') {
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
 * Bangun predicate drizzle untuk membaca data dalam scope.
 *
 * @param {string} scope - nilai scope dari resolveScope()
 * @param {object} column - kolom pasarId entitas (drizzle column ref)
 * @returns {import('drizzle-orm').SQL|undefined}
 *   undefined = tidak ada filter (scope 'all')
 *   SQL predicate = eq(column, scope)
 */
export function buildScopeFilter(scope, column) {
  if (scope === 'all') return undefined;
  return eq(column, scope);
}

/**
 * Penjaga jalur tulis: turunkan pasarId efektif, jangan percaya formData.
 *
 * @param {object} user - hasil getSession()
 * @param {string|null} requestedPasarId - nilai dari formData
 * @returns {string|null} pasarId efektif untuk ditulis;
 *   null berarti "tanpa pasar" (valid hanya untuk admin membuat admin)
 * @throws {Error} invariant violation: petugas tanpa pasarId
 */
export function assertWriteScope(user, requestedPasarId) {
  if (!user) {
    throw new Error('Unauthenticated write attempt');
  }

  if (user.role === 'petugas') {
    if (!user.pasarId) {
      throw new Error('Invariant violation: petugas tanpa pasarId');
    }
    return user.pasarId;
  }

  return requestedPasarId || null;
}
