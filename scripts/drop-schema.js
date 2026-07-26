/**
 * @description 
 * @author Aditya Syahestiano
 */

import postgres from 'postgres';
import logger from '../src/lib/logger.js';

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, { prepare: false });

async function reset() {
  try {
    logger.info('Dropping tables and types...');
    await client`DROP TABLE IF EXISTS perizinan CASCADE`;
    await client`DROP TABLE IF EXISTS ruang_dagang CASCADE`;
    await client`DROP TABLE IF EXISTS users CASCADE`;
    await client`DROP TABLE IF EXISTS pedagang CASCADE`;
    await client`DROP TABLE IF EXISTS pasar CASCADE`;
    await client`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`;

    await client`DROP TYPE IF EXISTS status_izin CASCADE`;
    await client`DROP TYPE IF EXISTS role CASCADE`;
    await client`DROP TYPE IF EXISTS jenis_ruang CASCADE`;
    await client`DROP TYPE IF EXISTS status_ruang CASCADE`;
    await client`DROP TYPE IF EXISTS status_teguran CASCADE`;
    
    logger.info('Tables and types dropped.');
  } catch (err) {
    logger.error('Failed to drop tables and types:', err);
  } finally {
    await client.end();
  }
  process.exit(0);
}

reset();
