/**
 * @file src/lib/scope.js
 * @description Utility penentuan scope pasar efektif berdasarkan perizinan & role user.
 * @author Muhamad Hazmi Alfarizqi
 */

import { cookies } from 'next/headers';

export async function getEffectivePasarScope(user) {
  if (!user) return 'all';

  if (user.role === 'petugas') {
    return user.pasarId || null;
  }

  const cookieStore = await cookies();
  const scope = cookieStore.get('simpasar_scope_pasar')?.value;
  return scope && scope !== 'all' ? scope : 'all';
}
