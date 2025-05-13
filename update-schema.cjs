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
  
  // Commit the transaction
  db.prepare('COMMIT').run();
  
  console.log('Database schema updated successfully!');
  
  // Verify the updated schema
  console.log('\nUpdated schema:');
  const updatedSchema = db.prepare("PRAGMA table_info(items)").all();
  console.log(updatedSchema.map(col => col.name).join(', '));
  
} catch (error) {
  // Rollback the transaction in case of error
  db.prepare('ROLLBACK').run();
  console.error('Error updating database schema:', error);
} finally {
  // Close the database connection
  db.close();
}
