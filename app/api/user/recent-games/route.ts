/**
 * GET /api/user/recent-games
 * Get authenticated user's recent game sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get recent game sessions with scores
    const recentGames = await prisma.gameSession.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
      include: {
        score_entry: true,
        game: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10,
    });

    const formattedGames = recentGames.map((session) => ({
      id: session.id,
      gameName: session.game.name,
      gameType: session.gameType,
      score: session.score_entry?.points || session.score || 0,
      result: session.won === true ? 'WON' : session.won === false ? 'LOST' : 'DRAW',
      completedAt: session.completedAt,
      duration: session.timeSpent,
    }));

    return NextResponse.json(formattedGames);
  } catch (error) {
    console.error('Error fetching recent games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent games' },
      { status: 500 }
    );
  }
}
