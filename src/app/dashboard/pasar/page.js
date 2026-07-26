/**
 * @description Halaman server-side Master Data Pasar.
 * @author Arnevin Renata Ahmad Barkah
 */

import { getSession } from '../../../lib/auth.js';
import { db } from '../../../db/index.js';
import { pasar } from '../../../db/schema.js';
import PasarTable from './PasarTable.js';

export default async function PasarPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto mt-12 p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center text-rose-300">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-sm text-rose-200/80">
          Halaman ini khusus untuk pengguna dengan role <strong>Admin</strong>. Anda tidak memiliki izin untuk mengelola data pasar.
        </p>
      </div>
    );
  }

  const pasarList = await db
    .select({
      id: pasar.id,
      namaPasar: pasar.namaPasar,
      alamat: pasar.alamat,
      nomorPasar: pasar.nomorPasar,
      createdAt: pasar.createdAt,
    })
    .from(pasar);

  return     <PasarTable pasars={pasarList} />;
}
