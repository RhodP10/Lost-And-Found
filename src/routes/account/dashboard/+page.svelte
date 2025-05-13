<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { navigateToAccountPage } from '$lib/utils/navigation';

  let user = $state(null as any);
  let isLoading = $state(true);
  let userItems = $state([] as any[]);

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
      const response = await fetch('/api/user/items');

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
</script>

<div class="dashboard-container">
  <div class="dashboard-header">
    <h1>Dashboard</h1>
    <p>Welcome back, <strong>{user?.username}</strong>!</p>
  </div>

  <div class="dashboard-grid">
    <!-- User Stats -->
    <div class="dashboard-card stats-card">
      <h2>Your Activity</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{userItems.filter(item => item.status === 'lost').length}</span>
          <span class="stat-label">Lost Items</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{userItems.filter(item => item.status === 'found').length}</span>
          <span class="stat-label">Found Items</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{userItems.length}</span>
          <span class="stat-label">Total Reports</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="dashboard-card actions-card">
      <h2>Quick Actions</h2>
      <div class="quick-actions">
        <a href="/account/report" class="action-button lost-button">
          Report Lost Item
        </a>
        <a href="/account/report?type=found" class="action-button found-button">
          Report Found Item
        </a>
      </div>
    </div>
  </div>

  <!-- Recent Reports -->
  <div class="dashboard-card reports-card">
    <h2>Your Recent Reports</h2>

    {#if userItems.length === 0}
      <p class="empty-message">You haven't reported any items yet.</p>
    {:else}
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Date Reported</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each userItems as item}
              <tr>
                <td>{item.title}</td>
                <td>
                  <span class="status-badge" class:lost={item.status === 'lost'} class:found={item.status === 'found'}>
                    {item.status}
                  </span>
                </td>
                <td>{item.category}</td>
                <td>{item.date_reported}</td>
                <td>
                  <a href={`/account/items/${item.id}`} class="view-button" data-from-account="true" onclick={(e) => {
                    // Ensure we stay in the account layout
                    e.preventDefault();
                    navigateToAccountPage(`/items/${item.id}`);
                  }}>
                    View
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  <!-- Notifications -->
  <div class="dashboard-card notifications-card">
    <h2>Notifications</h2>
    <div class="notification-list">
      <div class="notification-item">
        <div class="notification-icon">
          <span class="material-icons">notifications</span>
        </div>
        <div class="notification-content">
          <p class="notification-text">Welcome to your dashboard! Here you can manage all your lost and found items.</p>
          <p class="notification-time">Just now</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard-container {
    max-width: 100%;
  }

  .dashboard-header h1 {
    color: #443627;
    margin-bottom: 0.5rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .dashboard-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    border-left: 4px solid #EFDCAB;
  }

  .dashboard-card h2 {
    color: #443627;
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #EFDCAB;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: bold;
    color: #D98324;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #443627;
  }

  .quick-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .action-button {
    display: inline-block;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
  }

  .lost-button {
    background-color: #D98324;
    color: white;
  }

  .lost-button:hover {
    background-color: #c47520;
  }

  .found-button {
    background-color: #443627;
    color: white;
  }

  .found-button:hover {
    background-color: #362b1f;
  }

  .reports-card, .notifications-card {
    margin-bottom: 1.5rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #EFDCAB;
  }

  th {
    font-weight: 600;
    color: #443627;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: bold;
  }

  .status-badge.lost {
    background-color: #f8d7da;
    color: #842029;
  }

  .status-badge.found {
    background-color: #d1e7dd;
    color: #0f5132;
  }

  .view-button {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #EFDCAB;
    color: #443627;
    border-radius: 0.25rem;
    text-decoration: none;
    font-size: 0.875rem;
  }

  .empty-message {
    color: #6c757d;
    font-style: italic;
  }

  .notification-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .notification-item {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .notification-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: #D98324;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
  }

  .notification-text {
    margin: 0;
  }

  .notification-time {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: #6c757d;
  }
</style>
