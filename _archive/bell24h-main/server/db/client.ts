/**
 * Database client for Bell24H application
 * 
 * This provides a central database connection instance to be used across the application
 */
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Create the connection pool to the database
const connectionPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bell24h',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize drizzle with the connection
const db = drizzle(connectionPool);

export { db };
export default db;
