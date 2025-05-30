<script lang="ts">
  // Props
  export let title: string;
  export let description: string = '';
  export let icon: string = '';
  export let itemCount: number | null = null;
  export let showItemCount: boolean = false;
</script>

<div class="page-header">
  <div class="header-content">
    <div class="header-main">
      {#if icon}
        <div class="header-icon">
          <span class="material-icons">{icon}</span>
        </div>
      {/if}
      <div class="header-text">
        <h1>{title}</h1>
        {#if description}
          <p class="header-description">{description}</p>
        {/if}
      </div>
    </div>
    
    {#if showItemCount && itemCount !== null}
      <div class="item-count">
        <span class="count-number">{itemCount}</span>
        <span class="count-label">{itemCount === 1 ? 'item' : 'items'}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .page-header {
    margin-bottom: 2rem;
    position: relative;
  }
  
  .page-header::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.05), transparent);
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .header-main {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .header-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background-color: var(--color-accent, #D98324);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(217, 131, 36, 0.2);
  }
  
  .header-icon .material-icons {
    font-size: 32px;
  }
  
  .header-text h1 {
    margin: 0 0 0.5rem;
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--color-dark, #443627);
    line-height: 1.2;
  }
  
  .header-description {
    margin: 0;
    color: #718096;
    font-size: 1.1rem;
    max-width: 600px;
    line-height: 1.5;
  }
  
  .item-count {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f7fafc;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  
  .count-number {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-accent, #D98324);
  }
  
  .count-label {
    font-size: 0.875rem;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  @media (max-width: 640px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .item-count {
      align-self: flex-start;
    }
    
    .header-text h1 {
      font-size: 1.75rem;
    }
    
    .header-description {
      font-size: 1rem;
    }
  }
</style>
