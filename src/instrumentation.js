/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('./lib/logger.js');
    logger.info('Initializing Next.js server instrumentation...');
    const { runMigrationsAndSeed } = await import('./db/init.js');
    await runMigrationsAndSeed();
  }
}
