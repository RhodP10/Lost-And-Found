<script>
  import { authStore } from '$lib/stores/auth';

  // Get the children prop
  let { children, data } = $props();

  // Get user from auth store
  let user = $derived($authStore);

  // Navigation items
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Users', icon: 'people' },
    { path: '/admin/items', label: 'Items', icon: 'inventory_2' },
    { path: '/admin/categories', label: 'Categories', icon: 'category' }
  ];

  // Get current path from page data
  let currentPath = $derived(data.pathname);

  // Update page title based on current path
  let pageTitle = $state('Admin Dashboard');

  $effect(() => {
    // Update page title based on current path
    if (currentPath.includes('/dashboard')) {
      pageTitle = 'Admin Dashboard';
    } else if (currentPath.includes('/users')) {
      pageTitle = 'User Management';
    } else if (currentPath.includes('/items')) {
      pageTitle = 'Item Management';
    } else if (currentPath.includes('/categories')) {
      pageTitle = 'Category Management';
    } else {
      pageTitle = 'Admin Dashboard';
    }
  });

  // Handle logout
  function handleLogout() {
    authStore.logout();
    window.location.href = '/';
  }
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <title>{pageTitle} | Admin Panel</title>
</svelte:head>

<div class="admin-layout">
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="material-icons">admin_panel_settings</span>
      </div>
      <div class="title">Admin Panel</div>
    </div>

    <div class="user-info">
      <div class="avatar">
        {#if user && user.username}
          <span>{user.username.charAt(0).toUpperCase()}</span>
        {:else}
          <span>A</span>
        {/if}
      </div>
      <div class="username">{user ? user.username : 'Guest'}</div>
    </div>

    <nav class="nav-menu">
      <ul>
        {#each navItems as item}
          <li class:active={currentPath.startsWith(item.path)}>
            <a href={item.path}>
              <span class="material-icons">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="sidebar-footer">
      <a href="/account/dashboard" class="user-dashboard-link">
        <span class="material-icons">person</span>
        <span>User Dashboard</span>
      </a>
      <button class="logout-btn" onclick={handleLogout}>
        <span class="material-icons">logout</span>
        <span>Logout</span>
      </button>
    </div>
  </div>

  <div class="main-content">
    <header class="header">
      <h1>{pageTitle}</h1>
      <div class="user-actions">
        <span>Welcome, {user ? user.username : 'Guest'}</span>
        <button class="logout-btn-small" onclick={handleLogout}>Logout</button>
      </div>
    </header>

    <div class="content">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 250px;
    background-color: #2c3e50;
    color: white;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background-color: #1a2530;
  }

  .logo {
    font-size: 2rem;
    color: #D98324;
    margin-right: 1rem;
  }

  .title {
    font-weight: bold;
    font-size: 1.2rem;
    color: #D98324;
  }

  .user-info {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background-color: rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #D98324;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 1rem;
  }

  .username {
    font-weight: 500;
  }

  .nav-menu {
    flex: 1;
    padding: 1rem 0;
  }

  .nav-menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-menu li a {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: white;
    text-decoration: none;
    transition: background-color 0.2s;
  }

  .nav-menu li a:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .nav-menu li.active a {
    background-color: #D98324;
    font-weight: bold;
  }

  .nav-menu .material-icons {
    margin-right: 0.75rem;
  }

  .sidebar-footer {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .user-dashboard-link {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.25rem;
    color: white;
    text-decoration: none;
  }

  .user-dashboard-link:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background-color: rgba(217, 131, 36, 0.2);
    border: 1px solid rgba(217, 131, 36, 0.5);
    border-radius: 0.25rem;
    color: white;
    cursor: pointer;
  }

  .logout-btn:hover {
    background-color: rgba(217, 131, 36, 0.3);
  }

  .logout-btn .material-icons {
    margin-right: 0.75rem;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: white;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .header h1 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logout-btn-small {
    background-color: #D98324;
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }
</style>
