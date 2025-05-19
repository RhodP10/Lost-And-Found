import { json } from '@sveltejs/kit';
import { isUserAdmin, getAdminByUserId } from '$lib/sqliteDb';

// Check if a user is an admin
export async function GET({ url }) {
  try {
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const isAdmin = isUserAdmin(userId);
    
    if (isAdmin) {
      const adminDetails = getAdminByUserId(userId);
      return json({ 
        isAdmin: true, 
        admin: adminDetails 
      });
    } else {
      return json({ isAdmin: false });
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return json({ error: 'Failed to check admin status' }, { status: 500 });
  }
}
