/**
 * @description Konfigurasi Drizzle Kit untuk membaca schema dan menghasilkan migrasi PostgreSQL.
 * @author Muhamad Hazmi Alfarizqi
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Drizzle Kit membandingkan schema ini lalu menulis hasil migrasi ke folder drizzle.
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/simpasar',
  },
});
