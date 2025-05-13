import { getItemById } from '$lib/sqliteDb';
import { redirect } from '@sveltejs/kit';

export async function load({ params, request, locals }) {
  const { id } = params;
  
  // Log the request for debugging
  console.log('Public item details page - Request URL:', request.url);
  console.log('Public item details page - Referrer:', request.headers.get('referer'));
  
  // Parse the ID
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    console.error(`Invalid item ID: ${id} is not a number`);
    return {
      status: 400,
      error: 'Invalid item ID'
    };
  }
  
  // Get the item
  const item = getItemById(itemId);
  if (!item) {
    console.error(`Item with ID ${itemId} not found`);
    return {
      status: 404,
      error: 'Item not found'
    };
  }
  
  // Check if the user is logged in and is the owner of the item
  const user = locals.user;
  if (user && item.user_id === user.id) {
    // If the user is the owner, redirect to the account view
    console.log(`User ${user.id} is the owner of item ${itemId}, redirecting to account view`);
    throw redirect(303, `/account/items/${itemId}`);
  }
  
  // Return the item for the public view
  return {
    item
  };
}
