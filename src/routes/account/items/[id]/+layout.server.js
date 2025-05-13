// This server-side load function ensures that the item details page is properly handled
// It doesn't need to do anything special, just pass through the data
export function load({ params, parent }) {
  // Log the path for debugging
  console.log('Loading account item details layout for ID:', params.id);
  
  // Return the params so they're available to the layout
  return {
    id: params.id
  };
}
