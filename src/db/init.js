/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

import { runMigrations } from './migrate.js';
import { seed } from './seed.js';
import logger from '../lib/logger.js';

const initLogger = logger.child('DB:Init');

export async function runMigrationsAndSeed() {
  initLogger.info('Running migrations and seeder on startup...');
  try {
    await runMigrations();
    await seed();
    initLogger.info('Migrations and seeding completed successfully.');
  } catch (error) {
    initLogger.error('Migration/Seeding failed on startup:', error);
  }
}
