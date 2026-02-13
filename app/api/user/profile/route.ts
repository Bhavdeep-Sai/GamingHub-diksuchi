/**
 * GET /api/user/profile  
 * Get user profile with Google profile picture if available
 * 
 * PATCH /api/user/profile
 * Update user profile information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user with Google account info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          where: { provider: 'google' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine Google profile picture
    let googleProfilePic = null;
    
    // If user has a Google account linked
    if (user.accounts.length > 0) {
      // Always try to get the Google profile pic - check if current image is a URL
      if (user.image && user.image.startsWith('http')) {
        googleProfilePic = user.image;
      }
    }
    
    // ALSO check if user ever had a Google URL even if they changed their avatar
    // For now, if they have Google account but no URL in image, we can't retrieve it
    // unless we store it separately on first login

    console.log('Profile API returning:', {
      userId: session.user.id,
      hasGoogleAccount: user.accounts.length > 0,
      currentImage: user.image,
      googleProfilePic,
    });

    return NextResponse.json({
      name: user.name,
      username: user.username,
      bio: user.bio,
      image: user.image,
      googleProfilePic,
      hasGoogleAccount: user.accounts.length > 0,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, bio, image } = body;

    // Validate username if provided
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          { error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' },
          { status: 400 }
        );
      }

      // Check if username is already taken
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
      },
      select: {
        name: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
