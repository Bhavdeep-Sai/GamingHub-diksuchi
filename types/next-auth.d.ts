/**
 * NextAuth TypeScript Module Augmentation
 * Extends NextAuth types with custom properties
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    username?: string | null;
    bio?: string | null;
    role?: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      username?: string | null;
      image?: string | null;
      bio?: string | null;
      role?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string | null;
    bio?: string | null;
    role?: string;
  }
}
