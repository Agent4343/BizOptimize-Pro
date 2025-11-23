// Authentication utilities for NextAuth v5
// Note: For server-side auth, use getToken from 'next-auth/jwt' in API routes

export async function getCurrentUser(token: any) {
  if (!token) return null;
  return {
    id: token.sub || token.id,
    email: token.email,
    name: token.name,
  };
}

export async function requireAuth(token: any) {
  if (!token) {
    throw new Error('Unauthorized');
  }
  return {
    id: token.sub || token.id,
    email: token.email,
    name: token.name,
  };
}
