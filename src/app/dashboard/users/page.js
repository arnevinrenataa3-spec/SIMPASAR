/**
 * @description Halaman server untuk manajemen akun admin dan petugas pasar.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah, Aditya Syahestiano
 */

import { getSession } from '../../../lib/auth.js';
import { db } from '../../../db/index.js';
import { users, pasar } from '../../../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import UserTable from './UserTable.js';

export default async function UsersPage() {
  const session = await getSession();

  // Menu yang disembunyikan bukan pengaman; URL tetap harus dilindungi di server.
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
          Halaman ini khusus untuk pengguna dengan role <strong>Admin</strong>. Anda tidak memiliki izin untuk mengelola akun petugas/admin.
        </p>
      </div>
    );
  }

  // Left join tetap menampilkan admin yang memang tidak terikat ke satu pasar.
  const userList = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      pasarId: users.pasarId,
      namaPasar: pasar.namaPasar,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(pasar, eq(users.pasarId, pasar.id))
    .orderBy(asc(users.name));

  const pasars = await db
    .select({
      id: pasar.id,
      namaPasar: pasar.namaPasar,
    })
    .from(pasar)
    .orderBy(asc(pasar.namaPasar));

  return (
    <UserTable
      users={userList}
      pasars={pasars}
      currentUserId={session.id}
      selectedScope={'all'}
    />
  );
}
