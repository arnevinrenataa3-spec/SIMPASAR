/**
 * @description Seeder data awal pengguna (admin & petugas default) dan data pasar.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { db } from './index.js';
import { users } from './schema.js';
import { hashPassword } from '../lib/password.js';
import { eq } from 'drizzle-orm';
import logger from '../lib/logger.js';

const seedLogger = logger.child('DB:Seed');

export async function seed() {
  seedLogger.info('Seeding initial users...');

  const adminPasswordHash = await hashPassword('admin123');

  // Pemeriksaan ini membuat seed idempoten: startup berulang tidak membuat admin duplikat.
  const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin'));
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      name: 'Administrator SIMPASAR',
      username: 'admin',
      password: adminPasswordHash,
      role: 'admin',
    });
    seedLogger.info('Created user: admin / admin123');
  } else {
    seedLogger.info('User "admin" already exists.');
  }

  seedLogger.info('Seeding completed successfully.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Saat diimpor init.js, pemanggil yang mengatur alur; saat dijalankan langsung, skrip mengatur exit code.
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      seedLogger.error('Seed failed:', err);
      process.exit(1);
    });
}
