/**
 * Sign In Page - OAuth Only
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Gamepad2 } from 'lucide-react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const handleOAuthSignIn = async (provider: 'google' | 'diksuchi') => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl: '/games' });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-semibold">GamingHub</span>
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a method to sign in to your account
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('google')}
              isLoading={isLoading === 'google'}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
            
            {/* Diksuchi Sign In */}
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={() => handleOAuthSignIn('diksuchi')}
              isLoading={isLoading === 'diksuchi'}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Sign in with Diksuchi
            </Button>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
