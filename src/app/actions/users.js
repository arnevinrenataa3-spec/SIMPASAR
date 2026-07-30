'use server';

/**
 * @description Server Action untuk Manajemen Pengguna / User (Admin & Petugas).
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { eq, ne, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { hashPassword } from '../../lib/password.js';
import { defineAction } from '../../lib/pipeline.js';

const createSchema = z.object({
  name: z.string().min(1, 'Nama lengkap wajib diisi.'),
  username: z.string().min(1, 'Username wajib diisi.'),
  password: z.string().min(1, 'Password wajib diisi.'),
  role: z.enum(['admin', 'petugas'], { message: 'Role tidak valid.' }),
  pasarId: z.string().optional().default(''),
});

const updateSchema = z.object({
  id: z.string().min(1, 'ID user tidak valid.'),
  name: z.string().min(1, 'Nama lengkap wajib diisi.'),
  username: z.string().min(1, 'Username wajib diisi.'),
  password: z.string().optional().default(''),
  role: z.enum(['admin', 'petugas'], { message: 'Role tidak valid.' }),
  pasarId: z.string().optional().default(''),
});

const deleteSchema = z.object({
  id: z.string().min(1, 'ID user tidak valid.'),
});

export const createUserAction = defineAction({
  operasi: 'users:crud',
  schema: createSchema,
  revalidate: ['/dashboard/users'],
  execute: async (data) => {
    const pasarId = data.role === 'admin' ? null : data.pasarId;

    if (data.role === 'petugas' && !pasarId) {
      return { error: 'Petugas wajib ditugaskan ke sebuah Pasar.' };
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username.toLowerCase()));

    if (existing.length > 0) {
      return { error: 'Username sudah terdaftar. Silakan gunakan username lain.' };
    }

    const passwordHash = await hashPassword(data.password);

    await db.insert(users).values({
      name: data.name,
      username: data.username.toLowerCase(),
      password: passwordHash,
      role: data.role,
      pasarId,
    });

    return { message: `User "${data.username}" berhasil dibuat.` };
  },
});

export const updateUserAction = defineAction({
  operasi: 'users:crud',
  schema: updateSchema,
  revalidate: ['/dashboard/users'],
  execute: async (data) => {
    const pasarId = data.role === 'admin' ? null : data.pasarId;

    if (data.role === 'petugas' && !pasarId) {
      return { error: 'Petugas wajib ditugaskan ke sebuah Pasar.' };
    }

    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.username, data.username.toLowerCase()), ne(users.id, data.id)));

    if (existing.length > 0) {
      return { error: 'Username sudah digunakan oleh akun lain.' };
    }

    const updateData = {
      name: data.name,
      username: data.username.toLowerCase(),
      role: data.role,
      pasarId,
      updatedAt: new Date(),
    };

    if (data.password && data.password.trim() !== '') {
      updateData.password = await hashPassword(data.password);
    }

    await db.update(users).set(updateData).where(eq(users.id, data.id));

    return { message: `User "${data.username}" berhasil diperbarui.` };
  },
});

export const deleteUserAction = defineAction({
  operasi: 'users:crud',
  schema: deleteSchema,
  revalidate: ['/dashboard/users'],
  execute: async (data, ctx) => {
    if (data.id === ctx.user.id) {
      return { error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' };
    }

    await db.delete(users).where(eq(users.id, data.id));

    return { message: 'User berhasil dihapus.' };
  },
});
