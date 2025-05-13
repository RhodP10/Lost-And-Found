<script lang="ts">
	import { onMount } from 'svelte';
	import type { Item } from '$lib/types';

	let item: Item | null = null;
	let isLoading = true;
	let error = '';
	let showContactInfo = false;

	onMount(async () => {
		try {
			// Get the ID from the URL path
			const pathParts = window.location.pathname.split('/');
			const id = pathParts[pathParts.length - 1];

			const response = await fetch(`/api/items/${id}`);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Item not found');
				}
				throw new Error('Failed to fetch item details');
			}

			item = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	});

	function toggleContactInfo() {
		showContactInfo = !showContactInfo;
	}

	function goBack() {
		window.history.back();
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
		<div class="mb-3">
			<button on:click={goBack} class="flex items-center" style="background: none; border: none; color: #3b82f6; cursor: pointer; padding: 0;">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;">
					<path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
				</svg>
				Back
			</button>
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
									on:click={toggleContactInfo}
								>
									Hide Contact Info
								</button>
							</div>
						{:else}
							<p class="mb-3">Contact information is hidden to protect privacy.</p>
							<button
								class="btn btn-primary w-full"
								on:click={toggleContactInfo}
							>
								Show Contact Info
							</button>
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
