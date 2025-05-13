<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';

  // Get the item ID from the URL and data from the server
  let { id, data } = $props<{ id: string; data: { item: any } }>();

  // Ensure ID is properly formatted - use the ID from the server data if available
  const itemId = data?.item?.id || (id ? parseInt(id, 10) : null);
  console.log('Item ID from URL:', id, 'From server data:', data?.item?.id, 'Using:', itemId);

  // Form data
  let title = $state('');
  let description = $state('');
  let category = $state('');
  let status = $state<'lost' | 'found'>('lost');
  let location = $state('');
  let floor = $state('');
  let roomNumber = $state('');
  let reporterName = $state('');
  let reporterEmail = $state('');
  let reporterPhone = $state('');
  let imageUrl = $state('');

  let categories = $state<any[]>([]);
  let isLoading = $state(true);
  let isSaving = $state(false);
  let error = $state('');
  let success = $state(false);
  let user = $state(null as any);

  // Floor options
  const floorOptions = [
    { value: '1st Floor', label: '1st Floor' },
    { value: '2nd Floor', label: '2nd Floor' },
    { value: '3rd Floor', label: '3rd Floor' },
    { value: '4th Floor', label: '4th Floor' },
    { value: '5th Floor', label: '5th Floor' }
  ];

  // Form validation
  let errors = $state<Record<string, string>>({});

  onMount(() => {
    // Subscribe to auth store
    const unsubscribe = authStore.subscribe((value) => {
      user = value;
    });

    // Use server-side data if available
    if (data && data.item) {
      console.log('Server-side data available:', data.item);
      populateFormWithItem(data.item);
    } else {
      console.log('No server-side data available');
    }

    // Fetch categories and item data if needed
    Promise.all([
      data && data.item ? Promise.resolve() : fetchItem(),
      fetchCategories()
    ]).catch(err => {
      console.error('Error initializing form:', err);
    }).finally(() => {
      isLoading = false;
    });

    return unsubscribe;
  });

  // Helper function to populate form with item data
  function populateFormWithItem(item: any) {
    title = item.title || '';
    description = item.description || '';
    category = item.category || '';
    status = item.status || 'lost';
    location = item.location || '';
    floor = item.floor || '';
    roomNumber = item.room_number || '';
    reporterName = item.reporter_name || '';
    reporterEmail = item.reporter_email || '';
    reporterPhone = item.reporter_phone || '';
    imageUrl = item.image_url || '';
  }

  async function fetchItem() {
    try {
      if (!itemId) {
        throw new Error('Invalid item ID');
      }

      console.log(`Fetching item with ID: ${itemId}`);

      const response = await fetch(`/api/items/${itemId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch item details');
      }

      const item = await response.json();
      console.log('Fetched item data:', item);

      // Populate form with item data
      populateFormWithItem(item);

    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error fetching item:', error);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      categories = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error(error);
    }
  }

  function validateForm() {
    errors = {};

    if (!title.trim()) errors.title = 'Title is required';
    if (!category) errors.category = 'Category is required';
    if (!location.trim()) errors.location = 'Location is required';
    if (!floor) errors.floor = 'Floor is required';
    if (!roomNumber.trim()) errors.roomNumber = 'Room number is required';
    if (!reporterName.trim()) errors.reporterName = 'Your name is required';
    if (!reporterEmail.trim()) errors.reporterEmail = 'Your email is required';
    else if (!/^\S+@\S+\.\S+$/.test(reporterEmail)) errors.reporterEmail = 'Please enter a valid email';

    if (reporterPhone && !/^\+?[0-9\s\-()]{7,}$/.test(reporterPhone)) {
      errors.reporterPhone = 'Please enter a valid phone number';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      isSaving = true;
      error = ''; // Clear any previous errors

      // Include user_id if available
      const userId = user ? user.id : (data?.item?.user_id || null);
      console.log('Submitting with user ID:', userId);

      const itemData = {
        title,
        description,
        category,
        status,
        location,
        floor,
        room_number: roomNumber,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        reporter_phone: reporterPhone,
        image_url: imageUrl,
        user_id: userId
      };

      console.log('Submitting item data:', itemData);

      try {
        // First, validate the item ID
        if (!itemId) {
          throw new Error('Invalid item ID');
        }

        // For debugging, check if the item exists
        const checkResponse = await fetch(`/api/debug/item/${itemId}`);
        const checkData = await checkResponse.json();
        console.log('Item check result:', checkData);

        if (!checkData.method1_found) {
          console.error(`Item with ID ${itemId} not found in database`);
          throw new Error(`Item with ID ${itemId} not found`);
        }

        console.log(`Sending update request for item ID: ${itemId}`);

        // Use the raw ID from the URL for the API call
        const response = await fetch(`/api/items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...itemData,
            id: itemId // Include the ID in the request body
          }),
          credentials: 'include' // Include cookies in the request
        });

        console.log('Response status:', response.status);

        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to update item');
        }

        success = true;

        // Redirect to item details after a short delay
        // Use keepFocus to ensure we stay in the account layout
        setTimeout(() => {
          goto(`/account/items/${itemId}?updated=true`, { keepFocus: true });
        }, 1500);
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error in handleSubmit:', error);
    } finally {
      isSaving = false;
    }
  }

  function goBack() {
    // Use the parsed itemId if available, otherwise go to the items list
    // Use keepFocus to ensure we stay in the account layout
    if (itemId) {
      goto(`/account/items/${itemId}`, { keepFocus: true });
    } else {
      goto('/account/items', { keepFocus: true });
    }
  }
