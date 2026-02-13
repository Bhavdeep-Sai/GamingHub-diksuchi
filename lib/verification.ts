/**
 * Email Verification Check Middleware
 * Add this to protected pages that require verified email
 */

import { prisma } from '@/lib/prisma';

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });
  
  return !!user?.emailVerified;
}

/**
 * Get user verification status with details
 */
export async function getUserVerificationStatus(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      emailVerified: true,
      email: true,
      name: true,
    },
  });
  
  if (!user) {
    return {
      exists: false,
      verified: false,
    };
  }
  
  return {
    exists: true,
    verified: !!user.emailVerified,
    email: user.email,
    name: user.name,
  };
}
