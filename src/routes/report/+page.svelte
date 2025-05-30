<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/types';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ReportForm from '$lib/components/ReportForm.svelte';
	import ReportSuccess from '$lib/components/ReportSuccess.svelte';

	let categories: Category[] = [];
	let isLoading = false;
	let error = '';
	let success = false;
	let submittedItemId = '';

	// Form data object
	let formData = {
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
	};

	let uploadProgress = 0;
	let isUploading = false;

	// Form validation
	let errors: Record<string, string> = {};

	onMount(async () => {
		try {
			const response = await fetch('/api/categories');
			if (!response.ok) throw new Error('Failed to fetch categories');
			categories = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		}
	});

	function validateForm() {
		errors = {};

		if (!formData.title.trim()) errors.title = 'Title is required';
		if (!formData.category) errors.category = 'Category is required';
		if (!formData.location.trim()) errors.location = 'Location is required';
		if (!formData.floor) errors.floor = 'Floor is required';
		if (!formData.roomNumber.trim()) errors.roomNumber = 'Room number is required';
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
		if (!validateForm()) return;

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
				image_url: uploadedImageUrl
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
		goto(`/items/${submittedItemId}`);
	}

	function handleReportAnother() {
		// Reset form
		formData = {
			title: '',
			description: '',
			category: '',
			status: 'lost',
			location: '',
			floor: '',
			roomNumber: '',
			reporterName: '',
			reporterEmail: '',
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

<div class="report-page">
	{#if !success}
		<PageHeader
			title="Report an Item"
			description="Help reunite lost items with their owners by reporting what you've lost or found."
			icon="add_circle"
		/>

		{#if error}
			<div class="error-alert">
				<span class="material-icons">error_outline</span>
				<p>{error}</p>
			</div>
		{/if}

		<ReportForm
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
	.report-page {
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
