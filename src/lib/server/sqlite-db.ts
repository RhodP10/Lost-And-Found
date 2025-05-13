import Database from 'better-sqlite3';
import { dev } from '$app/environment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the database directory exists
const dbDir = path.join(__dirname, '../../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'lost_and_found.db');

// Create and initialize the database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('lost', 'found', 'claimed')),
    location TEXT,
    floor TEXT,
    room_number TEXT,
    date_reported TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reporter_name TEXT NOT NULL,
    reporter_email TEXT NOT NULL,
    reporter_phone TEXT,
    student_id TEXT,
    image_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default categories if they don't exist
const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoriesCount.count === 0) {
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  const defaultCategories = [
    'Electronics',
    'Clothing',
    'Accessories',
    'Documents',
    'Keys',
    'Bags',
    'Other'
  ];

  defaultCategories.forEach(category => {
    insertCategory.run(category);
  });
}

// Insert sample data in development mode
if (dev) {
  const itemsCount = db.prepare('SELECT COUNT(*) as count FROM items').get();
  if (itemsCount.count === 0) {
    // Sample lost items
    const lostItems = [
      {
        title: 'Blue Backpack',
        description: 'Lost my blue North Face backpack with laptop inside. Last seen in the library.',
        category: 'Bags',
        status: 'lost',
        location: 'Main Campus',
        floor: '2nd Floor',
        room_number: 'Room 203',
        reporter_name: 'John Smith',
        reporter_email: 'john@example.com',
        reporter_phone: '555-123-4567',
        student_id: 'S12345'
      },
      {
        title: 'iPhone 13 Pro',
        description: 'Lost my iPhone 13 Pro with a black case. The lock screen has a picture of a dog.',
        category: 'Electronics',
        status: 'lost',
        location: 'Student Center',
        floor: '1st Floor',
        room_number: 'Cafeteria',
        reporter_name: 'Emily Johnson',
        reporter_email: 'emily@example.com',
        student_id: 'S23456'
      },
      {
        title: 'Car Keys',
        description: 'Lost my Toyota car keys with a red keychain.',
        category: 'Keys',
        status: 'lost',
        location: 'Science Building',
        floor: '3rd Floor',
        room_number: 'Lab 305',
        reporter_name: 'Michael Brown',
        reporter_email: 'michael@example.com',
        reporter_phone: '555-987-6543',
        student_id: 'S34567'
      }
    ];

    // Sample found items
    const foundItems = [
      {
        title: 'Black Wallet',
        description: 'Found a black leather wallet with ID and credit cards inside.',
        category: 'Accessories',
        status: 'found',
        location: 'Engineering Building',
        floor: 'Ground Floor',
        room_number: 'Lobby',
        reporter_name: 'Sarah Wilson',
        reporter_email: 'sarah@example.com',
        student_id: 'S45678'
      },
      {
        title: 'Prescription Glasses',
        description: 'Found a pair of prescription glasses with tortoise shell frames.',
        category: 'Accessories',
        status: 'found',
        location: 'Library',
        floor: '3rd Floor',
        room_number: 'Study Room 3B',
        reporter_name: 'David Lee',
        reporter_email: 'david@example.com',
        reporter_phone: '555-456-7890',
        student_id: 'S56789'
      },
      {
        title: 'Textbook',
        description: 'Found a calculus textbook with the name "Jessica" written inside.',
        category: 'Other',
        status: 'found',
        location: 'Science Building',
        floor: '2nd Floor',
        room_number: 'Classroom 201',
        reporter_name: 'Robert Taylor',
        reporter_email: 'robert@example.com',
        student_id: 'S67890'
      }
    ];

    const insertItem = db.prepare(`
      INSERT INTO items (
        title, description, category, status, location, floor, room_number,
        reporter_name, reporter_email, reporter_phone, student_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert sample items
    [...lostItems, ...foundItems].forEach(item => {
      insertItem.run(
        item.title,
        item.description,
        item.category,
        item.status,
        item.location,
        item.floor || null,
        item.room_number || null,
        item.reporter_name,
        item.reporter_email,
        item.reporter_phone || null,
        item.student_id || null
      );
    });
  }
}

// Database interface
export const sqliteDb = {
  // Categories
  getCategories: () => {
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  },

  // Items
  getItems: (filters: { status?: string; category?: string; limit?: number } = {}) => {
    let query = 'SELECT * FROM items';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date_reported DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return db.prepare(query).all(...params);
  },

  getItemById: (id: number) => {
    return db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  },

  createItem: (item: any) => {
    const stmt = db.prepare(`
      INSERT INTO items (
        title, description, category, status, location,
        reporter_name, reporter_email, reporter_phone, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      item.title,
      item.description || null,
      item.category,
      item.status,
      item.location || null,
      item.reporter_name,
      item.reporter_email,
      item.reporter_phone || null,
      item.image_url || null
    );

    if (result.lastInsertRowid) {
      return {
        id: result.lastInsertRowid,
        ...item
      };
    }

    return null;
  },

  updateItem: (id: number, item: any) => {
    const stmt = db.prepare(`
      UPDATE items SET
        title = ?,
        description = ?,
        category = ?,
        status = ?,
        location = ?,
        reporter_name = ?,
        reporter_email = ?,
        reporter_phone = ?,
        image_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      item.title,
      item.description || null,
      item.category,
      item.status,
      item.location || null,
      item.reporter_name,
      item.reporter_email,
      item.reporter_phone || null,
      item.image_url || null,
      id
    );

    if (result.changes > 0) {
      return {
        id,
        ...item
      };
    }

    return null;
  },

  deleteItem: (id: number) => {
    const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
    return result.changes > 0;
  }
};

export default sqliteDb;
