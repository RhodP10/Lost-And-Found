<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let { children } = $props();

  // Get user from auth store
  let user = $derived($authStore);

  onMount(() => {
    // If user is not logged in, redirect to login page
    if (!user) {
      goto('/login');
    }
  });

  // Navigation items
  const navItems = [
    { path: '/account/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/account/profile', label: 'Profile', icon: 'person' },
    { path: '/report', label: 'Report Item', icon: 'add_circle' },
    { path: '/account/items', label: 'My Items', icon: 'inventory' }
  ];

  // Get current path for active link highlighting
  let currentPath = $state('');
  let pageTitle = $state('Dashboard');

  onMount(() => {
    currentPath = window.location.pathname;
    updatePageTitle(currentPath);

    // Update path when navigation occurs
    const handleNavigation = () => {
      currentPath = window.location.pathname;
      updatePageTitle(currentPath);
    };

    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  });

  // Update page title based on current path
  function updatePageTitle(path: string) {
    if (path.includes('/dashboard')) {
      pageTitle = 'Dashboard';
    } else if (path.includes('/profile')) {
      pageTitle = 'Profile';
    } else if (path.includes('/items')) {
      pageTitle = 'My Items';
    } else {
      pageTitle = 'Account';
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST'
      });

      // Clear auth store
      authStore.logout();

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
</script>

<svelte:head>
  <!-- Add Material Icons for navigation icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</svelte:head>

{#if user}
  <div class="account-layout">
    <div class="sidebar">
      <div class="user-profile">
        <div class="avatar">
          {#if user && user.username}
            <span>{user.username.charAt(0).toUpperCase()}</span>
          {:else}
            <span>U</span>
          {/if}
        </div>
        <div class="user-info">
          <div class="username">{user.username}</div>
          <div class="email">{user.email}</div>
        </div>
      </div>

      <nav class="nav-menu">
        <ul>
          {#each navItems as item}
            <li class:active={currentPath.startsWith(item.path)}>
              <a href={item.path}>
                <span class="icon material-icons">{item.icon}</span>
                <span class="label">{item.label}</span>
              </a>
            </li>
          {/each}
        </ul>
      </nav>

      <div class="logout-section">
        <button onclick={handleLogout} class="logout-button">
          <span class="icon material-icons">logout</span>
          <span class="label">Logout</span>
        </button>
      </div>
    </div>

    <div class="content-area">
      <header class="account-header">
        <div class="header-title">
          <h1>{pageTitle}</h1>
        </div>
        <div class="header-actions">
          <div class="user-greeting">
            Hello, <strong>{user.username}</strong>
          </div>
          <button onclick={handleLogout} class="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div class="content">
        {@render children()}
      </div>
    </div>
  </div>
{:else}
  <div class="loading-container">
    <p>Loading...</p>
  </div>
{/if}

<style>
  .account-layout {
    display: flex;
    min-height: calc(100vh - 60px); /* Adjust based on your header height */
  }

  .sidebar {
    background-color: #443627;
    color: white;
    width: 250px;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 0;
    position: sticky;
    top: 60px; /* Adjust based on your header height */
    height: calc(100vh - 60px); /* Adjust based on your header height */
  }

  .user-profile {
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    margin-bottom: 2rem;
  }

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #D98324;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 1rem;
  }

  .user-info {
    overflow: hidden;
  }

  .username {
    font-weight: bold;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .email {
    font-size: 0.75rem;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-menu {
    flex: 1;
  }

  .nav-menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-menu li {
    margin-bottom: 0.5rem;
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

  .icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }

  .logout-section {
    padding: 0 1.5rem;
    margin-top: 2rem;
  }

  .logout-button {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.75rem;
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.25rem;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .logout-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #F2F6D0;
  }

  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: white;
    border-bottom: 1px solid #EFDCAB;
  }

  .header-title h1 {
    margin: 0;
    color: #443627;
    font-size: 1.5rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-greeting {
    color: #443627;
  }

  .logout-btn {
    background-color: #D98324;
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .logout-btn:hover {
    background-color: #c47520;
  }

  .content {
    flex: 1;
    padding: 2rem;
    background-color: #F2F6D0;
    overflow-y: auto;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #F2F6D0;
  }
</style>
