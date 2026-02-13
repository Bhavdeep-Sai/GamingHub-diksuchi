/**
 * Scoring Service
 * Handles score calculation, validation, and recording
 */

import prisma from '@/lib/prisma';
import { GameType, GameDifficulty, ScoreCalculation } from '@/types';
import { SCORING, GAMES } from '@/lib/constants';

export class ScoringService {
  /**
   * Calculate score for a completed game
   */
  static calculateScore(params: {
    gameType: GameType;
    difficulty: GameDifficulty;
    timeSpent: number;
    accuracy?: number;
    moves?: number;
    won: boolean;
    currentStreak: number;
  }): ScoreCalculation {
    const game = GAMES[params.gameType];
    
    // Base score calculation
    let baseScore = 100;
    
    // Apply difficulty multiplier
    baseScore *= SCORING.DIFFICULTY_MULTIPLIERS[params.difficulty];
    
    // Winning bonus
    if (params.won) {
      baseScore *= 2;
    } else {
      baseScore *= 0.5; // Partial credit for attempting
    }
    
    // Speed bonus calculation
    const speedBonus = this.calculateSpeedBonus(
      params.timeSpent,
      game.avgDuration,
      params.won
    );
    
    // Accuracy bonus
    const accuracyBonus = this.calculateAccuracyBonus(params.accuracy);
    
    // Streak bonus
    const streakBonus = this.calculateStreakBonus(params.currentStreak);
    
    // Calculate brain power points
    const brainPoints = this.calculateBrainPoints(
      params.gameType,
      baseScore + speedBonus + accuracyBonus + streakBonus
    );
    
    return {
      baseScore: Math.round(baseScore),
      speedBonus,
      accuracyBonus,
      streakBonus,
      totalScore: Math.round(baseScore + speedBonus + accuracyBonus + streakBonus),
      brainPoints,
    };
  }
  
  /**
   * Calculate speed bonus
   */
  private static calculateSpeedBonus(
    timeSpent: number,
    avgDuration: number,
    won: boolean
  ): number {
    if (!won) return 0;
    
    const threshold = avgDuration * SCORING.SPEED_BONUS.THRESHOLD_PERCENTAGE;
    
    if (timeSpent <= threshold) {
      // Additional bonus for being even faster
      const speedRatio = timeSpent / threshold;
      return Math.round(SCORING.SPEED_BONUS.POINTS * (2 - speedRatio));
    }
    
    return 0;
  }
  
  /**
   * Calculate accuracy bonus
   */
  private static calculateAccuracyBonus(accuracy?: number): number {
    if (!accuracy) return 0;
    
    if (accuracy >= SCORING.ACCURACY_BONUS.THRESHOLD_PERCENTAGE) {
      // Perfect accuracy gets max bonus
      if (accuracy === 100) {
        return SCORING.ACCURACY_BONUS.POINTS * 2;
      }
      return SCORING.ACCURACY_BONUS.POINTS;
    }
    
    return 0;
  }
  
  /**
   * Calculate streak bonus
   */
  private static calculateStreakBonus(currentStreak: number): number {
    const bonus = currentStreak * SCORING.STREAK_BONUS.POINTS_PER_GAME;
    return Math.min(bonus, SCORING.STREAK_BONUS.MAX_BONUS);
  }
  
  /**
   * Calculate brain power points distribution
   */
  private static calculateBrainPoints(
    gameType: GameType,
    totalScore: number
  ): {
    logic: number;
    memory: number;
    strategy: number;
    reaction: number;
  } {
    const game = GAMES[gameType];
    const basePoints = Math.round(totalScore * 0.1); // 10% of score goes to brain power
    
    return {
      logic: game.trainsLogic ? basePoints : 0,
      memory: game.trainsMemory ? basePoints : 0,
      strategy: game.trainsStrategy ? basePoints : 0,
      reaction: game.trainsReaction ? basePoints : 0,
    };
  }
  
  /**
   * Record score in database
   */
  static async recordScore(
    userId: string,
    sessionId: string,
    scoreData: ScoreCalculation & {
      gameType: GameType;
      gameId: string;
      difficulty: GameDifficulty;
      timeSpent: number;
      accuracy?: number;
      moves?: number;
    }
  ) {
    // Check if this is a personal best
    const personalBest = await this.isPersonalBest(
      userId,
      scoreData.gameType,
      scoreData.totalScore
    );
    
    return prisma.score.create({
      data: {
        userId,
        gameId: scoreData.gameId,
        sessionId,
        gameType: scoreData.gameType,
        points: scoreData.totalScore,
        timeSpent: scoreData.timeSpent,
        accuracy: scoreData.accuracy,
        moves: scoreData.moves,
        difficulty: scoreData.difficulty,
        speedBonus: scoreData.speedBonus,
        accuracyBonus: scoreData.accuracyBonus,
        streakBonus: scoreData.streakBonus,
        logicPoints: scoreData.brainPoints.logic,
        memoryPoints: scoreData.brainPoints.memory,
        strategyPoints: scoreData.brainPoints.strategy,
        reactionPoints: scoreData.brainPoints.reaction,
        isPersonalBest: personalBest,
      },
    });
  }
  
  /**
   * Check if score is personal best
   */
  private static async isPersonalBest(
    userId: string,
    gameType: GameType,
    score: number
  ): Promise<boolean> {
    const bestScore = await prisma.score.findFirst({
      where: {
        userId,
        gameType,
      },
      orderBy: {
        points: 'desc',
      },
      select: {
        points: true,
      },
    });
    
    return !bestScore || score > bestScore.points;
  }
  
  /**
   * Get user's best scores per game
   */
  static async getUserBestScores(userId: string) {
    const scores = await prisma.score.groupBy({
      by: ['gameType'],
      where: { userId },
      _max: { points: true },
      _count: { id: true },
    });
    
    return scores.map(s => ({
      gameType: s.gameType,
      bestScore: s._max.points || 0,
      gamesPlayed: s._count.id,
    }));
  }
  
  /**
   * Anti-cheat: Validate score is feasible
   */
  static validateScore(params: {
    gameType: GameType;
    score: number;
    timeSpent: number;
    moves?: number;
  }): { valid: boolean; reason?: string } {
    const game = GAMES[params.gameType];
    
    // Check if time is suspiciously fast
    const minTime = game.avgDuration * 0.1; // 10% of average
    if (params.timeSpent < minTime) {
      return {
        valid: false,
        reason: 'Time too fast',
      };
    }
    
    // Check if score is impossibly high
    const maxPossibleScore = 1000 * SCORING.DIFFICULTY_MULTIPLIERS.EXPERT;
    if (params.score > maxPossibleScore) {
      return {
        valid: false,
        reason: 'Score too high',
      };
    }
    
    return { valid: true };
  }
}
