/**
 * @description Halaman server yang menyiapkan daftar izin kedaluwarsa untuk peneguran.
 * @author Arnevin Renata Ahmad Barkah
 */

import { and, asc, desc, eq, lt, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '../../../db/index.js';
import { pasar, pedagang, perizinan, ruangDagang } from '../../../db/schema.js';
import { getSession } from '../../../lib/auth.js';
import { statusTeguran } from '../../../lib/perizinan.js';
import { buildScopeFilter, resolveScope } from '../../../lib/scope.js';
import TeguranPanel from './TeguranPanel.js';

export default async function TeguranPage() {
  // Data dibatasi sesuai pasar aktif sebelum dikirim ke komponen interaktif.
  const user = await getSession();
  if (!user) redirect('/login');
  const scope = await resolveScope(user);
  const scopeFilter = buildScopeFilter(scope, ruangDagang.pasarId);
  const today = new Date().toISOString().slice(0, 10);

  const baseWhere = and(
    sql`${perizinan.statusIzin} IN ('aktif', 'kedaluwarsa')`,
    lt(perizinan.tanggalKedaluwarsa, today),
  );
  const whereClause = scopeFilter ? and(scopeFilter, baseWhere) : baseWhere;

  const rows = await db.select({
    id: perizinan.id,
    nomorKartu: perizinan.nomorKartu,
    kodeRuang: ruangDagang.kodeRuang,
    namaPasar: pasar.namaPasar,
    namaPedagang: pedagang.namaLengkap,
    jenisDagangan: perizinan.jenisDagangan,
    tanggalTerbit: perizinan.tanggalTerbit,
    tanggalKedaluwarsa: perizinan.tanggalKedaluwarsa,
    statusIzin: perizinan.statusIzin,
    statusTeguran: perizinan.statusTeguran,
    tanggalTeguran: perizinan.tanggalTeguran,
  }).from(perizinan)
    .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
    .innerJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
    .innerJoin(pedagang, eq(perizinan.pedagangId, pedagang.id))
    .where(whereClause)
    .orderBy(asc(perizinan.tanggalKedaluwarsa));

  // Normalisasi tanggal dan hitung jenjang SP agar komponen client tinggal merender hasilnya.
  const teguranList = rows.map((row) => ({
    ...row,
    tanggalTerbit: String(row.tanggalTerbit).slice(0, 10),
    tanggalKedaluwarsa: String(row.tanggalKedaluwarsa).slice(0, 10),
    tanggalTeguran: row.tanggalTeguran ? String(row.tanggalTeguran).slice(0, 10) : null,
    computedSP: statusTeguran(row.tanggalKedaluwarsa),
  }));

  return <TeguranPanel teguranList={teguranList} />;
}
