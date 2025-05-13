import { json } from '@sveltejs/kit';
import { getItems } from '$lib/sqliteDb';

export async function GET({ request, cookies, locals }) {
  try {
    // Get user ID from the request
    // In a real app, this would come from the session or JWT token
    // For now, we'll get it from the cookies or locals
    let userId;

    // Try to get user ID from cookies
    const userCookie = cookies.get('user');
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        userId = userData.id;
        console.log('Found user ID in cookie:', userId);
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }

    // If no user ID in cookie, try to get from localStorage via request headers
    if (!userId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // In a real app, you would verify the token
          // For now, we'll just try to parse it as JSON
          const userData = JSON.parse(token);
          if (userData && userData.id) {
            userId = userData.id;
            console.log('Found user ID in auth header:', userId);
          }
        } catch (e) {
          console.error('Error parsing auth header:', e);
        }
      }
    }

    // If no user ID found, return empty array
    // This is a simplified approach - in a real app, you would return an error
    if (!userId) {
      return json([]);
    }

    // Query the database for items associated with that user
    const items = getItems({ user_id: userId });

    return json(items);
  } catch (error) {
    console.error('Error fetching user items:', error);
    return json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
