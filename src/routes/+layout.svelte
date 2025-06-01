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

	/* Navbar Styles */
	.main-navbar {
		background: linear-gradient(135deg, #443627 0%, #5a4a3a 100%);
		padding: 12px 0;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		position: relative;
		z-index: 1000;
		animation: slideDown 0.6s ease-out;
	}

	.navbar-full-container {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		width: 100%;
		padding: 0 1rem;
		gap: 2rem;
	}

	/* Left Section: Logo */
	.navbar-left-section {
		display: flex;
		justify-content: flex-start;
		animation: fadeInLeft 0.8s ease-out;
	}

	.logo-section {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.logo-icon {
		width: 42px;
		height: 42px;
		background: linear-gradient(135deg, #f2f2f2 0%, #e0e0e0 100%);
		border-radius: 8px;
		margin-right: 12px;
		position: relative;
		overflow: hidden;
		transition: transform 0.3s ease;
	}

	.logo-icon:hover {
		transform: scale(1.05) rotate(5deg);
	}

	.logo-icon::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 20px;
		height: 20px;
		background-color: #D98324;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	.logo-text {
		display: flex;
		flex-direction: column;
	}

	.brand-name {
		color: #D98324;
		font-weight: bold;
		font-size: 1.2rem;
		line-height: 1.2;
		transition: color 0.3s ease;
	}

	.brand-subtitle {
		font-size: 0.75rem;
		color: #EFDCAB;
		opacity: 0.9;
		transition: opacity 0.3s ease;
	}

	.logo-section:hover .brand-name {
		color: #f4a636;
	}

	.logo-section:hover .brand-subtitle {
		opacity: 1;
	}

	/* Center Section: Navigation Links */
	.navbar-center-section {
		display: flex;
		justify-content: center;
		align-items: center;
		animation: fadeInUp 0.8s ease-out 0.2s both;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.nav-link {
		color: white;
		text-decoration: none;
		padding: 10px 16px;
		border-radius: 6px;
		font-weight: 500;
		position: relative;
		transition: all 0.3s ease;
		overflow: hidden;
		white-space: nowrap;
	}

	.nav-link::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.5s ease;
	}

	.nav-link:hover::before {
		left: 100%;
	}

	.nav-link:hover {
		background-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.nav-link.active {
		background-color: #D98324;
		color: white;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(217, 131, 36, 0.3);
	}

	.nav-link.active:hover {
		background-color: #f4a636;
		transform: translateY(-2px);
	}

	.admin-link {
		color: #D98324 !important;
		font-weight: 600;
	}

	.admin-link:hover {
		color: #f4a636 !important;
		background-color: rgba(217, 131, 36, 0.1);
	}

	/* Right Section: Authentication/User Actions */
	.navbar-right-section {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		animation: fadeInRight 0.8s ease-out 0.4s both;
	}

	.user-section {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.auth-section {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.user-greeting {
		color: white;
		font-weight: 500;
		padding: 8px 12px;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		font-size: 0.9rem;
		animation: glow 3s ease-in-out infinite alternate;
		white-space: nowrap;
	}

	.logout-btn {
		background: linear-gradient(135deg, #D98324 0%, #f4a636 100%);
		color: white;
		padding: 10px 20px;
		border-radius: 6px;
		font-weight: 600;
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		white-space: nowrap;
	}

	.logout-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.logout-btn:hover::before {
		left: 100%;
	}

	.logout-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(217, 131, 36, 0.4);
		background: linear-gradient(135deg, #f4a636 0%, #D98324 100%);
	}

	.logout-btn:active {
		transform: translateY(0);
	}

	/* Auth Buttons */
	.login-btn {
		color: white;
		text-decoration: none;
		padding: 10px 20px;
		border-radius: 6px;
		font-weight: 500;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		border: 2px solid transparent;
		white-space: nowrap;
	}

	.login-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.5s ease;
	}

	.login-btn:hover::before {
		left: 100%;
	}

	.login-btn:hover {
		background-color: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.signup-btn {
		background: linear-gradient(135deg, #D98324 0%, #f4a636 100%);
		color: white;
		padding: 10px 24px;
		border-radius: 6px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(217, 131, 36, 0.3);
		white-space: nowrap;
	}

	.signup-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.signup-btn:hover::before {
		left: 100%;
	}

	.signup-btn:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 25px rgba(217, 131, 36, 0.4);
		background: linear-gradient(135deg, #f4a636 0%, #D98324 100%);
	}

	.signup-btn:active {
		transform: translateY(-1px);
	}

	/* Animations */
	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes fadeInLeft {
		from {
			transform: translateX(-30px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes fadeInUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes fadeInRight {
		from {
			transform: translateX(30px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes pulse {
		0%, 100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.2);
			opacity: 0.7;
		}
	}

	@keyframes glow {
		from {
			box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
		}
		to {
			box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
		}
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.navbar-full-container {
			padding: 0 0.5rem;
			gap: 1rem;
		}

		.nav-links {
			gap: 4px;
		}

		.nav-link {
			padding: 8px 12px;
			font-size: 0.9rem;
		}
	}

	@media (max-width: 768px) {
		.navbar-full-container {
			grid-template-columns: 1fr;
			gap: 16px;
			padding: 8px 1rem;
		}

		.navbar-left-section {
			justify-content: center;
			order: 1;
		}

		.navbar-center-section {
			order: 2;
		}

		.navbar-right-section {
			justify-content: center;
			order: 3;
		}

		.nav-links {
			flex-wrap: wrap;
			justify-content: center;
			gap: 4px;
		}

		.nav-link {
			padding: 8px 12px;
			font-size: 0.9rem;
		}

		.auth-section {
			gap: 8px;
		}

		.login-btn,
		.signup-btn {
			padding: 8px 16px;
			font-size: 0.9rem;
		}

		.user-section {
			flex-wrap: wrap;
			justify-content: center;
			gap: 8px;
		}

		.user-greeting {
			font-size: 0.8rem;
			padding: 6px 10px;
		}
	}

	@media (max-width: 480px) {
		.navbar-full-container {
			padding: 8px 0.5rem;
		}

		.brand-name {
			font-size: 1rem;
		}

		.brand-subtitle {
			font-size: 0.7rem;
		}

		.logo-icon {
			width: 36px;
			height: 36px;
		}

		.nav-link {
			padding: 6px 10px;
			font-size: 0.85rem;
		}

		.login-btn,
		.signup-btn {
			padding: 6px 12px;
			font-size: 0.85rem;
		}
	}

	/* Utility classes */
	.flex {
		display: flex;
	}

	.justify-between {
		justify-content: space-between;
	}

	.items-center {
		align-items: center;
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
		<nav class="main-navbar">
			<!-- Full width navbar container -->
			<div class="navbar-full-container">
				<!-- Left Section: Logo -->
				<div class="navbar-left-section">
					<div class="logo-section">
						<div class="logo-icon"></div>
						<div class="logo-text">
							<div class="brand-name">Lost And Found</div>
							<div class="brand-subtitle">Management System</div>
						</div>
					</div>
				</div>

				<!-- Center Section: Navigation Links -->
				<div class="navbar-center-section">
					<div class="nav-links">
						<a
							href="/"
							class="nav-link {currentPath === '/' ? 'active' : ''}"
						>
							Home
						</a>
						<a
							href="/lost"
							class="nav-link {currentPath === '/lost' ? 'active' : ''}"
						>
							Lost
						</a>
						<a
							href="/found"
							class="nav-link {currentPath === '/found' ? 'active' : ''}"
						>
							Found
						</a>
						<a
							href="/report"
							class="nav-link {currentPath === '/report' ? 'active' : ''}"
						>
							Report Lost
						</a>

						{#if user}
							<!-- User navigation links -->
							<a
								href="/account/dashboard"
								class="nav-link {currentPath.startsWith('/account') ? 'active' : ''}"
							>
								My Dashboard
							</a>
							{#if user.isAdmin}
								<a
									href="/admin/dashboard"
									class="nav-link admin-link {currentPath.startsWith('/admin') ? 'active' : ''}"
								>
									Admin Panel
								</a>
							{/if}
						{/if}
					</div>
				</div>

				<!-- Right Section: Authentication/User Actions -->
				<div class="navbar-right-section">
					{#if user}
						<!-- Show user info and logout when logged in -->
						<div class="user-section">
							<span class="user-greeting">
								Hello, {user.username}
							</span>
							<button
								onclick={handleLogout}
								class="logout-btn"
							>
								Logout
							</button>
						</div>
					{:else}
						<!-- Show login/signup when not logged in -->
						<div class="auth-section">
							<a
								href="/login"
								target="_blank"
								class="login-btn"
							>
								Login
							</a>
							<a
								href="/signup"
								target="_blank"
								class="signup-btn"
							>
								Sign Up
							</a>
						</div>
					{/if}
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
