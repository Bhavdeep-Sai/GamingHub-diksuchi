/**
 * Environment variables validation and export
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // OAuth Providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Feature flags
  ENABLE_REGISTRATION: z.string().default('true'),
  ENABLE_LEADERBOARDS: z.string().default('true'),
});

// Validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(env.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const ENV = {
  ...env.data,
  // Parse boolean flags
  ENABLE_REGISTRATION: env.data.ENABLE_REGISTRATION === 'true',
  ENABLE_LEADERBOARDS: env.data.ENABLE_LEADERBOARDS === 'true',
  IS_PRODUCTION: env.data.NODE_ENV === 'production',
  IS_DEVELOPMENT: env.data.NODE_ENV === 'development',
} as const;
