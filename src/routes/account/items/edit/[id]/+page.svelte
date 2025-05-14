<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import type { Category, Item } from '$lib/types';

	// State variables
	let item = $state<Item | null>(null);
	let categories = $state<Category[]>([]);
	let isLoading = $state(false);
	let isSaving = $state(false);
	let error = $state('');
	let success = $state(false);
	let user = $state(null as any);

	// Form data
	let title = $state('');
	let description = $state('');
	let category = $state('');
	let status = $state<'lost' | 'found'>('lost');
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
		// Get the ID from the URL path
		const pathParts = window.location.pathname.split('/');
		const id = pathParts[pathParts.length - 1];

		try {
			isLoading = true;

			// Fetch item details
			const itemResponse = await fetch(`/api/items/${id}`);
			if (!itemResponse.ok) {
				throw new Error('Failed to fetch item details');
			}
			item = await itemResponse.json();

			if (item) {
				// Populate form with item data
				title = item.title;
				description = item.description || '';
				category = item.category;
				status = item.status as 'lost' | 'found';
				location = item.location || '';
				floor = item.floor || '';
				roomNumber = item.room_number || '';
				reporterName = item.reporter_name;
				reporterEmail = item.reporter_email;
				reporterPhone = item.reporter_phone || '';
				imageUrl = item.image_url || '';

				if (imageUrl) {
					imagePreview = imageUrl;
				}
			}

			// Fetch categories
			await fetchCategories();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	// Separate function to fetch categories
	async function fetchCategories() {
		try {
			// First try to get categories
			const response = await fetch('/api/categories');
			if (!response.ok) throw new Error('Failed to fetch categories');
			categories = await response.json();

			// If no categories found, try to initialize the database
			if (categories.length === 0) {
				console.warn('No categories found. Attempting to initialize database...');

				// Call the init-db endpoint
				const initResponse = await fetch('/api/init-db');
				if (!initResponse.ok) throw new Error('Failed to initialize database');

				const initData = await initResponse.json();

				if (initData.success && initData.categories) {
					categories = initData.categories;
					console.log('Database initialized with categories:', categories);
				} else {
					throw new Error('Failed to initialize categories');
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error('Error fetching categories:', error);
		}
	}

	function validateForm() {
		errors = {};

		if (!title.trim()) errors.title = 'Title is required';
		if (!category) errors.category = 'Category is required';
		if (!location.trim()) errors.location = 'Location is required';
		if (!floor) errors.floor = 'Floor is required';
		if (!roomNumber.trim()) errors.roomNumber = 'Room number is required';

		// Name and email should already be filled from user account, but validate just in case
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
		if (!imageFile) return imageUrl; // Return existing URL if no new file

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
		console.log('Form submission started');
		if (!validateForm()) {
			console.log('Form validation failed:', errors);
			return;
		}

		isSaving = true;
		error = '';

		try {
			// Upload image if one is selected
			let uploadedImageUrl = imageUrl;
			if (imageFile) {
				uploadedImageUrl = await uploadImage();
				if (!uploadedImageUrl) {
					throw new Error('Failed to upload image');
				}
			}

			// Get the ID from the URL path
			const pathParts = window.location.pathname.split('/');
			const id = pathParts[pathParts.length - 1];

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
				user_id: user ? user.id : null
			};

			console.log('Sending updated item data to API:', itemData);

			const response = await fetch(`/api/items/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(itemData)
			});

			console.log('API response status:', response.status);

			if (!response.ok) {
				const errorData = await response.json();
				console.error('API error response:', errorData);
				throw new Error(errorData.error || 'Failed to update item');
			}

			const result = await response.json();
			console.log('API success response:', result);

			success = true;

			// Redirect to the item details page after a short delay
			setTimeout(() => {
				goto(`/account/items/${id}`);
			}, 2000);

		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isSaving = false;
		}
	}

	function goBack() {
		if (item) {
			goto(`/account/items/${item.id}`);
		} else {
			goto('/account/items');
		}
	}
</script>

<div>
	<button onclick={goBack} class="back-button">
		<span class="material-icons">arrow_back</span>
		Back to Item Details
	</button>

	<div class="mb-4">
		<h1 class="mb-2">Edit Item</h1>
		<p>Update the information for your reported item.</p>
	</div>

	{#if success}
		<div class="card mb-4" style="background-color: #d1fae5; border: 1px solid #10b981; color: #065f46; padding: 1rem;">
			<p>Your item has been successfully updated! Redirecting to item details...</p>
		</div>
	{/if}

	{#if error}
		<div class="card mb-4" style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 1rem;">
			<p>{error}</p>
		</div>
	{/if}

	{#if isLoading}
		<div class="loading-container">
			<p>Loading item details...</p>
		</div>
	{:else}
		<div class="card">
			<div class="card-body">
				<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
					<div class="grid grid-cols-1 grid-cols-md-2 gap-4 mb-4">
						<div style="grid-column: span 2;">
							<div class="flex space-x-4">
								<label class="flex items-center">
									<input type="radio" name="status" checked={status === 'lost'} onclick={() => status = 'lost'} />
									<span class="ml-2">Lost item</span>
								</label>
								<label class="flex items-center">
									<input type="radio" name="status" checked={status === 'found'} onclick={() => status = 'found'} />
									<span class="ml-2">Found item</span>
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
									Optional: Upload a new image of the item (max 5MB, JPEG, PNG, GIF, or WebP)
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
								Your Name * <span style="font-size: 0.75rem; color: #6b7280;">(From your account)</span>
							</label>
							<input
								type="text"
								id="reporterName"
								bind:value={reporterName}
								class="form-control"
								style={errors.reporterName ? 'border-color: #ef4444;' : 'background-color: #f9f9f9;'}
								readonly
							/>
							{#if errors.reporterName}
								<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.reporterName}</p>
							{/if}
						</div>

						<div class="form-group">
							<label for="reporterEmail" class="form-label">
								Your Email * <span style="font-size: 0.75rem; color: #6b7280;">(From your account)</span>
							</label>
							<input
								type="email"
								id="reporterEmail"
								bind:value={reporterEmail}
								class="form-control"
								style={errors.reporterEmail ? 'border-color: #ef4444;' : 'background-color: #f9f9f9;'}
								readonly
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
							type="button"
							class="btn btn-secondary mr-2"
							onclick={goBack}
							disabled={isSaving}
						>
							Cancel
						</button>
						<button
							type="submit"
							class="btn btn-primary"
							disabled={isSaving}
							style={isSaving ? 'opacity: 0.5;' : ''}
						>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>

<style>
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

	.loading-container {
		background-color: white;
		border-radius: 0.5rem;
		padding: 2rem;
		text-align: center;
		margin-top: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #443627;
	}

	.form-control {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #EFDCAB;
		border-radius: 0.375rem;
		font-size: 1rem;
	}

	.form-control:focus {
		outline: none;
		border-color: #D98324;
		box-shadow: 0 0 0 2px rgba(217, 131, 36, 0.2);
	}

	.btn {
		padding: 0.75rem 1.25rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s, opacity 0.2s;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: #D98324;
		color: white;
		border: none;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #c47520;
	}

	.btn-secondary {
		background-color: #f8f9fa;
		color: #212529;
		border: 1px solid #dee2e6;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #e9ecef;
	}
</style>
