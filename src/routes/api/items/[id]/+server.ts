import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import dbModule, { getItemById, updateItem, deleteItem } from '$lib/sqliteDb';

// Get the database object for direct SQL operations
const db = dbModule.db;

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Ensure id is a valid number
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`Invalid item ID: ${id} is not a number`);
      return json({ error: 'Invalid item ID' }, { status: 400 });
    }

    console.log(`Fetching item with ID: ${numericId}`);

    const item = getItemById(numericId);

    if (!item) {
      console.error(`Item with ID ${numericId} not found`);
      return json({ error: 'Item not found' }, { status: 404 });
    }

    console.log(`Item found:`, JSON.stringify(item, null, 2));

    return json({
      ...item,
      id: numericId,
      user_id: item.user_id ? parseInt(item.user_id, 10) : null
    });
  } catch (error) {
    console.error(`Error fetching item ${params.id}:`, error);
    return json({ error: `Failed to fetch item: ${error.message}` }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id } = params;

    console.log(`Raw ID from URL params: ${id}, type: ${typeof id}`);

    // Get the request body first
    const itemData = await request.json();
    console.log(`Request body:`, JSON.stringify(itemData, null, 2));

    // Try to get the ID from multiple sources
    let itemId = null;

    // 1. Try from request body
    if (itemData.id) {
      itemId = parseInt(itemData.id, 10);
      console.log(`Using ID from request body: ${itemId}`);
    }
    // 2. Try from URL params
    else if (id) {
      itemId = parseInt(id, 10);
      console.log(`Using ID from URL params: ${itemId}`);
    }

    // Validate the ID
    if (!itemId || isNaN(itemId)) {
      console.error(`Invalid item ID: Could not determine a valid ID`);
      return json({ error: 'Invalid item ID' }, { status: 400 });
    }

    console.log(`Processing update request for item ID: ${itemId}`);

    // Log the update operation
    console.log(`Updating item ${itemId} with data:`, JSON.stringify(itemData, null, 2));

    // Get the current item to verify it exists - try multiple methods
    let currentItem = null;

    // Try with numeric ID
    currentItem = getItemById(itemId);

    // If not found, try with string ID
    if (!currentItem && id) {
      console.log(`Trying to get item with string ID: ${id}`);
      try {
        const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
        currentItem = stmt.get(id);
      } catch (e) {
        console.error(`Error getting item with string ID: ${e.message}`);
      }
    }

    if (!currentItem) {
      console.error(`Item with ID ${itemId} not found`);
      return json({ error: 'Item not found' }, { status: 404 });
    }

    console.log(`Found item:`, JSON.stringify(currentItem, null, 2));

    console.log(`Current item found:`, JSON.stringify(currentItem, null, 2));

    console.log(`Current item data:`, JSON.stringify(currentItem, null, 2));

    try {
      // Create update data object
      const updateData = {
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        status: itemData.status,
        location: itemData.location,
        floor: itemData.floor,
        room_number: itemData.room_number,
        reporter_name: itemData.reporter_name,
        reporter_email: itemData.reporter_email,
        reporter_phone: itemData.reporter_phone,
        image_url: itemData.image_url,
        user_id: itemData.user_id
      };

      console.log(`Calling updateItem with ID ${itemId} and data:`, JSON.stringify(updateData, null, 2));

      // Try direct SQL update as a fallback approach
      let updatedItem = null;

      try {
        // First try the normal updateItem function
        updatedItem = updateItem(itemId, updateData);
        console.log('Result from updateItem function:', updatedItem ? 'Success' : 'Failed');
      } catch (updateError) {
        console.error('Error from updateItem function:', updateError);
      }

      // If that fails, try direct SQL
      if (!updatedItem) {
        try {
          console.log('Trying direct SQL update...');

          const sql = `
            UPDATE items SET
              title = ?,
              description = ?,
              category = ?,
              status = ?,
              location = ?,
              floor = ?,
              room_number = ?,
              reporter_name = ?,
              reporter_email = ?,
              reporter_phone = ?,
              image_url = ?,
              user_id = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;

          const stmt = db.prepare(sql);
          const result = stmt.run(
            updateData.title,
            updateData.description || null,
            updateData.category,
            updateData.status,
            updateData.location || null,
            updateData.floor || null,
            updateData.room_number || null,
            updateData.reporter_name,
            updateData.reporter_email,
            updateData.reporter_phone || null,
            updateData.image_url || null,
            updateData.user_id || null,
            itemId
          );

          console.log('Direct SQL update result:', result);

          if (result.changes > 0) {
            // Get the updated item
            updatedItem = getItemById(itemId);
            console.log('Item updated via direct SQL');
          }
        } catch (sqlError) {
          console.error('Error with direct SQL update:', sqlError);
        }
      }

      if (!updatedItem) {
        console.error(`Update operation returned null for item ${id}`);
        return json({ error: 'Failed to update item' }, { status: 500 });
      }

      console.log(`Item ${id} updated successfully:`, JSON.stringify(updatedItem, null, 2));
      return json(updatedItem);
    } catch (updateError) {
      console.error(`Error in updateItem function:`, updateError);
      return json({ error: `Database error: ${updateError.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error(`Error updating item ${params.id}:`, error);
    return json({ error: `Failed to update item: ${error.message}` }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Ensure id is a valid number
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`Invalid item ID: ${id} is not a number`);
      return json({ error: 'Invalid item ID' }, { status: 400 });
    }

    console.log(`Deleting item with ID: ${numericId}`);

    // First check if the item exists
    const item = getItemById(numericId);
    if (!item) {
      console.error(`Item with ID ${numericId} not found for deletion`);
      return json({ error: 'Item not found' }, { status: 404 });
    }

    const success = deleteItem(numericId);

    if (!success) {
      console.error(`Failed to delete item with ID ${numericId}`);
      return json({ error: 'Failed to delete item' }, { status: 500 });
    }

    console.log(`Item with ID ${numericId} successfully deleted`);
    return json({ success: true });
  } catch (error) {
    console.error(`Error deleting item ${params.id}:`, error);
    return json({ error: `Failed to delete item: ${error.message}` }, { status: 500 });
  }
};
