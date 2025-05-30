<script lang="ts">
	import { onMount } from 'svelte';
	import type { Item, Category } from '$lib/types';
	import ItemCard from '$lib/components/ItemCard.svelte';
	import ItemsFilter from '$lib/components/ItemsFilter.svelte';
	import ItemsStateDisplay from '$lib/components/ItemsStateDisplay.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let items: Item[] = [];
	let categories: Category[] = [];
	let isLoading = true;
	let error = '';
	let totalItems = 0;

	// Filter state
	let selectedCategory = '';
	let searchQuery = '';

	onMount(async () => {
		try {
			// Fetch categories
			const categoryResponse = await fetch('/api/categories');
			if (!categoryResponse.ok) throw new Error('Failed to fetch categories');
			categories = await categoryResponse.json();

			// Fetch lost items
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
			// Set loading state and clear errors
			isLoading = true;
			error = '';

			// Log current filter state
			console.log(`Fetching lost items with filters:
				- Category: "${selectedCategory}"
				- Search Query: "${searchQuery}"
			`);

			// Fetch all lost items
			const response = await fetch('/api/items?status=lost');
			if (!response.ok) {
				throw new Error(`Failed to fetch lost items: ${response.status} ${response.statusText}`);
			}

			const allItems = await response.json();
			console.log(`Fetched ${allItems.length} total lost items`);

			// Create a filtered copy of the items
			let filteredItems = [...allItems];

			// Apply category filter if selected
			if (selectedCategory) {
				console.log(`Filtering by category: "${selectedCategory}"`);
				filteredItems = filteredItems.filter((item: Item) => {
					const match = item.category.toLowerCase() === selectedCategory.toLowerCase();
					return match;
				});
				console.log(`After category filter: ${filteredItems.length} items remaining`);
			}

			// Apply search filter if provided
			if (searchQuery && searchQuery.trim()) {
				console.log(`Filtering by search query: "${searchQuery}"`);
				const query = searchQuery.toLowerCase().trim();

				filteredItems = filteredItems.filter((item: Item) => {
					// Check title
					const titleMatch = item.title.toLowerCase().includes(query);

					// Check description if it exists
					const descMatch = item.description ?
						item.description.toLowerCase().includes(query) : false;

					// Check location if it exists
					const locMatch = item.location ?
						item.location.toLowerCase().includes(query) : false;

					// Return true if any field matches
					return titleMatch || descMatch || locMatch;
				});

				console.log(`After search filter: ${filteredItems.length} items remaining`);
			}

			// Update the items array and count
			items = filteredItems;
			totalItems = items.length;

			console.log(`Final result: ${totalItems} items match all filters`);

		} catch (err) {
			// Handle errors
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error('Error fetching items:', error);
			items = [];
			totalItems = 0;
		} finally {
			// Always set loading to false when done
			isLoading = false;
		}
	}

	function handleSearch() {
		console.log(`Search triggered with query: "${searchQuery}"`);
		fetchItems();
	}

	function handleCategoryChange() {
		console.log(`Category changed to: "${selectedCategory}"`);
		fetchItems();
	}

	function clearFilters() {
		console.log("Clearing all filters");
		selectedCategory = '';
		searchQuery = '';
		fetchItems();
	}
</script>

<div class="lost-items-page">
	<PageHeader
		title="Lost Items"
		description="Browse items that have been reported as lost. If you've found something similar, please contact the owner."
		icon="search"
		itemCount={totalItems}
		showItemCount={!isLoading && !error}
	/>

	<ItemsFilter
		{categories}
		{searchQuery}
		{selectedCategory}
		filterTitle="Filter Lost Items"
		itemType="lost items"
		on:search={(event) => {
			searchQuery = event.detail.query;
			handleSearch();
		}}
		on:categoryChange={(event) => {
			selectedCategory = event.detail.category;
			handleCategoryChange();
		}}
		on:clearFilters={clearFilters}
	/>

	{#if isLoading}
		<ItemsStateDisplay
			type="loading"
			itemType="lost items"
		/>
	{:else if error}
		<ItemsStateDisplay
			type="error"
			message={error}
			itemType="lost items"
			onAction={fetchItems}
			actionText="Try Again"
		/>
	{:else if items.length === 0}
		<ItemsStateDisplay
			type="empty"
			message="No lost items found matching your criteria."
			itemType="lost items"
			onAction={clearFilters}
			actionText="Clear Filters"
		/>
	{:else}
		<div class="items-grid">
			{#each items as item, index}
				<ItemCard {item} animationDelay={`${index * 0.1}s`} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.lost-items-page {
		padding-bottom: 3rem;
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 2rem;
		margin-top: 2rem;
	}

	@media (min-width: 768px) {
		.items-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.items-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
