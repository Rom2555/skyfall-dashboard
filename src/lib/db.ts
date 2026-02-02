import { Pool } from 'pg';

const globalForDb = global as unknown as { db: Pool };

export const db =
  globalForDb.db ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
