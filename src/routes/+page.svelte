<script lang="ts">
	import { onMount } from 'svelte';
	import type { Item } from '$lib/types';
	import './recent-items.css';

	let recentItems: Item[] = [];
	let isLoading = true;
	let error = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/items?limit=6');
			if (!response.ok) throw new Error('Failed to fetch recent items');
			recentItems = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	});
</script>

<div>
	<section style="background-color: #F2F6D0; padding: 0;">
		<div class="container" style="padding: 0;">
			<div style="display: flex; align-items: stretch;">
				<div style="flex: 1; padding: 40px 20px 40px 0;">
					<h1 style="font-size: 2.5rem; color: #443627; margin-bottom: 1rem; font-weight: bold;">Where lost items find their way back home</h1>
					<a href="/signup" target="_blank" style="background-color: #D98324; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; text-decoration: none; font-weight: 500;">
						Sign Up
					</a>
				</div>
				<div style="flex: 1; position: relative;">
					<img src="https://img.freepik.com/free-vector/lost-found-concept-illustration_114360-1757.jpg" alt="Person searching for lost items" style="width: 100%; height: 100%; object-fit: cover;" />
					<div style="position: absolute; top: 30%; right: 20%; background-color: #f8d7da; color: #842029; padding: 5px 10px; border-radius: 4px; font-weight: 600;">Lost</div>
					<div style="position: absolute; bottom: 30%; right: 30%; background-color: #d1e7dd; color: #0f5132; padding: 5px 10px; border-radius: 4px; font-weight: 600;">Found</div>
				</div>
			</div>
		</div>
	</section>

	<section class="recent-items-section mb-5">
		<div class="section-header">
			<h2 class="section-title">Recent Items</h2>
			<div class="section-line"></div>
		</div>

		{#if isLoading}
			<div class="loading-container">
				<div class="loading-spinner"></div>
				<p>Loading recent items...</p>
			</div>
		{:else if error}
			<div class="error-container">
				<div class="error-icon">
					<span class="material-icons">error</span>
				</div>
				<p>{error}</p>
			</div>
		{:else if recentItems.length === 0}
			<div class="empty-container">
				<div class="empty-icon">
					<span class="material-icons">inventory_2</span>
				</div>
				<p>No items have been reported yet.</p>
			</div>
		{:else}
			<div class="items-grid">
				{#each recentItems as item}
					<div class="item-card">
						<div class="item-status-ribbon {item.status === 'lost' ? 'lost' : 'found'}">
							{item.status === 'lost' ? 'Lost' : 'Found'}
						</div>
						<div class="item-image-container">
							{#if item.image_url}
								<img
									src={item.image_url}
									alt={item.title}
									class="item-image"
								/>
							{:else}
								<div class="item-image-placeholder">
									<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
										<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
										<circle cx="8.5" cy="8.5" r="1.5"></circle>
										<polyline points="21 15 16 10 5 21"></polyline>
									</svg>
								</div>
							{/if}
						</div>
						<div class="item-content">
							<h3 class="item-title">{item.title}</h3>
							<div class="item-details">
								<div class="item-detail">
									<span class="detail-label">Category:</span>
									<span class="detail-value">{item.category}</span>
								</div>
								{#if item.location}
									<div class="item-detail">
										<span class="detail-label">Location:</span>
										<span class="detail-value">{item.location}</span>
									</div>
								{/if}
								{#if item.floor}
									<div class="item-detail">
										<span class="detail-label">Floor:</span>
										<span class="detail-value">{item.floor}</span>
									</div>
								{/if}
								{#if item.room_number}
									<div class="item-detail">
										<span class="detail-label">Room:</span>
										<span class="detail-value">{item.room_number}</span>
									</div>
								{/if}
								<div class="item-detail">
									<span class="detail-label">Reported:</span>
									<span class="detail-value">{new Date(item.date_reported || '').toLocaleDateString()}</span>
								</div>
							</div>
						</div>
						<div class="item-footer">
							<a href="/items/{item.id}" class="view-details-btn">
								View Details <span class="material-icons">arrow_forward</span>
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="section-highlight p-4 text-center mb-4">
		<h2 class="mb-3 accent-text">How It Works</h2>
		<div class="grid grid-cols-1 grid-cols-md-3 gap-4">
			<div class="card p-3">
				<div style="color: var(--color-accent); font-size: 1.5rem; font-weight: bold;" class="mb-2">1</div>
				<h3 class="mb-2">Report an Item</h3>
				<p>Report a lost or found item with details and optional photo.</p>
			</div>
			<div class="card p-3">
				<div style="color: var(--color-accent); font-size: 1.5rem; font-weight: bold;" class="mb-2">2</div>
				<h3 class="mb-2">Browse Listings</h3>
				<p>Search through lost and found items to find a match.</p>
			</div>
			<div class="card p-3">
				<div style="color: var(--color-accent); font-size: 1.5rem; font-weight: bold;" class="mb-2">3</div>
				<h3 class="mb-2">Get Connected</h3>
				<p>Contact the reporter to arrange return of the item.</p>
			</div>
		</div>
	</section>
</div>
