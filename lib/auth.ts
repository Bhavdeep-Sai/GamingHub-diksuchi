/**
 * NextAuth Configuration
 * Authentication setup for GamingHub
 */

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};
