import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// PostgreSQL connection configuration
const dbConfig = {
  connectionString: process.env.DB_URI,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection function
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully');

    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);

    client.release();
    return true;
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    process.exit(1);
  }
};

// Database query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('⚡ Query executed:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Get client for transactions
const getClient = async () => {
  return await pool.connect();
};

export default connectDB;
export { pool, query, getClient };
