<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Props
  export let itemId: string = '';
  export let itemTitle: string = '';
  export let itemStatus: 'lost' | 'found' = 'lost';
  
  function viewItem() {
    dispatch('viewItem', { itemId });
  }
  
  function reportAnother() {
    dispatch('reportAnother');
  }
</script>

<div class="success-container">
  <div class="success-content">
    <div class="success-icon">
      <span class="material-icons">check_circle</span>
    </div>
    
    <h2>Report Submitted Successfully!</h2>
    
    <p class="success-message">
      Your {itemStatus} item "<strong>{itemTitle}</strong>" has been successfully reported 
      and is now visible to other users.
    </p>
    
    <div class="success-details">
      <div class="detail-item">
        <span class="material-icons">visibility</span>
        <span>Your item is now searchable by others</span>
      </div>
      <div class="detail-item">
        <span class="material-icons">email</span>
        <span>You'll receive email notifications for any matches</span>
      </div>
      <div class="detail-item">
        <span class="material-icons">edit</span>
        <span>You can update or remove your listing anytime</span>
      </div>
    </div>
    
    <div class="success-actions">
      <button class="action-button primary" on:click={viewItem}>
        <span class="material-icons">visibility</span>
        View Your Item
      </button>
      <button class="action-button secondary" on:click={reportAnother}>
        <span class="material-icons">add</span>
        Report Another Item
      </button>
    </div>
    
    <div class="next-steps">
      <h3>What happens next?</h3>
      <ul>
        <li>Other users can now see and search for your item</li>
        <li>If someone finds a match, they can contact you directly</li>
        <li>You'll receive email notifications for any activity</li>
        <li>You can manage your listings from your profile</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .success-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 2rem 1rem;
  }
  
  .success-content {
    max-width: 600px;
    text-align: center;
    background: white;
    border-radius: 16px;
    padding: 3rem 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  
  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #38a169;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem;
    animation: success-bounce 0.6s ease-out;
  }
  
  .success-icon .material-icons {
    font-size: 48px;
  }
  
  h2 {
    margin: 0 0 1rem;
    color: var(--color-dark, #443627);
    font-size: 2rem;
    font-weight: 700;
  }
  
  .success-message {
    color: #4a5568;
    font-size: 1.125rem;
    line-height: 1.6;
    margin-bottom: 2rem;
  }
  
  .success-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background-color: #f0f9ff;
    border-radius: 12px;
    border: 1px solid #bfdbfe;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    text-align: left;
    color: #1e40af;
  }
  
  .detail-item .material-icons {
    font-size: 20px;
    margin-right: 0.75rem;
    color: #3b82f6;
  }
  
  .success-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    text-decoration: none;
  }
  
  .action-button .material-icons {
    font-size: 18px;
    margin-right: 0.5rem;
  }
  
  .action-button.primary {
    background-color: var(--color-accent, #D98324);
    color: white;
  }
  
  .action-button.primary:hover {
    background-color: #c67620;
    transform: translateY(-1px);
  }
  
  .action-button.secondary {
    background-color: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }
  
  .action-button.secondary:hover {
    background-color: #edf2f7;
    transform: translateY(-1px);
  }
  
  .next-steps {
    text-align: left;
    background-color: #f7fafc;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  
  .next-steps h3 {
    margin: 0 0 1rem;
    color: var(--color-dark, #443627);
    font-size: 1.25rem;
  }
  
  .next-steps ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #4a5568;
    line-height: 1.6;
  }
  
  .next-steps li {
    margin-bottom: 0.5rem;
  }
  
  @keyframes success-bounce {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 640px) {
    .success-content {
      padding: 2rem 1rem;
    }
    
    .success-actions {
      flex-direction: column;
    }
    
    .action-button {
      width: 100%;
      justify-content: center;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    .success-message {
      font-size: 1rem;
    }
  }
</style>
