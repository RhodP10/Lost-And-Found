import { json } from '@sveltejs/kit';

export async function POST() {
  // In a more complex app with server-side sessions, we would invalidate the session here
  // For our simple client-side auth, we just return a success response
  return json({ success: true, message: 'Logged out successfully' });
}
