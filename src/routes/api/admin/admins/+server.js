import { json } from '@sveltejs/kit';
import { db, getAllAdmins, addAdmin, removeAdminByUserId } from '$lib/sqliteDb';

export async function GET() {
  try {
    // Get all admins with user details
    const admins = db.prepare(`
      SELECT a.*, u.username, u.email, u.full_name
      FROM admins a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `).all();

    return json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return json({ 
      success: false, 
      error: 'Failed to fetch admins' 
    }, { status: 500 });
  }
}

// Add a new admin
export async function POST({ request }) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.user_id) {
      return json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(data.user_id);
    if (!user) {
      return json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Check if user is already an admin
    const existingAdmin = db.prepare('SELECT id FROM admins WHERE user_id = ?').get(data.user_id);
    if (existingAdmin) {
      return json({ 
        success: false, 
        error: 'User is already an admin' 
      }, { status: 400 });
    }
    
    // Add user as admin
    const result = db.prepare(`
      INSERT INTO admins (user_id, role, permissions)
      VALUES (?, ?, ?)
    `).run(
      data.user_id,
      data.role || 'admin',
      data.permissions || null
    );
    
    if (result.lastInsertRowid) {
      // Get the created admin with user details
      const newAdmin = db.prepare(`
        SELECT a.*, u.username, u.email, u.full_name
        FROM admins a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `).get(result.lastInsertRowid);
      
      return json({
        success: true,
        admin: newAdmin
      });
    } else {
      throw new Error('Failed to add admin');
    }
  } catch (error) {
    console.error('Error adding admin:', error);
    return json({ 
      success: false, 
      error: 'Failed to add admin' 
    }, { status: 500 });
  }
}

// Delete an admin
export async function DELETE({ url }) {
  try {
    const userId = url.searchParams.get('user_id');
    
    if (!userId) {
      return json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Remove admin
    const result = db.prepare('DELETE FROM admins WHERE user_id = ?').run(userId);
    
    if (result.changes > 0) {
      return json({
        success: true,
        message: 'Admin removed successfully'
      });
    } else {
      return json({ 
        success: false, 
        error: 'Admin not found' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error removing admin:', error);
    return json({ 
      success: false, 
      error: 'Failed to remove admin' 
    }, { status: 500 });
  }
}
