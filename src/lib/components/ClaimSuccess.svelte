<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Item } from '$lib/types';

  export let item: Item;
  
  const dispatch = createEventDispatcher();
  
  function handleClose() {
    dispatch('close');
  }
</script>

<div class="claim-success">
  <div class="success-icon">
    <span class="material-icons">check_circle</span>
  </div>
  
  <h2 class="success-title">Claim Submitted Successfully!</h2>
  
  <p class="success-message">
    Your claim for <strong>{item.title}</strong> has been submitted and is pending review.
    We'll contact you via email once your claim has been processed.
  </p>
  
  <div class="claim-details">
    <h3 class="details-title">What happens next?</h3>
    <ol class="steps-list">
      <li>Our team will review your claim</li>
      <li>We may contact you for additional information</li>
      <li>If approved, we'll arrange for you to pick up the item</li>
      <li>If rejected, we'll provide a reason via email</li>
    </ol>
  </div>
  
  <div class="action-buttons">
    <button class="close-button" on:click={handleClose}>
      Close
    </button>
  </div>
</div>

<style>
  .claim-success {
    background-color: white;
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .success-icon {
    margin-bottom: 1.5rem;
  }
  
  .success-icon .material-icons {
    font-size: 4rem;
    color: #38a169;
  }
  
  .success-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-dark);
    margin-bottom: 1rem;
  }
  
  .success-message {
    margin-bottom: 1.5rem;
    color: #4a5568;
    line-height: 1.5;
  }
  
  .claim-details {
    background-color: #f7fafc;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: left;
  }
  
  .details-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-dark);
    margin-bottom: 1rem;
  }
  
  .steps-list {
    padding-left: 1.5rem;
    color: #4a5568;
    line-height: 1.6;
  }
  
  .steps-list li {
    margin-bottom: 0.5rem;
  }
  
  .action-buttons {
    margin-top: 1.5rem;
  }
  
  .close-button {
    padding: 0.75rem 2rem;
    background-color: var(--color-accent);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .close-button:hover {
    background-color: #c67620;
  }
</style>
