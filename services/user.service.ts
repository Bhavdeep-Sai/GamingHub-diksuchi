/**
 * User Service
 * Handles all user-related database operations
 */

import prisma from '@/lib/prisma';
import { hash, compare } from 'bcrypt';
import { UserProfile, UserStats, BrainPowerMetrics } from '@/types';
import { RANK_THRESHOLDS } from '@/lib/constants';
import { generateUsername } from '@/lib/utils';

export class UserService {
  /**
   * Create a new user with email and password
   */
  static async create(data: {
    email: string;
    password: string;
    name: string;
    username?: string;
    emailVerified?: boolean;
  }): Promise<UserProfile> {
    // Hash password
    const hashedPassword = await hash(data.password, 12);
    
    // Generate username if not provided
    const username = data.username || generateUsername(data.email);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        username,
        emailVerified: data.emailVerified ? new Date() : null,
      },
    });
    
    return this.toProfile(user);
  }
  
  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
  
  /**
   * Find user by username
   */
  static async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }
  
  /**
   * Find user by ID
   */
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }
  
  /**
   * Verify password
   */
  static async verifyPassword(user: { password: string | null }, password: string): Promise<boolean> {
    if (!user.password) return false;
    return compare(password, user.password);
  }
  
  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      username?: string;
      bio?: string;
      image?: string;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }
  
  /**
   * Update user stats after game completion
   */
  static async updateStats(
    userId: string,
    stats: {
      scoreChange: number;
      gamesPlayed: number;
      won: boolean;
      brainPoints: {
        logic: number;
        memory: number;
        strategy: number;
        reaction: number;
      };
      xpGained: number;
    }
  ) {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    
    const newTotalGames = user.totalGamesPlayed + stats.gamesPlayed;
    const newTotalScore = user.totalScore + stats.scoreChange;
    const newXp = user.xp + stats.xpGained;
    
    // Calculate new win rate
    const totalWins = Math.round(user.winRate * user.totalGamesPlayed / 100);
    const newWins = totalWins + (stats.won ? 1 : 0);
    const newWinRate = (newWins / newTotalGames) * 100;
    
    // Update streak
    const newStreak = stats.won ? user.currentStreak + 1 : 0;
    const newLongestStreak = Math.max(user.longestStreak, newStreak);
    
    // Calculate new rank
    const newRank = this.calculateRank(newTotalScore);
    
    // Update brain power scores
    const newLogicScore = user.logicScore + stats.brainPoints.logic;
    const newMemoryScore = user.memoryScore + stats.brainPoints.memory;
    const newStrategyScore = user.strategyScore + stats.brainPoints.strategy;
    const newReactionScore = user.reactionScore + stats.brainPoints.reaction;
    
    console.log('[User Stats Update]', {
      userId,
      before: {
        totalGamesPlayed: user.totalGamesPlayed,
        totalScore: user.totalScore,
        winRate: user.winRate,
        currentStreak: user.currentStreak,
      },
      changes: {
        scoreChange: stats.scoreChange,
        gamesPlayed: stats.gamesPlayed,
        won: stats.won,
        xpGained: stats.xpGained,
      },
      after: {
        totalGamesPlayed: newTotalGames,
        totalScore: newTotalScore,
        winRate: newWinRate,
        currentStreak: newStreak,
      },
    });
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        totalGamesPlayed: newTotalGames,
        totalScore: newTotalScore,
        winRate: newWinRate,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        rank: newRank,
        xp: newXp,
        logicScore: newLogicScore,
        memoryScore: newMemoryScore,
        strategyScore: newStrategyScore,
        reactionScore: newReactionScore,
        lastActiveAt: new Date(),
      },
    });
  }
  
  /**
   * Get user stats with history
   */
  static async getStats(userId: string): Promise<UserStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        gameSessions: {
          where: { status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
        achievements: {
          orderBy: { unlockedAt: 'desc' },
          take: 10,
        },
        statsSnapshots: {
          where: { periodType: 'daily' },
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });
    
    if (!user) throw new Error('User not found');
    
    const brainPower = this.calculateBrainPower(user);
    
    return {
      overview: {
        totalGamesPlayed: user.totalGamesPlayed,
        totalScore: user.totalScore,
        winRate: user.winRate,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        rank: user.rank as any,
        level: user.level,
        xp: user.xp,
      },
      brainPower,
      recentGames: user.gameSessions as any[],
      achievements: user.achievements as any[],
      progress: user.statsSnapshots as any[],
    };
  }
  
  /**
   * Calculate brain power metrics
   */
  private static calculateBrainPower(user: {
    logicScore: number;
    memoryScore: number;
    strategyScore: number;
    reactionScore: number;
  }): BrainPowerMetrics {
    const total = user.logicScore + user.memoryScore + user.strategyScore + user.reactionScore;
    const overall = total > 0 ? Math.round(total / 40) : 0; // Normalize to 0-100
    
    return {
      logic: Math.min(100, user.logicScore),
      memory: Math.min(100, user.memoryScore),
      strategy: Math.min(100, user.strategyScore),
      reaction: Math.min(100, user.reactionScore),
      overall: Math.min(100, overall),
    };
  }
  
  /**
   * Calculate rank based on total score
   */
  private static calculateRank(score: number): string {
    if (score >= RANK_THRESHOLDS.Master) return 'Master';
    if (score >= RANK_THRESHOLDS.Expert) return 'Expert';
    if (score >= RANK_THRESHOLDS.Advanced) return 'Advanced';
    if (score >= RANK_THRESHOLDS.Intermediate) return 'Intermediate';
    return 'Beginner';
  }
  
  /**
   * Convert user to profile format
   */
  private static toProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.image,
      bio: user.bio,
      totalGamesPlayed: user.totalGamesPlayed,
      totalScore: user.totalScore,
      winRate: user.winRate,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      rank: user.rank,
      level: user.level,
      xp: user.xp,
      logicScore: user.logicScore,
      memoryScore: user.memoryScore,
      strategyScore: user.strategyScore,
      reactionScore: user.reactionScore,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    };
  }
  
  /**
   * Get top users for leaderboard
   */
  static async getTopUsers(limit = 100) {
    return prisma.user.findMany({
      orderBy: { totalScore: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        totalScore: true,
        totalGamesPlayed: true,
        winRate: true,
        level: true,
        rank: true,
      },
    });
  }
}
