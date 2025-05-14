<script lang="ts">
  import { authStore } from '$lib/stores/auth';

  let isEditing = $state(false);
  let isLoading = $state(false);

  // Get user from auth store
  let user = $derived($authStore);

  // Form data
  let fullName = $state('');
  let email = $state('');
  let username = $state('');
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');

  // Form validation
  let errors = $state({} as {
    email?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  });
  let success = $state('');

  $effect(() => {
    if (user) {
      email = user.email || '';
      username = user.username || '';
      fullName = user.full_name || '';
    }
  });

  function toggleEditMode() {
    isEditing = !isEditing;

    if (!isEditing) {
      // Reset form when canceling edit
      email = user.email || '';
      username = user.username || '';
      fullName = user.full_name || '';
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
      errors = {};
      success = '';
    }
  }

  function validateForm() {
    errors = {};

    if (isEditing) {
      if (!email.trim()) errors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email';

      if (!username.trim()) errors.username = 'Username is required';

      // Password validation only if trying to change password
      if (newPassword) {
        if (!currentPassword) errors.currentPassword = 'Current password is required to set a new password';
        if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
        if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
      }
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    isLoading = true;
    errors.general = '';

    try {
      // Prepare the data to send to the API
      const userData: {
        id: any;
        username: string;
        email: string;
        full_name: string;
        current_password?: string;
        new_password?: string;
      } = {
        id: user.id,
        username,
        email,
        full_name: fullName
      };

      // Add password data if the user is trying to change it
      if (newPassword) {
        userData.current_password = currentPassword;
        userData.new_password = newPassword;
      }

      // Call the API to update the profile
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Update user in auth store with the returned user data
      authStore.login(result.user);

      // Show success message and exit edit mode
      success = result.message || 'Profile updated successfully!';
      isEditing = false;

      // Reset password fields
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';

    } catch (error: any) {
      console.error('Error updating profile:', error);
      errors.general = error.message || 'Failed to update profile. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="profile-container">
  <div class="profile-header">
    <h1>Profile</h1>
    {#if !isEditing}
      <button onclick={toggleEditMode} class="edit-button">
        <span class="material-icons">edit</span>
        Edit Profile
      </button>
    {/if}
  </div>

  {#if success}
    <div class="alert success">
      {success}
    </div>
  {/if}

  {#if errors.general}
    <div class="alert error">
      {errors.general}
    </div>
  {/if}

  <div class="profile-card">
    {#if isEditing}
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            bind:value={username}
            class="form-control"
            class:error={errors.username}
          />
          {#if errors.username}
            <div class="error-message">{errors.username}</div>
          {/if}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            class="form-control"
            class:error={errors.email}
          />
          {#if errors.email}
            <div class="error-message">{errors.email}</div>
          {/if}
        </div>

        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            bind:value={fullName}
            class="form-control"
          />
        </div>

        <div class="divider"></div>

        <h3>Change Password</h3>

        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            bind:value={currentPassword}
            class="form-control"
            class:error={errors.currentPassword}
          />
          {#if errors.currentPassword}
            <div class="error-message">{errors.currentPassword}</div>
          {/if}
        </div>

        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            bind:value={newPassword}
            class="form-control"
            class:error={errors.newPassword}
          />
          {#if errors.newPassword}
            <div class="error-message">{errors.newPassword}</div>
          {/if}
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            bind:value={confirmPassword}
            class="form-control"
            class:error={errors.confirmPassword}
          />
          {#if errors.confirmPassword}
            <div class="error-message">{errors.confirmPassword}</div>
          {/if}
        </div>

        <div class="form-actions">
          <button type="button" onclick={toggleEditMode} class="cancel-button" disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" class="save-button" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    {:else}
      <div class="profile-info">
        <div class="profile-item">
          <div class="profile-label">Username</div>
          <div class="profile-value">{user?.username}</div>
        </div>

        <div class="profile-item">
          <div class="profile-label">Email</div>
          <div class="profile-value">{user?.email}</div>
        </div>

        <div class="profile-item">
          <div class="profile-label">Full Name</div>
          <div class="profile-value">{user?.full_name || 'Not set'}</div>
        </div>

        <div class="profile-item">
          <div class="profile-label">Account Created</div>
          <div class="profile-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .profile-container {
    max-width: 100%;
  }

  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .profile-header h1 {
    color: #443627;
    margin: 0;
  }

  .edit-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #D98324;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .edit-button:hover {
    background-color: #c47520;
  }

  .profile-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    border-left: 4px solid #EFDCAB;
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
  }

  .alert.success {
    background-color: #d1e7dd;
    color: #0f5132;
    border: 1px solid #badbcc;
  }

  .alert.error {
    background-color: #f8d7da;
    color: #842029;
    border: 1px solid #f5c2c7;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #443627;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #EFDCAB;
    border-radius: 0.375rem;
    font-size: 1rem;
  }

  .form-control:focus {
    outline: none;
    border-color: #D98324;
    box-shadow: 0 0 0 2px rgba(217, 131, 36, 0.2);
  }

  .form-control.error {
    border-color: #dc3545;
  }

  .error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .divider {
    height: 1px;
    background-color: #EFDCAB;
    margin: 1.5rem 0;
  }

  h3 {
    color: #443627;
    font-size: 1.125rem;
    margin-top: 0;
    margin-bottom: 1.25rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .cancel-button {
    padding: 0.75rem 1.25rem;
    background-color: #f8f9fa;
    color: #212529;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
  }

  .save-button {
    padding: 0.75rem 1.25rem;
    background-color: #D98324;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s, opacity 0.2s;
  }

  .save-button:hover:not(:disabled) {
    background-color: #c47520;
  }

  .save-button:disabled, .cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .profile-item {
    padding-bottom: 1.25rem;
    border-bottom: 1px solid #EFDCAB;
  }

  .profile-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .profile-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
  }

  .profile-value {
    font-size: 1.125rem;
    color: #443627;
  }
</style>
