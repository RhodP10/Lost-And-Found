import { json } from '@sveltejs/kit';
import { db } from '$lib/sqliteDb';

export async function GET({ url }) {
  try {
    const userId = url.searchParams.get('id');

    // If userId is provided, get a single user
    if (userId) {
      const user = db.prepare(`
        SELECT id, username, email, full_name, created_at, updated_at
        FROM users
        WHERE id = ?
      `).get(userId);

      if (!user) {
        return json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      return json({
        success: true,
        user
      });
    }

    // Otherwise, get all users
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

// Update a user
export async function PUT({ request, url }) {
  try {
    const userId = url.searchParams.get('id');

    if (!userId) {
      return json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      return json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const userData = await request.json();

    // Validate required fields
    if (!userData.username || !userData.email) {
      return json({
        success: false,
        error: 'Username and email are required'
      }, { status: 400 });
    }

    // Check if username or email already exists for another user
    const duplicateUser = db.prepare(`
      SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?
    `).get(userData.username, userData.email, userId);

    if (duplicateUser) {
      return json({
        success: false,
        error: 'Username or email already exists'
      }, { status: 400 });
    }

    // Update user
    const updateFields = [];
    const updateValues = [];

    if (userData.username) {
      updateFields.push('username = ?');
      updateValues.push(userData.username);
    }

    if (userData.email) {
      updateFields.push('email = ?');
      updateValues.push(userData.email);
    }

    if (userData.full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(userData.full_name || null);
    }

    if (userData.password) {
      updateFields.push('password = ?');
      updateValues.push(userData.password); // Note: In a real app, this should be hashed
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    // Add userId to values array
    updateValues.push(userId);

    const result = db.prepare(`
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).run(...updateValues);

    if (result.changes > 0) {
      // Get the updated user
      const updatedUser = db.prepare(`
        SELECT id, username, email, full_name, created_at, updated_at
        FROM users
        WHERE id = ?
      `).get(userId);

      return json({
        success: true,
        user: updatedUser
      });
    } else {
      return json({
        success: false,
        error: 'No changes were made'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

// Delete a user
export async function DELETE({ url }) {
  try {
    const userId = url.searchParams.get('id');
    console.log('DELETE user request received for ID:', userId);

    if (!userId) {
      console.log('No user ID provided');
      return json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
    console.log('Existing user:', existingUser);

    if (!existingUser) {
      console.log('User not found');
      return json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check if user is an admin
    const isAdmin = db.prepare('SELECT id FROM admins WHERE user_id = ?').get(userId);
    console.log('Is admin:', isAdmin ? 'Yes' : 'No');

    if (isAdmin) {
      console.log('Removing admin status first');
      // Remove from admins table first
      const adminResult = db.prepare('DELETE FROM admins WHERE user_id = ?').run(userId);
      console.log('Admin removal result:', adminResult);
    }

    // Check if user has any items
    const userItems = db.prepare('SELECT id FROM items WHERE user_id = ?').all(userId);
    console.log('User items:', userItems);

    if (userItems.length > 0) {
      console.log('User has items, removing user_id reference from items');
      // Update items to remove user_id reference
      const updateItemsResult = db.prepare('UPDATE items SET user_id = NULL WHERE user_id = ?').run(userId);
      console.log('Update items result:', updateItemsResult);
    }

    // Check if user has any claims
    try {
      const userClaims = db.prepare('SELECT id FROM claims WHERE user_id = ?').all(userId);
      console.log('User claims:', userClaims);

      if (userClaims.length > 0) {
        console.log('User has claims, removing claims');
        // Delete claims associated with the user
        const deleteClaimsResult = db.prepare('DELETE FROM claims WHERE user_id = ?').run(userId);
        console.log('Delete claims result:', deleteClaimsResult);
      }
    } catch (error) {
      // Claims table might not exist
      console.log('Claims table check error (might not exist):', error.message);
    }

    // Delete user
    console.log('Deleting user from database');
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    console.log('Delete result:', result);

    if (result.changes > 0) {
      console.log('User deleted successfully');
      return json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      console.log('No changes made when deleting user');
      return json({
        success: false,
        error: 'Failed to delete user'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}