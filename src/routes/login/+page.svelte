<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	let username = '';
	let password = '';
	let isLoading = false;
	let error = '';
	let showPassword = false;

	// Form validation
	let errors: Record<string, string> = {};

	function validateForm() {
		errors = {};

		if (!username.trim()) errors.username = 'Username is required';
		if (!password) errors.password = 'Password is required';

		return Object.keys(errors).length === 0;
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		try {
			isLoading = true;

			// Call the login API endpoint
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username,
					password
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Login failed');
			}

			// Store user info in the auth store
			authStore.login(data.user);

			// Redirect to dashboard
			goto('/dashboard', { replaceState: true });

		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div style="display: flex; min-height: 100vh; width: 100%; position: absolute; top: 0; left: 0;">
	<!-- Left panel -->
	<div style="flex: 1; background-color: #443627; display: flex; justify-content: center; align-items: center;">
		<a
			href="/signup"
			target="_blank"
			style="background-color: #D98324; color: white; padding: 12px 24px; border-radius: 4px; font-weight: 500; text-decoration: none; font-size: 1rem;"
		>
			Sign Up
		</a>
	</div>

	<!-- Right panel -->
	<div style="flex: 1; background-color: #F2F6D0; display: flex; flex-direction: column; justify-content: center; padding: 0 40px;">
		<div style="max-width: 320px; margin: 0 auto; width: 100%;">
			<h1 style="color: #443627; font-size: 1.75rem; margin-bottom: 1.5rem; font-weight: 600;">Login</h1>

			{#if error}
				<div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
					<p>{error}</p>
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div style="margin-bottom: 1rem;">
					<label for="username" style="display: block; margin-bottom: 0.5rem; color: #443627; font-size: 0.875rem;">
						Username:
					</label>
					<div style="position: relative;">
						<input
							type="text"
							id="username"
							bind:value={username}
							style="width: 100%; padding: 0.75rem; border: 1px solid #EFDCAB; border-radius: 4px; background-color: white; padding-right: 2.5rem; {errors.username ? 'border-color: #ef4444;' : ''}"
						/>
						<div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #888;">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						</div>
					</div>
					{#if errors.username}
						<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.username}</p>
					{/if}
				</div>

				<div style="margin-bottom: 1.5rem;">
					<label for="password" style="display: block; margin-bottom: 0.5rem; color: #443627; font-size: 0.875rem;">
						Password:
					</label>
					<div style="position: relative;">
						<input
							type={showPassword ? "text" : "password"}
							id="password"
							bind:value={password}
							style="width: 100%; padding: 0.75rem; border: 1px solid #EFDCAB; border-radius: 4px; background-color: white; padding-right: 2.5rem; {errors.password ? 'border-color: #ef4444;' : ''}"
						/>
						<div
							style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"
							onclick={togglePasswordVisibility}
							onkeydown={(e) => e.key === 'Enter' && togglePasswordVisibility()}
							role="button"
							tabindex="0"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{#if showPassword}
								<!-- Eye with slash (hide password) -->
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #888;">
									<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
									<line x1="1" y1="1" x2="23" y2="23"></line>
								</svg>
							{:else}
								<!-- Eye (show password) -->
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #888;">
									<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
									<circle cx="12" cy="12" r="3"></circle>
								</svg>
							{/if}
						</div>
					</div>
					{#if errors.password}
						<p style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">{errors.password}</p>
					{/if}
				</div>

				<button
					type="submit"
					style="background-color: #D98324; color: white; padding: 0.75rem 1rem; border-radius: 4px; font-weight: 500; width: 100%; border: none; cursor: pointer; font-size: 1rem; {isLoading ? 'opacity: 0.7;' : ''}"
					disabled={isLoading}
				>
					{isLoading ? 'Logging in...' : 'Login'}
				</button>
			</form>
		</div>
	</div>
</div>
