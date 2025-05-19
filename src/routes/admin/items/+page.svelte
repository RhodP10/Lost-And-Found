<script lang="ts">
  import { onMount } from 'svelte';

  // Items list
  let items = $state([]);

  // Filter states
  let statusFilter = $state('all');
  let categoryFilter = $state('all');
  let searchQuery = $state('');

  // Categories list
  let categories = $state([]);

  // Loading state
  let isLoading = $state(true);

  // Pagination
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let totalItems = $state(0);

  // Computed properties
  let filteredItems = $derived(filterItems(items));
  let paginatedItems = $derived(paginateItems(filteredItems));
  let totalPages = $derived(Math.ceil(filteredItems.length / itemsPerPage));

  onMount(async () => {
    try {
      // Fetch items and categories
      await fetchItems();
      await fetchCategories();

      isLoading = false;
    } catch (error) {
      console.error('Error loading items data:', error);
      isLoading = false;
    }
  });

  async function fetchItems() {
    // In a real app, you would fetch this from an API
    // For now, we'll use mock data

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    items = [
      {
        id: 1,
        title: 'iPhone 13 Pro',
        description: 'Lost my iPhone 13 Pro with a black case. The lock screen has a picture of a dog.',
        category: 'Electronics',
        status: 'lost',
        location: 'Student Center',
        reporter_name: 'John Smith',
        reporter_email: 'john@example.com',
        date_reported: '2023-06-15T14:30:00Z'
      },
      {
        id: 2,
        title: 'Black Wallet',
        description: 'Found a black leather wallet with ID and credit cards inside.',
        category: 'Accessories',
        status: 'found',
        location: 'Engineering Building',
        reporter_name: 'Sarah Wilson',
        reporter_email: 'sarah@example.com',
        date_reported: '2023-06-14T10:15:00Z'
      },
      {
        id: 3,
        title: 'Laptop Charger',
        description: 'Lost my MacBook Pro charger in the computer lab.',
        category: 'Electronics',
        status: 'lost',
        location: 'Computer Lab',
        reporter_name: 'Michael Brown',
        reporter_email: 'michael@example.com',
        date_reported: '2023-06-13T16:45:00Z'
      },
      {
        id: 4,
        title: 'Student ID Card',
        description: 'Found a student ID card for Emily Johnson.',
        category: 'Documents',
        status: 'found',
        location: 'Main Entrance',
        reporter_name: 'Robert Taylor',
        reporter_email: 'robert@example.com',
        date_reported: '2023-06-12T09:20:00Z'
      },
      {
        id: 5,
        title: 'Textbook',
        description: 'Found a calculus textbook with the name "Jessica" written inside.',
        category: 'Other',
        status: 'claimed',
        location: 'Science Building',
        reporter_name: 'David Lee',
        reporter_email: 'david@example.com',
        date_reported: '2023-06-11T13:10:00Z'
      },
      {
        id: 6,
        title: 'Blue Backpack',
        description: 'Lost my blue North Face backpack with laptop inside.',
        category: 'Bags',
        status: 'lost',
        location: 'Library',
        reporter_name: 'Jessica Miller',
        reporter_email: 'jessica@example.com',
        date_reported: '2023-06-10T11:05:00Z'
      },
      {
        id: 7,
        title: 'Car Keys',
        description: 'Found a set of car keys with a Toyota key fob.',
        category: 'Keys',
        status: 'found',
        location: 'Parking Lot',
        reporter_name: 'Thomas Wilson',
        reporter_email: 'thomas@example.com',
        date_reported: '2023-06-09T15:30:00Z'
      }
    ];

    totalItems = items.length;
  }

  async function fetchCategories() {
    // In a real app, you would fetch this from an API
    // For now, we'll use mock data

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    categories = [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Accessories' },
      { id: 4, name: 'Documents' },
      { id: 5, name: 'Keys' },
      { id: 6, name: 'Bags' },
      { id: 7, name: 'Other' }
    ];
  }

  // Filter items based on status, category, and search query
  function filterItems(items) {
    return items.filter(item => {
      // Filter by status
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Filter by category
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.reporter_name.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }

  // Paginate items
  function paginateItems(items) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  // Handle page change
  function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }

  // Reset filters
  function resetFilters() {
    statusFilter = 'all';
    categoryFilter = 'all';
    searchQuery = '';
    currentPage = 1;
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

  // Get status badge class
  function getStatusBadgeClass(status) {
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

<div class="admin-items">
  {#if isLoading}
    <div class="loading">
      <p>Loading items data...</p>
    </div>
  {:else}
    <!-- Filters Section -->
    <div class="filters-section">
      <div class="search-box">
        <span class="material-icons search-icon">search</span>
        <input
          type="text"
          placeholder="Search items..."
          bind:value={searchQuery}
          oninput={() => currentPage = 1}
        />
        {#if searchQuery}
          <button class="clear-search" onclick={() => searchQuery = ''}>
            <span class="material-icons">close</span>
          </button>
        {/if}
      </div>

      <div class="filter-controls">
        <div class="filter-group">
          <label for="status-filter">Status:</label>
          <select
            id="status-filter"
            bind:value={statusFilter}
            onchange={() => currentPage = 1}
          >
            <option value="all">All Statuses</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="category-filter">Category:</label>
          <select
            id="category-filter"
            bind:value={categoryFilter}
            onchange={() => currentPage = 1}
          >
            <option value="all">All Categories</option>
            {#each categories as category}
              <option value={category.name}>{category.name}</option>
            {/each}
          </select>
        </div>

        <button class="reset-filters" onclick={resetFilters}>
          <span class="material-icons">refresh</span>
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-section">
      <div class="section-header">
        <h2>Items Management</h2>
        <div class="header-actions">
          <span class="item-count">{filteredItems.length} items found</span>
          <a href="/admin/items/add" class="add-item-btn">
            <span class="material-icons">add</span>
            Add New Item
          </a>
        </div>
      </div>

      <div class="table-container">
        <table class="items-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Location</th>
              <th>Reporter</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedItems as item}
              <tr>
                <td>{item.id}</td>
                <td>
                  <div class="item-title" title={item.description}>
                    {item.title}
                  </div>
                </td>
                <td>{item.category}</td>
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
                    <button class="action-btn view-btn" title="View Item">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="action-btn edit-btn" title="Edit Item">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="action-btn delete-btn" title="Delete Item">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            {/each}

            {#if paginatedItems.length === 0}
              <tr>
                <td colspan="8" class="no-items">
                  <div class="no-items-message">
                    <span class="material-icons">search_off</span>
                    <p>No items found matching your filters.</p>
                    <button class="reset-filters" onclick={resetFilters}>
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if filteredItems.length > 0}
        <div class="pagination">
          <button
            class="pagination-btn"
            disabled={currentPage === 1}
            onclick={() => changePage(1)}
          >
            <span class="material-icons">first_page</span>
          </button>

          <button
            class="pagination-btn"
            disabled={currentPage === 1}
            onclick={() => changePage(currentPage - 1)}
          >
            <span class="material-icons">chevron_left</span>
          </button>

          <div class="pagination-info">
            Page {currentPage} of {totalPages}
          </div>

          <button
            class="pagination-btn"
            disabled={currentPage === totalPages}
            onclick={() => changePage(currentPage + 1)}
          >
            <span class="material-icons">chevron_right</span>
          </button>

          <button
            class="pagination-btn"
            disabled={currentPage === totalPages}
            onclick={() => changePage(totalPages)}
          >
            <span class="material-icons">last_page</span>
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .admin-items {
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

  /* Filters Section */
  .filters-section {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .search-box {
    position: relative;
    margin-bottom: 1rem;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #7f8c8d;
  }

  .search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #dfe6e9;
    border-radius: 0.25rem;
    font-size: 1rem;
  }

  .clear-search {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
  }

  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-group label {
    font-weight: 500;
    color: #2c3e50;
  }

  .filter-group select {
    padding: 0.5rem;
    border: 1px solid #dfe6e9;
    border-radius: 0.25rem;
    background-color: white;
  }

  .reset-filters {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border: 1px solid #dfe6e9;
    border-radius: 0.25rem;
    color: #2c3e50;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-left: auto;
  }

  .reset-filters:hover {
    background-color: #ecf0f1;
  }

  /* Items Section */
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .item-count {
    color: #7f8c8d;
    font-size: 0.875rem;
  }

  .add-item-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background-color: #D98324;
    border-radius: 0.25rem;
    color: white;
    text-decoration: none;
    transition: background-color 0.2s;
  }

  .add-item-btn:hover {
    background-color: #c47520;
    text-decoration: none;
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

  .item-title {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

  .no-items {
    text-align: center;
    padding: 3rem 1rem !important;
  }

  .no-items-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #7f8c8d;
  }

  .no-items-message .material-icons {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .no-items-message .reset-filters {
    margin-top: 0.5rem;
  }

  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .pagination-btn {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    border: 1px solid #dfe6e9;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .pagination-btn:hover:not(:disabled) {
    background-color: #f8f9fa;
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-info {
    padding: 0 1rem;
    color: #2c3e50;
    font-size: 0.875rem;
  }
</style>
