<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/types';

	let categories: Category[] = [];
	let isLoading = false;
	let error = '';
	let success = false;

	// Form data
	let title = '';
	let description = '';
	let category = '';
	let status: 'lost' | 'found' = 'lost';
	let location = '';
	let reporterName = '';
	let reporterEmail = '';
	let reporterPhone = '';
	let imageUrl = '';

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

		if (!title.trim()) errors.title = 'Title is required';
		if (!category) errors.category = 'Category is required';
		if (!location.trim()) errors.location = 'Location is required';
		if (!reporterName.trim()) errors.reporterName = 'Your name is required';
		if (!reporterEmail.trim()) errors.reporterEmail = 'Your email is required';
		else if (!/^\S+@\S+\.\S+$/.test(reporterEmail)) errors.reporterEmail = 'Please enter a valid email';
		
		if (reporterPhone && !/^\+?[0-9\s\-()]{7,}$/.test(reporterPhone)) {
			errors.reporterPhone = 'Please enter a valid phone number';
		}
		
		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		try {
			isLoading = true;

			const itemData = {
				title,
				description,
				category,
				status,
				location,
				reporter_name: reporterName,
				reporter_email: reporterEmail,
				reporter_phone: reporterPhone,
				image_url: imageUrl
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
			reporterPhone = '';
			imageUrl = '';

			// Redirect to the item page after a short delay
			setTimeout(() => {
				goto(`/items/${result.id}`);
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
			<form on:submit|preventDefault={handleSubmit}>
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
							placeholder="Where was it lost/found?"
						/>
						{#if errors.location}
							<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.location}</p>
						{/if}
					</div>

					<div class="form-group">
						<label for="imageUrl" class="form-label">
							Image URL
						</label>
						<input
							type="text"
							id="imageUrl"
							bind:value={imageUrl}
							class="form-control"
							placeholder="https://example.com/image.jpg"
						/>
						<p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.25rem;">Optional: Link to an image of the item</p>
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
