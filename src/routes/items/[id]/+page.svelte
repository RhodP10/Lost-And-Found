<script lang="ts">
	import { onMount } from 'svelte';
	import type { Item } from '$lib/types';
	import './item-details.css';
	import ClaimForm from '$lib/components/ClaimForm.svelte';
	import ClaimSuccess from '$lib/components/ClaimSuccess.svelte';

	let item: Item | null = null;
	let isLoading = true;
	let error = '';
	let showContactInfo = false;
	let showImageModal = false;
	let showClaimForm = false;
	let isSubmittingClaim = false;
	let claimSubmitted = false;
	let claimError = '';

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

	function openImageModal() {
		showImageModal = true;
		// Add a class to the body to prevent scrolling
		document.body.style.overflow = 'hidden';
	}

	function closeImageModal() {
		showImageModal = false;
		// Remove the class from the body to allow scrolling
		document.body.style.overflow = '';
	}

	// Close modal when clicking outside the image
	function handleModalClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeImageModal();
		}
	}

	// Close modal when pressing Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showImageModal) {
			closeImageModal();
		}
	}

	// Open claim form
	function openClaimForm() {
		console.log('Opening claim form');
		showClaimForm = true;
	}

	// Close claim form
	function closeClaimForm() {
		showClaimForm = false;
	}

	// Handle claim submission
	async function handleClaimSubmit(event: CustomEvent) {
		if (!item) return;

		const claimData = event.detail;
		isSubmittingClaim = true;
		claimError = '';

		console.log('Submitting claim with data:', claimData);

		try {
			console.log('Sending POST request to /api/claims');
			const response = await fetch('/api/claims', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(claimData)
			});

			console.log('Response status:', response.status);
			const data = await response.json();
			console.log('Response data:', data);

			if (response.ok) {
				console.log('Claim submitted successfully');
				claimSubmitted = true;
				showClaimForm = false;
			} else {
				console.error('Error from server:', data.error);
				claimError = data.error || 'Failed to submit claim';
			}
		} catch (err) {
			console.error('Error submitting claim:', err);
			claimError = 'An error occurred while submitting your claim';
		} finally {
			isSubmittingClaim = false;
		}
	}

	// Close success message
	function closeSuccessMessage() {
		claimSubmitted = false;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="item-details-container">
	{#if isLoading}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<p>Loading item details...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<p class="error-message">{error}</p>
			<a href="/" class="home-link">Return to Home</a>
		</div>
	{:else if item}
		<button on:click={goBack} class="back-button">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
				<path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
			</svg>
			Back to Items
		</button>

		<div class="item-details-card">
			<div class="item-header">
				<div class="item-title-container">
					<span class="item-status-badge {item.status}">
						{item.status === 'lost' ? 'Lost' : item.status === 'found' ? 'Found' : 'Claimed'}
					</span>
					<h1 class="item-title">{item.title}</h1>
				</div>
				<div class="item-date">
					Reported on {new Date(item.date_reported || '').toLocaleDateString()}
				</div>
			</div>

			<div class="item-content">
				<div class="item-section">
					<h2 class="section-title">Description</h2>
					<p class="item-description">{item.description || 'No description provided.'}</p>
				</div>

				<div class="item-section">
					<h2 class="section-title">Item Details</h2>
					<div class="details-grid">
						<div class="detail-item">
							<span class="detail-label">Category</span>
							<span class="detail-value">{item.category}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Location</span>
							<span class="detail-value">{item.location || 'No location specified'}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Floor</span>
							<span class="detail-value">{item.floor || 'Not specified'}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Room Number</span>
							<span class="detail-value">{item.room_number || 'Not specified'}</span>
						</div>
					</div>
				</div>

				{#if item.image_url}
					<div class="item-section">
						<h2 class="section-title">Image</h2>
						<div class="item-image-container">
							<button
								class="image-button"
								on:click={openImageModal}
								aria-label="View full-size image"
							>
								<img
									src={item.image_url}
									alt={item.title}
									class="item-image"
								/>
								<div class="image-zoom-icon">
									<span class="material-icons">zoom_in</span>
								</div>
							</button>
						</div>
					</div>

					<!-- Image Modal/Lightbox -->
					{#if showImageModal}
						<div
							class="image-modal-overlay active"
							on:click={handleModalClick}
							on:keydown={event => event.key === 'Escape' && closeImageModal()}
							role="dialog"
							aria-modal="true"
							aria-label="Image preview"
							tabindex="-1"
						>
							<div class="image-modal-content">
								<button
									class="modal-close-btn"
									on:click={closeImageModal}
									aria-label="Close image preview"
								>
									<span class="material-icons">close</span>
								</button>
								<img
									src={item.image_url}
									alt={item.title}
									class="modal-image"
								/>
								<div class="modal-image-title">{item.title}</div>
							</div>
						</div>
					{/if}
				{/if}

				<div class="item-section">
					<div class="contact-card">
						<h2 class="contact-title">Contact Information</h2>
						{#if showContactInfo}
							<div class="contact-info">
								<div class="contact-item">
									<span class="contact-label">Name</span>
									<span class="contact-value">{item.reporter_name}</span>
								</div>
								<div class="contact-item">
									<span class="contact-label">Email</span>
									<span class="contact-value">
										<a href={`mailto:${item.reporter_email}`}>
											{item.reporter_email}
										</a>
									</span>
								</div>
								{#if item.reporter_phone}
									<div class="contact-item">
										<span class="contact-label">Phone</span>
										<span class="contact-value">
											<a href={`tel:${item.reporter_phone}`}>
												{item.reporter_phone}
											</a>
										</span>
									</div>
								{/if}
								{#if item.student_id}
									<div class="contact-item">
										<span class="contact-label">Student ID</span>
										<span class="contact-value">{item.student_id}</span>
									</div>
								{/if}
							</div>
							<button
								class="toggle-button secondary"
								on:click={toggleContactInfo}
							>
								Hide Contact Info
							</button>
						{:else}
							<p class="contact-info">Contact information is hidden to protect privacy.</p>
							<button
								class="toggle-button primary"
								on:click={toggleContactInfo}
							>
								Show Contact Info
							</button>
						{/if}
					</div>
				</div>

				<!-- Debug info -->
				<div class="debug-info" style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
					<p><strong>Debug Info:</strong> Item Status: {item.status}</p>
				</div>

				{#if item.status === 'found'}
					<div class="item-section">
						<div class="claim-container">
							{#if claimSubmitted}
								<ClaimSuccess {item} on:close={closeSuccessMessage} />
							{:else if showClaimForm}
								{#if claimError}
									<div class="claim-error-message">
										<span class="material-icons">error</span>
										<span>{claimError}</span>
									</div>
								{/if}
								<ClaimForm
									{item}
									isSubmitting={isSubmittingClaim}
									on:submit={handleClaimSubmit}
									on:cancel={closeClaimForm}
								/>
							{:else}
								<div class="claim-card">
									<div class="claim-icon">
										<span class="material-icons">handshake</span>
									</div>
									<h2 class="claim-title">Is this your item?</h2>
									<p class="claim-description">
										If you believe this is your lost item, you can submit a claim.
										Our team will review your claim and contact you if it's approved.
									</p>
									<button class="claim-button" on:click={openClaimForm}>
										Claim This Item
									</button>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="item-section">
						<div class="claim-container">
							<div class="claim-card">
								<div class="claim-icon">
									<span class="material-icons">info</span>
								</div>
								<h2 class="claim-title">Item Cannot Be Claimed</h2>
								<p class="claim-description">
									This item has a status of "{item.status}" and cannot be claimed. Only items with "found" status can be claimed.
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
