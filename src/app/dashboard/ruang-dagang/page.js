/**
 * @description Halaman server untuk mengambil ruang dagang sesuai cakupan pasar aktif.
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi, Aditya Syahestiano
 */

import { redirect } from 'next/navigation';
import { asc, eq, and } from 'drizzle-orm';
import { getSession } from '../../../lib/auth.js';
import { resolveScope, buildScopeFilter } from '../../../lib/scope.js';
import { formatLuas, hitungLuas } from '../../../lib/luas.js';
import { db } from '../../../db/index.js';
import { ruangDagang, pasar, perizinan, pedagang } from '../../../db/schema.js';
import RuangDagangTable from './RuangDagangTable.js';

export default async function RuangDagangPage() {
  // Query dan pembatasan scope dilakukan di server sebelum data masuk ke tabel client.
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const scope = await resolveScope(session);
  const whereClause = buildScopeFilter(scope, ruangDagang.pasarId);

  // Left join mempertahankan ruang kosong yang belum memiliki izin atau pedagang.
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
      namaPedagang: pedagang.namaLengkap,
      pedagangId: pedagang.id,
      createdAt: ruangDagang.createdAt,
      updatedAt: ruangDagang.updatedAt,
      tanggalKedaluwarsa: perizinan.tanggalKedaluwarsa,
    })
    .from(ruangDagang)
    .leftJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
    .leftJoin(perizinan, and(
      eq(ruangDagang.id, perizinan.ruangDagangId),
      eq(perizinan.statusIzin, 'aktif')
    ))
    .leftJoin(pedagang, eq(perizinan.pedagangId, pedagang.id))
    .where(whereClause)
    .orderBy(asc(ruangDagang.kodeRuang));

  const today = new Date().toISOString().slice(0, 10);

  // Tambahkan luas dan status kedaluwarsa sebagai data siap tampil.
  const ruangList = rawList.map((row) => {
    const kadaluwarsa = row.tanggalKedaluwarsa
      ? String(row.tanggalKedaluwarsa).slice(0, 10)
      : null;
    const daysLeft = kadaluwarsa
      ? Math.ceil((new Date(kadaluwarsa) - new Date(today)) / 86400000)
      : null;
    return {
      ...row,
      luas: formatLuas(row.panjang, row.lebar, hitungLuas(row.panjang, row.lebar)),
      kadaluwarsa,
      isExpiringSoon: daysLeft != null && daysLeft >= 0 && daysLeft <= 7,
      isExpired: daysLeft != null && daysLeft < 0,
    };
  });

  const pasars = await db
    .select({
      id: pasar.id,
      namaPasar: pasar.namaPasar,
    })
    .from(pasar)
    .orderBy(asc(pasar.namaPasar));

  return (
    <RuangDagangTable
      initialData={ruangList}
      pasars={pasars}
      user={session}
      selectedScope={scope}
    />
  );
}
