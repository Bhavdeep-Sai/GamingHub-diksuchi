/**
 * GET /api/leaderboard
 * Get leaderboard rankings
 * Query params: type (global, weekly, or game type), limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LeaderboardService } from '@/services/leaderboard.service';
import { GameType } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'global';
    
    const session = await getServerSession(authOptions);
    let userId: string | undefined;
    
    if (session?.user?.email) {
      const { prisma } = await import('@/lib/prisma');
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = user?.id;
    }
    
    let leaderboard;
    
    if (type === 'global') {
      leaderboard = await LeaderboardService.getGlobalLeaderboard(userId);
    } else if (type === 'weekly') {
      leaderboard = await LeaderboardService.getWeeklyLeaderboard(undefined, userId);
    } else {
      // Game-specific leaderboard
      leaderboard = await LeaderboardService.getGameLeaderboard(
        type as GameType,
        userId
      );
    }
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
