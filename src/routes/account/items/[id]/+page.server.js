import { error } from '@sveltejs/kit';
import { getItemById } from '$lib/sqliteDb';

export async function load({ params, cookies }) {
  try {
    const id = params.id;
    
    if (!id) {
      throw error(404, 'Item not found');
    }
    
    // Get the item details
    const item = getItemById(parseInt(id));
    
    if (!item) {
      throw error(404, 'Item not found');
    }
    
    // Get user ID from cookies
    let userId = null;
    const userCookie = cookies.get('user');
    
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        userId = userData.id;
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
    
    // Check if this item belongs to the current user
    if (userId && item.user_id && userId !== item.user_id) {
      throw error(403, 'You do not have permission to view this item');
    }
    
    return {
      item
    };
  } catch (err) {
    console.error('Error loading item:', err);
    throw error(500, 'Failed to load item details');
  }
}
