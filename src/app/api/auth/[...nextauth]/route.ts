import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import Credentials from 'next-auth/providers/credentials';
import { supabase } from '@/lib/supabase';
import type { NextRequest } from 'next/server';

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  adapter: (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) 
    ? SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }) as any
    : undefined,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check for developer credentials first (bypass Supabase)
        const DEVELOPER_EMAIL = 'mathesonashley@hotmail.com';
        const DEVELOPER_PASSWORD = 'Blake2011@';
        
        if (credentials.email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase() && 
            credentials.password === DEVELOPER_PASSWORD) {
          return {
            id: 'dev-user-id',
            email: DEVELOPER_EMAIL,
            name: 'Developer',
          };
        }

        // For all other users, sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

// NextAuth v5 beta - get handlers from NextAuth
const authResult = NextAuth(authOptions);
const handlers = (authResult as any)?.handlers || authResult;

export async function GET(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  try {
    const params = await context.params;
    const path = params.nextauth?.[0] || '';
    
    // Handle session endpoint specifically - return empty session if handler fails
    if (path === 'session') {
      try {
        // Try handlers.GET first, then fallback to calling handler directly
        if (handlers?.GET && typeof handlers.GET === 'function') {
          return await handlers.GET(request, { params });
        }
        // Fallback: try calling handler as function
        if (typeof handlers === 'function') {
          return await handlers(request, { params });
        }
      } catch (err: any) {
        console.error('NextAuth session error:', err);
        // Return empty session instead of error
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
      // If no handler, return empty session
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    
    // For all other endpoints
    if (handlers?.GET && typeof handlers.GET === 'function') {
      return await handlers.GET(request, { params });
    }
    // Fallback: try calling handler as function
    if (typeof handlers === 'function') {
      return await handlers(request, { params });
    }
    
    throw new Error('NextAuth GET handler not found');
  } catch (error: any) {
    console.error('NextAuth GET error:', error);
    // For session endpoint, return empty session instead of error
    try {
      const errorParams = await context.params;
      if (errorParams.nextauth?.[0] === 'session') {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
    } catch {
      // If we can't get params, assume it's not session and return error
    }
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
          },
    });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  try {
    const params = await context.params;
    
    // Try handlers.POST first, then fallback to calling handler directly
    if (handlers?.POST && typeof handlers.POST === 'function') {
      return await handlers.POST(request, { params });
    }
    // Fallback: try calling handler as function
    if (typeof handlers === 'function') {
      return await handlers(request, { params });
    }
    
    throw new Error('NextAuth POST handler not found');
  } catch (error: any) {
    console.error('NextAuth POST error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
          },
    });
  }
}
