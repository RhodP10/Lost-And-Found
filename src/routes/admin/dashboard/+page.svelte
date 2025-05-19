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
  let recentItems = $state([]);
  
  // Loading state
  let isLoading = $state(true);
  
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
    // In a real app, you would fetch this from an API
    // For now, we'll use mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    stats = {
      totalItems: 42,
      lostItems: 18,
      foundItems: 20,
      claimedItems: 4,
      totalUsers: 15,
      totalAdmins: 3
    };
  }
  
  async function fetchRecentItems() {
    // In a real app, you would fetch this from an API
    // For now, we'll use mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    recentItems = [
      {
        id: 1,
        title: 'iPhone 13 Pro',
        status: 'lost',
        location: 'Library',
        reporter_name: 'John Smith',
        date_reported: '2023-06-15T14:30:00Z'
      },
      {
        id: 2,
        title: 'Black Wallet',
        status: 'found',
        location: 'Cafeteria',
        reporter_name: 'Sarah Wilson',
        date_reported: '2023-06-14T10:15:00Z'
      },
      {
        id: 3,
        title: 'Laptop Charger',
        status: 'lost',
        location: 'Computer Lab',
        reporter_name: 'Michael Brown',
        date_reported: '2023-06-13T16:45:00Z'
      },
      {
        id: 4,
        title: 'Student ID Card',
        status: 'found',
        location: 'Main Entrance',
        reporter_name: 'Emily Johnson',
        date_reported: '2023-06-12T09:20:00Z'
      },
      {
        id: 5,
        title: 'Textbook',
        status: 'claimed',
        location: 'Science Building',
        reporter_name: 'Robert Taylor',
        date_reported: '2023-06-11T13:10:00Z'
      }
    ];
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

<div class="admin-dashboard">
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
</style>
