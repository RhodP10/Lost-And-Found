import { json } from '@sveltejs/kit';
import { db } from '$lib/sqliteDb';

// Get a specific claim
export async function GET({ params }) {
  try {
    const { id } = params;
    
    // Get claim with item details
    const claim = db.prepare(`
      SELECT c.*, i.title as item_title, i.status as item_status 
      FROM claims c 
      JOIN items i ON c.item_id = i.id 
      WHERE c.id = ?
    `).get(id);
    
    if (!claim) {
      return json({
        success: false,
        error: 'Claim not found'
      }, { status: 404 });
    }
    
    return json({
      success: true,
      claim
    });
  } catch (error) {
    console.error(`Error fetching claim ${params.id}:`, error);
    return json({
      success: false,
      error: 'Failed to fetch claim'
    }, { status: 500 });
  }
}

// Update a claim (approve/reject)
export async function PUT({ params, request }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Check if claim exists
    const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
    if (!claim) {
      return json({
        success: false,
        error: 'Claim not found'
      }, { status: 404 });
    }
    
    // Validate status
    if (data.status && !['pending', 'approved', 'rejected'].includes(data.status)) {
      return json({
        success: false,
        error: 'Invalid status. Must be pending, approved, or rejected'
      }, { status: 400 });
    }
    
    // Start a transaction
    db.exec('BEGIN TRANSACTION');
    
    try {
      // Update claim
      const updateClaimStmt = db.prepare(`
        UPDATE claims 
        SET status = ?, notes = ?
        WHERE id = ?
      `);
      
      updateClaimStmt.run(
        data.status || claim.status,
        data.notes || claim.notes,
        id
      );
      
      // If claim is approved, update item status to claimed
      if (data.status === 'approved') {
        // Get the item
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(claim.item_id);
        
        if (!item) {
          throw new Error('Item not found');
        }
        
        // Update item status
        const updateItemStmt = db.prepare(`
          UPDATE items 
          SET status = 'claimed', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        
        updateItemStmt.run(claim.item_id);
        
        // Reject all other pending claims for this item
        const rejectOtherClaimsStmt = db.prepare(`
          UPDATE claims 
          SET status = 'rejected', notes = COALESCE(notes, '') || ' (Automatically rejected because another claim was approved)'
          WHERE item_id = ? AND id != ? AND status = 'pending'
        `);
        
        rejectOtherClaimsStmt.run(claim.item_id, id);
      }
      
      // Commit transaction
      db.exec('COMMIT');
      
      // Get updated claim
      const updatedClaim = db.prepare(`
        SELECT c.*, i.title as item_title, i.status as item_status 
        FROM claims c 
        JOIN items i ON c.item_id = i.id 
        WHERE c.id = ?
      `).get(id);
      
      return json({
        success: true,
        message: `Claim ${data.status}`,
        claim: updatedClaim
      });
    } catch (error) {
      // Rollback transaction on error
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(`Error updating claim ${params.id}:`, error);
    return json({
      success: false,
      error: 'Failed to update claim'
    }, { status: 500 });
  }
}

// Delete a claim
export async function DELETE({ params }) {
  try {
    const { id } = params;
    
    // Check if claim exists
    const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
    if (!claim) {
      return json({
        success: false,
        error: 'Claim not found'
      }, { status: 404 });
    }
    
    // Delete the claim
    const result = db.prepare('DELETE FROM claims WHERE id = ?').run(id);
    
    if (result.changes > 0) {
      return json({
        success: true,
        message: 'Claim deleted successfully'
      });
    } else {
      return json({
        success: false,
        error: 'Failed to delete claim'
      }, { status: 500 });
    }
  } catch (error) {
    console.error(`Error deleting claim ${params.id}:`, error);
    return json({
      success: false,
      error: 'Failed to delete claim'
    }, { status: 500 });
  }
}
