import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCategories } from '$lib/sqliteDb';

export const GET: RequestHandler = async () => {
  try {
    const categories = getCategories();
    return json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
};
