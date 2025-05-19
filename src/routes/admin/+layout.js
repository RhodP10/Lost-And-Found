// This file ensures that the admin layout is properly loaded
export function load({ url }) {
  return {
    admin: true,
    pathname: url.pathname
  };
}