</script>

<div class="edit-item-container">
  <div class="back-button-container">
    <button onclick={goBack} class="back-button">
      <span class="material-icons">arrow_back</span>
      Back to Item Details
    </button>
  </div>

  <div class="edit-header">
    <h1>Edit Item</h1>
    <p>Update the information for your reported item.</p>
  </div>

  {#if isLoading}
    <div class="loading">
      <p>Loading item details...</p>
    </div>
  {:else}
    {#if error && !success}
      <div class="error-message">
        <h3>Error Updating Item</h3>
        <p>{error}</p>
        <div class="error-actions">
          <button onclick={goBack} class="btn btn-secondary mt-3">
            Go Back
          </button>
          <button onclick={() => { error = ''; }} class="btn btn-primary mt-3">
            Dismiss
          </button>
        </div>
      </div>
    {/if}

    {#if success}
      <div class="success-message">
        <p>Item updated successfully! Redirecting to item details...</p>
      </div>
    {/if}

    <div class="card">
      <div class="card-body">
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div class="form-grid">
            <div class="form-group span-2">
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" bind:group={status} value="lost" />
                  <span>Lost Item</span>
                </label>
                <label class="radio-label">
                  <input type="radio" bind:group={status} value="found" />
                  <span>Found Item</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="title" class="form-label">Item Title *</label>
              <input
                type="text"
                id="title"
                bind:value={title}
                class="form-control"
                class:error={errors.title}
                placeholder="e.g. Blue Backpack, iPhone 13, etc."
              />
              {#if errors.title}
                <p class="error-text">{errors.title}</p>
              {/if}
            </div>

            <div class="form-group">
              <label for="category" class="form-label">Category *</label>
              <select
                id="category"
                bind:value={category}
                class="form-control"
                class:error={errors.category}
              >
                <option value="">Select a category</option>
                {#each categories as cat}
                  <option value={cat.name}>{cat.name}</option>
                {/each}
              </select>
              {#if errors.category}
                <p class="error-text">{errors.category}</p>
              {/if}
            </div>

            <div class="form-group span-2">
              <label for="description" class="form-label">Description</label>
              <textarea
                id="description"
                bind:value={description}
                rows="4"
                class="form-control"
                placeholder="Provide details about the item..."
              ></textarea>
            </div>

            <div class="form-group">
              <label for="location" class="form-label">Location *</label>
              <input
                type="text"
                id="location"
                bind:value={location}
                class="form-control"
                class:error={errors.location}
                placeholder="Building or area where it was lost/found"
              />
              {#if errors.location}
                <p class="error-text">{errors.location}</p>
              {/if}
            </div>

            <div class="form-group">
              <label for="floor" class="form-label">Floor *</label>
              <select
                id="floor"
                bind:value={floor}
                class="form-control"
                class:error={errors.floor}
              >
                <option value="">Select a floor</option>
                {#each floorOptions as floorOption}
                  <option value={floorOption.value}>{floorOption.label}</option>
                {/each}
              </select>
              {#if errors.floor}
                <p class="error-text">{errors.floor}</p>
              {/if}
            </div>

            <div class="form-group">
              <label for="roomNumber" class="form-label">Room Number *</label>
              <input
                type="text"
                id="roomNumber"
                bind:value={roomNumber}
                class="form-control"
                class:error={errors.roomNumber}
                placeholder="e.g. 101, Lab 3, etc."
              />
              {#if errors.roomNumber}
                <p class="error-text">{errors.roomNumber}</p>
              {/if}
            </div>

            <div class="form-group">
              <label for="imageUrl" class="form-label">Image URL</label>
              <input
                type="text"
                id="imageUrl"
                bind:value={imageUrl}
                class="form-control"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div class="form-group span-2">
              <h3 class="section-title">Contact Information</h3>
            </div>

            <div class="form-group">
              <label for="reporterName" class="form-label">Your Name *</label>
              <input
                type="text"
                id="reporterName"
                bind:value={reporterName}
                class="form-control"
                class:error={errors.reporterName}
              />
              {#if errors.reporterName}
                <p class="error-text">{errors.reporterName}</p>
              {/if}
            </div>

            <div class="form-group">
              <label for="reporterEmail" class="form-label">Your Email *</label>
              <input
                type="email"
                id="reporterEmail"
                bind:value={reporterEmail}
                class="form-control"
                class:error={errors.reporterEmail}
              />
              {#if errors.reporterEmail}
                <p class="error-text">{errors.reporterEmail}</p>
              {/if}
            </div>

            <div class="form-group">
              <label for="reporterPhone" class="form-label">Your Phone</label>
              <input
                type="tel"
                id="reporterPhone"
                bind:value={reporterPhone}
                class="form-control"
                class:error={errors.reporterPhone}
              />
              {#if errors.reporterPhone}
                <p class="error-text">{errors.reporterPhone}</p>
              {:else}
                <p class="help-text">Optional</p>
              {/if}
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              onclick={goBack}
              class="btn btn-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  .edit-item-container {
    max-width: 100%;
    padding-bottom: 2rem;
  }

  .back-button-container {
    margin-bottom: 1.5rem;
  }

  .back-button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: #443627;
    font-weight: 500;
    padding: 0;
    cursor: pointer;
  }

  .back-button:hover {
    color: #D98324;
  }

  .back-button .material-icons {
    margin-right: 0.5rem;
  }

  .edit-header {
    margin-bottom: 1.5rem;
  }

  .edit-header h1 {
    color: #443627;
    margin-bottom: 0.5rem;
  }

  .edit-header p {
    color: #6c757d;
  }

  .loading, .error-message, .success-message {
    background-color: white;
    border-radius: 0.5rem;
    padding: 3rem;
    text-align: center;
  }

  .error-message {
    color: #842029;
  }

  .error-message h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .error-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .success-message {
    background-color: #d1e7dd;
    color: #0f5132;
  }

  .card {
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .card-body {
    padding: 1.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .span-2 {
    grid-column: span 2;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    color: #443627;
    font-weight: 500;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #EFDCAB;
    border-radius: 0.375rem;
    background-color: white;
  }

  .form-control.error {
    border-color: #ef4444;
  }

  .error-text {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .help-text {
    color: #6c757d;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .radio-group {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .radio-label span {
    margin-left: 0.5rem;
  }

  .section-title {
    color: #443627;
    font-size: 1.125rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #EFDCAB;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .btn {
    padding: 0.75rem 1.25rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }

  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-primary {
    background-color: #D98324;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #c47520;
  }

  .btn-secondary {
    background-color: #e9ecef;
    color: #212529;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #dde2e6;
  }

  .mt-3 {
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .span-2 {
      grid-column: 1;
    }
  }
</style>
