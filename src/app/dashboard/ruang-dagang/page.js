/**
 * @description Halaman server-side Master Data Ruang Dagang (Los / Meja / Kios / Toko).
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import { redirect } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { getSession } from '../../../lib/auth.js';
import { resolveScope, buildScopeFilter } from '../../../lib/scope.js';
import { formatLuas, hitungLuas } from '../../../lib/luas.js';
import { db } from '../../../db/index.js';
import { ruangDagang, pasar } from '../../../db/schema.js';
import RuangDagangClient from './RuangDagangClient.js';

export default async function RuangDagangPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const scope = await resolveScope(session);
  const whereClause = buildScopeFilter(scope, ruangDagang.pasarId);

  const rawList = await db
    .select({
      id: ruangDagang.id,
      pasarId: ruangDagang.pasarId,
      namaPasar: pasar.namaPasar,
      kodeRuang: ruangDagang.kodeRuang,
      jenis: ruangDagang.jenis,
      panjang: ruangDagang.panjang,
      lebar: ruangDagang.lebar,
      status: ruangDagang.status,
      createdAt: ruangDagang.createdAt,
      updatedAt: ruangDagang.updatedAt,
    })
    .from(ruangDagang)
    .leftJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
    .where(whereClause)
    .orderBy(asc(ruangDagang.kodeRuang));

  const ruangList = rawList.map((row) => ({
    ...row,
    luas: formatLuas(row.panjang, row.lebar, hitungLuas(row.panjang, row.lebar)),
  }));

  const pasars = await db
    .select({
      id: pasar.id,
      namaPasar: pasar.namaPasar,
    })
    .from(pasar)
    .orderBy(asc(pasar.namaPasar));

  return (
    <RuangDagangClient
      initialData={ruangList}
      pasars={pasars}
      user={session}
      selectedScope={scope}
    />
  );
}
