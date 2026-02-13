/**
 * Initialization API endpoint
 * Ensures all required data exists
 */

import { NextResponse } from 'next/server';
import { ensureInitialized } from '@/lib/init';

export async function GET() {
  try {
    await ensureInitialized();
    return NextResponse.json({ success: true, message: 'Initialization complete' });
  } catch (error) {
    console.error('Initialization failed:', error);
    return NextResponse.json(
      { success: false, error: 'Initialization failed' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET(); // Same logic for both GET and POST
}