// Script to check the database schema
const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database', 'lost_and_found.db');

// Create database connection
const db = new Database(dbPath);

try {
  // Get schema for items table
  console.log('\n=== ITEMS TABLE SCHEMA ===');
  const itemsSchema = db.prepare("PRAGMA table_info(items)").all();
  console.log(JSON.stringify(itemsSchema, null, 2));
  
} catch (error) {
  console.error('Error accessing database:', error);
} finally {
  // Close the database connection
  db.close();
}
