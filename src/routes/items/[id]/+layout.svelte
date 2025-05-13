<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';
  
  let { children } = $props();
  let user = $state(null);
  let isFromAccount = $state(false);
  
  onMount(() => {
    // Subscribe to auth store
    const unsubscribe = authStore.subscribe((value) => {
      user = value;
    });
    
    // Check if we came from the account section
    const referrer = document.referrer;
    isFromAccount = referrer.includes('/account/');
    
    console.log('Item details layout - Referrer:', referrer, 'isFromAccount:', isFromAccount);
    
    // If we came from account section and user is logged in, redirect to account view
    if (isFromAccount && user) {
      const currentPath = window.location.pathname;
      const itemId = currentPath.split('/').pop();
      
      if (itemId) {
        console.log('Redirecting to account item view:', itemId);
        window.location.href = `/account/items/${itemId}`;
      }
    }
    
    return unsubscribe;
  });
</script>

{@render children()}
