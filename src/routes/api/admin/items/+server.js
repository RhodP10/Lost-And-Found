import { json } from '@sveltejs/kit';
import { getItems, getItemById, updateItem, deleteItem } from '$lib/sqliteDb';

export async function GET({ url }) {
  try {
    // Check if a specific item ID is requested
    const itemId = url.searchParams.get('id');

    if (itemId) {
      // Get a single item by ID
      const item = getItemById(itemId);

      if (!item) {
        return json({
          success: false,
          error: 'Item not found'
        }, { status: 404 });
      }

      return json({
        success: true,
        item
      });
    }

    // Otherwise, get multiple items with filters
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

// Update an item
export async function PUT({ request, url }) {
  try {
    const itemId = url.searchParams.get('id');

    if (!itemId) {
      return json({
        success: false,
        error: 'Item ID is required'
      }, { status: 400 });
    }

    // Check if item exists
    const existingItem = getItemById(itemId);
    if (!existingItem) {
      return json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }

    const itemData = await request.json();

    // Validate required fields
    if (!itemData.title || !itemData.status || !itemData.category) {
      return json({
        success: false,
        error: 'Title, status, and category are required'
      }, { status: 400 });
    }

    // Update item
    const updatedItem = updateItem(itemId, {
      ...existingItem,
      ...itemData
    });

    if (updatedItem) {
      return json({
        success: true,
        item: updatedItem
      });
    } else {
      return json({
        success: false,
        error: 'Failed to update item'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    return json({
      success: false,
      error: 'Failed to update item'
    }, { status: 500 });
  }
}

// Delete an item
export async function DELETE({ url }) {
  try {
    const itemId = url.searchParams.get('id');

    if (!itemId) {
      return json({
        success: false,
        error: 'Item ID is required'
      }, { status: 400 });
    }

    // Check if item exists
    const existingItem = getItemById(itemId);
    if (!existingItem) {
      return json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }

    // Delete item
    const result = deleteItem(itemId);

    if (result) {
      return json({
        success: true,
        message: 'Item deleted successfully'
      });
    } else {
      return json({
        success: false,
        error: 'Failed to delete item'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    return json({
      success: false,
      error: 'Failed to delete item'
    }, { status: 500 });
  }
}
