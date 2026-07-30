/**
 * @description Script inisialisasi migrasi & seeder otomatis pada startup server.
 * @author Muhamad Hazmi Alfarizqi
 */

import { runMigrations } from './migrate.js';
import { seed } from './seed.js';
import logger from '../lib/logger.js';

const initLogger = logger.child('DB:Init');

export async function runMigrationsAndSeed() {
  initLogger.info('Running migrations and seeder on startup...');
  try {
    // Seed dijalankan setelah migrasi agar tabel dan kolom yang dibutuhkan sudah tersedia.
    await runMigrations();
    await seed();
    initLogger.info('Migrations and seeding completed successfully.');
  } catch (error) {
    // Startup tetap dapat mencatat kegagalan; detail error sudah diteruskan ke logger server.
    initLogger.error('Migration/Seeding failed on startup:', error);
  }
}
