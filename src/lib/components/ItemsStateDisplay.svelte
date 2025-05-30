<script lang="ts">
  // Props
  export let type: 'loading' | 'error' | 'empty' = 'loading';
  export let message: string = '';
  export let itemType: string = 'items';
  export let onAction: (() => void) | null = null;
  export let actionText: string = '';
</script>

<div class="state-display {type}-state">
  <div class="state-content">
    {#if type === 'loading'}
      <div class="state-icon-container">
        <span class="material-icons state-icon">hourglass_top</span>
      </div>
      <h3 class="state-title">Loading {itemType}...</h3>
      <p class="state-message">{message || `Please wait while we fetch the ${itemType}.`}</p>
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
    {:else if type === 'error'}
      <div class="state-icon-container error">
        <span class="material-icons state-icon">error_outline</span>
      </div>
      <h3 class="state-title">Error Loading {itemType}</h3>
      <p class="state-message">{message || 'An error occurred while fetching the data.'}</p>
      {#if onAction}
        <button class="state-action error-action" on:click={onAction}>
          {actionText || 'Try Again'}
        </button>
      {/if}
    {:else if type === 'empty'}
      <div class="state-icon-container empty">
        <span class="material-icons state-icon">inventory_2</span>
      </div>
      <h3 class="state-title">No {itemType} Found</h3>
      <p class="state-message">{message || 'No items match your current search criteria.'}</p>
      {#if onAction}
        <button class="state-action empty-action" on:click={onAction}>
          {actionText || 'Clear Filters'}
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .state-display {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 1rem;
    min-height: 300px;
  }
  
  .state-content {
    max-width: 500px;
    text-align: center;
    background-color: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .state-icon-container {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #f0f9ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  
  .state-icon-container.error {
    background-color: #fff5f5;
  }
  
  .state-icon-container.empty {
    background-color: #f7fafc;
  }
  
  .state-icon {
    font-size: 40px;
    color: var(--color-accent, #D98324);
  }
  
  .error .state-icon {
    color: #e53e3e;
  }
  
  .empty .state-icon {
    color: #718096;
  }
  
  .state-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
    color: #2d3748;
  }
  
  .state-message {
    color: #718096;
    margin: 0 0 1.5rem;
    line-height: 1.6;
  }
  
  .loading-bar {
    width: 100%;
    height: 4px;
    background-color: #edf2f7;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 1rem;
  }
  
  .loading-progress {
    height: 100%;
    width: 30%;
    background-color: var(--color-accent, #D98324);
    border-radius: 2px;
    animation: loading 1.5s infinite ease-in-out;
  }
  
  .state-action {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    margin-top: 0.5rem;
  }
  
  .error-action {
    background-color: #e53e3e;
    color: white;
  }
  
  .error-action:hover {
    background-color: #c53030;
  }
  
  .empty-action {
    background-color: var(--color-accent, #D98324);
    color: white;
  }
  
  .empty-action:hover {
    background-color: #c67620;
  }
  
  /* Loading animation */
  @keyframes loading {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(300%); }
  }
  
  /* Loading icon animation */
  .loading-state .state-icon {
    animation: pulse 1.5s infinite ease-in-out;
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 0.6; transform: scale(0.9); }
  }
</style>
