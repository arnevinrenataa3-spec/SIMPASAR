/**
 * @description Skrip pengembangan untuk mengosongkan seluruh data tanpa menghapus struktur tabel.
 * @author Arnevin Renata Ahmad Barkah
 */

import { db } from '../src/db/index.js';
import { sql } from 'drizzle-orm';
import logger from '../src/lib/logger.js';

async function reset() {
  try {
    logger.info('Truncating tables...');
    // CASCADE ikut mengosongkan tabel yang bergantung melalui foreign key, termasuk riwayat teguran.
    await db.execute(sql`TRUNCATE TABLE perizinan, ruang_dagang, users, pedagang CASCADE;`);
    logger.info('Tables truncated.');
  } catch (err) {
    logger.error('Failed to truncate tables:', err);
  }
  process.exit(0);
}

reset();
