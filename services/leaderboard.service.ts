/**
 * Leaderboard Service
 * Manages leaderboard generation, caching, and queries
 */

import prisma from '@/lib/prisma';
import { GameType, LeaderboardType, LeaderboardData, LeaderboardEntry } from '@/types';
import { LEADERBOARD } from '@/lib/constants';

export class LeaderboardService {
  /**
   * Get global leaderboard
   */
  static async getGlobalLeaderboard(userId?: string): Promise<LeaderboardData> {
    const topUsers = await prisma.user.findMany({
      orderBy: { totalScore: 'desc' },
      take: LEADERBOARD.TOP_ENTRIES_COUNT,
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        totalScore: true,
        totalGamesPlayed: true,
        winRate: true,
        level: true,
      },
    });
    
    const entries: LeaderboardEntry[] = topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      score: user.totalScore,
      gamesPlayed: user.totalGamesPlayed,
      winRate: user.winRate,
      level: user.level,
    }));
    
    // Find user's rank if provided
    let userRank: number | undefined;
    if (userId) {
      userRank = entries.findIndex(e => e.userId === userId) + 1;
      if (userRank === 0) {
        // User not in top 100, calculate their actual rank
        userRank = await this.getUserRank(userId);
      }
    }
    
    return {
      type: 'GLOBAL',
      entries,
      lastUpdated: new Date(),
      userRank,
    };
  }
  
  /**
   * Get game-specific leaderboard
   */
  static async getGameLeaderboard(
    gameType: GameType,
    userId?: string
  ): Promise<LeaderboardData> {
    // Aggregate best scores per user for this game
    const topScores = await prisma.score.groupBy({
      by: ['userId'],
      where: { gameType },
      _max: { points: true },
      _count: { id: true },
      orderBy: { _max: { points: 'desc' } },
      take: LEADERBOARD.TOP_ENTRIES_COUNT,
    });
    
    // Get user details
    const userIds = topScores.map(s => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        totalGamesPlayed: true,
        winRate: true,
        level: true,
      },
    });
    
    const userMap = new Map(users.map(u => [u.id, u]));
    
    const entries: LeaderboardEntry[] = topScores.map((score, index) => {
      const user = userMap.get(score.userId);
      return {
        rank: index + 1,
        userId: score.userId,
        username: user?.username || null,
        name: user?.name || null,
        image: user?.image || null,
        score: score._max.points || 0,
        gamesPlayed: score._count.id,
        winRate: user?.winRate || 0,
        level: user?.level || 1,
      };
    });
    
    // Find user's rank
    let userRank: number | undefined;
    if (userId) {
      userRank = entries.findIndex(e => e.userId === userId) + 1;
      if (userRank === 0) {
        userRank = await this.getUserGameRank(userId, gameType);
      }
    }
    
    return {
      type: 'ALL_TIME',
      gameType,
      entries,
      lastUpdated: new Date(),
      userRank,
    };
  }
  
  /**
   * Get weekly leaderboard
   */
  static async getWeeklyLeaderboard(
    gameType?: GameType,
    userId?: string
  ): Promise<LeaderboardData> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const where = {
      createdAt: { gte: weekAgo },
      ...(gameType && { gameType }),
    };
    
    // Aggregate weekly scores
    const weeklyScores = await prisma.score.groupBy({
      by: ['userId'],
      where,
      _sum: { points: true },
      _count: { id: true },
      orderBy: { _sum: { points: 'desc' } },
      take: LEADERBOARD.TOP_ENTRIES_COUNT,
    });
    
    // Get user details
    const userIds = weeklyScores.map(s => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        totalGamesPlayed: true,
        winRate: true,
        level: true,
      },
    });
    
    const userMap = new Map(users.map(u => [u.id, u]));
    
    const entries: LeaderboardEntry[] = weeklyScores.map((score, index) => {
      const user = userMap.get(score.userId);
      return {
        rank: index + 1,
        userId: score.userId,
        username: user?.username || null,
        name: user?.name || null,
        image: user?.image || null,
        score: score._sum.points || 0,
        gamesPlayed: score._count.id,
        winRate: user?.winRate || 0,
        level: user?.level || 1,
      };
    });
    
    // Find user's rank
    let userRank: number | undefined;
    if (userId) {
      userRank = entries.findIndex(e => e.userId === userId) + 1;
      if (userRank === 0) {
        userRank = await this.getUserWeeklyRank(userId, gameType);
      }
    }
    
    return {
      type: 'WEEKLY',
      gameType,
      entries,
      lastUpdated: new Date(),
      userRank,
    };
  }
  
  /**
   * Get user's global rank
   */
  private static async getUserRank(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalScore: true },
    });
    
    if (!user) return 0;
    
    const higherRanked = await prisma.user.count({
      where: {
        totalScore: { gt: user.totalScore },
      },
    });
    
    return higherRanked + 1;
  }
  
  /**
   * Get user's rank for specific game
   */
  private static async getUserGameRank(
    userId: string,
    gameType: GameType
  ): Promise<number> {
    const userBestScore = await prisma.score.findFirst({
      where: { userId, gameType },
      orderBy: { points: 'desc' },
      select: { points: true },
    });
    
    if (!userBestScore) return 0;
    
    // Get all scores for this game type, grouped by user
    const allScores = await prisma.score.groupBy({
      by: ['userId'],
      where: { gameType },
      _max: {
        points: true,
      },
    });
    
    // Count users with higher scores
    const higherScoreCount = allScores.filter(
      user => user._max.points && user._max.points > userBestScore.points
    ).length;
    
    return higherScoreCount + 1;
  }
  
  /**
   * Get user's weekly rank
   */
  private static async getUserWeeklyRank(
    userId: string,
    gameType?: GameType
  ): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const userWeeklyScore = await prisma.score.aggregate({
      where: {
        userId,
        createdAt: { gte: weekAgo },
        ...(gameType && { gameType }),
      },
      _sum: { points: true },
    });
    
    if (!userWeeklyScore._sum.points) return 0;
    
    // Get all user weekly scores
    const allUserWeeklyScores = await prisma.score.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: weekAgo },
        ...(gameType && { gameType }),
      },
      _sum: {
        points: true,
      },
    });
    
    // Count users with higher weekly scores
    const higherScoreCount = allUserWeeklyScores.filter(
      user => user._sum.points && user._sum.points > (userWeeklyScore._sum.points || 0)
    ).length;
    
    return higherScoreCount + 1;
  }
  
  /**
   * Cache leaderboard in database
   */
  static async cacheLeaderboard(
    type: LeaderboardType,
    entries: LeaderboardEntry[],
    gameType?: GameType,
    gameId?: string
  ) {
    return prisma.leaderboard.create({
      data: {
        type,
        gameType,
        gameId,
        entries: JSON.stringify(entries),
        lastUpdated: new Date(),
        isActive: true,
      },
    });
  }
  
  /**
   * Get cached leaderboard
   */
  static async getCachedLeaderboard(
    type: LeaderboardType,
    gameType?: GameType
  ) {
    const cached = await prisma.leaderboard.findFirst({
      where: {
        type,
        gameType,
        isActive: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });
    
    if (!cached) return null;
    
    // Check if cache is still valid
    const cacheAge = Date.now() - cached.lastUpdated.getTime();
    if (cacheAge > LEADERBOARD.CACHE_DURATION) {
      return null;
    }
    
    return {
      entries: JSON.parse(cached.entries) as LeaderboardEntry[],
      lastUpdated: cached.lastUpdated,
    };
  }
}
