/**
 * GET /api/users/[username]
 * Get public profile information for a user by their username
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Try to find user by username first, then by name
    let user = await prisma.user.findUnique({
      where: { username },
      select: {
        name: true,
        username: true,
        image: true,
        bio: true,
        createdAt: true,
        level: true,
        rank: true,
        totalGamesPlayed: true,
        winRate: true,
        longestStreak: true,
        totalScore: true,
        logicScore: true,
        memoryScore: true,
        strategyScore: true,
        reactionScore: true,
      },
    });

    // If not found by username, try by name
    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: username },
        select: {
          name: true,
          username: true,
          image: true,
          bio: true,
          createdAt: true,
          level: true,
          rank: true,
          totalGamesPlayed: true,
          winRate: true,
          longestStreak: true,
          totalScore: true,
          logicScore: true,
          memoryScore: true,
          strategyScore: true,
          reactionScore: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    const { username } = await params;
    console.error(`Error fetching public profile for ${username}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch public profile' },
      { status: 500 }
    );
  }
}