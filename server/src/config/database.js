import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Check if DATABASE_URL contains render.com (cloud database needs SSL)
const isCloudDatabase = process.env.DATABASE_URL?.includes('render.com') ||
  process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isCloudDatabase ? { rejectUnauthorized: false } : false,
  // Add connection pool settings for better reliability
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');
    console.log('✅ Database time:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err;
  }
};

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

export default pool;