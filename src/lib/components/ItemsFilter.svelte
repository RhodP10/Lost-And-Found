<script lang="ts">
  import type { Category } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Props
  export let categories: Category[] = [];
  export let searchQuery: string = '';
  export let selectedCategory: string = '';
  export let filterTitle: string = 'Filter Items';
  export let itemType: string = 'items';

  // Local state for form values
  let localSearchQuery = searchQuery;
  let localCategory = selectedCategory;

  // Update local values when props change
  $: {
    localSearchQuery = searchQuery;
    localCategory = selectedCategory;
  }

  // Handle search submission
  function handleSearch() {
    console.log(`[ItemsFilter] Search submitted with query: "${localSearchQuery}"`);
    dispatch('search', { query: localSearchQuery });
  }

  // Handle category change
  function handleCategoryChange() {
    console.log(`[ItemsFilter] Category changed to: "${localCategory}"`);
    dispatch('categoryChange', { category: localCategory });
  }

  // Handle clearing filters
  function handleClearFilters() {
    console.log('[ItemsFilter] Clearing all filters');
    localSearchQuery = '';
    localCategory = '';
    dispatch('clearFilters');
  }

  // Handle search input keyup
  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  // Handle search input clear
  function clearSearch() {
    localSearchQuery = '';
    dispatch('search', { query: '' });
  }
</script>

<div class="filter-container">
  <div class="filter-header">
    <h2>{filterTitle}</h2>
    <div class="filter-stats">
      <span class="material-icons">filter_list</span>
      <span>Refine your search</span>
    </div>
  </div>

  <div class="filter-body">
    <div class="filter-row">
      <div class="filter-group search-group">
        <label for="search" class="filter-label">
          <span class="material-icons">search</span>
          Search
        </label>
        <div class="search-input-container">
          <input
            type="text"
            id="search"
            placeholder="Search by title, description, location..."
            class="filter-input"
            bind:value={localSearchQuery}
            on:keyup={handleKeyUp}
          />
          {#if localSearchQuery}
            <button
              class="clear-search-btn"
              on:click={clearSearch}
              aria-label="Clear search"
            >
              <span class="material-icons">close</span>
            </button>
          {/if}
        </div>
      </div>

      <div class="filter-group">
        <label for="category" class="filter-label">
          <span class="material-icons">category</span>
          Category
        </label>
        <select
          id="category"
          class="filter-select"
          bind:value={localCategory}
          on:change={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {#each categories as category}
            <option value={category.name}>{category.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="filter-actions">
      <button
        class="filter-button search-button"
        on:click={handleSearch}
      >
        <span class="material-icons">search</span>
        Search {itemType}
      </button>
      <button
        class="filter-button clear-button"
        on:click={handleClearFilters}
        disabled={!localSearchQuery && !localCategory}
      >
        <span class="material-icons">refresh</span>
        Clear Filters
      </button>
    </div>
  </div>
</div>

<style>
  .filter-container {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .filter-header {
    background-color: var(--color-accent, #D98324);
    color: white;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .filter-stats {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
  }

  .filter-stats .material-icons {
    font-size: 18px;
    margin-right: 6px;
  }

  .filter-body {
    padding: 1.5rem;
  }

  .filter-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 768px) {
    .filter-row {
      grid-template-columns: 3fr 2fr;
    }
  }

  .filter-group {
    display: flex;
    flex-direction: column;
  }

  .filter-label {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a5568;
  }

  .filter-label .material-icons {
    font-size: 18px;
    margin-right: 6px;
    color: var(--color-accent, #D98324);
  }

  .search-input-container {
    position: relative;
  }

  .filter-input, .filter-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .filter-input:focus, .filter-select:focus {
    border-color: var(--color-accent, #D98324);
    box-shadow: 0 0 0 3px rgba(217, 131, 36, 0.15);
    outline: none;
  }

  .clear-search-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-search-btn:hover {
    background-color: #f7fafc;
    color: #4a5568;
  }

  .filter-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .filter-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .filter-button .material-icons {
    font-size: 18px;
    margin-right: 8px;
  }

  .search-button {
    background-color: var(--color-accent, #D98324);
    color: white;
    flex: 1;
  }

  .search-button:hover {
    background-color: #c67620;
  }

  .clear-button {
    background-color: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }

  .clear-button:hover:not(:disabled) {
    background-color: #edf2f7;
  }

  .clear-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .filter-actions {
      flex-direction: column;
    }

    .filter-button {
      width: 100%;
    }
  }
</style>
