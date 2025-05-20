import { json } from '@sveltejs/kit';
import { db } from '$lib/sqliteDb';

// Drop the existing claims table if it exists
try {
  db.exec(`DROP TABLE IF EXISTS claims;`);
} catch (error) {
  console.error('Error dropping claims table:', error);
}

// Create claims table with the correct schema
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      claimant_name TEXT NOT NULL,
      claimant_email TEXT NOT NULL,
      claimant_phone TEXT,
      student_id TEXT,
      proof_description TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      notes TEXT,
      claim_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id)
    );
  `);
  console.log('Claims table created successfully');
} catch (error) {
  console.error('Error creating claims table:', error);
}

// Get all claims
export async function GET({ url }) {
  try {
    const itemId = url.searchParams.get('item_id');
    const status = url.searchParams.get('status');

    let query = 'SELECT c.*, i.title as item_title FROM claims c JOIN items i ON c.item_id = i.id';
    const params = [];
    const conditions = [];

    if (itemId) {
      conditions.push('c.item_id = ?');
      params.push(itemId);
    }

    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.claim_date DESC';

    const claims = db.prepare(query).all(params);

    return json({
      success: true,
      claims
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return json({
      success: false,
      error: 'Failed to fetch claims'
    }, { status: 500 });
  }
}

// Submit a new claim
export async function POST({ request }) {
  try {
    const data = await request.json();

    // Log the received data for debugging
    console.log('Received claim data:', data);

    // Validate required fields
    if (!data.item_id) {
      console.log('Validation error: Item ID is required');
      return json({
        success: false,
        error: 'Item ID is required'
      }, { status: 400 });
    }

    if (!data.claimant_name || !data.claimant_name.trim()) {
      console.log('Validation error: Claimant name is required');
      return json({
        success: false,
        error: 'Claimant name is required'
      }, { status: 400 });
    }

    if (!data.claimant_email || !data.claimant_email.trim()) {
      console.log('Validation error: Claimant email is required');
      return json({
        success: false,
        error: 'Claimant email is required'
      }, { status: 400 });
    }

    // Check if item exists
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(data.item_id);
    if (!item) {
      return json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }

    // Check if item is already claimed
    if (item.status === 'claimed') {
      return json({
        success: false,
        error: 'This item has already been claimed'
      }, { status: 400 });
    }

    // Check if item is a found item (can't claim lost items)
    if (item.status !== 'found') {
      return json({
        success: false,
        error: 'Only found items can be claimed'
      }, { status: 400 });
    }

    // Check if user already has a pending claim for this item
    const existingClaim = db.prepare(`
      SELECT * FROM claims
      WHERE item_id = ? AND claimant_email = ? AND status = 'pending'
    `).get(data.item_id, data.claimant_email);

    if (existingClaim) {
      return json({
        success: false,
        error: 'You already have a pending claim for this item'
      }, { status: 400 });
    }

    // Insert the claim
    console.log('Preparing to insert claim into database');
    let result;

    try {
      // Check if the claims table exists
      const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='claims'").get();
      console.log('Claims table check:', tableCheck);

      if (!tableCheck) {
        console.log('Claims table does not exist, creating it now');
        // Create the table if it doesn't exist
        db.exec(`
          CREATE TABLE IF NOT EXISTS claims (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            claimant_name TEXT NOT NULL,
            claimant_email TEXT NOT NULL,
            claimant_phone TEXT,
            student_id TEXT,
            proof_description TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            notes TEXT,
            claim_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(id)
          );
        `);
        console.log('Claims table created');
      }

      const stmt = db.prepare(`
        INSERT INTO claims (
          item_id, claimant_name, claimant_email, claimant_phone,
          student_id, proof_description, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      console.log('Executing insert with values:', {
        item_id: data.item_id,
        claimant_name: data.claimant_name.trim(),
        claimant_email: data.claimant_email.trim(),
        claimant_phone: data.claimant_phone || null,
        student_id: data.student_id || null,
        proof_description: data.proof_description || null,
        notes: data.notes || null
      });

      result = stmt.run(
        data.item_id,
        data.claimant_name.trim(),
        data.claimant_email.trim(),
        data.claimant_phone || null,
        data.student_id || null,
        data.proof_description || null,
        data.notes || null
      );

      console.log('Insert result:', result);
    } catch (dbError) {
      console.error('Database error during claim insertion:', dbError);
      throw dbError;
    }

    if (result && result.lastInsertRowid) {
      // Get the created claim
      const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(result.lastInsertRowid);

      return json({
        success: true,
        message: 'Claim submitted successfully',
        claim
      }, { status: 201 });
    } else {
      return json({
        success: false,
        error: 'Failed to submit claim'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error submitting claim:', error);
    return json({
      success: false,
      error: 'Failed to submit claim'
    }, { status: 500 });
  }
}
