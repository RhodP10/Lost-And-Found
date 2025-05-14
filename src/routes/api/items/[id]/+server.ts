import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getItemById, updateItem, deleteItem } from '$lib/sqliteDb';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    const item = getItemById(parseInt(id));

    if (!item) {
      return json({ error: 'Item not found' }, { status: 404 });
    }

    return json(item);
  } catch (error) {
    console.error(`Error fetching item ${params.id}:`, error);
    return json({ error: 'Failed to fetch item' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id } = params;
    const itemData = await request.json();

    const updatedItem = updateItem(parseInt(id), {
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
      image_url: itemData.image_url
    });

    if (!updatedItem) {
      return json({ error: 'Item not found' }, { status: 404 });
    }

    return json(updatedItem);
  } catch (error) {
    console.error(`Error updating item ${params.id}:`, error);
    return json({ error: 'Failed to update item' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    const success = deleteItem(parseInt(id));

    if (!success) {
      return json({ error: 'Item not found' }, { status: 404 });
    }

    return json({ success: true });
  } catch (error) {
    console.error(`Error deleting item ${params.id}:`, error);
    return json({ error: 'Failed to delete item' }, { status: 500 });
  }
};
