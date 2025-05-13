// Database configuration
export const DB_CONFIG = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'lost_and_found',
  port: process.env.DATABASE_PORT || 3306
};
