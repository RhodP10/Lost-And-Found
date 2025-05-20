import { json } from '@sveltejs/kit';
import { db } from '$lib/sqliteDb';

// Debug endpoint to check database tables and data
export async function GET({ url }) {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `).all();
    
    const tableData = {};
    
    // Get data from each table
    for (const table of tables) {
      if (table.name.startsWith('sqlite_')) continue; // Skip SQLite internal tables
      
      try {
        const rows = db.prepare(`SELECT * FROM ${table.name} LIMIT 10`).all();
        tableData[table.name] = rows;
      } catch (error) {
        console.error(`Error fetching data from table ${table.name}:`, error);
        tableData[table.name] = { error: error.message };
      }
    }
    
    return json({
      success: true,
      tables: tables.map(t => t.name),
      data: tableData
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return json({
      success: false,
      error: 'Failed to check database'
    }, { status: 500 });
  }
}
