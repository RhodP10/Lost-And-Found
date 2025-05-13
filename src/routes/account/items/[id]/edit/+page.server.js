import { error, redirect } from '@sveltejs/kit';
import { getItemById } from '$lib/sqliteDb';

export async function load({ params, cookies }) {
  try {
    const id = params.id;

    if (!id) {
      console.error('No item ID provided');
      throw error(404, 'Item not found');
    }

    // Ensure ID is a valid number
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`Invalid item ID format: ${id}`);
      throw error(400, 'Invalid item ID format');
    }

    console.log(`Loading item with ID ${numericId} for edit page`);

    // Get the item details
    const item = getItemById(numericId);

    if (!item) {
      console.error(`Item with ID ${numericId} not found in database`);
      throw error(404, 'Item not found');
    }

    console.log(`Item found:`, JSON.stringify(item, null, 2));

    // Get user ID from cookies
    let userId = null;
    const userCookie = cookies.get('user');

    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        userId = userData.id;
        console.log(`User ID from cookie: ${userId}`);
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    } else {
      console.error('No user cookie found');
    }

    // Check if this item belongs to the current user
    if (!userId) {
      console.error('No user ID found, redirecting to login');
      throw redirect(302, '/login');
    }

    // Check if user has permission to edit this item
    if (item.user_id && userId && parseInt(item.user_id) !== parseInt(userId)) {
      console.error(`User ${userId} does not have permission to edit item ${numericId} (owned by ${item.user_id})`);
      throw error(403, 'You do not have permission to edit this item');
    }

    return {
      item: {
        ...item,
        // Ensure these fields are properly formatted
        id: numericId,
        user_id: item.user_id ? parseInt(item.user_id, 10) : null
      }
    };
  } catch (err) {
    console.error('Error loading item for edit:', err);
    throw error(500, `Failed to load item details: ${err.message}`);
  }
}
