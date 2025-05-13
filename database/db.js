// SQLite database utility for the Lost and Found application
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, 'lost_and_found.sqlite');

// Create and export database connection
const db = new Database(dbPath, { verbose: console.log });

// Helper function to run a query with parameters
export function query(sql, params = []) {
  return db.prepare(sql).all(params);
}

// Helper function to get a single row
export function get(sql, params = []) {
  return db.prepare(sql).get(params);
}

// Helper function to run an insert and return the last inserted ID
export function insert(sql, params = []) {
  const stmt = db.prepare(sql);
  const info = stmt.run(params);
  return info.lastInsertRowid;
}

// Helper function to run an update and return the number of affected rows
export function update(sql, params = []) {
  const stmt = db.prepare(sql);
  const info = stmt.run(params);
  return info.changes;
}

// Helper function to run a delete and return the number of affected rows
export function remove(sql, params = []) {
  return update(sql, params);
}

// Helper function to run a transaction
export function transaction(callback) {
  const runTransaction = db.transaction(callback);
  return runTransaction();
}

export default db;
