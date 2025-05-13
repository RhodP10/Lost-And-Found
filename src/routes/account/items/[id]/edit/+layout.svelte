<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // This layout file ensures that the edit page uses the account layout
  let { children } = $props();

  onMount(() => {
    // Force the path to be recognized as an account page
    console.log('Account item edit layout mounted');

    // Check if we're in the correct layout
    const path = window.location.pathname;
    if (!path.startsWith('/account/')) {
      console.log('Redirecting to account path');
      const pathParts = path.split('/');
      const itemId = pathParts[pathParts.length - 2]; // Get the ID from the path
      goto(`/account/items/${itemId}/edit`, { replaceState: true });
    }
  });
</script>

{@render children()}
