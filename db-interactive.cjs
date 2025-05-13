// Interactive database viewer (CommonJS version)
const Database = require('better-sqlite3');
const path = require('path');
const readline = require('readline');

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Display menu
function showMenu() {
  console.log('\n=== LOST & FOUND DATABASE VIEWER ===');
  console.log('1. Show all tables');
  console.log('2. Show all categories');
  console.log('3. Show all items');
  console.log('4. Show items by status');
  console.log('5. Show items by category');
  console.log('6. Search items');
  console.log('7. Show recent items (last 7 days)');
  console.log('8. Run custom SQL query');
  console.log('9. Exit');
  
  rl.question('\nEnter your choice (1-9): ', handleChoice);
}

// Handle user choice
function handleChoice(choice) {
  switch(choice) {
    case '1':
      showTables();
      break;
    case '2':
      showCategories();
      break;
    case '3':
      showItems();
      break;
    case '4':
      showItemsByStatus();
      break;
    case '5':
      showItemsByCategory();
      break;
    case '6':
      searchItems();
      break;
    case '7':
      showRecentItems();
      break;
    case '8':
      runCustomQuery();
      break;
    case '9':
      exitProgram();
      break;
    default:
      console.log('Invalid choice. Please try again.');
      showMenu();
  }
}

// Show all tables
function showTables() {
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(formatTable(tables));
  } catch (error) {
    console.error('Error:', error.message);
  }
  showMenu();
}

// Show all categories
function showCategories() {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    console.log(formatTable(categories));
  } catch (error) {
    console.error('Error:', error.message);
  }
  showMenu();
}

// Show all items
function showItems() {
  try {
    const items = db.prepare('SELECT * FROM items').all();
    console.log(formatTable(items));
  } catch (error) {
    console.error('Error:', error.message);
  }
  showMenu();
}

// Show items by status
function showItemsByStatus() {
  try {
    const itemsByStatus = db.prepare('SELECT status, COUNT(*) as count FROM items GROUP BY status').all();
    console.log(formatTable(itemsByStatus));
    
    rl.question('\nEnter status to view items (lost/found/claimed): ', (status) => {
      if (['lost', 'found', 'claimed'].includes(status.toLowerCase())) {
        const items = db.prepare('SELECT * FROM items WHERE status = ?').all(status.toLowerCase());
        console.log(formatTable(items));
      } else {
        console.log('Invalid status.');
      }
      showMenu();
    });
  } catch (error) {
    console.error('Error:', error.message);
    showMenu();
  }
}

// Show items by category
function showItemsByCategory() {
  try {
    const itemsByCategory = db.prepare('SELECT category, COUNT(*) as count FROM items GROUP BY category').all();
    console.log(formatTable(itemsByCategory));
    
    rl.question('\nEnter category name to view items: ', (category) => {
      const items = db.prepare('SELECT * FROM items WHERE category = ?').all(category);
      console.log(formatTable(items));
      showMenu();
    });
  } catch (error) {
    console.error('Error:', error.message);
    showMenu();
  }
}

// Search items
function searchItems() {
  rl.question('\nEnter search term: ', (term) => {
    try {
      const items = db.prepare(`
        SELECT * FROM items 
        WHERE title LIKE ? 
        OR description LIKE ? 
        OR location LIKE ?
        OR floor LIKE ?
        OR room_number LIKE ?
      `).all(`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`);
      
      console.log(formatTable(items));
    } catch (error) {
      console.error('Error:', error.message);
    }
    showMenu();
  });
}

// Show recent items
function showRecentItems() {
  try {
    const recentItems = db.prepare(`
      SELECT * FROM items 
      WHERE date_reported >= datetime('now', '-7 days')
      ORDER BY date_reported DESC
    `).all();
    console.log(formatTable(recentItems));
  } catch (error) {
    console.error('Error:', error.message);
  }
  showMenu();
}

// Run custom SQL query
function runCustomQuery() {
  rl.question('\nEnter SQL query: ', (query) => {
    try {
      const result = db.prepare(query).all();
      console.log(formatTable(result));
    } catch (error) {
      console.error('Error:', error.message);
    }
    showMenu();
  });
}

// Exit program
function exitProgram() {
  console.log('\nClosing database connection and exiting...');
  db.close();
  rl.close();
}

// Start the program
showMenu();
