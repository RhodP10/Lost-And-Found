import { json } from '@sveltejs/kit';
import { db, findUserByEmail, findUserByUsername, updateUser } from '$lib/sqliteDb';
import bcrypt from 'bcryptjs';

export async function PUT({ request, cookies }) {
  try {
    // Get user data from request
    const userData = await request.json();
    console.log('Update user request:', JSON.stringify(userData, null, 2));

    // Get current user from cookies
    let currentUser = null;
    const userCookie = cookies.get('user');

    if (userCookie) {
      try {
        currentUser = JSON.parse(userCookie);
      } catch (e) {
        console.error('Error parsing user cookie:', e);
        return json({ error: 'Invalid user session' }, { status: 401 });
      }
    }

    if (!currentUser || !currentUser.id) {
      return json({ error: 'User not authenticated' }, { status: 401 });
    }

    console.log('Current user ID:', currentUser.id);

    // Check if email is already taken by another user
    if (userData.email !== currentUser.email) {
      const existingUserWithEmail = findUserByEmail(userData.email);
      if (existingUserWithEmail && existingUserWithEmail.id !== currentUser.id) {
        return json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    // Check if username is already taken by another user
    if (userData.username !== currentUser.username) {
      const existingUserWithUsername = findUserByUsername(userData.username);
      if (existingUserWithUsername && existingUserWithUsername.id !== currentUser.id) {
        return json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData = {
      email: userData.email,
      username: userData.username,
      full_name: userData.full_name || null,
      updated_at: new Date().toISOString()
    };

    // If password is being changed, verify current password and hash new password
    if (userData.newPassword) {
      // Get the current user with password from the database
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const userWithPassword = stmt.get(currentUser.id);

      if (!userWithPassword) {
        return json({ error: 'User not found' }, { status: 404 });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(userData.currentPassword, userWithPassword.password);
      if (!isPasswordValid) {
        return json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.newPassword, salt);
      updateData.password = hashedPassword;
    }

    // Use the updateUser function to update the user
    try {
      console.log('Updating user with ID:', currentUser.id);
      console.log('Update data:', JSON.stringify(updateData, null, 2));

      const updatedUser = await updateUser(currentUser.id, updateData);

      if (!updatedUser) {
        return json({ error: 'No changes made' }, { status: 400 });
      }

      // Update the user cookie with the new information
      const userCookieData = {
        ...updatedUser,
        // Don't include sensitive information in the cookie
      };

      // Set the updated cookie
      cookies.set('user', JSON.stringify(userCookieData), {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      // Return the updated user
      return json({
        success: true,
        user: updatedUser
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return json({ error: 'Server error during update' }, { status: 500 });
  }
}
