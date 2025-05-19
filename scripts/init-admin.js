// Script to initialize the database with an admin user
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../database/lost_and_found.sqlite');

console.log('Initializing admin user in database:', dbPath);

try {
  // Create database connection
  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Create admins table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      permissions TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  
  // Check if admin user already exists
  const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  
  if (adminUser) {
    console.log('Admin user already exists.');
    
    // Check if admin user is already an admin
    const isAdmin = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(adminUser.id);
    
    if (!isAdmin) {
      console.log('Making existing admin user an admin...');
      
      // Add admin role
      const insertAdmin = db.prepare(`
        INSERT INTO admins (user_id, role, permissions)
        VALUES (?, ?, ?)
      `);
      
      insertAdmin.run(
        adminUser.id,
        'admin',
        JSON.stringify({ all: true })
      );
      
      console.log('Admin role added successfully.');
    } else {
      console.log('User is already an admin.');
    }
  } else {
    console.log('Creating new admin user...');
    
    // Default admin credentials
    const newAdminUser = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed
      full_name: 'System Administrator'
    };
    
    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newAdminUser.password, salt);
    
    // Insert admin user
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, full_name)
      VALUES (?, ?, ?, ?)
    `);
    
    const userResult = insertUser.run(
      newAdminUser.username,
      newAdminUser.email,
      hashedPassword,
      newAdminUser.full_name
    );
    
    // If user was created successfully, make them an admin
    if (userResult.lastInsertRowid) {
      const insertAdmin = db.prepare(`
        INSERT INTO admins (user_id, role, permissions)
        VALUES (?, ?, ?)
      `);
      
      insertAdmin.run(
        userResult.lastInsertRowid,
        'admin',
        JSON.stringify({ all: true })
      );
      
      console.log('Admin user created successfully:');
      console.log('Username: admin');
      console.log('Password: admin123');
    }
  }
  
  // Close the database connection
  db.close();
  
  console.log('Database initialization complete.');
} catch (error) {
  console.error('Error initializing database:', error);
}
