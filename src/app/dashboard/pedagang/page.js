/**
 * @description Halaman server untuk mengambil daftar pedagang sebelum dirender sebagai tabel.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { asc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '../../../db/index.js';
import { pedagang } from '../../../db/schema.js';
import { getSession } from '../../../lib/auth.js';
import PedagangTable from './PedagangTable.js';

export default async function PedagangPage() {
  // Sesi diperiksa di server agar data pedagang tidak dikirim kepada pengguna anonim.
  const user = await getSession();
  if (!user) redirect('/login');

  const rows = await db.select().from(pedagang).orderBy(asc(pedagang.namaLengkap));

  return <PedagangTable initialData={rows} />;
}
