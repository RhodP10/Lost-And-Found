/**
 * Navigation utilities for the application
 */

/**
 * Navigate to an account page while ensuring the account layout is preserved
 * This function should be used for all navigation within the account section
 * 
 * @param {string} path - The path to navigate to (should start with /account)
 * @param {boolean} useReplace - Whether to use replaceState instead of pushState
 */
export function navigateToAccountPage(path, useReplace = false) {
  // Ensure the path starts with /account
  if (!path.startsWith('/account')) {
    path = `/account${path.startsWith('/') ? path : `/${path}`}`;
  }
  
  console.log(`Navigating to account page: ${path}`);
  
  // Use window.location.href to ensure a full page load that preserves the account layout
  if (useReplace) {
    window.location.replace(path);
  } else {
    window.location.href = path;
  }
}

/**
 * Check if the current path is an account page
 * 
 * @returns {boolean} - True if the current path starts with /account
 */
export function isAccountPage() {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/account');
}
