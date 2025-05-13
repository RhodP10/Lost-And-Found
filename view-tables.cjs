// Script to view all tables and their contents
const Database = require('better-sqlite3');
const path = require('path');

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
  // Get all tables
  console.log('\n=== DATABASE TABLES ===');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log(formatTable(tables));
  
  // For each table, show its contents
  tables.forEach(table => {
    const tableName = table.name;
    console.log(`\n=== TABLE: ${tableName} ===`);
    
    try {
      // Get all rows from the table
      const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
      console.log(formatTable(rows));
      
      // Show count
      console.log(`Total rows: ${rows.length}`);
    } catch (error) {
      console.error(`Error reading table ${tableName}:`, error.message);
    }
  });
  
} catch (error) {
  console.error('Error accessing database:', error);
} finally {
  // Close the database connection
  db.close();
}
