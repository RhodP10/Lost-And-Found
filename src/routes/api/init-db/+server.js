import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../../../database/lost_and_found.sqlite');

export async function GET() {
  try {
    // Create database connection
    const db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create categories table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if categories exist
    const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    
    // If no categories exist, insert default ones
    if (categoriesCount.count === 0) {
      const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
      
      const defaultCategories = [
        'Electronics',
        'Clothing',
        'Accessories',
        'Documents',
        'Keys',
        'Bags',
        'Other'
      ];
      
      // Insert each category
      const insertMany = db.transaction((categories) => {
        for (const category of categories) {
          stmt.run(category);
        }
      });
      
      insertMany(defaultCategories);
    }
    
    // Get all categories
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    
    // Close the database connection
    db.close();
    
    return json({
      success: true,
      message: 'Database initialized successfully',
      categories
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return json({ 
      success: false, 
      error: 'Failed to initialize database',
      details: error.message
    }, { status: 500 });
  }
}
