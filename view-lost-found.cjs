// Script to view lost and found items
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
  // View lost items
  console.log('\n=== LOST ITEMS ===');
  const lostItems = db.prepare(`
    SELECT id, title, category, location, floor, room_number, date_reported, reporter_name, reporter_email, student_id
    FROM items 
    WHERE status = 'lost'
    ORDER BY date_reported DESC
  `).all();
  console.log(formatTable(lostItems));
  
  // View found items
  console.log('\n=== FOUND ITEMS ===');
  const foundItems = db.prepare(`
    SELECT id, title, category, location, floor, room_number, date_reported, reporter_name, reporter_email, student_id
    FROM items 
    WHERE status = 'found'
    ORDER BY date_reported DESC
  `).all();
  console.log(formatTable(foundItems));
  
  // Count items by location
  console.log('\n=== ITEMS BY LOCATION ===');
  const itemsByLocation = db.prepare(`
    SELECT location, status, COUNT(*) as count 
    FROM items 
    GROUP BY location, status
    ORDER BY location, status
  `).all();
  console.log(formatTable(itemsByLocation));
  
  // Count items by floor
  console.log('\n=== ITEMS BY FLOOR ===');
  const itemsByFloor = db.prepare(`
    SELECT floor, status, COUNT(*) as count 
    FROM items 
    WHERE floor IS NOT NULL
    GROUP BY floor, status
    ORDER BY floor, status
  `).all();
  console.log(formatTable(itemsByFloor));
  
  // Recent items (last 30 days)
  console.log('\n=== RECENT ITEMS (LAST 30 DAYS) ===');
  const recentItems = db.prepare(`
    SELECT id, title, status, category, location, floor, room_number, date_reported
    FROM items 
    WHERE date_reported >= datetime('now', '-30 days')
    ORDER BY date_reported DESC
  `).all();
  console.log(formatTable(recentItems));
  
} catch (error) {
  console.error('Error accessing database:', error);
} finally {
  // Close the database connection
  db.close();
}
