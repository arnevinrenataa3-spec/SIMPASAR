/**
 * @description Halaman Detail Izin — info lengkap satu izin beserta riwayat
 * perpanjangan sebelumnya (rantai penerbitan) dan riwayat surat peringatannya.
 */

import { redirect, notFound } from 'next/navigation';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../../../db/index.js';
import { pasar, pedagang, perizinan, ruangDagang, teguran } from '../../../../db/schema.js';
import { getSession } from '../../../../lib/auth.js';
import { resolveScope, buildScopeFilter } from '../../../../lib/scope.js';
import { classifyLineage } from '../../../../lib/perizinan.js';
import PerizinanDetail from './PerizinanDetail.js';

export default async function PerizinanDetailPage({ params }) {
  const user = await getSession();
  if (!user) redirect('/login');

  const scope = await resolveScope(user);
  const { id } = await params;

  const scopeFilter = buildScopeFilter(scope, ruangDagang.pasarId);
  const whereClause = scopeFilter ? and(eq(perizinan.id, id), scopeFilter) : eq(perizinan.id, id);

  const targetRows = await db
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
    .where(whereClause)
    .limit(1);

  if (!targetRows.length) notFound();
  const target = targetRows[0];

  const lineageRows = await db
    .select({
      id: perizinan.id,
      nomorKartu: perizinan.nomorKartu,
      tanggalTerbit: perizinan.tanggalTerbit,
      tanggalKedaluwarsa: perizinan.tanggalKedaluwarsa,
      statusIzin: perizinan.statusIzin,
      createdAt: perizinan.createdAt,
      updatedAt: perizinan.updatedAt,
    })
    .from(perizinan)
    .where(and(
      eq(perizinan.ruangDagangId, target.ruangDagangId),
      eq(perizinan.pedagangId, target.pedagangId),
    ));

  const lineage = classifyLineage(lineageRows.map((row) => ({
    ...row,
    ruangDagangId: target.ruangDagangId,
    pedagangId: target.pedagangId,
  })));
  const byId = new Map(lineageRows.map((row) => [row.id, row]));

  const history = [];
  let cursor = lineage.get(target.id);
  while (cursor?.previousId) {
    history.push(byId.get(cursor.previousId));
    cursor = lineage.get(cursor.previousId);
  }
  history.reverse();

  const teguranList = await db
    .select({
      id: teguran.id,
      status: teguran.status,
      tanggalTerbit: teguran.tanggalTerbit,
      createdAt: teguran.createdAt,
    })
    .from(teguran)
    .where(eq(teguran.perizinanId, id))
    .orderBy(desc(teguran.createdAt));

  const today = new Date().toISOString().slice(0, 10);
  const kadaluwarsa = String(target.tanggalKedaluwarsa).slice(0, 10);
  const daysLeft = Math.ceil((new Date(kadaluwarsa) - new Date(today)) / 86400000);
  const isExpiringSoon = target.statusIzin === 'aktif' && daysLeft >= 0 && daysLeft <= 7;
  const isExpired = target.statusIzin === 'aktif' && daysLeft < 0;

  const permit = {
    ...target,
    daysLeft,
    isExpiringSoon,
    isExpired,
    jenisIzin: lineage.get(target.id)?.isPerpanjangan ? 'perpanjangan' : 'baru',
  };

  return <PerizinanDetail permit={permit} history={history} teguranList={teguranList} />;
}
