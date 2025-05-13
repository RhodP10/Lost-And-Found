// This file ensures that the account layout is applied to all pages under /account
// It doesn't need to do anything special, just export a load function

export function load() {
  console.log('Account layout load function called');
  return {
    layout: 'account'
  };
}
