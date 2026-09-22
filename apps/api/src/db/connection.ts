import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Em produção ou na nuvem com SSL, habilita rejectUnauthorized: false para certificados de nuvem
const isCloud = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('tidbcloud') || process.env.DATABASE_URL.includes('ssl');

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: isCloud ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(poolConnection);
