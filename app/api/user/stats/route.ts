/**
 * GET /api/user/stats
 * Get authenticated user's statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserService } from '@/services/user.service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user first
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return flattened user stats for the frontend
    const stats = {
      totalScore: user.totalScore,
      gamesPlayed: user.totalGamesPlayed,
      gamesWon: Math.round((user.winRate * user.totalGamesPlayed) / 100),
      winRate: user.winRate,
      currentStreak: user.currentStreak,
      bestStreak: user.longestStreak,
      level: user.level,
      rank: user.rank,
      logicScore: user.logicScore,
      memoryScore: user.memoryScore,
      strategyScore: user.strategyScore,
      reactionScore: user.reactionScore,
      bio: user.bio,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
