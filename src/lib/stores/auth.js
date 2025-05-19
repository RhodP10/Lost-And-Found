import { writable } from 'svelte/store';

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
        localStorage.setItem('user', JSON.stringify(user));
      }
      set(user);
    },
    logout: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
      }
      set(null);
    },
    // Check if user is logged in
    isLoggedIn: () => {
      return !!initialUser;
    },
    // Update admin status
    setAdminStatus: (isAdmin, adminDetails = null) => {
      update(user => {
        if (user) {
          const updatedUser = {
            ...user,
            isAdmin,
            adminDetails: isAdmin ? adminDetails : null
          };

          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }

          return updatedUser;
        }
        return user;
      });
    }
  };
};

export const authStore = createAuthStore();
