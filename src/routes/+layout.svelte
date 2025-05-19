<script lang="ts">
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { authStore } from '$lib/stores/auth';

	let { children } = $props();
	let currentPath = $state(typeof window !== 'undefined' ? window.location.pathname : '/');
	let isNavigating = $state(false);
	let user = $state(null as any);

	// Check if current page is login, signup, account, or admin page
	let isAuthPage = $derived(currentPath === '/login' || currentPath === '/signup');
	let isAccountPage = $derived(currentPath.startsWith('/account'));
	let isAdminPage = $derived(currentPath.startsWith('/admin'));

	// Subscribe to auth store
	onMount(() => {
		const unsubscribe = authStore.subscribe((value) => {
			user = value;
		});

		return () => {
			unsubscribe();
		};
	});

	// Logout function
	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', {
				method: 'POST'
			});
			authStore.logout();
			window.location.href = '/'; // Full page refresh to clear any state
		} catch (error) {
			console.error('Logout error:', error);
		}
	}

	// Update currentPath when the URL changes
	function updatePath() {
		currentPath = window.location.pathname;
	}

	onMount(() => {
		// Initial path
		updatePath();

		// Listen for navigation events
		window.addEventListener('popstate', updatePath);

		// Intercept link clicks for client-side navigation
		document.addEventListener('click', handleLinkClick);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('popstate', updatePath);
			document.removeEventListener('click', handleLinkClick);
		}
	});

	// Handle link clicks for client-side navigation
	function handleLinkClick(event: MouseEvent) {
		// Only handle clicks on links within our app
		const target = event.target as HTMLElement;
		const link = target.closest('a');

		if (link && link.href && link.href.startsWith(window.location.origin)) {
			// Check if the link should open in a new tab
			const url = new URL(link.href);
			const newPath = url.pathname;

			// If it's a login or signup link, let it open in a new tab
			if (newPath === '/login' || newPath === '/signup') {
				if (!link.hasAttribute('target')) {
					link.setAttribute('target', '_blank');
				}
				return; // Let the browser handle it
			}

			// For other links without target attribute, handle with client-side navigation
			if (!link.hasAttribute('target')) {
				event.preventDefault();

				// Only navigate if the path is different
				if (newPath !== currentPath) {
					// Start navigation
					isNavigating = true;

					// Update URL
					history.pushState({}, '', newPath);
					currentPath = newPath;

					// Simulate a small delay for smoother transitions
					setTimeout(() => {
						// Manually trigger a popstate event to update the UI
						window.dispatchEvent(new Event('popstate'));

						// End navigation after a short delay
						setTimeout(() => {
							isNavigating = false;
						}, 100);
					}, 50);
				}
			}
		}
	}
</script>

<style>
	.page-content {
		position: relative;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.content-wrapper {
		flex: 1;
	}

	.footer-wrapper {
		position: relative;
		z-index: 10;
	}

	/* Add a subtle fade transition for content */
	.fade-transition {
		opacity: 1;
		transition: opacity 0.2s ease;
	}

	.fade-transition.navigating {
		opacity: 0.8;
	}
</style>

{#if isAuthPage}
	<!-- For login and signup pages, render only the content without header/footer -->
	<div style="min-height: 100vh;">
		{@render children()}
	</div>
{:else if isAccountPage}
	<!-- For account pages, render only the content without header/footer -->
	<div style="min-height: 100vh;">
		{@render children()}
	</div>
{:else if isAdminPage}
	<!-- For admin pages, render only the content without header/footer -->
	<div style="min-height: 100vh;">
		{@render children()}
	</div>
{:else}
	<!-- For all other pages, render with header and footer -->
	<div class="page-content">
		<nav style="background-color: #443627; padding: 10px 0;">
			<div class="container">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<div style="width: 42px; height: 42px; background-color: #f2f2f2; border-radius: 4px; margin-right: 10px;"></div>
						<div>
							<div style="color: #D98324; font-weight: bold; font-size: 1.1rem;">Lost And Found</div>
							<div style="font-size: 0.75rem; color: #EFDCAB;">Management System</div>
						</div>
					</div>
					<div style="display: flex; align-items: center;">
						<a
							href="/"
							style="margin-right: 20px; color: white; text-decoration: none;"
							class={currentPath === '/' ? 'font-bold' : ''}
						>
							Home
						</a>
						<a
							href="/lost"
							style="margin-right: 20px; color: white; text-decoration: none;"
							class={currentPath === '/lost' ? 'font-bold' : ''}
						>
							Lost
						</a>
						<a
							href="/found"
							style="margin-right: 20px; color: white; text-decoration: none;"
							class={currentPath === '/found' ? 'font-bold' : ''}
						>
							Found
						</a>
						<a
							href="/report"
							style="margin-right: 20px; color: white; text-decoration: none;"
							class={currentPath === '/report' ? 'font-bold' : ''}
						>
							Report Lost
						</a>
						{#if user}
							<!-- Show user info and dashboard link when logged in -->
							<div style="display: flex; align-items: center;">
								<a
									href="/account/dashboard"
									style="margin-right: 20px; color: white; text-decoration: none;"
									class={currentPath.startsWith('/account') ? 'font-bold' : ''}
								>
									My Dashboard
								</a>
								{#if user.isAdmin}
									<a
										href="/admin/dashboard"
										style="margin-right: 20px; color: #D98324; text-decoration: none; font-weight: 500;"
										class={currentPath.startsWith('/admin') ? 'font-bold' : ''}
									>
										Admin Panel
									</a>
								{/if}
								<span style="margin-right: 20px; color: white;">
									Hello, {user.username}
								</span>
								<button
									onclick={handleLogout}
									style="background-color: #D98324; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 500; border: none; cursor: pointer;"
								>
									Logout
								</button>
							</div>
						{:else}
							<!-- Show login/signup when not logged in -->
							<a
								href="/login"
								target="_blank"
								style="margin-right: 20px; color: white; text-decoration: none;"
							>
								Login
							</a>
							<a
								href="/signup"
								target="_blank"
								style="background-color: #D98324; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 500; text-decoration: none;"
							>
								Sign Up
							</a>
						{/if}
					</div>
				</div>
			</div>
		</nav>

		<div class="content-wrapper">
			<main class="container fade-transition" class:navigating={isNavigating}>
				{@render children()}
			</main>
		</div>

		<div class="footer-wrapper">
			<footer>
				<div class="container">
					<div class="flex justify-between items-center">
						<div>
							<h3>Lost & Found</h3>
							<p class="footer-text">Helping reunite people with their belongings</p>
						</div>
						<div>
							<p class="footer-text">&copy; {new Date().getFullYear()} Lost & Found App</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	</div>
{/if}
