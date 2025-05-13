<script lang="ts">
	import { onMount } from 'svelte';
	import Report from '../../report/+page.svelte';

	// Get the initial status from URL parameters
	let initialStatus = $state<'lost' | 'found'>('lost');

	onMount(() => {
		// Check if URL has type=found parameter
		const url = new URL(window.location.href);
		const typeParam = url.searchParams.get('type');
		if (typeParam === 'found') {
			initialStatus = 'found';
		}

		console.log('Account report page - initialStatus:', initialStatus);
		console.log('Account report page - path:', window.location.pathname);
	});
</script>

<div class="account-report-page">
	<Report initialStatus={initialStatus} />
</div>

<style>
	.account-report-page {
		max-width: 100%;
	}
</style>
