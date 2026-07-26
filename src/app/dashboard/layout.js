/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth.js';
import Sidebar from '../../components/Sidebar.js';
import Navbar from '../../components/Navbar.js';

export default async function DashboardLayout({ children }) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar user={user} />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar user={user} />

        {/* Page Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
