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
  try {
    // Ensure id is a number
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      console.error(`Invalid item ID: ${id} is not a number`);
      return null;
    }

    console.log(`Getting item with ID: ${numericId}`);

    // Execute the query with the numeric ID
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(numericId);

    if (!item) {
      console.error(`No item found with ID: ${numericId}`);
      return null;
    }

    console.log(`Found item with ID ${numericId}:`, JSON.stringify(item, null, 2));
    return item;
  } catch (error) {
    console.error(`Error in getItemById(${id}):`, error);
    return null;
  }
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
  try {
    // Ensure id is a number
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      console.error(`Invalid item ID: ${id} is not a number`);
      return null;
    }

    // Log the update operation
    console.log(`SQLite updateItem for ID ${numericId}:`, JSON.stringify(item, null, 2));

    // First, check if the item exists
    const existingItem = getItemById(numericId);
    if (!existingItem) {
      console.error(`Item with ID ${numericId} not found in database`);
      return null;
    }

    console.log(`Existing item found:`, JSON.stringify(existingItem, null, 2));

    // Prepare the SQL statement
    const sql = `
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
        user_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    // Validate required fields
    if (!item.title) {
      console.error('Title is required for update');
      return null;
    }

    if (!item.category) {
      console.error('Category is required for update');
      return null;
    }

    // Prepare parameters with proper type handling
    const title = String(item.title);
    const description = item.description ? String(item.description) : null;
    const category = String(item.category);
    const status = String(item.status || 'lost');
    const location = item.location ? String(item.location) : null;
    const floor = item.floor ? String(item.floor) : null;
    const roomNumber = item.room_number ? String(item.room_number) : null;
    const reporterName = item.reporter_name ? String(item.reporter_name) : null;
    const reporterEmail = item.reporter_email ? String(item.reporter_email) : null;
    const reporterPhone = item.reporter_phone ? String(item.reporter_phone) : null;
    const imageUrl = item.image_url ? String(item.image_url) : null;

    // Handle user_id specially to ensure it's a number or null
    let userId = null;
    if (item.user_id !== undefined && item.user_id !== null) {
      userId = parseInt(item.user_id, 10);
      if (isNaN(userId)) {
        console.warn(`Invalid user_id: ${item.user_id}, setting to null`);
        userId = null;
      }
    }

    console.log(`Executing SQL: ${sql}`);

    // Log all parameters
    console.log(`SQL parameters for update:
      title: ${title}
      description: ${description}
      category: ${category}
      status: ${status}
      location: ${location}
      floor: ${floor}
      room_number: ${roomNumber}
      reporter_name: ${reporterName}
      reporter_email: ${reporterEmail}
      reporter_phone: ${reporterPhone}
      image_url: ${imageUrl}
      user_id: ${userId}
      id: ${numericId}
    `);

    // Prepare and execute the statement
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(
        title,
        description,
        category,
        status,
        location,
        floor,
        roomNumber,
        reporterName,
        reporterEmail,
        reporterPhone,
        imageUrl,
        userId,
        numericId
      );

      console.log(`Update result:`, JSON.stringify(result, null, 2));

      if (result.changes > 0) {
        // Get the updated item to return
        const updatedItem = getItemById(numericId);
        console.log(`Updated item:`, JSON.stringify(updatedItem, null, 2));
        return updatedItem;
      }

      console.log(`No changes made to item ${numericId}`);
      return existingItem; // Return the existing item if no changes were made
    } catch (sqlError) {
      console.error(`SQL error in updateItem:`, sqlError);
      throw sqlError;
    }
  } catch (error) {
    console.error(`Error in updateItem function:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export function deleteItem(id) {
  try {
    // Ensure id is a number
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      console.error(`Invalid item ID: ${id} is not a number`);
      return false;
    }

    console.log(`Deleting item with ID: ${numericId}`);

    // First check if the item exists
    const item = getItemById(numericId);
    if (!item) {
      console.error(`Item with ID ${numericId} not found for deletion`);
      return false;
    }

    // Execute the delete operation
    const result = db.prepare('DELETE FROM items WHERE id = ?').run(numericId);

    console.log(`Delete result:`, result);
    return result.changes > 0;
  } catch (error) {
    console.error(`Error in deleteItem function:`, error);
    return false;
  }
}

// Category-related functions
export function getCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY name').all();
}

export default {
  db, // Export the database object for debugging
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
