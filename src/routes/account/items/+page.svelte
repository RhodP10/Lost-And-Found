<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';

  let user = $state(null as any);
  let isLoading = $state(true);
  let userItems = $state([] as any[]);
  let activeTab = $state('all'); // 'all', 'lost', 'found'
  let showDeleteModal = $state(false);
  let isDeleting = $state(false);
  let deleteError = $state('');
  let itemToDelete = $state(null as any);

  onMount(() => {
    // Subscribe to auth store
    const unsubscribe = authStore.subscribe((value) => {
      user = value;
    });

    // Fetch user's items
    if (user) {
      fetchUserItems().catch(error => {
        console.error('Error fetching user items:', error);
      });
    }

    isLoading = false;

    return unsubscribe;
  });

  async function fetchUserItems() {
    try {
      if (!user || !user.id) {
        console.error('User ID not available');
        return;
      }

      const response = await fetch(`/api/user/items?userId=${user.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      userItems = data.map((item: any) => ({
        ...item,
        date_reported: new Date(item.date_reported).toLocaleDateString()
      }));
    } catch (error) {
      console.error('Error fetching user items:', error);
      userItems = [];
    }
  }

  // Filter items based on active tab
  let filteredItems = $derived(
    activeTab === 'all'
      ? userItems
      : userItems.filter(item => item.status === activeTab)
  );

  // Function to open delete modal
  function openDeleteModal(item: any) {
    itemToDelete = item;
    showDeleteModal = true;
    deleteError = '';
  }

  // Function to delete an item
  async function deleteItem() {
    if (!itemToDelete) return;

    try {
      isDeleting = true;
      deleteError = '';

      const response = await fetch(`/api/items/${itemToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      // Remove the deleted item from the list
      userItems = userItems.filter(item => item.id !== itemToDelete.id);

      // Close the modal
      showDeleteModal = false;
      itemToDelete = null;
    } catch (err) {
      deleteError = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error deleting item:', deleteError);
    } finally {
      isDeleting = false;
    }
  }
</script>

<div class="my-items-container">
  <div class="my-items-header">
    <h1>My Items</h1>
    <a href="/account/report" class="report-button">
      <span class="material-icons">add</span>
      Report New Item
    </a>
  </div>

  <div class="tabs">
    <button
      class="tab-button"
      class:active={activeTab === 'all'}
      onclick={() => activeTab = 'all'}
    >
      All Items ({userItems.length})
    </button>
    <button
      class="tab-button"
      class:active={activeTab === 'lost'}
      onclick={() => activeTab = 'lost'}
    >
      Lost Items ({userItems.filter(item => item.status === 'lost').length})
    </button>
    <button
      class="tab-button"
      class:active={activeTab === 'found'}
      onclick={() => activeTab = 'found'}
    >
      Found Items ({userItems.filter(item => item.status === 'found').length})
    </button>
  </div>

  {#if isLoading}
    <div class="loading">
      <p>Loading your items...</p>
    </div>
  {:else if filteredItems.length === 0}
    <div class="empty-state">
      <div class="empty-icon">
        <span class="material-icons">inventory_2</span>
      </div>
      <h3>No items to display</h3>
      {#if activeTab === 'all'}
        <p>You haven't reported any items yet.</p>
      {:else if activeTab === 'lost'}
        <p>You haven't reported any lost items yet.</p>
      {:else}
        <p>You haven't reported any found items yet.</p>
      {/if}
      <a href="/account/report" class="empty-action">Report an Item</a>
    </div>
  {:else}
    <div class="items-grid">
      {#each filteredItems as item}
        <div class="item-card">
          {#if item.image_url}
            <div class="item-image">
              <img src={item.image_url} alt={item.title} />
            </div>
          {:else}
            <div class="item-image no-image">
              <span class="material-icons">image_not_supported</span>
            </div>
          {/if}
          <div class="item-content">
            <div class="item-status" class:lost={item.status === 'lost'} class:found={item.status === 'found'}>
              {item.status}
            </div>
            <h3 class="item-title">{item.title}</h3>
            <div class="item-details">
              <div class="item-detail">
                <span class="detail-label">Category:</span>
                <span class="detail-value">{item.category}</span>
              </div>
              {#if item.location}
                <div class="item-detail">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">{item.location}</span>
                </div>
              {/if}
              {#if item.floor}
                <div class="item-detail">
                  <span class="detail-label">Floor:</span>
                  <span class="detail-value">{item.floor}</span>
                </div>
              {/if}
              {#if item.room_number}
                <div class="item-detail">
                  <span class="detail-label">Room:</span>
                  <span class="detail-value">{item.room_number}</span>
                </div>
              {/if}
              <div class="item-detail">
                <span class="detail-label">Reported:</span>
                <span class="detail-value">{item.date_reported}</span>
              </div>
            </div>
            <div class="item-actions">
              <a href={`/account/items/${item.id}`} class="view-button">
                View Details
              </a>
              <a href={`/account/items/edit/${item.id}`} class="edit-button">
                <span class="material-icons">edit</span>
                Edit
              </a>
              <button onclick={() => openDeleteModal(item)} class="delete-button">
                <span class="material-icons">delete</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if showDeleteModal && itemToDelete}
    <div class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
          <button onclick={() => showDeleteModal = false} class="close-button">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this item?</p>
          <p><strong>{itemToDelete.title}</strong></p>
          <p>This action cannot be undone.</p>

          {#if deleteError}
            <div class="error-message">
              {deleteError}
            </div>
          {/if}
        </div>
        <div class="modal-footer">
          <button onclick={() => showDeleteModal = false} class="btn btn-secondary">
            Cancel
          </button>
          <button onclick={deleteItem} class="btn btn-danger" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .my-items-container {
    max-width: 100%;
  }

  .my-items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .my-items-header h1 {
    color: #443627;
    margin: 0;
  }

  .report-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #D98324;
    color: white;
    border-radius: 0.375rem;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .report-button:hover {
    background-color: #c47520;
  }

  .tabs {
    display: flex;
    border-bottom: 2px solid #EFDCAB;
    margin-bottom: 1.5rem;
  }

  .tab-button {
    padding: 0.75rem 1.25rem;
    background: none;
    border: none;
    color: #443627;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
  }

  .tab-button:hover {
    color: #D98324;
  }

  .tab-button.active {
    color: #D98324;
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #D98324;
  }

  .loading, .empty-state {
    background-color: white;
    border-radius: 0.5rem;
    padding: 3rem;
    text-align: center;
    margin-top: 1rem;
  }

  .empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    background-color: #f8f9fa;
    border-radius: 50%;
    margin-bottom: 1rem;
  }

  .empty-icon .material-icons {
    font-size: 2rem;
    color: #6c757d;
  }

  .empty-state h3 {
    color: #443627;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: #6c757d;
    margin-bottom: 1.5rem;
  }

  .empty-action {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #D98324;
    color: white;
    border-radius: 0.375rem;
    text-decoration: none;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .item-card {
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .item-image {
    height: 180px;
    overflow: hidden;
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-image.no-image {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    color: #adb5bd;
  }

  .item-content {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .item-status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: bold;
    margin-bottom: 0.75rem;
  }

  .item-status.lost {
    background-color: #f8d7da;
    color: #842029;
  }

  .item-status.found {
    background-color: #d1e7dd;
    color: #0f5132;
  }

  .item-title {
    color: #443627;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .item-details {
    margin-bottom: 1.25rem;
  }

  .item-detail {
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .detail-label {
    font-weight: 500;
    color: #6c757d;
    margin-right: 0.25rem;
  }

  .detail-value {
    color: #212529;
  }

  .item-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: auto;
  }

  .view-button, .edit-button, .delete-button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }

  .view-button {
    background-color: #EFDCAB;
    color: #443627;
  }

  .view-button:hover {
    background-color: #e5d29d;
  }

  .edit-button {
    background-color: #f3f4f6;
    color: #4b5563;
  }

  .edit-button:hover {
    background-color: #e5e7eb;
  }

  .delete-button {
    background-color: #fee2e2;
    color: #b91c1c;
  }

  .delete-button:hover {
    background-color: #fecaca;
  }

  .btn {
    padding: 0.75rem 1.25rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, opacity 0.2s;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: #f8f9fa;
    color: #212529;
    border: 1px solid #dee2e6;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #e9ecef;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
    border: none;
  }

  .btn-danger:hover:not(:disabled) {
    background-color: #bb2d3b;
  }

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

  .modal-container {
    background-color: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #EFDCAB;
  }

  .modal-header h3 {
    margin: 0;
    color: #443627;
    font-size: 1.25rem;
  }

  .close-button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
  }

  .close-button:hover {
    background-color: #f3f4f6;
    color: #1f2937;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #EFDCAB;
    background-color: #f9fafb;
  }

  .error-message {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-top: 1rem;
    font-size: 0.875rem;
  }
</style>
