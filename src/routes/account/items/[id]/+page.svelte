<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';

  // Get the data from the server-side load function
  let { data } = $props<{ data: { item: any } }>();

  let item = $state(data.item);
  let isLoading = $state(false);
  let error = $state('');
  let user = $state(null as any);

  // Format the date
  if (item && item.date_reported) {
    item.formatted_date = new Date(item.date_reported).toLocaleDateString();
  }

  onMount(() => {
    // Subscribe to auth store
    const unsubscribe = authStore.subscribe((value) => {
      user = value;
    });

    return unsubscribe;
  });

  function goBack() {
    goto('/account/items');
  }
</script>

<div class="item-details-container">
  <div class="back-button-container">
    <button onclick={goBack} class="back-button">
      <span class="material-icons">arrow_back</span>
      Back to My Items
    </button>
  </div>

  {#if isLoading}
    <div class="loading">
      <p>Loading item details...</p>
    </div>
  {:else if error}
    <div class="error-message">
      <p>{error}</p>
      <button onclick={goBack} class="btn btn-primary mt-3">
        Go Back
      </button>
    </div>
  {:else if item}
    <div class="item-details-card">
      <div class="item-header">
        <div class="item-title-section">
          <div class="item-status" class:lost={item.status === 'lost'} class:found={item.status === 'found'}>
            {item.status}
          </div>
          <h1 class="item-title">{item.title}</h1>
        </div>
        <div class="item-date">
          Reported on {item.formatted_date || new Date(item.date_reported).toLocaleDateString()}
        </div>
      </div>

      <div class="item-content">
        <div class="item-image-container">
          {#if item.image_url}
            <img src={item.image_url} alt={item.title} class="item-image" />
          {:else}
            <div class="no-image">
              <span class="material-icons">image_not_supported</span>
              <p>No image available</p>
            </div>
          {/if}
        </div>

        <div class="item-info">
          <div class="info-section">
            <h2>Item Details</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Category</span>
                <span class="info-value">{item.category}</span>
              </div>
              {#if item.description}
                <div class="info-item full-width">
                  <span class="info-label">Description</span>
                  <p class="info-value description">{item.description}</p>
                </div>
              {/if}
            </div>
          </div>

          <div class="info-section">
            <h2>Location Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Location</span>
                <span class="info-value">{item.location || 'Not specified'}</span>
              </div>
              {#if item.floor}
                <div class="info-item">
                  <span class="info-label">Floor</span>
                  <span class="info-value">{item.floor}</span>
                </div>
              {/if}
              {#if item.room_number}
                <div class="info-item">
                  <span class="info-label">Room</span>
                  <span class="info-value">{item.room_number}</span>
                </div>
              {/if}
            </div>
          </div>

          <div class="info-section">
            <h2>Contact Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">{item.reporter_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{item.reporter_email}</span>
              </div>
              {#if item.reporter_phone}
                <div class="info-item">
                  <span class="info-label">Phone</span>
                  <span class="info-value">{item.reporter_phone}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="error-message">
      <p>Item not found</p>
      <button onclick={goBack} class="btn btn-primary mt-3">
        Go Back
      </button>
    </div>
  {/if}
</div>

<style>
  .item-details-container {
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

  .loading, .error-message {
    background-color: white;
    border-radius: 0.5rem;
    padding: 3rem;
    text-align: center;
  }

  .error-message {
    color: #842029;
  }

  .item-details-card {
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .item-header {
    padding: 1.5rem;
    border-bottom: 1px solid #EFDCAB;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .item-title-section {
    flex: 1;
  }

  .item-status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .item-status.lost {
    background-color: #f8d7da;
    color: #842029;
  }

  .item-status.found {
    background-color: #d1e7dd;
    color: #0f5132;
  }

  .item-title {
    margin: 0;
    color: #443627;
    font-size: 1.75rem;
  }

  .item-date {
    color: #6c757d;
    font-size: 0.875rem;
  }

  .item-content {
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .item-content {
      flex-direction: row;
    }
  }

  .item-image-container {
    padding: 1.5rem;
    width: 100%;
  }

  @media (min-width: 768px) {
    .item-image-container {
      width: 40%;
    }
  }

  .item-image {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 0.375rem;
  }

  .no-image {
    width: 100%;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    color: #adb5bd;
    border-radius: 0.375rem;
  }

  .no-image .material-icons {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .item-info {
    flex: 1;
    padding: 1.5rem;
  }

  .info-section {
    margin-bottom: 2rem;
  }

  .info-section h2 {
    color: #443627;
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #EFDCAB;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .info-item {
    display: flex;
    flex-direction: column;
  }

  .info-item.full-width {
    grid-column: 1 / -1;
  }

  .info-label {
    font-weight: 500;
    color: #6c757d;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }

  .info-value {
    color: #212529;
  }

  .description {
    white-space: pre-line;
  }

  .btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  }

  .btn-primary {
    color: white;
    background-color: #D98324;
    border-color: #D98324;
  }

  .btn-primary:hover {
    background-color: #c47520;
    border-color: #c47520;
  }

  .mt-3 {
    margin-top: 1rem;
  }
</style>
