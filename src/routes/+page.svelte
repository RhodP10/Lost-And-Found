<script lang="ts">
	import { onMount } from 'svelte';
	import type { Item } from '$lib/types';

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

	<section class="mb-5">
		<h2 class="mb-3">Recent Items</h2>

		{#if isLoading}
			<div class="text-center p-4">
				<p>Loading recent items...</p>
			</div>
		{:else if error}
			<div class="text-center p-4">
				<p style="color: red;">{error}</p>
			</div>
		{:else if recentItems.length === 0}
			<div class="text-center p-4 card">
				<p>No items have been reported yet.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 gap-6">
				{#each recentItems as item}
					<div class="card" style="display: flex; flex-direction: column; height: 100%;">
						{#if item.image_url}
							<div style="height: 180px; overflow: hidden; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem;">
								<img
									src={item.image_url}
									alt={item.title}
									style="width: 100%; height: 100%; object-fit: cover;"
								/>
							</div>
						{:else}
							<div style="height: 180px; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem;">
								<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: #d1d5db;">
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
									<circle cx="8.5" cy="8.5" r="1.5"></circle>
									<polyline points="21 15 16 10 5 21"></polyline>
								</svg>
							</div>
						{/if}
						<div class="card-body" style="flex: 1;">
							<span class="badge {item.status === 'lost' ? 'badge-lost' : 'badge-found'} mb-2">
								{item.status === 'lost' ? 'Lost' : 'Found'}
							</span>
							<h3 class="mb-2">{item.title}</h3>
							<p class="mb-2">
								<span style="font-weight: 500;">Category:</span> {item.category}
							</p>
							{#if item.location}
								<p class="mb-2">
									<span style="font-weight: 500;">Location:</span> {item.location}
								</p>
							{/if}
							{#if item.floor}
								<p class="mb-2">
									<span style="font-weight: 500;">Floor:</span> {item.floor}
								</p>
							{/if}
							{#if item.room_number}
								<p class="mb-2">
									<span style="font-weight: 500;">Room:</span> {item.room_number}
								</p>
							{/if}
							<p>
								<span style="font-weight: 500;">Reported:</span> {new Date(item.date_reported || '').toLocaleDateString()}
							</p>
						</div>
						<div class="card-footer" style="margin-top: auto;">
							<a href="/items/{item.id}">
								View Details →
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
