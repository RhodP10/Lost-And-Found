<script lang="ts">
	import { onMount } from 'svelte';
	import type { Item, Category } from '$lib/types';

	let items: Item[] = [];
	let categories: Category[] = [];
	let isLoading = true;
	let error = '';

	// Filter state
	let selectedCategory = '';
	let searchQuery = '';

	onMount(async () => {
		try {
			// Fetch categories
			const categoryResponse = await fetch('/api/categories');
			if (!categoryResponse.ok) throw new Error('Failed to fetch categories');
			categories = await categoryResponse.json();

			// Fetch found items
			await fetchItems();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	});

	async function fetchItems() {
		try {
			isLoading = true;
			let url = '/api/items?status=found';

			if (selectedCategory) {
				url += `&category=${encodeURIComponent(selectedCategory)}`;
			}

			const response = await fetch(url);
			if (!response.ok) throw new Error('Failed to fetch found items');
			items = await response.json();

			// Apply search filter client-side
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				items = items.filter(item =>
					item.title.toLowerCase().includes(query) ||
					(item.description && item.description.toLowerCase().includes(query)) ||
					(item.location && item.location.toLowerCase().includes(query))
				);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		fetchItems();
	}

	function handleCategoryChange() {
		fetchItems();
	}

	function clearFilters() {
		selectedCategory = '';
		searchQuery = '';
		fetchItems();
	}
</script>

<div>
	<div class="mb-4">
		<h1 class="mb-2">Found Items</h1>
		<p>Browse items that have been reported as found.</p>
	</div>

	<div class="card mb-4">
		<div class="card-body">
			<div class="grid grid-cols-1 grid-cols-md-3 gap-4">
				<div class="form-group">
					<label for="search" class="form-label">Search</label>
					<input
						type="text"
						id="search"
						placeholder="Search by title, description, location..."
						class="form-control"
						bind:value={searchQuery}
						on:keyup={(e) => e.key === 'Enter' && handleSearch()}
					/>
				</div>

				<div class="form-group">
					<label for="category" class="form-label">Category</label>
					<select
						id="category"
						class="form-control"
						bind:value={selectedCategory}
						on:change={handleCategoryChange}
					>
						<option value="">All Categories</option>
						{#each categories as category}
							<option value={category.name}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div class="flex items-end">
					<button
						class="btn btn-primary mr-2"
						on:click={handleSearch}
					>
						Search
					</button>
					<button
						class="btn"
						on:click={clearFilters}
					>
						Clear
					</button>
				</div>
			</div>
		</div>
	</div>

	{#if isLoading}
		<div class="text-center p-4">
			<p>Loading found items...</p>
		</div>
	{:else if error}
		<div class="text-center p-4">
			<p style="color: red;">{error}</p>
		</div>
	{:else if items.length === 0}
		<div class="text-center p-4 card">
			<p>No found items matching your criteria.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 gap-6">
			{#each items as item}
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
						<span class="badge badge-found mb-2">
							Found
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
</div>
