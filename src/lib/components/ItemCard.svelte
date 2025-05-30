<script lang="ts">
  import type { Item } from '$lib/types';

  // Props
  export let item: Item;
  export let animationDelay: string = "0s";

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Truncate text if it's too long
  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  // Get status color and background
  function getStatusColor(status: string): { color: string, background: string } {
    return status === 'lost'
      ? { color: 'white', background: '#e53e3e' }
      : { color: 'white', background: '#38a169' };
  }

  // Get category icon
  function getCategoryIcon(category: string): string {
    const categoryMap: {[key: string]: string} = {
      'Electronics': 'devices',
      'Clothing': 'checkroom',
      'Accessories': 'watch',
      'Documents': 'description',
      'Keys': 'key',
      'Bags': 'work',
      'Other': 'category'
    };

    return categoryMap[category] || 'category';
  }
</script>

<div class="item-card-wrapper" style="animation-delay: {animationDelay}">
  <div class="custom-card">
    <div class="status-chip-container">
      <div class="status-badge" style="background-color: {getStatusColor(item.status).background}; color: {getStatusColor(item.status).color}">
        {item.status === 'lost' ? 'Lost' : 'Found'}
      </div>
    </div>

    <div class="item-media">
      {#if item.image_url}
        <img src={item.image_url} alt={item.title} class="item-image" />
      {:else}
        <div class="item-image-placeholder">
          <span class="material-icons placeholder-icon">image</span>
        </div>
      {/if}
    </div>

    <div class="custom-content">
      <div class="item-category">
        <span class="material-icons category-icon">{getCategoryIcon(item.category)}</span>
        <span class="category-text">{item.category}</span>
      </div>

      <h2 class="item-title">{truncateText(item.title, 40)}</h2>

      <div class="item-details">
        {#if item.location}
          <div class="detail-item">
            <span class="material-icons detail-icon">place</span>
            <span class="detail-text">{item.location}</span>
          </div>
        {/if}

        <div class="detail-item">
          <span class="material-icons detail-icon">event</span>
          <span class="detail-text">{formatDate(item.date_reported || '')}</span>
        </div>
      </div>
    </div>

    <div class="custom-actions">
      <a href="/items/{item.id}" class="custom-button">
        <span>View Details</span>
        <span class="material-icons">arrow_forward</span>
      </a>
    </div>
  </div>
</div>

<style>
  /* Card Animation */
  .item-card-wrapper {
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
    transform: translateY(20px);
    display: flex;
    height: 450px; /* Fixed height for all cards */
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Card Styles */
  .custom-card {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .custom-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .status-chip-container {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 10;
  }

  .status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .item-media {
    position: relative;
    height: 200px; /* Fixed height for all images */
    overflow: hidden;
  }

  .item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .custom-card:hover .item-image {
    transform: scale(1.05);
  }

  .item-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
  }

  .placeholder-icon {
    font-size: 48px;
    color: #bdbdbd;
  }

  /* Content Styles */
  .custom-content {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
  }

  .item-category {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    color: var(--color-accent, #D98324);
  }

  .category-icon {
    font-size: 18px;
    margin-right: 4px;
  }

  .category-text {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .item-title {
    margin: 0.5rem 0;
    line-height: 1.3;
    height: 3.9rem; /* Fixed height for 3 lines of text */
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .item-details {
    margin-top: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 80px; /* Minimum height for details section */
  }

  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    color: #718096;
  }

  .detail-icon {
    font-size: 16px;
    margin-right: 8px;
  }

  .detail-text {
    font-size: 0.875rem;
  }

  /* Button Styles */
  .custom-actions {
    background-color: white;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0;
    margin-top: auto;
  }

  .custom-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.75rem 1rem;
    color: var(--color-dark, #443627);
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .custom-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-accent, #D98324);
    text-decoration: none;
  }

  .custom-button .material-icons {
    transition: transform 0.2s ease;
  }

  .custom-button:hover .material-icons {
    transform: translateX(4px);
  }
</style>
