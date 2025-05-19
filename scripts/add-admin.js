// Script to add an admin user
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../database/lost_and_found.sqlite');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function addAdmin() {
  try {
    // Create database connection
    const db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    console.log('=== Add Admin User ===');
    
    // Get user identifier
    const identifier = await prompt('Enter user email or username: ');
    
    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier, identifier);
    
    if (!user) {
      console.error(`User with email/username "${identifier}" not found.`);
      rl.close();
      db.close();
      return;
    }
    
    console.log(`Found user: ${user.username} (${user.email})`);
    
    // Check if user is already an admin
    const existingAdmin = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(user.id);
    
    if (existingAdmin) {
      console.log(`User is already an admin with role: ${existingAdmin.role}`);
      rl.close();
      db.close();
      return;
    }
    
    // Get admin role
    const role = await prompt('Enter admin role (default: admin): ') || 'admin';
    
    // Get permissions (optional)
    const permissions = await prompt('Enter permissions (optional, JSON format): ') || null;
    
    // Add user as admin
    const stmt = db.prepare(`
      INSERT INTO admins (user_id, role, permissions)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(user.id, role, permissions);
    
    if (result.lastInsertRowid) {
      console.log(`User "${user.username}" has been added as an admin with role "${role}".`);
    } else {
      console.error('Failed to add admin.');
    }
    
    // Close connections
    rl.close();
    db.close();
    
  } catch (error) {
    console.error('Error adding admin:', error);
    rl.close();
  }
}

// Run the script
addAdmin();
