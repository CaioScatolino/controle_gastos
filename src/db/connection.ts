import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Create mysql connection pool
const poolConnection = mysql.createPool(process.env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(poolConnection);
    