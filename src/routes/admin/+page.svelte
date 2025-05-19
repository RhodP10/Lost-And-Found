<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';

  // Get user from auth store
  let user = $derived($authStore);

  onMount(() => {
    // Redirect to admin dashboard
    goto('/admin/dashboard');
  });
</script>

<div class="redirect-container">
  <div class="redirect-content">
    <div class="spinner"></div>
    <p>Redirecting to admin dashboard...</p>

    {#if user && user.isAdmin}
      <div class="user-info">
        <p>Logged in as: <strong>{user.username}</strong></p>
        <p>Admin status: <span class="badge">Admin</span></p>
      </div>
    {:else if user}
      <div class="user-info">
        <p>Logged in as: <strong>{user.username}</strong></p>
        <p>Admin status: <span class="badge error">Not Admin</span></p>
        <p class="error-message">You need admin privileges to access this area.</p>
      </div>
    {:else}
      <div class="user-info">
        <p>Not logged in</p>
        <p class="error-message">Please <a href="/login">log in</a> to access the admin area.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .redirect-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .redirect-content {
    background-color: white;
    border-radius: 0.5rem;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #D98324;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .user-info {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    text-align: left;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #10b981;
    color: white;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge.error {
    background-color: #ef4444;
  }

  .error-message {
    color: #ef4444;
    margin-top: 0.5rem;
  }

  a {
    color: #D98324;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
