// Simple script to view the SQLite database contents
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, 'database', 'lost_and_found.db');

// Create database connection
const db = new Database(dbPath);

// Function to format data as a table
function formatTable(data) {
  if (!data || data.length === 0) {
    return 'No data found';
  }
  
  // Get column names from the first row
  const columns = Object.keys(data[0]);
  
  // Calculate column widths
  const columnWidths = {};
  columns.forEach(col => {
    // Start with the column name length
    columnWidths[col] = col.length;
    
    // Check each row's value length
    data.forEach(row => {
      const value = row[col] === null ? 'NULL' : String(row[col]);
      columnWidths[col] = Math.max(columnWidths[col], value.length);
    });
  });
  
  // Create header row
  let table = '\n';
  columns.forEach(col => {
    table += col.padEnd(columnWidths[col] + 2);
  });
  table += '\n';
  
  // Create separator
  columns.forEach(col => {
    table += '-'.repeat(columnWidths[col]) + '  ';
  });
  table += '\n';
  
  // Create data rows
  data.forEach(row => {
    columns.forEach(col => {
      const value = row[col] === null ? 'NULL' : String(row[col]);
      table += value.padEnd(columnWidths[col] + 2);
    });
    table += '\n';
  });
  
  return table;
}

try {
  // View all tables
  console.log('\n=== DATABASE TABLES ===');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log(formatTable(tables));
  
  // View all categories
  console.log('\n=== CATEGORIES ===');
  const categories = db.prepare('SELECT * FROM categories').all();
  console.log(formatTable(categories));
  
  // View all items
  console.log('\n=== ITEMS ===');
  const items = db.prepare('SELECT * FROM items').all();
  console.log(formatTable(items));
  
  // Count items by status
  console.log('\n=== ITEMS BY STATUS ===');
  const itemsByStatus = db.prepare('SELECT status, COUNT(*) as count FROM items GROUP BY status').all();
  console.log(formatTable(itemsByStatus));
  
  // Count items by category
  console.log('\n=== ITEMS BY CATEGORY ===');
  const itemsByCategory = db.prepare('SELECT category, COUNT(*) as count FROM items GROUP BY category').all();
  console.log(formatTable(itemsByCategory));
  
} catch (error) {
  console.error('Error accessing database:', error);
} finally {
  // Close the database connection
  db.close();
}
