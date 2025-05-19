import { json } from '@sveltejs/kit';
import { verifyUser, isUserAdmin, getAdminByUserId } from '$lib/sqliteDb';

export async function POST({ request }) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Verify user credentials
    const user = await verifyUser(username, password);

    if (!user) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user is an admin
    let isAdmin = false;
    let adminDetails = null;

    try {
      console.log('Checking admin status for user ID:', user.id);
      isAdmin = isUserAdmin(user.id);
      console.log('Is admin?', isAdmin);

      if (isAdmin) {
        adminDetails = getAdminByUserId(user.id);
        console.log('Admin details:', adminDetails);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      // Continue without admin privileges if there's an error
      isAdmin = false;
      adminDetails = null;
    }

    // Force admin status for testing (remove in production)
    if (user.username === 'admin') {
      console.log('Forcing admin status for admin user');
      isAdmin = true;
      adminDetails = {
        id: 1,
        user_id: user.id,
        role: 'admin',
        permissions: JSON.stringify({ all: true }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return json({
      success: true,
      message: 'Login successful',
      user: {
        ...user,
        isAdmin,
        adminDetails
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return json({ error: 'Server error during login' }, { status: 500 });
  }
}
