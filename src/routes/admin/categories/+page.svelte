<script lang="ts">
  import { onMount } from 'svelte';
  
  // Categories list
  let categories = $state([]);
  
  // New category name
  let newCategoryName = $state('');
  
  // Edit mode
  let editMode = $state(false);
  let editCategoryId = $state(null);
  let editCategoryName = $state('');
  
  // Loading state
  let isLoading = $state(true);
  
  // Error message
  let errorMessage = $state('');
  
  onMount(async () => {
    try {
      // Fetch categories
      await fetchCategories();
      
      isLoading = false;
    } catch (error) {
      console.error('Error loading categories:', error);
      isLoading = false;
    }
  });
  
  async function fetchCategories() {
    // In a real app, you would fetch this from an API
    // For now, we'll use mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    categories = [
      { id: 1, name: 'Electronics', created_at: '2023-05-10T14:30:00Z' },
      { id: 2, name: 'Clothing', created_at: '2023-05-10T14:30:00Z' },
      { id: 3, name: 'Accessories', created_at: '2023-05-10T14:30:00Z' },
      { id: 4, name: 'Documents', created_at: '2023-05-10T14:30:00Z' },
      { id: 5, name: 'Keys', created_at: '2023-05-10T14:30:00Z' },
      { id: 6, name: 'Bags', created_at: '2023-05-10T14:30:00Z' },
      { id: 7, name: 'Other', created_at: '2023-05-10T14:30:00Z' }
    ];
  }
  
  // Add new category
  async function addCategory() {
    // Validate input
    if (!newCategoryName.trim()) {
      errorMessage = 'Category name cannot be empty';
      return;
    }
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      errorMessage = 'Category already exists';
      return;
    }
    
    try {
      // In a real app, you would call an API
      console.log(`Adding new category: ${newCategoryName}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add to categories list
      const newCategory = {
        id: categories.length + 1,
        name: newCategoryName.trim(),
        created_at: new Date().toISOString()
      };
      
      categories = [...categories, newCategory];
      
      // Clear input and error
      newCategoryName = '';
      errorMessage = '';
      
    } catch (error) {
      console.error('Error adding category:', error);
      errorMessage = 'Failed to add category';
    }
  }
  
  // Start editing category
  function startEdit(category) {
    editMode = true;
    editCategoryId = category.id;
    editCategoryName = category.name;
    errorMessage = '';
  }
  
  // Cancel editing
  function cancelEdit() {
    editMode = false;
    editCategoryId = null;
    editCategoryName = '';
    errorMessage = '';
  }
  
  // Update category
  async function updateCategory() {
    // Validate input
    if (!editCategoryName.trim()) {
      errorMessage = 'Category name cannot be empty';
      return;
    }
    
    // Check if category already exists (excluding the current one)
    if (categories.some(cat => 
      cat.id !== editCategoryId && 
      cat.name.toLowerCase() === editCategoryName.trim().toLowerCase()
    )) {
      errorMessage = 'Category already exists';
      return;
    }
    
    try {
      // In a real app, you would call an API
      console.log(`Updating category ${editCategoryId} to: ${editCategoryName}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update categories list
      categories = categories.map(cat => 
        cat.id === editCategoryId 
          ? { ...cat, name: editCategoryName.trim() } 
          : cat
      );
      
      // Exit edit mode
      cancelEdit();
      
    } catch (error) {
      console.error('Error updating category:', error);
      errorMessage = 'Failed to update category';
    }
  }
  
  // Delete category
  async function deleteCategory(categoryId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this category? This may affect items using this category.')) {
      return;
    }
    
    try {
      // In a real app, you would call an API
      console.log(`Deleting category: ${categoryId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Remove from categories list
      categories = categories.filter(cat => cat.id !== categoryId);
      
      // Exit edit mode if deleting the category being edited
      if (editCategoryId === categoryId) {
        cancelEdit();
      }
      
    } catch (error) {
      console.error('Error deleting category:', error);
      errorMessage = 'Failed to delete category';
    }
  }
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="admin-categories">
  {#if isLoading}
    <div class="loading">
      <p>Loading categories...</p>
    </div>
  {:else}
    <div class="categories-container">
      <!-- Add New Category -->
      <div class="add-category-section">
        <h2>Add New Category</h2>
        
        <div class="add-category-form">
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Enter category name" 
              bind:value={newCategoryName}
              class:error={errorMessage && !editMode}
            />
            {#if errorMessage && !editMode}
              <div class="error-message">{errorMessage}</div>
            {/if}
          </div>
          
          <button class="add-btn" onclick={addCategory}>
            <span class="material-icons">add</span>
            Add Category
          </button>
        </div>
      </div>
      
      <!-- Categories List -->
      <div class="categories-list-section">
        <h2>Categories</h2>
        
        <div class="table-container">
          <table class="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each categories as category}
                <tr>
                  <td>{category.id}</td>
                  <td>
                    {#if editMode && editCategoryId === category.id}
                      <div class="edit-form">
                        <input 
                          type="text" 
                          bind:value={editCategoryName}
                          class:error={errorMessage && editMode}
                        />
                        {#if errorMessage && editMode}
                          <div class="error-message">{errorMessage}</div>
                        {/if}
                      </div>
                    {:else}
                      {category.name}
                    {/if}
                  </td>
                  <td>{formatDate(category.created_at)}</td>
                  <td>
                    <div class="action-buttons">
                      {#if editMode && editCategoryId === category.id}
                        <button class="action-btn save-btn" title="Save" onclick={updateCategory}>
                          <span class="material-icons">save</span>
                        </button>
                        <button class="action-btn cancel-btn" title="Cancel" onclick={cancelEdit}>
                          <span class="material-icons">close</span>
                        </button>
                      {:else}
                        <button class="action-btn edit-btn" title="Edit" onclick={() => startEdit(category)}>
                          <span class="material-icons">edit</span>
                        </button>
                        <button class="action-btn delete-btn" title="Delete" onclick={() => deleteCategory(category.id)}>
                          <span class="material-icons">delete</span>
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
              
              {#if categories.length === 0}
                <tr>
                  <td colspan="4" class="no-categories">
                    <div class="no-categories-message">
                      <span class="material-icons">category</span>
                      <p>No categories found.</p>
                      <p>Add a new category to get started.</p>
                    </div>
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .admin-categories {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
  
  .categories-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .categories-container {
      grid-template-columns: 1fr;
    }
  }
  
  /* Add Category Section */
  .add-category-section {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .add-category-section h2 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
  }
  
  .add-category-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  input[type="text"] {
    padding: 0.75rem 1rem;
    border: 1px solid #dfe6e9;
    border-radius: 0.25rem;
    font-size: 1rem;
  }
  
  input[type="text"].error {
    border-color: #e53e3e;
  }
  
  .error-message {
    color: #e53e3e;
    font-size: 0.875rem;
  }
  
  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: #D98324;
    border: none;
    border-radius: 0.25rem;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .add-btn:hover {
    background-color: #c47520;
  }
  
  /* Categories List Section */
  .categories-list-section {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .categories-list-section h2 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .categories-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .categories-table th,
  .categories-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }
  
  .categories-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.875rem;
  }
  
  .categories-table tr:last-child td {
    border-bottom: none;
  }
  
  .categories-table tr:hover td {
    background-color: #f8f9fa;
  }
  
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-btn .material-icons {
    font-size: 18px;
  }
  
  .edit-btn {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  .edit-btn:hover {
    background-color: #c8e6c9;
  }
  
  .delete-btn {
    background-color: #ffebee;
    color: #f44336;
  }
  
  .delete-btn:hover {
    background-color: #ffcdd2;
  }
  
  .save-btn {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  .save-btn:hover {
    background-color: #c8e6c9;
  }
  
  .cancel-btn {
    background-color: #f8f9fa;
    color: #7f8c8d;
  }
  
  .cancel-btn:hover {
    background-color: #ecf0f1;
  }
  
  .no-categories {
    text-align: center;
    padding: 3rem 1rem !important;
  }
  
  .no-categories-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #7f8c8d;
  }
  
  .no-categories-message .material-icons {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
</style>
