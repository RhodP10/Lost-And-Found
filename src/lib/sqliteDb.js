// SQLite database utility for the Lost and Found application
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../database/lost_and_found.sqlite');

// Create and export database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// User-related functions
export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function findUserByUsernameOrEmail(identifier) {
  return db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(identifier, identifier);
}

export async function createUser(userData) {
  // Check if email or username already exists
  if (findUserByEmail(userData.email)) {
    throw new Error('Email already in use');
  }
  
  if (findUserByUsername(userData.username)) {
    throw new Error('Username already taken');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  // Insert user into database
  const stmt = db.prepare(`
    INSERT INTO users (email, username, password, full_name)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    userData.email,
    userData.username,
    hashedPassword,
    userData.full_name || null
  );
  
  if (result.lastInsertRowid) {
    // Get the created user
    const newUser = db.prepare('SELECT id, email, username, full_name, created_at, updated_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    return newUser;
  } else {
    throw new Error('Failed to create user');
  }
}

export async function verifyUser(identifier, password) {
  const user = findUserByUsernameOrEmail(identifier);
  
  if (!user) {
    return null;
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Item-related functions
export function getItems(filters = {}) {
  let query = 'SELECT * FROM items';
  const params = [];
  const conditions = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }

  if (filters.user_id) {
    conditions.push('user_id = ?');
    params.push(filters.user_id);
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
}

export function getItemById(id) {
  return db.prepare('SELECT * FROM items WHERE id = ?').get(id);
}

export function createItem(item) {
  const stmt = db.prepare(`
    INSERT INTO items (
      title, description, category, status, location, floor, room_number,
      reporter_name, reporter_email, reporter_phone, image_url, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    item.title,
    item.description || null,
    item.category,
    item.status,
    item.location || null,
    item.floor || null,
    item.room_number || null,
    item.reporter_name,
    item.reporter_email,
    item.reporter_phone || null,
    item.image_url || null,
    item.user_id || null
  );

  if (result.lastInsertRowid) {
    return {
      id: result.lastInsertRowid,
      ...item
    };
  }

  return null;
}

export function updateItem(id, item) {
  const stmt = db.prepare(`
    UPDATE items SET
      title = ?,
      description = ?,
      category = ?,
      status = ?,
      location = ?,
      floor = ?,
      room_number = ?,
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
    item.floor || null,
    item.room_number || null,
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
}

export function deleteItem(id) {
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return result.changes > 0;
}

// Category-related functions
export function getCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY name').all();
}

export default {
  findUserByEmail,
  findUserByUsername,
  findUserByUsernameOrEmail,
  createUser,
  verifyUser,
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getCategories
};
