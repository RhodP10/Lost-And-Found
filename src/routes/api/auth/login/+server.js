import { json } from '@sveltejs/kit';
import { verifyUser } from '$lib/sqliteDb';

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

    return json({
      success: true,
      message: 'Login successful',
      user
    });
  } catch (error) {
    console.error('Error in login:', error);
    return json({ error: 'Server error during login' }, { status: 500 });
  }
}
