<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/types';
	import { authStore } from '$lib/stores/auth';
	import { navigateToAccountPage, isAccountPage } from '$lib/utils/navigation';
	// Accept initialStatus prop from parent component
	let { initialStatus = 'lost' } = $props<{ initialStatus?: 'lost' | 'found' }>();

	let categories = $state<Category[]>([]);
	let isLoading = $state(false);
	let error = $state('');
	let success = $state(false);
	let user = $state(null as any);

	// Form data
	let title = $state('');
	let description = $state('');
	let category = $state('');
	let status = $state<'lost' | 'found'>(initialStatus);
	let location = $state('');
	let floor = $state('');
	let roomNumber = $state('');
	let reporterName = $state('');
	let reporterEmail = $state('');
	let reporterPhone = $state('');
	let imageUrl = $state('');
	let imageFile = $state<File | null>(null);
	let imagePreview = $state('');
	let uploadProgress = $state(0);
	let isUploading = $state(false);

	// Check URL parameters on mount
	onMount(() => {
		// Check if URL has type=found parameter
		const url = new URL(window.location.href);
		const typeParam = url.searchParams.get('type');
		if (typeParam === 'found') {
			status = 'found';
		}

		// Log whether we're in the account section for debugging
		console.log('Current path:', window.location.pathname);
		console.log('Is account page:', isAccountPage());
	});

	// Floor options
	const floorOptions = [
		{ value: '1st Floor', label: '1st Floor' },
		{ value: '2nd Floor', label: '2nd Floor' },
		{ value: '3rd Floor', label: '3rd Floor' },
		{ value: '4th Floor', label: '4th Floor' },
		{ value: '5th Floor', label: '5th Floor' }
	];

	// Form validation
	let errors = $state<Record<string, string>>({});

	onMount(() => {
		// Subscribe to auth store to get user information
		const unsubscribe = authStore.subscribe((value) => {
			user = value;

			// Pre-fill user information if available
			if (user) {
				reporterName = user.username || '';
				reporterEmail = user.email || '';

				// If user has a full_name, use that instead of username
				if (user.full_name) {
					reporterName = user.full_name;
				}

				// Log user ID for debugging
				console.log('User ID in report form:', user.id);
			}
		});

		// Fetch categories
		fetchCategories();

		// Return the unsubscribe function
		return unsubscribe;
	});

	async function fetchCategories() {
		try {
			const response = await fetch('/api/categories');
			if (!response.ok) throw new Error('Failed to fetch categories');
			categories = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		}
	}

	function validateForm() {
		errors = {};

		if (!title.trim()) errors.title = 'Title is required';
		if (!category) errors.category = 'Category is required';
		if (!location.trim()) errors.location = 'Location is required';
		if (!floor) errors.floor = 'Floor is required';
		if (!roomNumber.trim()) errors.roomNumber = 'Room number is required';
		if (!reporterName.trim()) errors.reporterName = 'Your name is required';
		if (!reporterEmail.trim()) errors.reporterEmail = 'Your email is required';
		else if (!/^\S+@\S+\.\S+$/.test(reporterEmail)) errors.reporterEmail = 'Please enter a valid email';

		if (reporterPhone && !/^\+?[0-9\s\-()]{7,}$/.test(reporterPhone)) {
			errors.reporterPhone = 'Please enter a valid phone number';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleImageUpload(event: Event) {
		const fileInput = event.target as HTMLInputElement;
		if (!fileInput.files || fileInput.files.length === 0) {
			return;
		}

		const file = fileInput.files[0];
		imageFile = file;

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			errors.image = 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.';
			return;
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			errors.image = 'File too large. Maximum size is 5MB.';
			return;
		}

		// Create a preview
		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function uploadImage() {
		if (!imageFile) return null;

		try {
			isUploading = true;
			uploadProgress = 0;

			const formData = new FormData();
			formData.append('image', imageFile);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to upload image');
			}

			const result = await response.json();
			uploadProgress = 100;
			return result.fileUrl;
		} catch (err) {
			console.error('Error uploading image:', err);
			errors.image = err instanceof Error ? err.message : 'Failed to upload image';
			return null;
		} finally {
			isUploading = false;
		}
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		try {
			isLoading = true;

			// Upload image if one is selected
			let uploadedImageUrl = imageUrl;
			if (imageFile) {
				uploadedImageUrl = await uploadImage();
				if (!uploadedImageUrl) {
					throw new Error('Failed to upload image');
				}
			}

			// Include user_id if user is logged in
			const userId = user ? user.id : null;
			console.log('Submitting report with user ID:', userId);

			const itemData = {
				title,
				description,
				category,
				status,
				location,
				floor,
				room_number: roomNumber,
				reporter_name: reporterName,
				reporter_email: reporterEmail,
				reporter_phone: reporterPhone,
				image_url: uploadedImageUrl,
				user_id: userId
			};

			const response = await fetch('/api/items', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(itemData)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to submit item');
			}

			const result = await response.json();
			success = true;

			// Reset form
			title = '';
			description = '';
			category = '';
			location = '';
			floor = '';
			roomNumber = '';
			reporterPhone = '';
			imageUrl = '';
			imageFile = null;
			imagePreview = '';

			// Redirect to the appropriate page after a short delay
			setTimeout(() => {
				// Check if we're in the account section
				if (isAccountPage()) {
					// Redirect to account items page using our navigation utility
					console.log('Redirecting to account items page');
					navigateToAccountPage('/items');
				} else {
					// Redirect to item details page
					console.log('Redirecting to public item details page');
					goto(`/items/${result.id}`);
				}
			}, 2000);

		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div>
	<div class="mb-4">
		<h1 class="mb-2">Report an Item</h1>
		<p>Fill out the form below to report a lost or found item.</p>
	</div>

	{#if success}
		<div class="card mb-4" style="background-color: #d1fae5; border: 1px solid #10b981; color: #065f46; padding: 1rem;">
			<p>Your item has been successfully reported! Redirecting to item details...</p>
		</div>
	{/if}

	{#if error}
		<div class="card mb-4" style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 1rem;">
			<p>{error}</p>
		</div>
	{/if}

	<div class="card">
		<div class="card-body">
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="grid grid-cols-1 grid-cols-md-2 gap-4 mb-4">
					<div style="grid-column: span 2;">
						<div class="flex space-x-4">
							<label class="flex items-center">
								<input type="radio" bind:group={status} value="lost" />
								<span class="ml-2">I lost an item</span>
							</label>
							<label class="flex items-center">
								<input type="radio" bind:group={status} value="found" />
								<span class="ml-2">I found an item</span>
							</label>
						</div>
					</div>

					<div class="form-group">
						<label for="title" class="form-label">
							Item Title *
						</label>
						<input
							type="text"
							id="title"
							bind:value={title}
							class="form-control"
							style={errors.title ? 'border-color: #ef4444;' : ''}
							placeholder="e.g. Blue Backpack, iPhone 13, etc."
						/>
						{#if errors.title}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.title}</p>
						{/if}
					</div>

					<div class="form-group">
						<label for="category" class="form-label">
							Category *
						</label>
						<select
							id="category"
							bind:value={category}
							class="form-control"
							style={errors.category ? 'border-color: #ef4444;' : ''}
						>
							<option value="">Select a category</option>
							{#each categories as cat}
								<option value={cat.name}>{cat.name}</option>
							{/each}
						</select>
						{#if errors.category}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.category}</p>
						{/if}
					</div>

					<div style="grid-column: span 2;" class="form-group">
						<label for="description" class="form-label">
							Description
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="4"
							class="form-control"
							placeholder="Provide details about the item..."
						></textarea>
					</div>

					<div class="form-group">
						<label for="location" class="form-label">
							Location *
						</label>
						<input
							type="text"
							id="location"
							bind:value={location}
							class="form-control"
							style={errors.location ? 'border-color: #ef4444;' : ''}
							placeholder="Building or area where it was lost/found"
						/>
						{#if errors.location}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.location}</p>
						{/if}
					</div>

					<div class="form-group">
						<label for="floor" class="form-label">
							Floor *
						</label>
						<select
							id="floor"
							bind:value={floor}
							class="form-control"
							style={errors.floor ? 'border-color: #ef4444;' : ''}
						>
							<option value="">Select a floor</option>
							{#each floorOptions as floorOption}
								<option value={floorOption.value}>{floorOption.label}</option>
							{/each}
						</select>
						{#if errors.floor}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.floor}</p>
						{/if}
					</div>

					<div class="form-group">
						<label for="roomNumber" class="form-label">
							Room Number *
						</label>
						<input
							type="text"
							id="roomNumber"
							bind:value={roomNumber}
							class="form-control"
							style={errors.roomNumber ? 'border-color: #ef4444;' : ''}
							placeholder="e.g. 101, Lab 3, etc."
						/>
						{#if errors.roomNumber}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.roomNumber}</p>
						{/if}
					</div>

					<div class="form-group">
						<label for="image" class="form-label">
							Item Image
						</label>
						<div style="margin-bottom: 0.5rem;">
							<input
								type="file"
								id="image"
								accept="image/*"
								onchange={handleImageUpload}
								class="form-control"
								style={errors.image ? 'border-color: #ef4444;' : ''}
							/>
							<p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.25rem;">
								Optional: Upload an image of the item (max 5MB, JPEG, PNG, GIF, or WebP)
							</p>
							{#if errors.image}
								<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.image}</p>
							{/if}
						</div>

						{#if imagePreview}
							<div style="margin-top: 0.5rem;">
								<p style="font-size: 0.875rem; margin-bottom: 0.5rem;">Image Preview:</p>
								<img
									src={imagePreview}
									alt="Preview"
									style="max-width: 100%; max-height: 200px; border-radius: 0.375rem; border: 1px solid #EFDCAB;"
								/>
							</div>
						{/if}

						{#if isUploading}
							<div style="margin-top: 0.5rem;">
								<p style="font-size: 0.875rem; margin-bottom: 0.25rem;">Uploading: {uploadProgress}%</p>
								<div style="height: 0.5rem; width: 100%; background-color: #e5e7eb; border-radius: 0.25rem; overflow: hidden;">
									<div
										style="height: 100%; background-color: #D98324; width: {uploadProgress}%;"
									></div>
								</div>
							</div>
						{/if}

						<div style="margin-top: 0.5rem;">
							<p style="font-size: 0.875rem; margin-bottom: 0.25rem;">Or provide an image URL:</p>
							<input
								type="text"
								id="imageUrl"
								bind:value={imageUrl}
								class="form-control"
								placeholder="https://example.com/image.jpg"
							/>
						</div>
					</div>

					<div style="grid-column: span 2;" class="mb-3 mt-2">
						<h3>Your Contact Information</h3>
					</div>

					<div class="form-group">
						<label for="reporterName" class="form-label">
							Your Name *
						</label>
						<input
							type="text"
							id="reporterName"
							bind:value={reporterName}
							class="form-control"
							style={errors.reporterName ? 'border-color: #ef4444;' : ''}
						/>
						{#if errors.reporterName}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.reporterName}</p>
						{/if}
					</div>

					<div class="form-group">
						<label for="reporterEmail" class="form-label">
							Your Email *
						</label>
						<input
							type="email"
							id="reporterEmail"
							bind:value={reporterEmail}
							class="form-control"
							style={errors.reporterEmail ? 'border-color: #ef4444;' : ''}
						/>
						{#if errors.reporterEmail}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.reporterEmail}</p>
						{/if}
					</div>

					<div class="form-group">
						<label for="reporterPhone" class="form-label">
							Your Phone
						</label>
						<input
							type="tel"
							id="reporterPhone"
							bind:value={reporterPhone}
							class="form-control"
							style={errors.reporterPhone ? 'border-color: #ef4444;' : ''}
						/>
						{#if errors.reporterPhone}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.reporterPhone}</p>
						{:else}
							<p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.25rem;">Optional</p>
						{/if}
					</div>
				</div>

				<div class="flex justify-end">
					<button
						type="submit"
						class="btn btn-primary"
						disabled={isLoading}
						style={isLoading ? 'opacity: 0.5;' : ''}
					>
						{isLoading ? 'Submitting...' : 'Submit Report'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
