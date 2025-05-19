import { json } from '@sveltejs/kit';
import { db, getCategories } from '$lib/sqliteDb';

export async function GET() {
  try {
    // Get categories from database
    const categories = getCategories();

    return json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return json({
      success: false,
      error: 'Failed to fetch categories'
    }, { status: 500 });
  }
}

// Add a new category
export async function POST({ request }) {
  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    // Check if category already exists
    const existingCategory = db.prepare('SELECT * FROM categories WHERE name = ?').get(name.trim());
    if (existingCategory) {
      return json({
        success: false,
        error: 'Category already exists'
      }, { status: 400 });
    }

    // Insert new category
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const result = stmt.run(name.trim());

    if (result.lastInsertRowid) {
      // Get the created category
      const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);

      return json({
        success: true,
        category: newCategory
      }, { status: 201 });
    } else {
      return json({
        success: false,
        error: 'Failed to create category'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return json({
      success: false,
      error: 'Failed to create category'
    }, { status: 500 });
  }
}

// Update a category
export async function PUT({ request, url }) {
  try {
    const categoryId = url.searchParams.get('id');

    if (!categoryId) {
      return json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!existingCategory) {
      return json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Check if name already exists for another category
    const duplicateCategory = db.prepare('SELECT * FROM categories WHERE name = ? AND id != ?').get(name.trim(), categoryId);
    if (duplicateCategory) {
      return json({
        success: false,
        error: 'Category name already exists'
      }, { status: 400 });
    }

    // Update category
    const stmt = db.prepare('UPDATE categories SET name = ? WHERE id = ?');
    const result = stmt.run(name.trim(), categoryId);

    if (result.changes > 0) {
      // Get the updated category
      const updatedCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);

      return json({
        success: true,
        category: updatedCategory
      });
    } else {
      return json({
        success: false,
        error: 'Failed to update category'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    return json({
      success: false,
      error: 'Failed to update category'
    }, { status: 500 });
  }
}

// Delete a category
export async function DELETE({ url }) {
  try {
    const categoryId = url.searchParams.get('id');

    if (!categoryId) {
      return json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!existingCategory) {
      return json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Check if category is in use by any items
    const itemsUsingCategory = db.prepare('SELECT COUNT(*) as count FROM items WHERE category = ?').get(existingCategory.name);
    if (itemsUsingCategory.count > 0) {
      return json({
        success: false,
        error: `Cannot delete category that is in use by ${itemsUsingCategory.count} items`
      }, { status: 400 });
    }

    // Delete category
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const result = stmt.run(categoryId);

    if (result.changes > 0) {
      return json({
        success: true,
        message: 'Category deleted successfully'
      });
    } else {
      return json({
        success: false,
        error: 'Failed to delete category'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return json({
      success: false,
      error: 'Failed to delete category'
    }, { status: 500 });
  }
}
