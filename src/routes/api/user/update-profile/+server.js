import { json } from '@sveltejs/kit';
import { updateUser, findUserByEmail, findUserByUsername, verifyUser } from '$lib/sqliteDb';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { id, username, email, full_name, current_password, new_password } = data;

    // Validate required fields
    if (!id) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!username || !email) {
      return json({ error: 'Username and email are required' }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existingEmail = findUserByEmail(email);
    if (existingEmail && existingEmail.id !== id) {
      return json({ error: 'Email is already in use by another account' }, { status: 400 });
    }

    // Check if username is already taken by another user
    const existingUsername = findUserByUsername(username);
    if (existingUsername && existingUsername.id !== id) {
      return json({ error: 'Username is already taken by another account' }, { status: 400 });
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      full_name: full_name || null
    };

    // If changing password, verify current password and hash new password
    if (new_password) {
      if (!current_password) {
        return json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      // Verify current password
      const user = await verifyUser(username, current_password);
      if (!user) {
        return json({ error: 'Current password is incorrect' }, { status: 401 });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);
      
      // Add password to update data
      updateData.password = hashedPassword;
    }

    // Update user in database
    const updatedUser = updateUser(id, updateData);

    if (!updatedUser) {
      return json({ error: 'Failed to update user' }, { status: 500 });
    }

    // Return updated user without password
    return json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return json({ error: 'Server error during profile update' }, { status: 500 });
  }
}
