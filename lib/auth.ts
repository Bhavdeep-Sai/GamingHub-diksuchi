/**
 * NextAuth Configuration
 * Authentication setup for GamingHub
 */

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/prisma';
import type { Adapter } from 'next-auth/adapters';

/**
 * Generate a unique username from email or name
 */
async function generateUniqueUsername(email?: string | null, name?: string | null): Promise<string> {
  // Start with email prefix or name
  let baseUsername = '';
  
  if (email) {
    baseUsername = email.split('@')[0];
  } else if (name) {
    baseUsername = name.toLowerCase().replace(/\s+/g, '');
  } else {
    baseUsername = 'user';
  }
  
  // Clean the username: remove special characters, keep only alphanumeric and underscores
  baseUsername = baseUsername.replace(/[^a-z0-9_]/gi, '').substring(0, 20);
  
  // Ensure it's not empty
  if (!baseUsername) {
    baseUsername = 'user';
  }
  
  // Try the base username first
  let username = baseUsername;
  let counter = 1;
  
  // Keep trying until we find a unique username
  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username },
    });
    
    if (!existing) {
      return username;
    }
    
    // Add a number suffix and try again
    username = `${baseUsername}${counter}`;
    counter++;
  }
}

/**
 * Custom adapter that extends PrismaAdapter to handle username generation
 */
function customPrismaAdapter(p: typeof prisma): Adapter {
  const baseAdapter = PrismaAdapter(p);
  
  return {
    ...baseAdapter,
    createUser: async (data: { email: string; emailVerified: Date | null; name?: string | null; image?: string | null }) => {
      // Generate a unique username
      const username = await generateUniqueUsername(data.email, data.name);
      
      // Create the user with the generated username
      const user = await p.user.create({
        data: {
          ...data,
          username,
        },
      });
      
      return user;
    },
  } as Adapter;
}

export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter(prisma),
  providers: [
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    
    // Diksuchi OAuth
    ...(process.env.DIKSUCHI_CLIENT_ID && process.env.DIKSUCHI_CLIENT_SECRET
      ? [
          {
            id: 'diksuchi',
            name: 'Diksuchi',
            type: 'oauth' as const,
            clientId: process.env.DIKSUCHI_CLIENT_ID,
            clientSecret: process.env.DIKSUCHI_CLIENT_SECRET,
            authorization: {
              url: `${process.env.DIKSUCHI_AUTH_URL || 'https://auth.diksuchi.com'}/oauth/authorize`,
              params: {
                scope: 'openid profile email',
                response_type: 'code',
              },
            },
            token: `${process.env.DIKSUCHI_AUTH_URL || 'https://auth.diksuchi.com'}/oauth/token`,
            userinfo: `${process.env.DIKSUCHI_AUTH_URL || 'https://auth.diksuchi.com'}/oauth/userinfo`,
            profile(profile: {
              sub: string;
              email: string;
              name: string;
              picture?: string;
              email_verified?: boolean;
            }) {
              return {
                id: profile.sub,
                email: profile.email,
                name: profile.name,
                image: profile.picture,
                emailVerified: profile.email_verified ? new Date() : null,
              };
            },
          },
        ]
      : []),
  ],
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
      }
      
      // Always fetch fresh user data from database for session refresh
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, username: true, image: true, email: true, bio: true, role: true },
          });
          if (dbUser) {
            token.name = dbUser.name;
            token.username = dbUser.username;
            token.picture = dbUser.image;
            token.email = dbUser.email;
            token.bio = dbUser.bio;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Failed to fetch user from database:', error);
        }
      }
      
      // Handle explicit session updates
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.username = session.username;
        token.image = session.image;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
        session.user.bio = token.bio as string | null;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};
