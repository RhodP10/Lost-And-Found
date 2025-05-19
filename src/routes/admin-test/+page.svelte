<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';

  let user = $derived($authStore);
  let isAdmin = $state(false);
  let adminDetails = $state(null);

  onMount(() => {
    if (user) {
      isAdmin = user.isAdmin || false;
      adminDetails = user.adminDetails || null;

      console.log('User:', user);
      console.log('Is admin?', isAdmin);
      console.log('Admin details:', adminDetails);
    }
  });
</script>

<div class="admin-test">
  <h1>Admin Test Page</h1>

  {#if user}
    <div class="user-info">
      <h2>User Information</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>

      {#if isAdmin && adminDetails}
        <div class="admin-details">
          <h2>Admin Details</h2>
          <p><strong>Admin ID:</strong> {adminDetails.id}</p>
          <p><strong>Role:</strong> {adminDetails.role}</p>
          <p><strong>Created At:</strong> {new Date(adminDetails.created_at).toLocaleString()}</p>
        </div>
      {/if}
    </div>

    <div class="links">
      <h2>Navigation Links</h2>
      <ul>
        <li><a href="/account/dashboard">User Dashboard</a></li>
        <li><a href="/admin/dashboard">Admin Dashboard</a></li>
        <li><a href="/admin/users">Admin Users</a></li>
        <li><a href="/admin/items">Admin Items</a></li>
        <li><a href="/admin/categories">Admin Categories</a></li>
      </ul>

      <div class="direct-links">
        <h3>Direct Links (Bypass Layout)</h3>
        <button onclick={() => window.location.href = '/admin/dashboard'}>
          Go to Admin Dashboard
        </button>
      </div>
    </div>
  {:else}
    <p>Please log in to see user information.</p>
    <a href="/login">Login</a>
  {/if}
</div>

<style>
  .admin-test {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #2c3e50;
    margin-bottom: 2rem;
  }

  h2 {
    color: #2c3e50;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .user-info, .admin-details, .links {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: #D98324;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .direct-links {
    margin-top: 2rem;
  }

  .direct-links h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  button {
    background-color: #D98324;
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover {
    background-color: #c47520;
  }
</style>
