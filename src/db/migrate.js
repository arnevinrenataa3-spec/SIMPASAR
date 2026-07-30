/**
 * @description Runner skrip eksekusi migrasi Drizzle Kit.
 * @author Muhamad Hazmi Alfarizqi
 */

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index.js';
import path from 'path';
import logger from '../lib/logger.js';

const dbLogger = logger.child('DB:Migrate');

export async function runMigrations() {
  dbLogger.info('Running database migrations...');
  try {
    // process.cwd() menunjuk akar proyek saat skrip dijalankan melalui npm.
    const migrationsFolder = path.join(process.cwd(), 'drizzle');
    await migrate(db, { migrationsFolder });
    dbLogger.info('Database migrations completed successfully.');
  } catch (error) {
    dbLogger.error('Migration failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Blok ini hanya berjalan saat file dieksekusi langsung, bukan ketika diimpor saat startup.
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
