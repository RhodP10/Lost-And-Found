import { json } from '@sveltejs/kit';
import { 
  isUserAdmin, 
  getAllAdmins, 
  addAdmin, 
  updateAdminPermissions, 
  updateAdminRole, 
  removeAdmin 
} from '$lib/sqliteDb';

// Helper function to check if the current user is an admin
function checkAdminAccess(request) {
  // In a real application, you would check the session or JWT token
  // For now, we'll assume the user ID is passed in the request headers
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return { authorized: false, error: 'Authentication required' };
  }
  
  if (!isUserAdmin(userId)) {
    return { authorized: false, error: 'Admin access required' };
  }
  
  return { authorized: true, userId };
}

// Get all admins
export async function GET({ request }) {
  // Check admin access
  const access = checkAdminAccess(request);
  if (!access.authorized) {
    return json({ error: access.error }, { status: 403 });
  }
  
  try {
    const admins = getAllAdmins();
    return json({ admins });
  } catch (error) {
    console.error('Error getting admins:', error);
    return json({ error: 'Failed to get admins' }, { status: 500 });
  }
}

// Add a new admin
export async function POST({ request }) {
  // Check admin access
  const access = checkAdminAccess(request);
  if (!access.authorized) {
    return json({ error: access.error }, { status: 403 });
  }
  
  try {
    const { userId, role, permissions } = await request.json();
    
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const admin = addAdmin(userId, role, permissions);
    return json({ 
      success: true, 
      message: 'Admin added successfully', 
      admin 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding admin:', error);
    return json({ error: error.message || 'Failed to add admin' }, { status: 500 });
  }
}

// Update admin permissions or role
export async function PUT({ request }) {
  // Check admin access
  const access = checkAdminAccess(request);
  if (!access.authorized) {
    return json({ error: access.error }, { status: 403 });
  }
  
  try {
    const { adminId, role, permissions } = await request.json();
    
    if (!adminId) {
      return json({ error: 'Admin ID is required' }, { status: 400 });
    }
    
    let admin = null;
    
    // Update role if provided
    if (role) {
      admin = updateAdminRole(adminId, role);
    }
    
    // Update permissions if provided
    if (permissions) {
      admin = updateAdminPermissions(adminId, permissions);
    }
    
    if (!admin) {
      return json({ error: 'Admin not found' }, { status: 404 });
    }
    
    return json({ 
      success: true, 
      message: 'Admin updated successfully', 
      admin 
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

// Remove an admin
export async function DELETE({ request, url }) {
  // Check admin access
  const access = checkAdminAccess(request);
  if (!access.authorized) {
    return json({ error: access.error }, { status: 403 });
  }
  
  try {
    const adminId = url.searchParams.get('id');
    
    if (!adminId) {
      return json({ error: 'Admin ID is required' }, { status: 400 });
    }
    
    const success = removeAdmin(adminId);
    
    if (!success) {
      return json({ error: 'Admin not found' }, { status: 404 });
    }
    
    return json({ 
      success: true, 
      message: 'Admin removed successfully' 
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    return json({ error: 'Failed to remove admin' }, { status: 500 });
  }
}
