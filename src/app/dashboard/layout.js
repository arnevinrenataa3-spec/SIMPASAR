/**
 * @description Layout server untuk autentikasi dan kerangka bersama seluruh dashboard.
 * @author Muhamad Hazmi Alfarizqi
 */

import { redirect } from 'next/navigation';
import { asc } from 'drizzle-orm';
import { getSession } from '../../lib/auth.js';
import { resolveScope } from '../../lib/scope.js';
import { db } from '../../db/index.js';
import { pasar } from '../../db/schema.js';
import Sidebar from '../../components/Sidebar.js';
import Navbar from '../../components/Navbar.js';

export default async function DashboardLayout({ children }) {
  // Pemeriksaan sesi dilakukan di server sebelum isi dashboard dikirim ke browser.
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  let pasars = [];
  // Hanya admin memerlukan daftar pasar karena petugas tidak boleh mengganti cakupan.
  if (user.role === 'admin') {
    pasars = await db
      .select({
        id: pasar.id,
        namaPasar: pasar.namaPasar,
      })
      .from(pasar)
      .orderBy(asc(pasar.namaPasar));
  }

  const scope = await resolveScope(user);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Navigasi samping */}
      <Sidebar user={user} />

      {/* Kontainer isi utama */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigasi atas */}
        <Navbar user={user} pasars={pasars} selectedScope={scope} />

        {/* children berisi halaman dashboard yang cocok dengan URL aktif. */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
