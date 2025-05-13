import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

// Create a connection pool
const pool = mysql.createPool({
  host: env.DATABASE_HOST || 'localhost',
  user: env.DATABASE_USER || 'root',
  password: env.DATABASE_PASSWORD || 'password',
  database: env.DATABASE_NAME || 'lost_and_found',
  port: parseInt(env.DATABASE_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
