import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to our JSON "database" file
const usersFilePath = path.join(__dirname, '../../data/users.json');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
}

// Read all users
export function getUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Save users
export function saveUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
}

// Find user by email
export function findUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Find user by username
export function findUserByUsername(username) {
  const users = getUsers();
  return users.find(user => user.username.toLowerCase() === username.toLowerCase());
}

// Find user by username or email
export function findUserByUsernameOrEmail(identifier) {
  const users = getUsers();
  return users.find(
    user => 
      user.username.toLowerCase() === identifier.toLowerCase() || 
      user.email.toLowerCase() === identifier.toLowerCase()
  );
}

// Create a new user
export async function createUser(userData) {
  const users = getUsers();
  
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
  
  // Create new user with ID
  const newUser = {
    id: Date.now().toString(),
    email: userData.email,
    username: userData.username,
    password: hashedPassword,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Save to file
  if (saveUsers(users)) {
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } else {
    throw new Error('Failed to save user');
  }
}

// Verify user credentials
export async function verifyUser(username, password) {
  const user = findUserByUsernameOrEmail(username);
  
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
