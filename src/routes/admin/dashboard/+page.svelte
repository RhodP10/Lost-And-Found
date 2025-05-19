<script lang="ts">
  import { onMount } from 'svelte';

  // Stats for the dashboard
  let stats = $state({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    claimedItems: 0,
    totalUsers: 0,
    totalAdmins: 0
  });

  // Recent items
  let recentItems = $state<any[]>([]);

  // Loading state
  let isLoading = $state(true);

  // Modal states
  let showViewItemModal = $state(false);
  let showEditItemModal = $state(false);
  let showDeleteItemModal = $state(false);
  let selectedItem = $state<any>(null);

  // Edit item form data
  let editItemForm = $state<any>({
    title: '',
    description: '',
    category: '',
    status: '',
    location: '',
    floor: '',
    room_number: '',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: ''
  });

  // Error and success messages
  let errorMessage = $state('');
  let successMessage = $state('');

  onMount(async () => {
    try {
      // Fetch stats
      await fetchStats();

      // Fetch recent items
      await fetchRecentItems();

      isLoading = false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      isLoading = false;
    }
  });

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (data.success) {
        stats = data.stats;
      } else {
        console.error('Error fetching stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function fetchRecentItems() {
    try {
      // Fetch 5 most recent items
      const response = await fetch('/api/admin/items?limit=5');
      const data = await response.json();

      if (data.success) {
        recentItems = data.items;
      } else {
        console.error('Error fetching recent items:', data.error);
      }
    } catch (error) {
      console.error('Error fetching recent items:', error);
    }
  }

  // Open view item modal
  function openViewItemModal(item: any): void {
    selectedItem = item;
    showViewItemModal = true;
    // Clear any previous messages
    errorMessage = '';
    successMessage = '';
  }

  // Open edit item modal
  function openEditItemModal(item: any): void {
    selectedItem = item;
    // Initialize form with item data
    editItemForm = {
      title: item.title,
      description: item.description || '',
      category: item.category,
      status: item.status,
      location: item.location || '',
      floor: item.floor || '',
      room_number: item.room_number || '',
      reporter_name: item.reporter_name,
      reporter_email: item.reporter_email,
      reporter_phone: item.reporter_phone || ''
    };
    showEditItemModal = true;
    // Clear any previous messages
    errorMessage = '';
    successMessage = '';
  }

  // Open delete item modal
  function openDeleteItemModal(item: any): void {
    selectedItem = item;
    showDeleteItemModal = true;
    // Clear any previous messages
    errorMessage = '';
    successMessage = '';
  }

  // Close modals
  function closeModals(): void {
    showViewItemModal = false;
    showEditItemModal = false;
    showDeleteItemModal = false;
    selectedItem = null;
  }

  // Edit item
  async function editItem(): Promise<void> {
    if (!selectedItem) return;

    try {
      console.log('Editing item:', selectedItem.id, selectedItem.title);

      // Store title for success message
      const title = editItemForm.title;
      const itemId = selectedItem.id;

      // Call API to update item
      const response = await fetch(`/api/admin/items?id=${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editItemForm)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Check if the response status is in the success range (200-299)
      if (response.ok) {
        console.log('Edit successful, updating UI');
        // Update item in the list
        recentItems = recentItems.map(item =>
          item.id === data.item.id ? data.item : item
        );

        // Close modal
        closeModals();

        // Show success message
        successMessage = `Item "${title}" has been updated successfully.`;
        setTimeout(() => { successMessage = ''; }, 5000);
      } else {
        errorMessage = data.error || 'Failed to update item';
        console.error('Error updating item:', data.error);

        // Close modal after a short delay
        setTimeout(() => {
          closeModals();
        }, 1000);
      }
    } catch (error) {
      errorMessage = 'Failed to update item';
      console.error('Error updating item:', error);

      // Close modal after a short delay
      setTimeout(() => {
        closeModals();
      }, 1000);
    }
  }

  // Delete item
  async function deleteItem(): Promise<void> {
    if (!selectedItem) return;

    try {
      console.log('Deleting item:', selectedItem.id, selectedItem.title);

      // Store title for success message
      const title = selectedItem.title;
      const itemId = selectedItem.id;

      // Call API to delete item
      const url = `/api/admin/items?id=${itemId}`;
      console.log('DELETE request to:', url);

      const response = await fetch(url, {
        method: 'DELETE'
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Check if the response status is in the success range (200-299)
      if (response.ok) {
        console.log('Delete successful, updating UI');
        // Remove item from the list
        recentItems = recentItems.filter(item => item.id !== itemId);

        // Close modal
        closeModals();

        // Show success message
        successMessage = `Item "${title}" has been deleted successfully.`;
        setTimeout(() => { successMessage = ''; }, 5000);

        // Refresh stats
        await fetchStats();
      } else {
        errorMessage = data.error || 'Failed to delete item';
        console.error('Error deleting item:', data.error);

        // Close modal after a short delay
        setTimeout(() => {
          closeModals();
        }, 1000);
      }
    } catch (error) {
      errorMessage = 'Failed to delete item';
      console.error('Error deleting item:', error);

      // Close modal after a short delay
      setTimeout(() => {
        closeModals();
      }, 1000);
    }
  }

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get status badge class
  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'lost':
        return 'badge-lost';
      case 'found':
        return 'badge-found';
      case 'claimed':
        return 'badge-claimed';
      default:
        return '';
    }
  }
</script>

<div class="admin-dashboard">
  {#if errorMessage}
    <div class="alert alert-error">
      <span class="material-icons">error</span>
      <span>{errorMessage}</span>
      <button class="close-alert" onclick={() => errorMessage = ''}>×</button>
    </div>
  {/if}

  {#if successMessage}
    <div class="alert alert-success">
      <span class="material-icons">check_circle</span>
      <span>{successMessage}</span>
      <button class="close-alert" onclick={() => successMessage = ''}>×</button>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading">
      <p>Loading dashboard data...</p>
    </div>
  {:else}
    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">inventory_2</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{stats.totalItems}</div>
            <div class="stat-label">Total Items</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon lost">
            <span class="material-icons">search</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{stats.lostItems}</div>
            <div class="stat-label">Lost Items</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon found">
            <span class="material-icons">check_circle</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{stats.foundItems}</div>
            <div class="stat-label">Found Items</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon claimed">
            <span class="material-icons">handshake</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{stats.claimedItems}</div>
            <div class="stat-label">Claimed Items</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon users">
            <span class="material-icons">people</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{stats.totalUsers}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon admins">
            <span class="material-icons">admin_panel_settings</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{stats.totalAdmins}</div>
            <div class="stat-label">Administrators</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Items -->
    <div class="recent-items-section">
      <div class="section-header">
        <h2>Recent Items</h2>
        <a href="/admin/items" class="view-all-link">View All Items</a>
      </div>

      <div class="table-container">
        <table class="items-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Location</th>
              <th>Reported By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each recentItems as item}
              <tr>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>
                  <span class="badge {getStatusBadgeClass(item.status)}">
                    {item.status}
                  </span>
                </td>
                <td>{item.location}</td>
                <td>{item.reporter_name}</td>
                <td>{formatDate(item.date_reported)}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="action-btn view-btn"
                      title="View Item"
                      onclick={() => openViewItemModal(item)}
                    >
                      <span class="material-icons">visibility</span>
                    </button>
                    <button
                      class="action-btn edit-btn"
                      title="Edit Item"
                      onclick={() => openEditItemModal(item)}
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <button
                      class="action-btn delete-btn"
                      title="Delete Item"
                      onclick={() => openDeleteItemModal(item)}
                    >
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <div class="section-header">
        <h2>Quick Actions</h2>
      </div>

      <div class="quick-actions-grid">
        <a href="/admin/users" class="quick-action-card">
          <span class="material-icons">person_add</span>
          <span class="action-label">Manage Users</span>
        </a>

        <a href="/admin/items/add" class="quick-action-card">
          <span class="material-icons">add_circle</span>
          <span class="action-label">Add New Item</span>
        </a>

        <a href="/admin/categories" class="quick-action-card">
          <span class="material-icons">category</span>
          <span class="action-label">Manage Categories</span>
        </a>

        <a href="/admin/settings" class="quick-action-card">
          <span class="material-icons">settings</span>
          <span class="action-label">System Settings</span>
        </a>
      </div>
    </div>

    <!-- View Item Modal -->
    {#if showViewItemModal && selectedItem}
      <div class="modal-overlay" onclick={closeModals} role="dialog" aria-modal="true">
        <div class="modal modal-large" onclick={e => e.stopPropagation()} role="document">
          <div class="modal-header">
            <h3>Item Details</h3>
            <button class="close-btn" onclick={closeModals}>
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="item-details">
              <div class="detail-row">
                <div class="detail-label">ID:</div>
                <div class="detail-value">{selectedItem.id}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Title:</div>
                <div class="detail-value">{selectedItem.title}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Description:</div>
                <div class="detail-value">{selectedItem.description || '-'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Category:</div>
                <div class="detail-value">{selectedItem.category}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                  <span class="badge {getStatusBadgeClass(selectedItem.status)}">
                    {selectedItem.status}
                  </span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Location:</div>
                <div class="detail-value">{selectedItem.location || '-'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Floor:</div>
                <div class="detail-value">{selectedItem.floor || '-'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Room Number:</div>
                <div class="detail-value">{selectedItem.room_number || '-'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Reporter Name:</div>
                <div class="detail-value">{selectedItem.reporter_name}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Reporter Email:</div>
                <div class="detail-value">{selectedItem.reporter_email}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Reporter Phone:</div>
                <div class="detail-value">{selectedItem.reporter_phone || '-'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Date Reported:</div>
                <div class="detail-value">{formatDate(selectedItem.date_reported || selectedItem.created_at)}</div>
              </div>
              {#if selectedItem.image_url}
                <div class="detail-row">
                  <div class="detail-label">Image:</div>
                  <div class="detail-value">
                    <img src={selectedItem.image_url} alt={selectedItem.title} class="item-image" />
                  </div>
                </div>
              {/if}
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" onclick={closeModals}>Close</button>
            <button class="confirm-btn" onclick={() => { closeModals(); openEditItemModal(selectedItem); }}>Edit Item</button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Edit Item Modal -->
    {#if showEditItemModal && selectedItem}
      <div class="modal-overlay" onclick={closeModals} role="dialog" aria-modal="true">
        <div class="modal modal-large" onclick={e => e.stopPropagation()} role="document">
          <div class="modal-header">
            <h3>Edit Item</h3>
            <button class="close-btn" onclick={closeModals}>
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <form class="edit-item-form" onsubmit={e => e.preventDefault()}>
              <div class="form-group">
                <label for="title">Title</label>
                <input
                  type="text"
                  id="title"
                  bind:value={editItemForm.title}
                  required
                />
              </div>
              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  id="description"
                  bind:value={editItemForm.description}
                  rows="3"
                ></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="category">Category</label>
                  <select id="category" bind:value={editItemForm.category} required>
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Books">Books</option>
                    <option value="Documents">Documents</option>
                    <option value="Keys">Keys</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" bind:value={editItemForm.status} required>
                    <option value="">Select Status</option>
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                    <option value="claimed">Claimed</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    bind:value={editItemForm.location}
                  />
                </div>
                <div class="form-group">
                  <label for="floor">Floor</label>
                  <input
                    type="text"
                    id="floor"
                    bind:value={editItemForm.floor}
                  />
                </div>
                <div class="form-group">
                  <label for="room_number">Room Number</label>
                  <input
                    type="text"
                    id="room_number"
                    bind:value={editItemForm.room_number}
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="reporter_name">Reporter Name</label>
                  <input
                    type="text"
                    id="reporter_name"
                    bind:value={editItemForm.reporter_name}
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="reporter_email">Reporter Email</label>
                  <input
                    type="email"
                    id="reporter_email"
                    bind:value={editItemForm.reporter_email}
                    required
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="reporter_phone">Reporter Phone</label>
                <input
                  type="tel"
                  id="reporter_phone"
                  bind:value={editItemForm.reporter_phone}
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" onclick={closeModals}>Cancel</button>
            <button class="confirm-btn" onclick={editItem}>Save Changes</button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Delete Item Modal -->
    {#if showDeleteItemModal && selectedItem}
      <div class="modal-overlay" onclick={closeModals} role="dialog" aria-modal="true">
        <div class="modal" onclick={e => e.stopPropagation()} role="document">
          <div class="modal-header">
            <h3>Delete Item</h3>
            <button class="close-btn" onclick={closeModals}>
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete item <strong>"{selectedItem.title}"</strong>?</p>
            <p class="modal-info warning">This action cannot be undone. All data associated with this item will be permanently deleted.</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" onclick={closeModals}>Cancel</button>
            <button class="confirm-btn delete" onclick={deleteItem}>Delete Item</button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .admin-dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  /* Stats Section */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #2c3e50;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    color: white;
  }

  .stat-icon.lost {
    background-color: #e74c3c;
  }

  .stat-icon.found {
    background-color: #2ecc71;
  }

  .stat-icon.claimed {
    background-color: #f39c12;
  }

  .stat-icon.users {
    background-color: #3498db;
  }

  .stat-icon.admins {
    background-color: #9b59b6;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #7f8c8d;
    margin-top: 0.25rem;
  }

  /* Recent Items Section */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.25rem;
  }

  .view-all-link {
    color: #D98324;
    font-size: 0.875rem;
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  .view-all-link:hover {
    text-decoration: underline;
  }

  .table-container {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
  }

  .items-table th,
  .items-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }

  .items-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.875rem;
  }

  .items-table tr:last-child td {
    border-bottom: none;
  }

  .items-table tr:hover td {
    background-color: #f8f9fa;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
    text-transform: capitalize;
  }

  .badge-lost {
    background-color: #fde8e8;
    color: #e53e3e;
  }

  .badge-found {
    background-color: #e6fffa;
    color: #38b2ac;
  }

  .badge-claimed {
    background-color: #fef3c7;
    color: #d97706;
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

  .view-btn {
    background-color: #e3f2fd;
    color: #2196f3;
  }

  .view-btn:hover {
    background-color: #bbdefb;
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

  /* Quick Actions Section */
  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .quick-action-card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: #2c3e50;
    gap: 0.75rem;
  }

  .quick-action-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }

  .quick-action-card .material-icons {
    font-size: 2rem;
    color: #D98324;
  }

  .action-label {
    font-weight: 500;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background-color: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }

  .modal-large {
    max-width: 700px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #ecf0f1;
  }

  .modal-header h3 {
    margin: 0;
    color: #2c3e50;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #f8f9fa;
    color: #2c3e50;
  }

  .modal-body {
    padding: 1rem;
    overflow-y: auto;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 1px solid #ecf0f1;
  }

  .cancel-btn, .confirm-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .cancel-btn {
    background-color: #f8f9fa;
    color: #2c3e50;
    border: 1px solid #dfe6e9;
  }

  .cancel-btn:hover {
    background-color: #ecf0f1;
  }

  .confirm-btn {
    background-color: #D98324;
    color: white;
    border: none;
  }

  .confirm-btn:hover {
    background-color: #c67620;
  }

  .confirm-btn.delete {
    background-color: #e53e3e;
  }

  .confirm-btn.delete:hover {
    background-color: #c53030;
  }

  /* Item Details Styles */
  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-row {
    display: flex;
    border-bottom: 1px solid #ecf0f1;
    padding-bottom: 0.75rem;
  }

  .detail-label {
    width: 150px;
    font-weight: 600;
    color: #2c3e50;
  }

  .detail-value {
    flex: 1;
  }

  .item-image {
    max-width: 100%;
    max-height: 200px;
    border-radius: 0.25rem;
  }

  /* Form Styles */
  .edit-item-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
  }

  .form-row .form-group {
    flex: 1;
  }

  .form-group label {
    font-weight: 600;
    color: #2c3e50;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.75rem;
    border: 1px solid #dfe6e9;
    border-radius: 0.25rem;
    font-size: 1rem;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    border-color: #D98324;
    outline: none;
    box-shadow: 0 0 0 2px rgba(217, 131, 36, 0.2);
  }

  /* Modal Info */
  .modal-info {
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-top: 1rem;
    font-size: 0.875rem;
  }

  .modal-info.warning {
    background-color: #fff3e0;
    color: #e65100;
    border: 1px solid #ffe0b2;
  }

  /* Alert Styles */
  .alert {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    position: relative;
  }

  .alert .material-icons {
    margin-right: 0.5rem;
    font-size: 1.25rem;
  }

  .alert-success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
  }

  .alert-error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }

  .close-alert {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
  }

  .close-alert:hover {
    opacity: 1;
  }
</style>
