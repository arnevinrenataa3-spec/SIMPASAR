/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

import { db } from './index.js';
import { users } from './schema.js';
import { hashPassword } from '../lib/password.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding initial users...');

  const adminPasswordHash = await hashPassword('admin123');
  const petugasPasswordHash = await hashPassword('petugas123');

  const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin'));
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      name: 'Administrator SIMPASAR',
      username: 'admin',
      password: adminPasswordHash,
      role: 'admin',
    });
    console.log('Created user: admin / admin123');
  } else {
    console.log('User "admin" already exists.');
  }

  const existingPetugas = await db.select().from(users).where(eq(users.username, 'petugas'));
  if (existingPetugas.length === 0) {
    await db.insert(users).values({
      name: 'Petugas Pengelola',
      username: 'petugas',
      password: petugasPasswordHash,
      role: 'petugas',
    });
    console.log('Created user: petugas / petugas123');
  } else {
    console.log('User "petugas" already exists.');
  }

  console.log('Seeding completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
