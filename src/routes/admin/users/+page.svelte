<script lang="ts">
  import { onMount } from 'svelte';
  
  // Users list
  let users = $state([]);
  
  // Admins list
  let admins = $state([]);
  
  // Loading state
  let isLoading = $state(true);
  
  // Modal states
  let showAddAdminModal = $state(false);
  let showRemoveAdminModal = $state(false);
  let selectedUser = $state(null);
  
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
    // In a real app, you would fetch this from an API
    // For now, we'll use mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    users = [
      {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        full_name: 'John Doe',
        created_at: '2023-05-10T14:30:00Z'
      },
      {
        id: 2,
        username: 'sarah_wilson',
        email: 'sarah@example.com',
        full_name: 'Sarah Wilson',
        created_at: '2023-05-12T10:15:00Z'
      },
      {
        id: 3,
        username: 'michael_brown',
        email: 'michael@example.com',
        full_name: 'Michael Brown',
        created_at: '2023-05-15T16:45:00Z'
      },
      {
        id: 4,
        username: 'emily_johnson',
        email: 'emily@example.com',
        full_name: 'Emily Johnson',
        created_at: '2023-05-18T09:20:00Z'
      },
      {
        id: 5,
        username: 'robert_taylor',
        email: 'robert@example.com',
        full_name: 'Robert Taylor',
        created_at: '2023-05-20T13:10:00Z'
      }
    ];
  }
  
  async function fetchAdmins() {
    // In a real app, you would fetch this from an API
    // For now, we'll use mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    admins = [
      {
        id: 1,
        user_id: 1,
        role: 'admin',
        permissions: null,
        created_at: '2023-05-10T14:35:00Z'
      },
      {
        id: 2,
        user_id: 3,
        role: 'admin',
        permissions: null,
        created_at: '2023-05-16T10:20:00Z'
      }
    ];
  }
  
  // Check if user is admin
  function isUserAdmin(userId) {
    return admins.some(admin => admin.user_id === userId);
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
  
  // Open add admin modal
  function openAddAdminModal(user) {
    selectedUser = user;
    showAddAdminModal = true;
  }
  
  // Open remove admin modal
  function openRemoveAdminModal(user) {
    selectedUser = user;
    showRemoveAdminModal = true;
  }
  
  // Close modals
  function closeModals() {
    showAddAdminModal = false;
    showRemoveAdminModal = false;
    selectedUser = null;
  }
  
  // Add admin
  async function addAdmin() {
    if (!selectedUser) return;
    
    try {
      // In a real app, you would call an API
      console.log(`Adding user ${selectedUser.username} as admin`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add to admins list
      const newAdmin = {
        id: admins.length + 1,
        user_id: selectedUser.id,
        role: 'admin',
        permissions: null,
        created_at: new Date().toISOString()
      };
      
      admins = [...admins, newAdmin];
      
      // Close modal
      closeModals();
      
      // Show success message
      alert(`${selectedUser.username} has been added as an admin.`);
      
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Failed to add admin. Please try again.');
    }
  }
  
  // Remove admin
  async function removeAdmin() {
    if (!selectedUser) return;
    
    try {
      // In a real app, you would call an API
      console.log(`Removing admin status from user ${selectedUser.username}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from admins list
      admins = admins.filter(admin => admin.user_id !== selectedUser.id);
      
      // Close modal
      closeModals();
      
      // Show success message
      alert(`Admin status has been removed from ${selectedUser.username}.`);
      
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Failed to remove admin. Please try again.');
    }
  }
</script>

<div class="admin-users">
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
                    <button class="action-btn view-btn" title="View User">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="action-btn edit-btn" title="Edit User">
                      <span class="material-icons">edit</span>
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
</style>
