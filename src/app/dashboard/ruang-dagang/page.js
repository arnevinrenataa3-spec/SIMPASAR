/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */

import { redirect } from 'next/navigation';
import { asc } from 'drizzle-orm';
import { getSession } from '../../../lib/auth.js';
import { db } from '../../../db/index.js';
import { ruangDagang } from '../../../db/schema.js';
import RuangDagangClient from './RuangDagangClient.js';

export default async function RuangDagangPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const ruangList = await db
    .select({
      id: ruangDagang.id,
      kodeRuang: ruangDagang.kodeRuang,
      jenis: ruangDagang.jenis,
      luas: ruangDagang.luas,
      status: ruangDagang.status,
      createdAt: ruangDagang.createdAt,
      updatedAt: ruangDagang.updatedAt,
    })
    .from(ruangDagang)
    .orderBy(asc(ruangDagang.kodeRuang));

  return <RuangDagangClient initialData={ruangList} user={session} />;
}
