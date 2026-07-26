/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */

import { redirect } from 'next/navigation';
import { asc } from 'drizzle-orm';
import { getSession } from '../../../lib/auth.js';
import { db } from '../../../db/index.js';
import { ruangDagang, pasar } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import RuangDagangClient from './RuangDagangClient.js';

export default async function RuangDagangPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const ruangList = await db
    .select({
      id: ruangDagang.id,
      pasarId: ruangDagang.pasarId,
      namaPasar: pasar.namaPasar,
      kodeRuang: ruangDagang.kodeRuang,
      jenis: ruangDagang.jenis,
      luas: ruangDagang.luas,
      status: ruangDagang.status,
      createdAt: ruangDagang.createdAt,
      updatedAt: ruangDagang.updatedAt,
    })
    .from(ruangDagang)
    .leftJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
    .orderBy(asc(ruangDagang.kodeRuang));

  const pasars = await db
    .select({
      id: pasar.id,
      namaPasar: pasar.namaPasar,
    })
    .from(pasar)
    .orderBy(asc(pasar.namaPasar));

  return <RuangDagangClient initialData={ruangList} pasars={pasars} user={session} />;
}
