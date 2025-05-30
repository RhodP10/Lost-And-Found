<script lang="ts">
	import { onMount } from 'svelte';
	import type { Item } from '$lib/types';
	import RecentItemsSection from '$lib/components/RecentItemsSection.svelte';
	import HowItWorks from '$lib/components/HowItWorks.svelte';

	let recentItems: Item[] = [];
	let isLoading = true;
	let error = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/items?limit=6');
			if (!response.ok) throw new Error('Failed to fetch recent items');
			recentItems = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	});
</script>

<div>
	<section style="background-color: #F2F6D0; padding: 0;">
		<div class="container" style="padding: 0;">
			<div style="display: flex; align-items: stretch;">
				<div style="flex: 1; padding: 40px 20px 40px 0;">
					<h1 style="font-size: 2.5rem; color: #443627; margin-bottom: 1rem; font-weight: bold;">Where lost items find their way back home</h1>
					<a href="/signup" target="_blank" style="background-color: #D98324; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; text-decoration: none; font-weight: 500;">
						Sign Up
					</a>
				</div>
				<div style="flex: 1; position: relative;">
					<img src="https://img.freepik.com/free-vector/lost-found-concept-illustration_114360-1757.jpg" alt="Person searching for lost items" style="width: 100%; height: 100%; object-fit: cover;" />
					<div style="position: absolute; top: 30%; right: 20%; background-color: #f8d7da; color: #842029; padding: 5px 10px; border-radius: 4px; font-weight: 600;">Lost</div>
					<div style="position: absolute; bottom: 30%; right: 30%; background-color: #d1e7dd; color: #0f5132; padding: 5px 10px; border-radius: 4px; font-weight: 600;">Found</div>
				</div>
			</div>
		</div>
	</section>

	<div class="container">
		<RecentItemsSection items={recentItems} {isLoading} {error} />
	</div>

	<HowItWorks />
</div>
