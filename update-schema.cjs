// Script to update the database schema
const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database', 'lost_and_found.db');

// Create database connection
const db = new Database(dbPath);

try {
  console.log('Updating database schema...');

  // Start a transaction
  db.prepare('BEGIN TRANSACTION').run();

  // Check if floor column exists
  const floorExists = db.prepare("PRAGMA table_info(items)").all()
    .some(col => col.name === 'floor');

  if (!floorExists) {
    console.log('Adding floor column...');
    db.prepare('ALTER TABLE items ADD COLUMN floor TEXT').run();
  }

  // Check if room_number column exists
  const roomNumberExists = db.prepare("PRAGMA table_info(items)").all()
    .some(col => col.name === 'room_number');

  if (!roomNumberExists) {
    console.log('Adding room_number column...');
    db.prepare('ALTER TABLE items ADD COLUMN room_number TEXT').run();
  }

  // Check if student_id column exists
  const studentIdExists = db.prepare("PRAGMA table_info(items)").all()
    .some(col => col.name === 'student_id');

  if (!studentIdExists) {
    console.log('Adding student_id column...');
    db.prepare('ALTER TABLE items ADD COLUMN student_id TEXT').run();
  }

  // Check if admins table exists
  const adminTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'").get();

  if (!adminTableExists) {
    console.log('Creating admins table...');
    db.prepare(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        permissions TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();

    // Create index for admin user_id
    db.prepare('CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id)').run();

    console.log('Admins table created successfully!');
  }

  // Commit the transaction
  db.prepare('COMMIT').run();

  console.log('Database schema updated successfully!');

  // Verify the updated schema
  console.log('\nUpdated items schema:');
  const updatedItemsSchema = db.prepare("PRAGMA table_info(items)").all();
  console.log(updatedItemsSchema.map(col => col.name).join(', '));

  // Verify admin table schema if it exists
  if (adminTableExists || !adminTableExists) {
    console.log('\nAdmin table schema:');
    const adminSchema = db.prepare("PRAGMA table_info(admins)").all();
    console.log(adminSchema.map(col => col.name).join(', '));
  }

} catch (error) {
  // Rollback the transaction in case of error
  db.prepare('ROLLBACK').run();
  console.error('Error updating database schema:', error);
} finally {
  // Close the database connection
  db.close();
}
