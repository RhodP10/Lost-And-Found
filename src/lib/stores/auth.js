import { writable } from 'svelte/store';

// Function to set a cookie
function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return; // Skip if not in browser

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

// Function to delete a cookie
function deleteCookie(name) {
  if (typeof document === 'undefined') return; // Skip if not in browser

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
}

// Create a writable store for the user
const createAuthStore = () => {
  // Initialize from localStorage if available (client-side only)
  const initialUser = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null;

  const { subscribe, set, update } = writable(initialUser);

  return {
    subscribe,
    login: (user) => {
      if (typeof localStorage !== 'undefined') {
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(user));

        // Also store in cookies for server-side access
        setCookie('user', JSON.stringify(user));
      }
      set(user);
    },
    logout: () => {
      if (typeof localStorage !== 'undefined') {
        // Remove from localStorage
        localStorage.removeItem('user');

        // Also remove from cookies
        deleteCookie('user');
      }
      set(null);
    },
    // Check if user is logged in
    isLoggedIn: () => {
      return !!initialUser;
    }
  };
};

export const authStore = createAuthStore();
