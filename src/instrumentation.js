/**
 * @description Next.js instrumentation hook untuk auto-run migrasi & init server saat runtime Node.js siap.
 * @author Muhamad Hazmi Alfarizqi
 */

export async function register() {
  // Hook register dapat dipanggil untuk runtime lain; akses database hanya aman pada runtime Node.js.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import dinamis mencegah modul khusus server ikut dimuat pada runtime yang tidak membutuhkannya.
    const { logger } = await import('./lib/logger.js');
    logger.info('Initializing Next.js server instrumentation...');
    const { runMigrationsAndSeed } = await import('./db/init.js');
    await runMigrationsAndSeed();
  }
}
