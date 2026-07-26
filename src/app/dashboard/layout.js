/**
 * @description Root layout untuk area Dashboard SIMPASAR (Sidebar, Navbar, Scope Provider).
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
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  let pasars = [];
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
      {/* Sidebar Navigation */}
      <Sidebar user={user} />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar user={user} pasars={pasars} selectedScope={scope} />

        {/* Page Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
