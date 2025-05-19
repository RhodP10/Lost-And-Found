<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  
  let user = $derived($authStore);
  let isAdmin = $state(false);
  
  onMount(() => {
    if (user) {
      isAdmin = user.isAdmin || false;
    }
  });
</script>

<div class="admin-simple">
  <div class="admin-header">
    <h1>Simple Admin Dashboard</h1>
    <div class="user-info">
      {#if user}
        <span>Logged in as: <strong>{user.username}</strong></span>
        <span class="admin-badge">{isAdmin ? 'Admin' : 'User'}</span>
      {:else}
        <span>Not logged in</span>
      {/if}
    </div>
  </div>
  
  <div class="admin-content">
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Admin Menu</h2>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li class="active"><a href="/admin-simple">Dashboard</a></li>
          <li><a href="/admin-simple/users">Users</a></li>
          <li><a href="/admin-simple/items">Items</a></li>
          <li><a href="/admin-simple/categories">Categories</a></li>
          <li><a href="/admin-simple/settings">Settings</a></li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <a href="/account/dashboard" class="user-dashboard-link">User Dashboard</a>
        <button class="logout-button">Logout</button>
      </div>
    </div>
    
    <div class="main-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">inventory_2</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">42</div>
            <div class="stat-label">Total Items</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon lost">
            <span class="material-icons">search</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">18</div>
            <div class="stat-label">Lost Items</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon found">
            <span class="material-icons">check_circle</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">20</div>
            <div class="stat-label">Found Items</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon claimed">
            <span class="material-icons">handshake</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">4</div>
            <div class="stat-label">Claimed Items</div>
          </div>
        </div>
      </div>
      
      <div class="recent-items">
        <h2>Recent Items</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Location</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>iPhone 13 Pro</td>
              <td><span class="badge lost">Lost</span></td>
              <td>Library</td>
              <td>Jun 15, 2023</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Black Wallet</td>
              <td><span class="badge found">Found</span></td>
              <td>Cafeteria</td>
              <td>Jun 14, 2023</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Laptop Charger</td>
              <td><span class="badge lost">Lost</span></td>
              <td>Computer Lab</td>
              <td>Jun 13, 2023</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<svelte:head>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</svelte:head>

<style>
  .admin-simple {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  .admin-header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .admin-header h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .admin-badge {
    background-color: #D98324;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: bold;
  }
  
  .admin-content {
    display: flex;
    flex: 1;
  }
  
  .sidebar {
    width: 250px;
    background-color: #2c3e50;
    color: white;
    display: flex;
    flex-direction: column;
  }
  
  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .sidebar-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #D98324;
  }
  
  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
  }
  
  .sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .sidebar-nav li {
    margin-bottom: 0.25rem;
  }
  
  .sidebar-nav a {
    display: block;
    padding: 0.75rem 1.5rem;
    color: white;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  
  .sidebar-nav a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    text-decoration: none;
  }
  
  .sidebar-nav li.active a {
    background-color: #D98324;
    font-weight: bold;
  }
  
  .sidebar-footer {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .user-dashboard-link {
    display: block;
    padding: 0.75rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.25rem;
    color: white;
    text-decoration: none;
    text-align: center;
    transition: background-color 0.2s;
  }
  
  .user-dashboard-link:hover {
    background-color: rgba(255, 255, 255, 0.2);
    text-decoration: none;
  }
  
  .logout-button {
    padding: 0.75rem;
    background-color: rgba(217, 131, 36, 0.2);
    border: 1px solid rgba(217, 131, 36, 0.5);
    border-radius: 0.25rem;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .logout-button:hover {
    background-color: rgba(217, 131, 36, 0.3);
  }
  
  .main-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  
  .recent-items {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .recent-items h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #2c3e50;
    font-size: 1.25rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.875rem;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
    text-transform: capitalize;
  }
  
  .badge.lost {
    background-color: #fde8e8;
    color: #e53e3e;
  }
  
  .badge.found {
    background-color: #e6fffa;
    color: #38b2ac;
  }
  
  .badge.claimed {
    background-color: #fef3c7;
    color: #d97706;
  }
</style>
