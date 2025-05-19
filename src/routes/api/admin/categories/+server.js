import { json } from '@sveltejs/kit';
import { getCategories } from '$lib/sqliteDb';

export async function GET() {
  try {
    // Get categories from database
    const categories = getCategories();

    return json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    }, { status: 500 });
  }
}
