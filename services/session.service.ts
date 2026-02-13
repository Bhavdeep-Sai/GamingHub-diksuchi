/**
 * Game Session Service
 * Manages game session lifecycle and state
 */

import prisma from '@/lib/prisma';
import { GameType, GameDifficulty, SessionStatus, GameState } from '@/types';
import { ScoringService } from './scoring.service';
import { UserService } from './user.service';
import { SCORING } from '@/lib/constants';

export class GameSessionService {
  /**
   * Start a new game session
   */
  static async startSession(params: {
    userId: string;
    gameId: string;
    gameType: GameType;
    difficulty?: GameDifficulty;
    initialState?: GameState;
    startedAt?: Date;
  }) {
    return prisma.gameSession.create({
      data: {
        userId: params.userId,
        gameId: params.gameId,
        gameType: params.gameType,
        difficulty: params.difficulty,
        status: 'IN_PROGRESS',
        gameState: params.initialState ? JSON.stringify(params.initialState) : null,
        startedAt: params.startedAt || new Date(),
      },
    });
  }
  
  /**
   * Update game session state
   */
  static async updateSession(
    sessionId: string,
    state: GameState,
    moves?: number
  ) {
    return prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        gameState: JSON.stringify(state),
        moves: moves !== undefined ? moves : undefined,
      },
    });
  }
  
  /**
   * Complete a game session
   */
  static async completeSession(params: {
    sessionId: string;
    userId: string;
    gameId: string;
    gameType: GameType;
    difficulty: GameDifficulty;
    won: boolean;
    accuracy?: number;
    moves: number;
    timeSpent?: number;
    finalState?: GameState;
  }) {
    // Get session
    const session = await prisma.gameSession.findUnique({
      where: { id: params.sessionId },
      include: {
        user: true,
      },
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    if (session.status === 'COMPLETED') {
      throw new Error('Session already completed');
    }
    
    // Use provided timeSpent or calculate from session startedAt
    const timeSpent = params.timeSpent ?? Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000
    );
    
    // Calculate score
    const scoreCalc = ScoringService.calculateScore({
      gameType: params.gameType,
      difficulty: params.difficulty,
      timeSpent,
      accuracy: params.accuracy,
      moves: params.moves,
      won: params.won,
      currentStreak: session.user.currentStreak,
    });
    
    // Validate score
    const validation = ScoringService.validateScore({
      gameType: params.gameType,
      score: scoreCalc.totalScore,
      timeSpent,
      moves: params.moves,
    });
    
    if (!validation.valid) {
      // Mark session as invalid
      await prisma.gameSession.update({
        where: { id: params.sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          checksumValid: false,
        },
      });
      
      throw new Error(`Invalid score: ${validation.reason}`);
    }
    
    // Update session
    const updatedSession = await prisma.gameSession.update({
      where: { id: params.sessionId },
      data: {
        status: 'COMPLETED',
        score: scoreCalc.totalScore,
        timeSpent,
        accuracy: params.accuracy,
        moves: params.moves,
        won: params.won,
        completedAt: new Date(),
        gameState: params.finalState ? JSON.stringify(params.finalState) : session.gameState,
      },
    });
    
    // Record score
    await ScoringService.recordScore(params.userId, params.sessionId, {
      ...scoreCalc,
      gameType: params.gameType,
      gameId: params.gameId,
      difficulty: params.difficulty,
      timeSpent,
      accuracy: params.accuracy,
      moves: params.moves,
    });
    
    // Calculate XP
    let xpGained = SCORING.XP_PER_GAME;
    if (params.won) {
      xpGained += SCORING.XP_WIN_BONUS;
    }
    if (params.accuracy === 100) {
      xpGained += SCORING.XP_PERFECT_BONUS;
    }
    
    // Update user stats
    await UserService.updateStats(params.userId, {
      scoreChange: scoreCalc.totalScore,
      gamesPlayed: 1,
      won: params.won,
      brainPoints: scoreCalc.brainPoints,
      xpGained,
    });
    
    return updatedSession;
  }
  
  /**
   * Abandon a game session
   */
  static async abandonSession(sessionId: string) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    if (session.status !== 'IN_PROGRESS') {
      throw new Error('Can only abandon in-progress sessions');
    }
    
    return prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: 'ABANDONED',
        abandoned: true,
        completedAt: new Date(),
      },
    });
  }
  
  /**
   * Get active session for user
   */
  static async getActiveSession(userId: string, gameType?: GameType) {
    return prisma.gameSession.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
        ...(gameType && { gameType }),
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }
  
  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: string) {
    return prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        game: true,
      },
    });
  }
  
  /**
   * Get user's recent sessions
   */
  static async getRecentSessions(userId: string, limit = 10) {
    return prisma.gameSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
      include: {
        game: true,
      },
    });
  }
  
  /**
   * Get session statistics
   */
  static async getSessionStats(userId: string, gameType?: GameType) {
    const where = {
      userId,
      status: 'COMPLETED' as SessionStatus,
      ...(gameType && { gameType }),
    };
    
    const [totalGames, totalWins, avgScore, avgTime] = await Promise.all([
      prisma.gameSession.count({ where }),
      prisma.gameSession.count({ where: { ...where, won: true } }),
      prisma.gameSession.aggregate({
        where,
        _avg: { score: true },
      }),
      prisma.gameSession.aggregate({
        where,
        _avg: { timeSpent: true },
      }),
    ]);
    
    return {
      totalGames,
      totalWins,
      winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
      avgScore: avgScore._avg.score || 0,
      avgTime: avgTime._avg.timeSpent || 0,
    };
  }
}
