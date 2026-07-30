/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

import { asc, eq, exists } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '../../../db/index.js';
import { pedagang, perizinan, ruangDagang } from '../../../db/schema.js';
import { getSession } from '../../../lib/auth.js';
import { resolveScope } from '../../../lib/scope.js';
import PedagangTable from './PedagangTable.js';

export default async function PedagangPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  const scope = await resolveScope(user);

  const where = scope === 'all' ? undefined : exists(
    db.select({ id: perizinan.id })
      .from(perizinan)
      .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
      .where(eq(perizinan.pedagangId, pedagang.id)),
  );
  const rows = await db.select().from(pedagang).where(where).orderBy(asc(pedagang.namaLengkap));

  const activeRooms = await db
    .select({ pedagangId: perizinan.pedagangId, ruangDagangId: perizinan.ruangDagangId })
    .from(perizinan)
    .where(eq(perizinan.statusIzin, 'aktif'));
  const roomByPedagang = new Map();
  for (const r of activeRooms) {
    if (!roomByPedagang.has(r.pedagangId)) roomByPedagang.set(r.pedagangId, r.ruangDagangId);
  }
  const initialData = rows.map((p) => ({ ...p, ruangDagangId: roomByPedagang.get(p.id) ?? null }));

  return <PedagangTable initialData={initialData} />;
}
