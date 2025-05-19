import { json } from '@sveltejs/kit';
import { getItems, getAllAdmins } from '$lib/sqliteDb';
import { db } from '$lib/sqliteDb';

export async function GET({ request }) {
  try {
    // Get counts from database
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
    const lostItems = db.prepare("SELECT COUNT(*) as count FROM items WHERE status = 'lost'").get().count;
    const foundItems = db.prepare("SELECT COUNT(*) as count FROM items WHERE status = 'found'").get().count;
    const claimedItems = db.prepare("SELECT COUNT(*) as count FROM items WHERE status = 'claimed'").get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const admins = getAllAdmins();
    const totalAdmins = admins.length;

    return json({
      success: true,
      stats: {
        totalItems,
        lostItems,
        foundItems,
        claimedItems,
        totalUsers,
        totalAdmins
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return json({ 
      success: false, 
      error: 'Failed to fetch admin statistics' 
    }, { status: 500 });
  }
}
