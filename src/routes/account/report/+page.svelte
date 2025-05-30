<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/types';
	import { authStore } from '$lib/stores/auth';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import UserReportForm from '$lib/components/UserReportForm.svelte';
	import ReportSuccess from '$lib/components/ReportSuccess.svelte';

	let categories = $state<Category[]>([]);
	let isLoading = $state(false);
	let error = $state('');
	let success = $state(false);
	let user = $state(null as any);
	let submittedItemId = $state('');

	// Form data object
	let formData = $state({
		title: '',
		description: '',
		category: '',
		status: 'lost' as 'lost' | 'found',
		location: '',
		floor: '',
		roomNumber: '',
		reporterName: '',
		reporterEmail: '',
		reporterPhone: '',
		imageUrl: '',
		imageFile: null as File | null,
		imagePreview: ''
	});

	let uploadProgress = $state(0);
	let isUploading = $state(false);

	// Form validation
	let errors = $state<Record<string, string>>({});

	onMount(() => {
		// Subscribe to auth store
		const unsubscribe = authStore.subscribe((value) => {
			user = value;

			// Auto-fill user information when user data is available
			if (user) {
				// Use username for reporter name if full_name is not available
				formData.reporterName = user.full_name || user.username || '';
				formData.reporterEmail = user.email || '';
			}
		});

		// Fetch categories
		fetchCategories();

		// Check URL parameters for pre-selecting lost or found
		const urlParams = new URLSearchParams(window.location.search);
		const type = urlParams.get('type');
		if (type === 'found') {
			formData.status = 'found';
		} else if (type === 'lost') {
			formData.status = 'lost';
		}

		// Return the unsubscribe function
		return () => unsubscribe();
	});

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

		if (!formData.title.trim()) errors.title = 'Title is required';
		if (!formData.category) errors.category = 'Category is required';
		if (!formData.location.trim()) errors.location = 'Location is required';
		if (!formData.floor) errors.floor = 'Floor is required';
		if (!formData.roomNumber.trim()) errors.roomNumber = 'Room number is required';

		// Name and email should already be filled from user account, but validate just in case
		if (!formData.reporterName.trim()) errors.reporterName = 'Your name is required';
		if (!formData.reporterEmail.trim()) errors.reporterEmail = 'Your email is required';
		else if (!/^\S+@\S+\.\S+$/.test(formData.reporterEmail)) errors.reporterEmail = 'Please enter a valid email';

		if (formData.reporterPhone && !/^\+?[0-9\s\-()]{7,}$/.test(formData.reporterPhone)) {
			errors.reporterPhone = 'Please enter a valid phone number';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleImageUpload(event: CustomEvent) {
		const fileInput = event.detail.event.target as HTMLInputElement;
		if (!fileInput.files || fileInput.files.length === 0) {
			return;
		}

		const file = fileInput.files[0];
		formData.imageFile = file;

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
			formData.imagePreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function uploadImage() {
		if (!formData.imageFile) return null;

		try {
			isUploading = true;
			uploadProgress = 0;

			const uploadFormData = new FormData();
			uploadFormData.append('image', formData.imageFile);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData
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

		try {
			isLoading = true;
			error = '';

			// Upload image if one is selected
			let uploadedImageUrl = formData.imageUrl;
			if (formData.imageFile) {
				uploadedImageUrl = await uploadImage();
				if (!uploadedImageUrl) {
					throw new Error('Failed to upload image');
				}
			}

			const itemData = {
				title: formData.title,
				description: formData.description,
				category: formData.category,
				status: formData.status,
				location: formData.location,
				floor: formData.floor,
				room_number: formData.roomNumber,
				reporter_name: formData.reporterName,
				reporter_email: formData.reporterEmail,
				reporter_phone: formData.reporterPhone,
				image_url: uploadedImageUrl,
				user_id: user ? user.id : null
			};

			console.log('Sending item data to API:', itemData);

			const response = await fetch('/api/items', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(itemData)
			});

			console.log('API response status:', response.status);

			if (!response.ok) {
				const errorData = await response.json();
				console.error('API error response:', errorData);
				throw new Error(errorData.error || 'Failed to submit item');
			}

			const result = await response.json();
			console.log('API success response:', result);
			submittedItemId = result.id;
			success = true;

		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleViewItem() {
		goto(`/account/items/${submittedItemId}`);
	}

	function handleReportAnother() {
		// Reset form but keep user info
		formData = {
			title: '',
			description: '',
			category: '',
			status: 'lost',
			location: '',
			floor: '',
			roomNumber: '',
			reporterName: user?.full_name || user?.username || '',
			reporterEmail: user?.email || '',
			reporterPhone: '',
			imageUrl: '',
			imageFile: null,
			imagePreview: ''
		};
		errors = {};
		success = false;
		submittedItemId = '';
	}
</script>

<div class="user-report-page">
	{#if !success}
		<PageHeader
			title="Report an Item"
			description="Report a lost or found item from your account. Your contact information will be automatically filled from your profile."
			icon="add_circle"
		/>

		{#if error}
			<div class="error-alert">
				<span class="material-icons">error_outline</span>
				<p>{error}</p>
			</div>
		{/if}

		<UserReportForm
			{categories}
			{isLoading}
			{errors}
			bind:formData
			on:imageUpload={handleImageUpload}
			on:submit={handleSubmit}
		/>
	{:else}
		<ReportSuccess
			itemId={submittedItemId}
			itemTitle={formData.title}
			itemStatus={formData.status}
			on:viewItem={handleViewItem}
			on:reportAnother={handleReportAnother}
		/>
	{/if}
</div>

<style>
	.user-report-page {
		padding-bottom: 3rem;
	}

	.error-alert {
		display: flex;
		align-items: center;
		background-color: #fee2e2;
		border: 1px solid #ef4444;
		color: #b91c1c;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.error-alert .material-icons {
		font-size: 20px;
		margin-right: 0.5rem;
	}

	.error-alert p {
		margin: 0;
	}
</style>
