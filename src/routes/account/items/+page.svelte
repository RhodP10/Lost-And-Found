<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';

  let user = $state(null as any);
  let isLoading = $state(true);
  let userItems = $state([] as any[]);
  let activeTab = $state('all'); // 'all', 'lost', 'found'

  onMount(() => {
    // Subscribe to auth store
    const unsubscribe = authStore.subscribe((value) => {
      user = value;

      // When user changes, fetch items if user is available
      if (user && user.id) {
        isLoading = true;
        fetchUserItems()
          .catch(error => {
            console.error('Error fetching user items:', error);
          })
          .finally(() => {
            isLoading = false;
          });
      } else {
        isLoading = false;
      }
    });

    return unsubscribe;
  });

  async function fetchUserItems() {
    try {
      // Make sure we have a user
      if (!user || !user.id) {
        console.error('No user ID available');
        return;
      }

      console.log('Fetching items for user ID:', user.id);

      // Get user from localStorage for auth header
      let authToken = '';
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          authToken = storedUser;
        }
      } catch (e) {
        console.error('Error getting user from localStorage:', e);
      }

      // Fetch items for the current user
      const response = await fetch('/api/user/items', {
        headers: {
          'Content-Type': 'application/json',
          // Include user data in auth header as a backup
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();

      // Format the date and update the items
      userItems = data.map((item: any) => ({
        ...item,
        date_reported: new Date(item.date_reported).toLocaleDateString()
      }));

      console.log('Fetched user items:', userItems);
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
            </div>
          </div>
        </div>
      {/each}
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
    margin-top: auto;
  }

  .view-button {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #EFDCAB;
    color: #443627;
    border-radius: 0.375rem;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .view-button:hover {
    background-color: #e5d29d;
  }
</style>
