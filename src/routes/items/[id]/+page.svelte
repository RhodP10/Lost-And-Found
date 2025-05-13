<script lang="ts">
	import { onMount } from 'svelte';
	import type { Item } from '$lib/types';
	import { authStore } from '$lib/stores/auth';

	// Get the data from the server-side load function
	let { data } = $props<{ data: { item: Item, error?: string, status?: number } }>();

	// Track user authentication state
	let user = $state(null as any);

	let item = $state(data.item || null);
	let isLoading = $state(false);
	let error = $state(data.error || '');
	let showContactInfo = $state(false);

	// Format the date in a function to avoid state reference issues
	function formatItemDate() {
		if (item && item.date_reported) {
			item = {
				...item,
				formatted_date: new Date(item.date_reported).toLocaleDateString()
			};
		}
	}

	// Format the date initially
	formatItemDate();

	onMount(() => {
		// Subscribe to auth store
		const unsubscribe = authStore.subscribe((value) => {
			user = value;
			console.log('Auth state in item details:', user ? 'Logged in' : 'Not logged in');
		});

		// If we have an error from the server, log it
		if (data.error) {
			console.error('Server-side error:', data.error, 'Status:', data.status);
		}

		// If we don't have an item from the server, try to fetch it
		if (!item && !error) {
			fetchItem();
		}

		return unsubscribe;
	});

	async function fetchItem() {
		try {
			isLoading = true;

			// Get the ID from the URL path
			const pathParts = window.location.pathname.split('/');
			const id = pathParts[pathParts.length - 1];

			console.log('Fetching item with ID:', id);

			const response = await fetch(`/api/items/${id}`);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Item not found');
				}
				throw new Error('Failed to fetch item details');
			}

			item = await response.json();

			// Format the date using our helper function
			formatItemDate();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error('Error fetching item:', error);
		} finally {
			isLoading = false;
		}
	}

	function toggleContactInfo() {
		showContactInfo = !showContactInfo;
	}

	function goBack() {
		// Check if we came from the account section
		const referrer = document.referrer;

		if (referrer.includes('/account/')) {
			// If from account section, go back to account items
			window.location.href = '/account/items';
		} else if (referrer.includes('/lost')) {
			// If from lost items, go back to lost items
			window.location.href = '/lost';
		} else if (referrer.includes('/found')) {
			// If from found items, go back to found items
			window.location.href = '/found';
		} else {
			// Otherwise, use browser back
			window.history.back();
		}
	}
</script>

<div>
	{#if isLoading}
		<div class="text-center p-4">
			<p>Loading item details...</p>
		</div>
	{:else if error}
		<div class="text-center p-4">
			<p style="color: red;">{error}</p>
			<a href="/" class="mt-3" style="display: inline-block;">Return to Home</a>
		</div>
	{:else if item}
		<div class="mb-3 flex justify-between items-center">
			<button onclick={goBack} class="flex items-center" style="background: none; border: none; color: #3b82f6; cursor: pointer; padding: 0;">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;">
					<path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
				</svg>
				Back
			</button>

			{#if user}
				<a href="/account/dashboard" class="dashboard-link">
					<span class="material-icons" style="font-size: 16px; margin-right: 4px;">dashboard</span>
					My Dashboard
				</a>
			{/if}
		</div>

		<div class="card">
			<div class="card-body">
				<div class="flex justify-between items-start mb-3">
					<div>
						<span class="badge {item.status === 'lost' ? 'badge-lost' : item.status === 'found' ? 'badge-found' : 'badge-claimed'} mb-2">
							{item.status === 'lost' ? 'Lost' : item.status === 'found' ? 'Found' : 'Claimed'}
						</span>
						<h1 class="mb-0">{item.title}</h1>
					</div>
					<div>
						Reported on {new Date(item.date_reported || '').toLocaleDateString()}
					</div>
				</div>

				<div class="grid grid-cols-1 grid-cols-md-3 gap-4 mb-4">
					<div style="grid-column: span 2;">
						<div class="mb-3">
							<h2 class="mb-2">Description</h2>
							<p>{item.description || 'No description provided.'}</p>
						</div>

						<div class="grid grid-cols-1 grid-cols-md-2 gap-4 mb-3">
							<div>
								<h3 class="mb-1">Category</h3>
								<p>{item.category}</p>
							</div>
							<div>
								<h3 class="mb-1">Location</h3>
								<p>{item.location || 'No location specified'}</p>
							</div>
							<div>
								<h3 class="mb-1">Floor</h3>
								<p>{item.floor || 'Not specified'}</p>
							</div>
							<div>
								<h3 class="mb-1">Room Number</h3>
								<p>{item.room_number || 'Not specified'}</p>
							</div>
						</div>
					</div>

					<div class="card p-3" style="background-color: #f9fafb;">
						<h3 class="mb-3">Contact Information</h3>
						{#if showContactInfo}
							<div>
								<div class="mb-2">
									<span style="display: block; font-size: 0.875rem;">Name</span>
									<span style="font-weight: 500;">{item.reporter_name}</span>
								</div>
								<div class="mb-2">
									<span style="display: block; font-size: 0.875rem;">Email</span>
									<a href={`mailto:${item.reporter_email}`} style="font-weight: 500;">
										{item.reporter_email}
									</a>
								</div>
								{#if item.reporter_phone}
									<div class="mb-2">
										<span style="display: block; font-size: 0.875rem;">Phone</span>
										<a href={`tel:${item.reporter_phone}`} style="font-weight: 500;">
											{item.reporter_phone}
										</a>
									</div>
								{/if}
								{#if item.student_id}
									<div class="mb-2">
										<span style="display: block; font-size: 0.875rem;">Student ID</span>
										<span style="font-weight: 500;">{item.student_id}</span>
									</div>
								{/if}
								<button
									class="btn w-full mt-2"
									onclick={toggleContactInfo}
								>
									Hide Contact Info
								</button>
							</div>
						{:else}
							<p class="mb-3">Contact information is hidden to protect privacy.</p>
							<button
								class="btn btn-primary w-full"
								onclick={toggleContactInfo}
							>
								Show Contact Info
							</button>
						{/if}

						{#if user && item.status === 'found' && user.id !== item.user_id}
							<div class="mt-4 pt-4 border-t border-gray-200">
								<h4 class="mb-2 font-medium">Is this your item?</h4>
								<p class="mb-3 text-sm">If you believe this is your lost item, you can claim it.</p>
								<a href={`/account/claim/${item.id}`} class="btn btn-claim w-full">
									Claim This Item
								</a>
							</div>
						{/if}
					</div>
				</div>

				{#if item.image_url}
					<div class="mb-4">
						<h3 class="mb-2">Image</h3>
						<img
							src={item.image_url}
							alt={item.title}
							style="max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);"
						/>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.dashboard-link {
		display: flex;
		align-items: center;
		color: #D98324;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.875rem;
		padding: 0.375rem 0.75rem;
		border-radius: 0.25rem;
		background-color: rgba(217, 131, 36, 0.1);
		transition: background-color 0.2s;
	}

	.dashboard-link:hover {
		background-color: rgba(217, 131, 36, 0.2);
	}

	.btn-claim {
		background-color: #0d6efd;
		color: white;
		border: none;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
		font-weight: 500;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		transition: background-color 0.2s;
	}

	.btn-claim:hover {
		background-color: #0b5ed7;
	}
</style>