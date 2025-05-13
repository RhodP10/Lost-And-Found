<script>
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';

  // Get current path for active link highlighting
  $: currentPath = $page.url.pathname;

  // Get user from auth store
  $: user = $authStore;

  // Navigation items
  const navItems = [
    { path: '/user/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/user/profile', label: 'Profile', icon: 'person' },
    { path: '/report', label: 'Report Item', icon: 'add_circle' },
    { path: '/user/my-items', label: 'My Items', icon: 'inventory' }
  ];

  // Handle logout
  function handleLogout() {
    // Call logout API
    fetch('/api/auth/logout', {
      method: 'POST'
    }).then(() => {
      // Clear auth store
      authStore.logout();
      // Redirect to home page
      window.location.href = '/';
    }).catch(error => {
      console.error('Error logging out:', error);
    });
  }
</script>

<div class="user-nav">
  <div class="user-profile">
    <div class="avatar">
      {#if user && user.username}
        <span>{user.username.charAt(0).toUpperCase()}</span>
      {:else}
        <span>U</span>
      {/if}
    </div>
    <div class="user-info">
      <div class="username">{user ? user.username : 'User'}</div>
      <div class="email">{user ? user.email : 'user@example.com'}</div>
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
    <button on:click={handleLogout} class="logout-button">
      <span class="icon material-icons">logout</span>
      <span class="label">Logout</span>
    </button>
  </div>
</div>

<style>
  .user-nav {
    background-color: #443627;
    color: white;
    width: 250px;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 0;
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
</style>
