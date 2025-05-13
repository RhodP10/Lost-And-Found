<script>
  import { onMount } from 'svelte';
  
  let itemId = $state('');
  let result = $state(null);
  let loading = $state(false);
  let error = $state('');
  
  async function testItemId() {
    if (!itemId.trim()) {
      error = 'Please enter an item ID';
      return;
    }
    
    try {
      loading = true;
      error = '';
      result = null;
      
      console.log(`Testing item ID: ${itemId}`);
      
      const response = await fetch(`/api/debug/item/${itemId}`);
      const data = await response.json();
      
      console.log('Debug response:', data);
      result = data;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error testing item ID:', error);
    } finally {
      loading = false;
    }
  }
  
  async function fetchAllItems() {
    try {
      loading = true;
      error = '';
      
      const response = await fetch('/api/items');
      const data = await response.json();
      
      console.log('All items:', data);
      
      result = {
        all_items: data,
        count: data.length,
        item_ids: data.map(item => item.id)
      };
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error fetching all items:', error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="debug-container">
  <h1>Item ID Debug Tool</h1>
  <p>Use this tool to debug issues with item IDs</p>
  
  <div class="debug-form">
    <div class="form-group">
      <label for="itemId">Item ID to test:</label>
      <input 
        type="text" 
        id="itemId" 
        bind:value={itemId} 
        placeholder="Enter item ID"
      />
    </div>
    
    <div class="button-group">
      <button 
        onclick={testItemId} 
        disabled={loading}
        class="btn btn-primary"
      >
        {loading ? 'Testing...' : 'Test Item ID'}
      </button>
      
      <button 
        onclick={fetchAllItems} 
        disabled={loading}
        class="btn btn-secondary"
      >
        Fetch All Items
      </button>
    </div>
  </div>
  
  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {/if}
  
  {#if result}
    <div class="result-container">
      <h2>Result</h2>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  {/if}
</div>

<style>
  .debug-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    color: #443627;
    margin-bottom: 0.5rem;
  }
  
  .debug-form {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-top: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #443627;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #EFDCAB;
    border-radius: 0.375rem;
    background-color: white;
  }
  
  .button-group {
    display: flex;
    gap: 0.75rem;
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
  
  .error-message {
    background-color: #f8d7da;
    color: #842029;
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-top: 1rem;
  }
  
  .result-container {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-top: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .result-container h2 {
    color: #443627;
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  pre {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
