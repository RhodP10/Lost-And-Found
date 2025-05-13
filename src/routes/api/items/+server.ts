import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getItems, createItem } from '$lib/sqliteDb';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    const filters = {
      status: status || undefined,
      category: category || undefined,
      limit
    };

    const items = getItems(filters);

    return json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return json({ error: 'Failed to fetch items' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const itemData = await request.json();

    // Log the user ID for debugging
    console.log('Creating item with user ID:', itemData.user_id);

    const newItem = createItem({
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
    });

    console.log('Item created successfully with ID:', newItem.id);
    return json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return json({ error: 'Failed to create item' }, { status: 500 });
  }
};
