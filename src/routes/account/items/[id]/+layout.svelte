<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // This layout file ensures that the item details page uses the account layout
  let { children } = $props();

  onMount(() => {
    // Force the path to be recognized as an account page
    console.log('Account item details layout mounted');

    // Check if we're in the correct layout
    const path = window.location.pathname;
    if (!path.startsWith('/account/')) {
      console.log('Redirecting to account path');
      const itemId = path.split('/').pop();
      goto(`/account/items/${itemId}`, { replaceState: true });
    }
  });
</script>

{@render children()}
