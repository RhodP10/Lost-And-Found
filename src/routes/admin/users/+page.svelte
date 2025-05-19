<script lang="ts">
  import { onMount } from 'svelte';

  // Users list
  let users = $state<any[]>([]);

  // Admins list
  let admins = $state<any[]>([]);

  // Loading state
  let isLoading = $state(true);

  // Modal states
  let showAddAdminModal = $state(false);
  let showRemoveAdminModal = $state(false);
  let showViewUserModal = $state(false);
  let showEditUserModal = $state(false);
  let showDeleteUserModal = $state(false);
  let selectedUser = $state<any>(null);

  // Edit user form data
  let editUserForm = $state<any>({
    username: '',
    email: '',
    full_name: '',
    password: ''
  });

  // Error and success messages
  let errorMessage = $state('');
  let successMessage = $state('');

  onMount(async () => {
    try {
      // Fetch users and admins
      await fetchUsers();
      await fetchAdmins();

      isLoading = false;
    } catch (error) {
      console.error('Error loading users data:', error);
      isLoading = false;
    }
  });

  async function fetchUsers() {
    try {
      // Fetch users from API
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        users = data.users;
      } else {
        errorMessage = data.error || 'Failed to fetch users';
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      errorMessage = 'Failed to fetch users';
      console.error('Error fetching users:', error);
    }
  }

  async function fetchAdmins() {
    try {
      // Fetch admins from API
      const response = await fetch('/api/admin/admins');
      const data = await response.json();

      if (data.success) {
        admins = data.admins;
      } else {
        errorMessage = data.error || 'Failed to fetch admins';
        console.error('Error fetching admins:', data.error);
      }
    } catch (error) {
      errorMessage = 'Failed to fetch admins';
      console.error('Error fetching admins:', error);
    }
  }

  // Check if user is admin
  function isUserAdmin(userId: number): boolean {
    return admins.some(admin => admin.user_id === userId);
  }

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Open add admin modal
  function openAddAdminModal(user: any): void {
    selectedUser = user;
    showAddAdminModal = true;
    // Clear any previous messages
    errorMessage = '';
    successMessage = '';
  }

  // Open remove admin modal
  function openRemoveAdminModal(user: any): void {
    selectedUser = user;
    showRemoveAdminModal = true;
    // Clear any previous messages
    errorMessage = '';
    successMessage = '';
  }

  // Open view user modal
  function openViewUserModal(user: any): void {
    selectedUser = user;
    showViewUserModal = true;
    // Clear any previous messages
    errorMessage = '';
    successMessage = '';
  }

  // Open edit user modal
  function openEditUserModal(user: any): void {
    selectedUser = user;
    // Initialize form with user data
    editUserForm = {
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      password: '' // Don't populate password for security
    };
    showEditUserModal = true;
    // Clear any previous messages
    errorMessage = '';
    successMessage = '';
  }

  // Open delete user modal
  function openDeleteUserModal(user: any): void {
    selectedUser = user;
    showDeleteUserModal = true;
    // Clear any previous messages
    errorMessage = '';
    successMessage = '';
  }

  // Close modals
  function closeModals(): void {
    showAddAdminModal = false;
    showRemoveAdminModal = false;
    showViewUserModal = false;
    showEditUserModal = false;
    showDeleteUserModal = false;
    selectedUser = null;
  }

  // Edit user
  async function editUser(): Promise<void> {
    if (!selectedUser) return;

    try {
      console.log('Editing user:', selectedUser.id, selectedUser.username);

      // Store username for success message
      const username = editUserForm.username;
      const userId = selectedUser.id;

      // Call API to update user
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUserForm)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Check if the response status is in the success range (200-299)
      if (response.ok) {
        console.log('Edit successful, updating UI');
        // Update user in the list
        users = users.map(user =>
          user.id === data.user.id ? data.user : user
        );

        // Close modal
        closeModals();

        // Show success message
        successMessage = `User ${username} has been updated successfully.`;
        setTimeout(() => { successMessage = ''; }, 5000);
      } else {
        errorMessage = data.error || 'Failed to update user';
        console.error('Error updating user:', data.error);

        // Close modal after a short delay
        setTimeout(() => {
          closeModals();
        }, 1000);
      }
    } catch (error) {
      errorMessage = 'Failed to update user';
      console.error('Error updating user:', error);

      // Close modal after a short delay
      setTimeout(() => {
        closeModals();
      }, 1000);
    }
  }

  // Delete user
  async function deleteUser(): Promise<void> {
    if (!selectedUser) return;

    try {
      console.log('Deleting user:', selectedUser.id, selectedUser.username);

      // Store username for success message
      const username = selectedUser.username;
      const userId = selectedUser.id;

      // Call API to delete user
      const url = `/api/admin/users?id=${userId}`;
      console.log('DELETE request to:', url);

      const response = await fetch(url, {
        method: 'DELETE'
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Check if the response status is in the success range (200-299)
      if (response.ok) {
        console.log('Delete successful, updating UI');
        // Remove user from the list
        users = users.filter(user => user.id !== userId);

        // If user was an admin, also remove from admins list
        if (isUserAdmin(userId)) {
          admins = admins.filter(admin => admin.user_id !== userId);
        }

        // Close modal
        closeModals();

        // Show success message
        successMessage = `User ${username} has been deleted successfully.`;
        setTimeout(() => { successMessage = ''; }, 5000);
      } else {
        errorMessage = data.error || 'Failed to delete user';
        console.error('Error deleting user:', data.error);

        // Close modal after a short delay
        setTimeout(() => {
          closeModals();
        }, 1000);
      }
    } catch (error) {
      errorMessage = 'Failed to delete user';
      console.error('Error deleting user:', error);

      // Close modal after a short delay
      setTimeout(() => {
        closeModals();
      }, 1000);
    }
  }

  // Add admin
  async function addAdmin() {
    if (!selectedUser) return;

    try {
      console.log('Adding admin:', selectedUser.id, selectedUser.username);

      // Store username for success message
      const username = selectedUser.username;
      const userId = selectedUser.id;

      // Call API to add admin
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          role: 'admin'
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Check if the response status is in the success range (200-299)
      if (response.ok) {
        console.log('Add admin successful, updating UI');
        // Refresh admins list
        await fetchAdmins();

        // Close modal
        closeModals();

        // Show success message
        successMessage = `${username} has been added as an admin.`;
        setTimeout(() => { successMessage = ''; }, 5000);
      } else {
        errorMessage = data.error || 'Failed to add admin';
        console.error('Error adding admin:', data.error);

        // Close modal after a short delay
        setTimeout(() => {
          closeModals();
        }, 1000);
      }
    } catch (error) {
      errorMessage = 'Failed to add admin';
      console.error('Error adding admin:', error);

      // Close modal after a short delay
      setTimeout(() => {
        closeModals();
      }, 1000);
    }
  }

  // Remove admin
  async function removeAdmin() {
    if (!selectedUser) return;

    try {
      console.log('Removing admin:', selectedUser.id, selectedUser.username);

      // Store username for success message
      const username = selectedUser.username;
      const userId = selectedUser.id;

      // Call API to remove admin
      const url = `/api/admin/admins?user_id=${userId}`;
      console.log('DELETE request to:', url);

      const response = await fetch(url, {
        method: 'DELETE'
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Check if the response status is in the success range (200-299)
      if (response.ok) {
        console.log('Remove admin successful, updating UI');
        // Refresh admins list
        await fetchAdmins();

        // Close modal
        closeModals();

        // Show success message
        successMessage = `Admin status has been removed from ${username}.`;
        setTimeout(() => { successMessage = ''; }, 5000);
      } else {
        errorMessage = data.error || 'Failed to remove admin';
        console.error('Error removing admin:', data.error);

        // Close modal after a short delay
        setTimeout(() => {
          closeModals();
        }, 1000);
      }
    } catch (error) {
      errorMessage = 'Failed to remove admin';
      console.error('Error removing admin:', error);

      // Close modal after a short delay
      setTimeout(() => {
        closeModals();
      }, 1000);
    }
  }
</script>

<div class="admin-users">
  {#if errorMessage}
    <div class="alert alert-error">
      <span class="material-icons">error</span>
      <span>{errorMessage}</span>
      <button class="close-alert" onclick={() => errorMessage = ''}>×</button>
    </div>
  {/if}

  {#if successMessage}
    <div class="alert alert-success">
      <span class="material-icons">check_circle</span>
      <span>{successMessage}</span>
      <button class="close-alert" onclick={() => successMessage = ''}>×</button>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading">
      <p>Loading users data...</p>
    </div>
  {:else}
    <!-- Users Section -->
    <div class="users-section">
      <div class="section-header">
        <h2>Users Management</h2>
      </div>

      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Joined</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user}
              <tr>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.full_name || '-'}</td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  {#if isUserAdmin(user.id)}
                    <span class="badge badge-admin">Admin</span>
                  {:else}
                    <span class="badge badge-user">User</span>
                  {/if}
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="action-btn view-btn"
                      title="View User"
                      onclick={() => openViewUserModal(user)}
                    >
                      <span class="material-icons">visibility</span>
                    </button>
                    <button
                      class="action-btn edit-btn"
                      title="Edit User"
                      onclick={() => openEditUserModal(user)}
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <button
                      class="action-btn delete-btn"
                      title="Delete User"
                      onclick={() => openDeleteUserModal(user)}
                    >
                      <span class="material-icons">delete</span>
                    </button>
                    {#if isUserAdmin(user.id)}
                      <button
                        class="action-btn remove-admin-btn"
                        title="Remove Admin Status"
                        onclick={() => openRemoveAdminModal(user)}
                      >
                        <span class="material-icons">admin_panel_settings</span>
                      </button>
                    {:else}
                      <button
                        class="action-btn add-admin-btn"
                        title="Make Admin"
                        onclick={() => openAddAdminModal(user)}
                      >
                        <span class="material-icons">admin_panel_settings</span>
                      </button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Admins Section -->
    <div class="admins-section">
      <div class="section-header">
        <h2>Administrators</h2>
      </div>

      <div class="table-container">
        <table class="admins-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Admin Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each admins as admin}
              {@const user = users.find(u => u.id === admin.user_id)}
              {#if user}
                <tr>
                  <td>{admin.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{admin.role}</td>
                  <td>{formatDate(admin.created_at)}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="action-btn remove-admin-btn"
                        title="Remove Admin Status"
                        onclick={() => openRemoveAdminModal(user)}
                      >
                        <span class="material-icons">person_remove</span>
                      </button>
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Add Admin Modal -->
  {#if showAddAdminModal && selectedUser}
    <div class="modal-overlay" onclick={closeModals}>
      <div class="modal" onclick={e => e.stopPropagation()}>
        <div class="modal-header">
          <h3>Add Administrator</h3>
          <button class="close-btn" onclick={closeModals}>
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to make <strong>{selectedUser.username}</strong> an administrator?</p>
          <p class="modal-info">Administrators have full access to the system and can manage all aspects of the application.</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" onclick={closeModals}>Cancel</button>
          <button class="confirm-btn" onclick={addAdmin}>Make Admin</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Remove Admin Modal -->
  {#if showRemoveAdminModal && selectedUser}
    <div class="modal-overlay" onclick={closeModals}>
      <div class="modal" onclick={e => e.stopPropagation()}>
        <div class="modal-header">
          <h3>Remove Administrator</h3>
          <button class="close-btn" onclick={closeModals}>
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to remove administrator status from <strong>{selectedUser.username}</strong>?</p>
          <p class="modal-info">This user will no longer have administrative access to the system.</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" onclick={closeModals}>Cancel</button>
          <button class="confirm-btn delete" onclick={removeAdmin}>Remove Admin</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- View User Modal -->
  {#if showViewUserModal && selectedUser}
    <div class="modal-overlay" onclick={closeModals} role="dialog" aria-modal="true">
      <div class="modal modal-large" onclick={e => e.stopPropagation()} role="document">
        <div class="modal-header">
          <h3>User Details</h3>
          <button class="close-btn" onclick={closeModals}>
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="user-details">
            <div class="detail-row">
              <div class="detail-label">ID:</div>
              <div class="detail-value">{selectedUser.id}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Username:</div>
              <div class="detail-value">{selectedUser.username}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">{selectedUser.email}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Full Name:</div>
              <div class="detail-value">{selectedUser.full_name || '-'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Admin Status:</div>
              <div class="detail-value">
                {#if isUserAdmin(selectedUser.id)}
                  <span class="badge badge-admin">Admin</span>
                {:else}
                  <span class="badge badge-user">User</span>
                {/if}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Created:</div>
              <div class="detail-value">{formatDate(selectedUser.created_at)}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Last Updated:</div>
              <div class="detail-value">{selectedUser.updated_at ? formatDate(selectedUser.updated_at) : '-'}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" onclick={closeModals}>Close</button>
          <button class="confirm-btn" onclick={() => { closeModals(); openEditUserModal(selectedUser); }}>Edit User</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Edit User Modal -->
  {#if showEditUserModal && selectedUser}
    <div class="modal-overlay" onclick={closeModals} role="dialog" aria-modal="true">
      <div class="modal modal-large" onclick={e => e.stopPropagation()} role="document">
        <div class="modal-header">
          <h3>Edit User</h3>
          <button class="close-btn" onclick={closeModals}>
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form class="edit-user-form" onsubmit={e => e.preventDefault()}>
            <div class="form-group">
              <label for="username">Username</label>
              <input
                type="text"
                id="username"
                bind:value={editUserForm.username}
                required
              />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                bind:value={editUserForm.email}
                required
              />
            </div>
            <div class="form-group">
              <label for="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                bind:value={editUserForm.full_name}
              />
            </div>
            <div class="form-group">
              <label for="password">Password (leave blank to keep current)</label>
              <input
                type="password"
                id="password"
                bind:value={editUserForm.password}
              />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" onclick={closeModals}>Cancel</button>
          <button class="confirm-btn" onclick={editUser}>Save Changes</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete User Modal -->
  {#if showDeleteUserModal && selectedUser}
    <div class="modal-overlay" onclick={closeModals} role="dialog" aria-modal="true">
      <div class="modal" onclick={e => e.stopPropagation()} role="document">
        <div class="modal-header">
          <h3>Delete User</h3>
          <button class="close-btn" onclick={closeModals}>
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete user <strong>{selectedUser.username}</strong>?</p>
          <p class="modal-info warning">This action cannot be undone. All data associated with this user will be permanently deleted.</p>
          {#if isUserAdmin(selectedUser.id)}
            <p class="modal-info warning">This user is an administrator. Deleting this user will also remove their admin status.</p>
          {/if}
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" onclick={closeModals}>Cancel</button>
          <button class="confirm-btn delete" onclick={deleteUser}>Delete User</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .admin-users {
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

  .table-container {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .users-table,
  .admins-table {
    width: 100%;
    border-collapse: collapse;
  }

  .users-table th,
  .users-table td,
  .admins-table th,
  .admins-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }

  .users-table th,
  .admins-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.875rem;
  }

  .users-table tr:last-child td,
  .admins-table tr:last-child td {
    border-bottom: none;
  }

  .users-table tr:hover td,
  .admins-table tr:hover td {
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

  .badge-admin {
    background-color: #e8f5e9;
    color: #4caf50;
  }

  .badge-user {
    background-color: #e3f2fd;
    color: #2196f3;
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

  .add-admin-btn {
    background-color: #e8f5e9;
    color: #4caf50;
  }

  .add-admin-btn:hover {
    background-color: #c8e6c9;
  }

  .remove-admin-btn {
    background-color: #ffebee;
    color: #f44336;
  }

  .remove-admin-btn:hover {
    background-color: #ffcdd2;
  }

  .delete-btn {
    background-color: #ffebee;
    color: #f44336;
  }

  .delete-btn:hover {
    background-color: #ffcdd2;
  }

  /* User Details Styles */
  .user-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-row {
    display: flex;
    border-bottom: 1px solid #ecf0f1;
    padding-bottom: 0.75rem;
  }

  .detail-label {
    width: 150px;
    font-weight: 600;
    color: #2c3e50;
  }

  .detail-value {
    flex: 1;
  }

  /* Form Styles */
  .edit-user-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 600;
    color: #2c3e50;
  }

  .form-group input {
    padding: 0.75rem;
    border: 1px solid #dfe6e9;
    border-radius: 0.25rem;
    font-size: 1rem;
  }

  .form-group input:focus {
    border-color: #D98324;
    outline: none;
    box-shadow: 0 0 0 2px rgba(217, 131, 36, 0.2);
  }

  /* Modal Size Variants */
  .modal-large {
    max-width: 600px;
  }

  /* Warning Styles */
  .modal-info.warning {
    background-color: #fff3e0;
    color: #e65100;
    border-color: #ffe0b2;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background-color: white;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #ecf0f1;
  }

  .modal-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #7f8c8d;
  }

  .close-btn:hover {
    color: #2c3e50;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-info {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    color: #7f8c8d;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #ecf0f1;
  }

  .cancel-btn {
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border: 1px solid #dfe6e9;
    border-radius: 0.25rem;
    color: #2c3e50;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .cancel-btn:hover {
    background-color: #ecf0f1;
  }

  .confirm-btn {
    padding: 0.5rem 1rem;
    background-color: #D98324;
    border: none;
    border-radius: 0.25rem;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .confirm-btn:hover {
    background-color: #c47520;
  }

  .confirm-btn.delete {
    background-color: #e53e3e;
  }

  .confirm-btn.delete:hover {
    background-color: #c53030;
  }

  /* Alert Styles */
  .alert {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    position: relative;
  }

  .alert .material-icons {
    margin-right: 0.5rem;
    font-size: 1.25rem;
  }

  .alert-success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
  }

  .alert-error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }

  .close-alert {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
  }

  .close-alert:hover {
    opacity: 1;
  }
</style>
