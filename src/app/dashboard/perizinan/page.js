/**
 * @description Halaman Perizinan — daftar & histori seluruh izin lintas Ruang Dagang,
 * dengan shortcut langsung ke Ruang Dagang dan Pedagang terkait.
 */

import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { pasar, pedagang, perizinan, ruangDagang } from '../../../db/schema.js';
import { getSession } from '../../../lib/auth.js';
import { resolveScope, buildScopeFilter } from '../../../lib/scope.js';
import PerizinanTable from './PerizinanTable.js';

export default async function PerizinanPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const scope = await resolveScope(user);
  const scopeFilter = buildScopeFilter(scope, ruangDagang.pasarId);

  const rows = await db
    .select({
      id: perizinan.id,
      nomorKartu: perizinan.nomorKartu,
      ruangDagangId: ruangDagang.id,
      kodeRuang: ruangDagang.kodeRuang,
      namaPasar: pasar.namaPasar,
      pedagangId: pedagang.id,
      namaPedagang: pedagang.namaLengkap,
      nik: pedagang.nik,
      jenisDagangan: perizinan.jenisDagangan,
      tanggalTerbit: perizinan.tanggalTerbit,
      tanggalKedaluwarsa: perizinan.tanggalKedaluwarsa,
      statusIzin: perizinan.statusIzin,
      statusTeguran: perizinan.statusTeguran,
      createdAt: perizinan.createdAt,
    })
    .from(perizinan)
    .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
    .innerJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
    .innerJoin(pedagang, eq(perizinan.pedagangId, pedagang.id))
    .where(scopeFilter)
    .orderBy(desc(perizinan.createdAt));

  const today = new Date().toISOString().slice(0, 10);
  const permits = rows.map((row) => {
    const kadaluwarsa = String(row.tanggalKedaluwarsa).slice(0, 10);
    const daysLeft = Math.ceil((new Date(kadaluwarsa) - new Date(today)) / 86400000);
    const isExpiringSoon = row.statusIzin === 'aktif' && daysLeft >= 0 && daysLeft <= 7;
    const isExpired = row.statusIzin === 'aktif' && daysLeft < 0;
    return { ...row, daysLeft, isExpiringSoon, isExpired };
  });

  return <PerizinanTable permits={permits} />;
}
