-- SQLite schema for Lost and Found application

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('lost', 'found', 'claimed')),
  location TEXT,
  floor TEXT,
  room_number TEXT,
  date_reported DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  reporter_phone TEXT,
  image_url TEXT,
  user_id INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create categories table for predefined categories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default categories
INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Accessories'),
  ('Documents'),
  ('Keys'),
  ('Bags'),
  ('Other');

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email and username
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Create claims table to track item claims
CREATE TABLE IF NOT EXISTS claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  claim_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create admin table for administrative users
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for admin user_id
CREATE INDEX idx_admins_user_id ON admins(user_id);
