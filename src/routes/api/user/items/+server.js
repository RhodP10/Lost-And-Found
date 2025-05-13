import { json } from '@sveltejs/kit';
import { getItems } from '$lib/sqliteDb';

export async function GET({ url, request }) {
  try {
    // In a real app with proper authentication, you would get the user ID from the session
    // For now, we'll get it from the query parameter
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Query the database for items associated with that user
    const items = getItems({ user_id: userId });

    return json(items);
  } catch (error) {
    console.error('Error fetching user items:', error);
    return json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
