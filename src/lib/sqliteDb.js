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
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create admin table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Create default admin user if no users exist
const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (usersCount.count === 0) {
  // Default admin credentials
  const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // This will be hashed
    full_name: 'System Administrator'
  };

  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(adminUser.password, salt);

  // Insert admin user
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, full_name)
    VALUES (?, ?, ?, ?)
  `);

  const userResult = insertUser.run(
    adminUser.username,
    adminUser.email,
    hashedPassword,
    adminUser.full_name
  );

  // If user was created successfully, make them an admin
  if (userResult.lastInsertRowid) {
    const insertAdmin = db.prepare(`
      INSERT INTO admins (user_id, role, permissions)
      VALUES (?, ?, ?)
    `);

    insertAdmin.run(
      userResult.lastInsertRowid,
      'admin',
      JSON.stringify({ all: true })
    );

    console.log('Default admin user created:');
    console.log('Username: admin');
    console.log('Password: admin123');
  }
}

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

export function updateUser(id, userData) {
  // Build the SQL query dynamically based on what fields are being updated
  let fields = [];
  let params = [];

  if (userData.username !== undefined) {
    fields.push('username = ?');
    params.push(userData.username);
  }

  if (userData.email !== undefined) {
    fields.push('email = ?');
    params.push(userData.email);
  }

  if (userData.full_name !== undefined) {
    fields.push('full_name = ?');
    params.push(userData.full_name);
  }

  if (userData.password !== undefined) {
    fields.push('password = ?');
    params.push(userData.password);
  }

  // Always update the updated_at timestamp
  fields.push('updated_at = CURRENT_TIMESTAMP');

  // Add the ID as the last parameter
  params.push(id);

  // Create and execute the update statement
  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  const result = db.prepare(query).run(...params);

  if (result.changes > 0) {
    // Return the updated user
    return db.prepare('SELECT id, username, email, full_name, created_at, updated_at FROM users WHERE id = ?').get(id);
  }

  return null;
}

// Admin-related functions
export function isUserAdmin(userId) {
  try {
    return db.prepare('SELECT * FROM admins WHERE user_id = ?').get(userId) !== undefined;
  } catch (error) {
    // If the admins table doesn't exist, create it
    if (error.message.includes('no such table')) {
      console.log('Creating admins table...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          permissions TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      return false;
    }
    throw error;
  }
}

export function getAdminByUserId(userId) {
  try {
    return db.prepare('SELECT * FROM admins WHERE user_id = ?').get(userId);
  } catch (error) {
    // If the admins table doesn't exist, return null
    if (error.message.includes('no such table')) {
      return null;
    }
    throw error;
  }
}

export function getAllAdmins() {
  try {
    return db.prepare(`
      SELECT a.*, u.username, u.email, u.full_name
      FROM admins a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `).all();
  } catch (error) {
    // If the admins table doesn't exist, return empty array
    if (error.message.includes('no such table')) {
      return [];
    }
    throw error;
  }
}

export function addAdmin(userId, role = 'admin', permissions = null) {
  // Check if user exists
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if user is already an admin
  if (isUserAdmin(userId)) {
    throw new Error('User is already an admin');
  }

  // Add user as admin
  const stmt = db.prepare(`
    INSERT INTO admins (user_id, role, permissions)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(userId, role, permissions);

  if (result.lastInsertRowid) {
    return getAdminByUserId(userId);
  } else {
    throw new Error('Failed to add admin');
  }
}

export function updateAdminPermissions(adminId, permissions) {
  const stmt = db.prepare(`
    UPDATE admins
    SET permissions = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = stmt.run(permissions, adminId);

  if (result.changes > 0) {
    return db.prepare('SELECT * FROM admins WHERE id = ?').get(adminId);
  }

  return null;
}

export function updateAdminRole(adminId, role) {
  const stmt = db.prepare(`
    UPDATE admins
    SET role = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = stmt.run(role, adminId);

  if (result.changes > 0) {
    return db.prepare('SELECT * FROM admins WHERE id = ?').get(adminId);
  }

  return null;
}

export function removeAdmin(adminId) {
  const result = db.prepare('DELETE FROM admins WHERE id = ?').run(adminId);
  return result.changes > 0;
}

export function removeAdminByUserId(userId) {
  const result = db.prepare('DELETE FROM admins WHERE user_id = ?').run(userId);
  return result.changes > 0;
}

export default {
  findUserByEmail,
  findUserByUsername,
  findUserByUsernameOrEmail,
  createUser,
  verifyUser,
  updateUser,
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getCategories,
  // Admin functions
  isUserAdmin,
  getAdminByUserId,
  getAllAdmins,
  addAdmin,
  updateAdminPermissions,
  updateAdminRole,
  removeAdmin,
  removeAdminByUserId
};
