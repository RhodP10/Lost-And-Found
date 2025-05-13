import { json } from '@sveltejs/kit';
import { createUser } from '$lib/sqliteDb';

export async function POST({ request }) {
  try {
    const { email, username, password, full_name } = await request.json();

    // Validate input
    if (!email || !username || !password) {
      return json({ error: 'Email, username and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    try {
      // Create new user
      const newUser = await createUser({ email, username, password, full_name });

      return json({
        success: true,
        message: 'User registered successfully',
        userId: newUser.id
      }, { status: 201 });
    } catch (err) {
      // Handle specific errors
      if (err.message === 'Email already in use' || err.message === 'Username already taken') {
        return json({ error: err.message }, { status: 400 });
      }
      throw err; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error in signup:', error);
    return json({ error: 'Server error during registration' }, { status: 500 });
  }
}
