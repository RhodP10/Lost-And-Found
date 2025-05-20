<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  // Claim type
  interface Claim {
    id: number;
    item_id: number;
    item_title: string;
    claimant_name: string;
    claimant_email: string;
    claimant_phone: string | null;
    student_id: string | null;
    proof_description: string;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    claim_date: string;
  }
  
  // State variables
  let claims: Claim[] = [];
  let isLoading = true;
  let error = '';
  let statusFilter = 'all';
  let selectedClaim: Claim | null = null;
  let isProcessing = false;
  let successMessage = '';
  let errorMessage = '';
  let adminNotes = '';
  
  // Fetch claims on mount
  onMount(async () => {
    await fetchClaims();
  });
  
  // Fetch claims from API
  async function fetchClaims() {
    isLoading = true;
    error = '';
    
    try {
      const url = statusFilter === 'all' 
        ? '/api/claims' 
        : `/api/claims?status=${statusFilter}`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }
      
      const data = await response.json();
      
      if (data.success) {
        claims = data.claims;
      } else {
        throw new Error(data.error || 'Failed to fetch claims');
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isLoading = false;
    }
  }
  
  // Handle status filter change
  function handleStatusFilterChange() {
    fetchClaims();
  }
  
  // View claim details
  function viewClaimDetails(claim: Claim) {
    selectedClaim = claim;
    adminNotes = claim.notes || '';
  }
  
  // Close claim details
  function closeClaimDetails() {
    selectedClaim = null;
    adminNotes = '';
  }
  
  // Process claim (approve/reject)
  async function processClaim(action: 'approved' | 'rejected') {
    if (!selectedClaim) return;
    
    isProcessing = true;
    errorMessage = '';
    successMessage = '';
    
    try {
      const response = await fetch(`/api/claims/${selectedClaim.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action,
          notes: adminNotes
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        successMessage = `Claim ${action === 'approved' ? 'approved' : 'rejected'} successfully`;
        
        // Update the claim in the list
        claims = claims.map(claim => 
          claim.id === selectedClaim?.id ? data.claim : claim
        );
        
        // Update selected claim
        selectedClaim = data.claim;
      } else {
        errorMessage = data.error || `Failed to ${action} claim`;
      }
    } catch (err) {
      console.error(`Error ${action} claim:`, err);
      errorMessage = `An error occurred while ${action === 'approved' ? 'approving' : 'rejecting'} the claim`;
    } finally {
      isProcessing = false;
    }
  }
  
  // Format date
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  // Get status badge class
  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'approved': return 'badge-approved';
      case 'rejected': return 'badge-rejected';
      default: return '';
    }
  }
  
  // View item details
  function viewItemDetails(itemId: number) {
    goto(`/items/${itemId}`);
  }
</script>

<div class="admin-claims-page">
  <div class="page-header">
    <h1>Manage Claims</h1>
    <div class="filter-controls">
      <label for="status-filter">Filter by Status:</label>
      <select 
        id="status-filter" 
        bind:value={statusFilter} 
        on:change={handleStatusFilterChange}
      >
        <option value="all">All Claims</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
  </div>
  
  {#if isLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading claims...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <p class="error-message">{error}</p>
    </div>
  {:else if claims.length === 0}
    <div class="empty-container">
      <p>No claims found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.</p>
    </div>
  {:else}
    <div class="claims-table-container">
      <table class="claims-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Claimant</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each claims as claim}
            <tr>
              <td>{claim.id}</td>
              <td>
                <button class="link-button" on:click={() => viewItemDetails(claim.item_id)}>
                  {claim.item_title}
                </button>
              </td>
              <td>{claim.claimant_name}</td>
              <td>{formatDate(claim.claim_date)}</td>
              <td>
                <span class="status-badge {getStatusBadgeClass(claim.status)}">
                  {claim.status}
                </span>
              </td>
              <td>
                <button class="view-button" on:click={() => viewClaimDetails(claim)}>
                  View Details
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  
  {#if selectedClaim}
    <div class="claim-details-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Claim Details</h2>
          <button class="close-button" on:click={closeClaimDetails}>×</button>
        </div>
        
        {#if successMessage}
          <div class="success-message">
            <span class="material-icons">check_circle</span>
            <span>{successMessage}</span>
          </div>
        {/if}
        
        {#if errorMessage}
          <div class="error-message">
            <span class="material-icons">error</span>
            <span>{errorMessage}</span>
          </div>
        {/if}
        
        <div class="claim-info">
          <div class="info-section">
            <h3>Claim Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Claim ID</span>
                <span class="info-value">{selectedClaim.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="info-value status-badge {getStatusBadgeClass(selectedClaim.status)}">
                  {selectedClaim.status}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Date Submitted</span>
                <span class="info-value">{formatDate(selectedClaim.claim_date)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Item</span>
                <span class="info-value">
                  <button class="link-button" on:click={() => viewItemDetails(selectedClaim.item_id)}>
                    {selectedClaim.item_title}
                  </button>
                </span>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h3>Claimant Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">{selectedClaim.claimant_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">
                  <a href={`mailto:${selectedClaim.claimant_email}`}>
                    {selectedClaim.claimant_email}
                  </a>
                </span>
              </div>
              {#if selectedClaim.claimant_phone}
                <div class="info-item">
                  <span class="info-label">Phone</span>
                  <span class="info-value">
                    <a href={`tel:${selectedClaim.claimant_phone}`}>
                      {selectedClaim.claimant_phone}
                    </a>
                  </span>
                </div>
              {/if}
              {#if selectedClaim.student_id}
                <div class="info-item">
                  <span class="info-label">Student ID</span>
                  <span class="info-value">{selectedClaim.student_id}</span>
                </div>
              {/if}
            </div>
          </div>
          
          <div class="info-section">
            <h3>Proof of Ownership</h3>
            <p class="proof-text">{selectedClaim.proof_description}</p>
          </div>
          
          <div class="info-section">
            <h3>Admin Notes</h3>
            <textarea 
              bind:value={adminNotes} 
              disabled={selectedClaim.status !== 'pending' || isProcessing}
              placeholder="Add notes about this claim (optional)"
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            class="cancel-button" 
            on:click={closeClaimDetails}
          >
            Close
          </button>
          
          {#if selectedClaim.status === 'pending'}
            <div class="action-buttons">
              <button 
                class="reject-button" 
                on:click={() => processClaim('rejected')}
                disabled={isProcessing}
              >
                {#if isProcessing}
                  Processing...
                {:else}
                  Reject Claim
                {/if}
              </button>
              <button 
                class="approve-button" 
                on:click={() => processClaim('approved')}
                disabled={isProcessing}
              >
                {#if isProcessing}
                  Processing...
                {:else}
                  Approve Claim
                {/if}
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .admin-claims-page {
    padding: 2rem 0;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-dark);
  }
  
  .filter-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .filter-controls label {
    font-weight: 600;
  }
  
  .filter-controls select {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background-color: white;
  }
  
  .loading-container,
  .error-container,
  .empty-container {
    padding: 3rem;
    text-align: center;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(217, 131, 36, 0.3);
    border-radius: 50%;
    border-top-color: var(--color-accent);
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error-message {
    color: #e53e3e;
  }
  
  .claims-table-container {
    overflow-x: auto;
  }
  
  .claims-table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .claims-table th,
  .claims-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .claims-table th {
    background-color: #f7fafc;
    font-weight: 600;
    color: var(--color-dark);
  }
  
  .claims-table tr:last-child td {
    border-bottom: none;
  }
  
  .claims-table tr:hover {
    background-color: #f7fafc;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .badge-pending {
    background-color: #ebf8ff;
    color: #3182ce;
  }
  
  .badge-approved {
    background-color: #f0fff4;
    color: #38a169;
  }
  
  .badge-rejected {
    background-color: #fff5f5;
    color: #e53e3e;
  }
  
  .view-button {
    padding: 0.375rem 0.75rem;
    background-color: var(--color-accent);
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .view-button:hover {
    background-color: #c67620;
  }
  
  .link-button {
    background: none;
    border: none;
    color: var(--color-accent);
    cursor: pointer;
    padding: 0;
    font-weight: 500;
    text-decoration: underline;
  }
  
  .link-button:hover {
    color: #c67620;
  }
  
  .claim-details-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-dark);
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #718096;
  }
  
  .success-message,
  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    margin: 0 1.5rem;
    border-radius: 0.375rem;
    margin-top: 1.5rem;
  }
  
  .success-message {
    background-color: #f0fff4;
    color: #38a169;
    border: 1px solid #c6f6d5;
  }
  
  .error-message {
    background-color: #fff5f5;
    color: #e53e3e;
    border: 1px solid #fed7d7;
  }
  
  .claim-info {
    padding: 1.5rem;
  }
  
  .info-section {
    margin-bottom: 1.5rem;
  }
  
  .info-section h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-dark);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
  }
  
  .info-label {
    font-size: 0.875rem;
    color: #718096;
    margin-bottom: 0.25rem;
  }
  
  .info-value {
    font-weight: 500;
    color: var(--color-dark);
  }
  
  .proof-text {
    background-color: #f7fafc;
    padding: 1rem;
    border-radius: 0.375rem;
    white-space: pre-line;
  }
  
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    resize: vertical;
  }
  
  .modal-actions {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
  }
  
  .cancel-button,
  .reject-button,
  .approve-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .cancel-button {
    background-color: #e2e8f0;
    color: #4a5568;
  }
  
  .cancel-button:hover {
    background-color: #cbd5e0;
  }
  
  .reject-button {
    background-color: #fff5f5;
    color: #e53e3e;
    border: 1px solid #fed7d7;
  }
  
  .reject-button:hover {
    background-color: #fed7d7;
  }
  
  .approve-button {
    background-color: var(--color-accent);
    color: white;
  }
  
  .approve-button:hover {
    background-color: #c67620;
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
