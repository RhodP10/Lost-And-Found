import { json } from '@sveltejs/kit';
import { getItems } from '$lib/sqliteDb';

export async function GET({ url }) {
  try {
    // Parse query parameters
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')) : null;
    const search = url.searchParams.get('search');

    // Build filters object
    const filters = {};
    if (status && status !== 'all') filters.status = status;
    if (category && category !== 'all') filters.category = category;
    if (limit) filters.limit = limit;

    // Get items from database
    let items = getItems(filters);

    // Apply search filter if provided (this is done in JS since SQLite doesn't have good text search)
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.location && item.location.toLowerCase().includes(searchLower)) ||
        (item.reporter_name && item.reporter_name.toLowerCase().includes(searchLower))
      );
    }

    return json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return json({ 
      success: false, 
      error: 'Failed to fetch items' 
    }, { status: 500 });
  }
}
