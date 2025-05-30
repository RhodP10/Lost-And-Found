<script lang="ts">
  import type { Item } from '$lib/types';
  import ItemCard from '$lib/components/ItemCard.svelte';
  
  // Props
  export let items: Item[] = [];
  export let isLoading: boolean = false;
  export let error: string = '';
  
  // Animation delay for staggered card appearance
  function getAnimationDelay(index: number): string {
    return `${index * 0.1}s`;
  }
  
  // Handle reload
  function handleReload() {
    window.location.reload();
  }
</script>

<section class="recent-items-section">
  <div class="section-header">
    <h2>Recent Items</h2>
    <div class="section-subtitle">
      Browse the latest lost and found items
    </div>
    <div class="section-divider"></div>
  </div>
  
  {#if isLoading}
    <div class="loading-state">
      <div class="state-container">
        <div class="loading-content">
          <span class="material-icons loading-icon">hourglass_top</span>
          <p class="state-text">Loading recent items...</p>
          <div class="progress-container">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="state-container">
        <div class="error-content">
          <span class="material-icons error-icon">error_outline</span>
          <h3 class="state-title">Error Loading Items</h3>
          <p class="state-text">{error}</p>
          <button class="custom-action-button" on:click={handleReload}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  {:else if items.length === 0}
    <div class="empty-state">
      <div class="state-container">
        <div class="empty-content">
          <span class="material-icons empty-icon">inventory_2</span>
          <h3 class="state-title">No Items Found</h3>
          <p class="state-text">No items have been reported yet.</p>
          <a href="/report" class="custom-action-button">
            Report an Item
          </a>
        </div>
      </div>
    </div>
  {:else}
    <div class="items-grid">
      {#each items as item, index}
        <ItemCard {item} animationDelay={getAnimationDelay(index)} />
      {/each}
    </div>
  {/if}
</section>

<style>
  /* Section Styles */
  .recent-items-section {
    padding: 3rem 0;
    margin-bottom: 2rem;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .section-header h2 {
    margin: 0;
    color: var(--color-dark);
    font-size: 2.25rem;
    font-weight: 700;
  }
  
  .section-subtitle {
    color: #718096;
    margin: 0.5rem 0 1rem;
  }
  
  .section-divider {
    width: 80px;
    height: 4px;
    background-color: var(--color-accent);
    margin: 0 auto;
    border-radius: 2px;
  }
  
  /* Grid Layout */
  .items-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 2rem;
    margin: 0 auto;
    max-width: 1200px;
    padding: 0 1rem;
  }
  
  @media (min-width: 768px) {
    .items-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .items-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  /* State Containers */
  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }
  
  .state-container {
    padding: 2rem;
    text-align: center;
    max-width: 500px;
    width: 100%;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .loading-content,
  .error-content,
  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .state-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0.5rem 0;
  }
  
  .state-text {
    color: #666;
    margin: 0.5rem 0;
  }
  
  .loading-icon,
  .error-icon,
  .empty-icon {
    font-size: 48px;
  }
  
  .loading-icon {
    color: var(--color-accent);
    animation: pulse 1.5s infinite ease-in-out;
  }
  
  .error-icon {
    color: #e53e3e;
  }
  
  .empty-icon {
    color: #718096;
  }
  
  .progress-container {
    width: 100%;
    max-width: 300px;
    margin-top: 1rem;
    height: 4px;
    background-color: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    width: 30%;
    background-color: var(--color-accent);
    border-radius: 2px;
    animation: loading 1.5s infinite ease-in-out;
  }
  
  .custom-action-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: var(--color-accent);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    margin-top: 1rem;
    transition: background-color 0.2s ease;
  }
  
  .custom-action-button:hover {
    background-color: #c67620;
    text-decoration: none;
  }
  
  @keyframes loading {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(300%); }
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 0.6; transform: scale(0.9); }
  }
</style>
