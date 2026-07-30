/**
 * @description Inisialisasi koneksi database PostgreSQL dengan Drizzle ORM.
 * @author Muhamad Hazmi Alfarizqi
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Alamat database berasal dari environment agar berbeda untuk lokal, pengujian, dan produksi.
const connectionString = process.env.DATABASE_URL;

// prepare:false diperlukan agar koneksi kompatibel dengan pooler/proxy yang tidak mendukung prepared statement.
const client = postgres(connectionString, { prepare: false });

// Schema diberikan ke Drizzle agar query memiliki referensi tabel dan relasi yang sama.
export const db = drizzle(client, { schema });
