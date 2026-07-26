/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Menggunakan connection string dari env
const connectionString = process.env.DATABASE_URL;

// Client postgres.js
const client = postgres(connectionString, { prepare: false });

// Export instance drizzle
export const db = drizzle(client, { schema });
