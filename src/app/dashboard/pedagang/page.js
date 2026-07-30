/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

import { and, asc, eq, exists } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '../../../db/index.js';
import { pedagang, perizinan, ruangDagang } from '../../../db/schema.js';
import { getSession } from '../../../lib/auth.js';
import { resolveScope, buildScopeFilter } from '../../../lib/scope.js';
import PedagangTable from './PedagangTable.js';

export default async function PedagangPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  const scope = await resolveScope(user);
  const scopeFilter = buildScopeFilter(scope, ruangDagang.pasarId);

  const where = scope === 'all' ? undefined : exists(
    db.select({ id: perizinan.id })
      .from(perizinan)
      .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
      .where(and(eq(perizinan.pedagangId, pedagang.id), scopeFilter)),
  );
  const rows = await db.select().from(pedagang).where(where).orderBy(asc(pedagang.namaLengkap));

  return <PedagangTable initialData={rows} />;
}
