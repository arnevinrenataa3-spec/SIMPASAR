/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { redirect, notFound } from 'next/navigation';
import { asc, desc, eq, exists, and } from 'drizzle-orm';
import { getSession } from '../../../../lib/auth.js';
import { resolveScope, buildScopeFilter } from '../../../../lib/scope.js';
import { hitungLuas, formatLuas } from '../../../../lib/luas.js';
import { db } from '../../../../db/index.js';
import { ruangDagang, pasar, perizinan, pedagang, teguran } from '../../../../db/schema.js';
import RuangDagangDetail from './RuangDagangDetail.js';

export default async function RuangDagangDetailPage({ params }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const scope = await resolveScope(session);
  const { id } = await params;

  const scopeFilter = buildScopeFilter(scope, ruangDagang.pasarId);
  const whereClause = scopeFilter ? and(eq(ruangDagang.id, id), scopeFilter) : eq(ruangDagang.id, id);

  const ruangRows = await db
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
    .where(whereClause);

  if (!ruangRows.length) notFound();

  const ruang = {
    ...ruangRows[0],
    luas: formatLuas(ruangRows[0].panjang, ruangRows[0].lebar, hitungLuas(ruangRows[0].panjang, ruangRows[0].lebar)),
  };

  const izins = await db
    .select({
      id: perizinan.id,
      nomorKartu: perizinan.nomorKartu,
      jenisDagangan: perizinan.jenisDagangan,
      tanggalTerbit: perizinan.tanggalTerbit,
      tanggalKedaluwarsa: perizinan.tanggalKedaluwarsa,
      statusIzin: perizinan.statusIzin,
      statusTeguran: perizinan.statusTeguran,
      tanggalTeguran: perizinan.tanggalTeguran,
      namaPedagang: pedagang.namaLengkap,
      nik: pedagang.nik,
      pedagangId: pedagang.id,
      createdAt: perizinan.createdAt,
    })
    .from(perizinan)
    .leftJoin(pedagang, eq(perizinan.pedagangId, pedagang.id))
    .where(eq(perizinan.ruangDagangId, id))
    .orderBy(desc(perizinan.createdAt));

  const pedagangAktif = izins.find((i) => i.statusIzin === 'aktif');

  const traders = scope === 'all'
    ? await db.select({
        id: pedagang.id,
        nik: pedagang.nik,
        namaLengkap: pedagang.namaLengkap,
        alamat: pedagang.alamat,
        nomorHp: pedagang.nomorHp,
      }).from(pedagang).orderBy(asc(pedagang.namaLengkap))
    : await db.select({
        id: pedagang.id,
        nik: pedagang.nik,
        namaLengkap: pedagang.namaLengkap,
        alamat: pedagang.alamat,
        nomorHp: pedagang.nomorHp,
      }).from(pedagang)
        .where(exists(
          db.select({ id: perizinan.id }).from(perizinan)
            .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
            .where(and(eq(perizinan.pedagangId, pedagang.id), eq(ruangDagang.pasarId, scope))),
        ))
        .orderBy(asc(pedagang.namaLengkap));

  const izinIds = izins.map((i) => i.id);
  let teguranList = [];
  if (izinIds.length > 0) {
    teguranList = await db
      .select({
        id: teguran.id,
        perizinanId: teguran.perizinanId,
        status: teguran.status,
        tanggalTerbit: teguran.tanggalTerbit,
        userId: teguran.userId,
        createdAt: teguran.createdAt,
        nomorKartu: perizinan.nomorKartu,
      })
      .from(teguran)
      .leftJoin(perizinan, eq(teguran.perizinanId, perizinan.id))
      .where(eq(perizinan.ruangDagangId, id))
      .orderBy(desc(teguran.createdAt));
  }

  return (
    <RuangDagangDetail
      ruang={ruang}
      izins={izins}
      pedagangAktif={pedagangAktif}
      traders={traders}
      teguranList={teguranList}
      user={session}
    />
  );
}
