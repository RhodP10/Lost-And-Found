import { json } from '@sveltejs/kit';
import { getItemById } from '$lib/sqliteDb';
import db from '$lib/sqliteDb';

export async function GET({ params }) {
  try {
    const { id } = params;
    
    // Log the raw ID from the URL
    console.log('Debug endpoint - Raw ID from URL:', id, 'Type:', typeof id);
    
    // Try to parse as number
    const numericId = parseInt(id, 10);
    console.log('Debug endpoint - Parsed numeric ID:', numericId, 'Type:', typeof numericId);
    
    // Check if valid number
    if (isNaN(numericId)) {
      console.error(`Debug endpoint - Invalid item ID: ${id} is not a number`);
      return json({ 
        error: 'Invalid item ID',
        raw_id: id,
        parsed_id: numericId,
        is_valid: false
      }, { status: 400 });
    }
    
    // Try direct query to database
    console.log(`Debug endpoint - Querying database for item with ID: ${numericId}`);
    
    // Method 1: Using getItemById function
    const item1 = getItemById(numericId);
    console.log('Debug endpoint - Result from getItemById:', item1 ? 'Found' : 'Not found');
    
    // Method 2: Direct SQL query
    let item2 = null;
    try {
      const stmt = db.db.prepare('SELECT * FROM items WHERE id = ?');
      item2 = stmt.get(numericId);
      console.log('Debug endpoint - Result from direct SQL:', item2 ? 'Found' : 'Not found');
    } catch (sqlError) {
      console.error('Debug endpoint - SQL error:', sqlError);
    }
    
    // Method 3: Try with string ID
    let item3 = null;
    try {
      const stmt = db.db.prepare('SELECT * FROM items WHERE id = ?');
      item3 = stmt.get(id);
      console.log('Debug endpoint - Result from SQL with string ID:', item3 ? 'Found' : 'Not found');
    } catch (sqlError) {
      console.error('Debug endpoint - SQL error with string ID:', sqlError);
    }
    
    // Get all items to check if the ID exists
    let allItems = [];
    try {
      const stmt = db.db.prepare('SELECT id FROM items ORDER BY id');
      allItems = stmt.all();
      console.log('Debug endpoint - All item IDs in database:', allItems.map(i => i.id));
    } catch (sqlError) {
      console.error('Debug endpoint - SQL error getting all items:', sqlError);
    }
    
    // Check if the ID exists in the list
    const idExists = allItems.some(item => item.id === numericId);
    console.log(`Debug endpoint - ID ${numericId} exists in database: ${idExists}`);
    
    return json({
      raw_id: id,
      parsed_id: numericId,
      is_valid: !isNaN(numericId),
      method1_found: !!item1,
      method2_found: !!item2,
      method3_found: !!item3,
      all_item_ids: allItems.map(i => i.id),
      id_exists_in_list: idExists,
      item_details: item1 || item2 || item3 || null
    });
  } catch (error) {
    console.error(`Debug endpoint - Error:`, error);
    return json({ 
      error: `Debug error: ${error.message}`,
      stack: error.stack
    }, { status: 500 });
  }
}
