import { json } from '@sveltejs/kit';
import { db } from '$lib/sqliteDb';

export async function GET() {
  try {
    // Get all users from database
    const users = db.prepare(`
      SELECT id, username, email, full_name, created_at, updated_at 
      FROM users
      ORDER BY created_at DESC
    `).all();

    return json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}

// Add a new user (for future use)
export async function POST({ request }) {
  try {
    const userData = await request.json();
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password) {
      return json({ 
        success: false, 
        error: 'Username, email, and password are required' 
      }, { status: 400 });
    }
    
    // Check if username or email already exists
    const existingUser = db.prepare(`
      SELECT id FROM users WHERE username = ? OR email = ?
    `).get(userData.username, userData.email);
    
    if (existingUser) {
      return json({ 
        success: false, 
        error: 'Username or email already exists' 
      }, { status: 400 });
    }
    
    // Insert new user
    const result = db.prepare(`
      INSERT INTO users (username, email, password, full_name)
      VALUES (?, ?, ?, ?)
    `).run(
      userData.username,
      userData.email,
      userData.password, // Note: In a real app, this should be hashed
      userData.full_name || null
    );
    
    if (result.lastInsertRowid) {
      // Get the created user
      const newUser = db.prepare(`
        SELECT id, username, email, full_name, created_at, updated_at 
        FROM users 
        WHERE id = ?
      `).get(result.lastInsertRowid);
      
      return json({
        success: true,
        user: newUser
      });
    } else {
      throw new Error('Failed to create user');
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return json({ 
      success: false, 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
}
