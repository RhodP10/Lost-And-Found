import { json } from '@sveltejs/kit';
import { db } from '$lib/sqliteDb';

// Update item status for debugging purposes
export async function GET({ url }) {
  try {
    const itemId = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    
    if (!itemId) {
      return json({
        success: false,
        error: 'Item ID is required'
      }, { status: 400 });
    }
    
    if (!status || !['lost', 'found', 'claimed'].includes(status)) {
      return json({
        success: false,
        error: 'Valid status is required (lost, found, or claimed)'
      }, { status: 400 });
    }
    
    // Check if item exists
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    if (!item) {
      return json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }
    
    // Update item status
    const stmt = db.prepare(`
      UPDATE items 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(status, itemId);
    
    if (result.changes > 0) {
      // Get updated item
      const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
      
      return json({
        success: true,
        message: `Item status updated to "${status}"`,
        item: updatedItem
      });
    } else {
      return json({
        success: false,
        error: 'Failed to update item status'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating item status:', error);
    return json({
      success: false,
      error: 'Failed to update item status'
    }, { status: 500 });
  }
}
