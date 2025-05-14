<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Item } from '$lib/types';
	import { authStore } from '$lib/stores/auth';

	let item = $state<Item | null>(null);
	let isLoading = $state(true);
	let error = $state('');
	let showContactInfo = $state(false);
	let showDeleteModal = $state(false);
	let isDeleting = $state(false);
	let deleteError = $state('');
	let user = $state(null as any);

	onMount(() => {
		// Subscribe to auth store
		const unsubscribe = authStore.subscribe((value) => {
			user = value;
		});

		// Load item data
		loadItemData();

		// Return the unsubscribe function
		return unsubscribe;
	});

	async function loadItemData() {
		try {
			isLoading = true;
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
	}

	async function deleteItem() {
		if (!item) return;

		try {
			isDeleting = true;
			deleteError = '';

			const response = await fetch(`/api/items/${item.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete item');
			}

			// Navigate back to the items list
			goto('/account/items');
		} catch (err) {
			deleteError = err instanceof Error ? err.message : 'An error occurred';
			console.error('Error deleting item:', deleteError);
		} finally {
			isDeleting = false;
			showDeleteModal = false;
		}
	}

	function formatDate(dateString: string | undefined) {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString();
	}

	function goBack() {
		goto('/account/items');
	}
</script>

<div class="item-details-container">
	<button onclick={goBack} class="back-button">
		<span class="material-icons">arrow_back</span>
		Back to My Items
	</button>

	{#if isLoading}
		<div class="loading-container">
			<p>Loading item details...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<p>{error}</p>
			<button onclick={goBack} class="btn">Go Back</button>
		</div>
	{:else if item}
		<div class="item-header">
			<div>
				<div class="status-badge" class:lost={item.status === 'lost'} class:found={item.status === 'found'} class:claimed={item.status === 'claimed'}>
					{item.status}
				</div>
				<h1>{item.title}</h1>
				<p class="reported-date">Reported on {formatDate(item.date_reported)}</p>
			</div>
			<div class="item-actions">
				<button onclick={() => goto(`/account/items/edit/${item.id}`)} class="edit-button">
					<span class="material-icons">edit</span>
					Edit
				</button>
				<button onclick={() => showDeleteModal = true} class="delete-button">
					<span class="material-icons">delete</span>
					Delete
				</button>
			</div>
		</div>

		<div class="item-content">
			<div class="item-details">
				<div class="details-section">
					<h2>Description</h2>
					<p>{item.description || 'No description provided.'}</p>
				</div>

				<div class="details-grid">
					<div class="details-section">
						<h2>Category</h2>
						<p>{item.category}</p>
					</div>

					<div class="details-section">
						<h2>Location</h2>
						<p>{item.location || 'Not specified'}</p>
					</div>

					<div class="details-section">
						<h2>Floor</h2>
						<p>{item.floor || 'Not specified'}</p>
					</div>

					<div class="details-section">
						<h2>Room Number</h2>
						<p>{item.room_number || 'Not specified'}</p>
					</div>
				</div>

				{#if item.image_url}
					<div class="details-section">
						<h2>Image</h2>
						<div class="item-image">
							<img src={item.image_url} alt={item.title} />
						</div>
					</div>
				{/if}

				<div class="details-section contact-info">
					<h2>Contact Information</h2>
					{#if showContactInfo}
						<div class="contact-details">
							<p><strong>Name:</strong> {item.reporter_name}</p>
							<p><strong>Email:</strong> {item.reporter_email}</p>
							{#if item.reporter_phone}
								<p><strong>Phone:</strong> {item.reporter_phone}</p>
							{/if}
						</div>
					{:else}
						<p>Contact information is hidden to protect privacy.</p>
						<button onclick={() => showContactInfo = true} class="show-contact-btn">
							Show Contact Info
						</button>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="error-container">
			<p>Item not found</p>
			<button onclick={goBack} class="btn">Go Back</button>
		</div>
	{/if}

	{#if showDeleteModal && item}
		<div class="modal-overlay">
			<div class="modal-container">
				<div class="modal-header">
					<h3>Confirm Deletion</h3>
					<button onclick={() => showDeleteModal = false} class="close-button">
						<span class="material-icons">close</span>
					</button>
				</div>
				<div class="modal-body">
					<p>Are you sure you want to delete this item?</p>
					<p><strong>{item.title}</strong></p>
					<p>This action cannot be undone.</p>

					{#if deleteError}
						<div class="error-message">
							{deleteError}
						</div>
					{/if}
				</div>
				<div class="modal-footer">
					<button onclick={() => showDeleteModal = false} class="btn btn-secondary">
						Cancel
					</button>
					<button onclick={deleteItem} class="btn btn-danger" disabled={isDeleting}>
						{isDeleting ? 'Deleting...' : 'Delete Item'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.item-details-container {
		max-width: 100%;
	}

	.back-button {
		display: flex;
		align-items: center;
		background: none;
		border: none;
		color: #443627;
		font-weight: 500;
		padding: 0;
		margin-bottom: 1.5rem;
		cursor: pointer;
	}

	.back-button:hover {
		color: #D98324;
	}

	.back-button .material-icons {
		margin-right: 0.5rem;
		font-size: 1.25rem;
	}

	.loading-container, .error-container {
		background-color: white;
		border-radius: 0.5rem;
		padding: 2rem;
		text-align: center;
		margin-top: 1rem;
	}

	.error-container p {
		color: #ef4444;
		margin-bottom: 1rem;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
	}

	.item-header h1 {
		color: #443627;
		margin: 0.5rem 0;
		font-size: 1.75rem;
	}

	.reported-date {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.item-actions {
		display: flex;
		gap: 0.5rem;
	}

	.edit-button, .delete-button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: background-color 0.2s;
	}

	.edit-button {
		background-color: #f3f4f6;
		color: #4b5563;
	}

	.edit-button:hover {
		background-color: #e5e7eb;
	}

	.delete-button {
		background-color: #fee2e2;
		color: #b91c1c;
	}

	.delete-button:hover {
		background-color: #fecaca;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		text-transform: uppercase;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.status-badge.lost {
		background-color: #f8d7da;
		color: #842029;
	}

	.status-badge.found {
		background-color: #d1e7dd;
		color: #0f5132;
	}

	.status-badge.claimed {
		background-color: #EFDCAB;
		color: #443627;
	}

	.item-content {
		display: flex;
		gap: 2rem;
	}

	.item-details {
		flex: 1;
		background-color: white;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.details-section {
		padding: 1.5rem;
		border-bottom: 1px solid #EFDCAB;
	}

	.details-section:last-child {
		border-bottom: none;
	}

	.details-section h2 {
		color: #443627;
		font-size: 1.25rem;
		margin-top: 0;
		margin-bottom: 0.75rem;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
	}

	.details-grid .details-section {
		border-right: 1px solid #EFDCAB;
	}

	.details-grid .details-section:nth-child(2n) {
		border-right: none;
	}

	.item-image {
		max-width: 100%;
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.item-image img {
		width: 100%;
		max-height: 400px;
		object-fit: contain;
	}

	.contact-info {
		background-color: #f9fafb;
	}

	.contact-details {
		margin-top: 1rem;
	}

	.contact-details p {
		margin-bottom: 0.5rem;
	}

	.show-contact-btn {
		background-color: #D98324;
		color: white;
		border: none;
		border-radius: 0.375rem;
		padding: 0.5rem 1rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: background-color 0.2s;
	}

	.show-contact-btn:hover {
		background-color: #c47520;
	}

	.btn {
		background-color: #D98324;
		color: white;
		border: none;
		border-radius: 0.375rem;
		padding: 0.5rem 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s, opacity 0.2s;
	}

	.btn:hover {
		background-color: #c47520;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background-color: #f8f9fa;
		color: #212529;
		border: 1px solid #dee2e6;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #e9ecef;
	}

	.btn-danger {
		background-color: #dc3545;
		color: white;
		border: none;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: #bb2d3b;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-container {
		background-color: white;
		border-radius: 0.5rem;
		width: 90%;
		max-width: 500px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #EFDCAB;
	}

	.modal-header h3 {
		margin: 0;
		color: #443627;
		font-size: 1.25rem;
	}

	.close-button {
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
	}

	.close-button:hover {
		background-color: #f3f4f6;
		color: #1f2937;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid #EFDCAB;
		background-color: #f9fafb;
	}

	.error-message {
		background-color: #fee2e2;
		color: #b91c1c;
		padding: 0.75rem;
		border-radius: 0.375rem;
		margin-top: 1rem;
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.item-content {
			flex-direction: column;
		}

		.details-grid {
			grid-template-columns: 1fr;
		}

		.details-grid .details-section {
			border-right: none;
		}
	}
</style>
