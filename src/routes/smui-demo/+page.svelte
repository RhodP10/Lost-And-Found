<script>
  import SmuiDemo from '$lib/components/SmuiDemo.svelte';
</script>

<div class="demo-page">
  <h1>Material UI Components Demo</h1>
  <p class="intro">
    This page demonstrates the Svelte Material UI (SMUI) components that you can use in your lost and found application.
    These components follow Material Design guidelines and provide a consistent, modern look and feel.
  </p>
  
  <SmuiDemo />
</div>

<style>
  .demo-page {
    padding: 2rem 0;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .intro {
    max-width: 800px;
    margin: 0 auto 2rem;
    text-align: center;
    color: #666;
    line-height: 1.6;
  }
</style>
