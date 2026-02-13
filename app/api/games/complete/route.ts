/**
 * Game Completion API Route
 * Handles game completion and score recording
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { GameSessionService } from '@/services/session.service';
import { GameType, GameDifficulty } from '@/types';
import { ensureInitialized } from '@/lib/init';

const completeGameSchema = z.object({
  gameType: z.enum([
    'CHESS',
    'SUDOKU',
    'HANGMAN',
    'LUDO',
    'UNO',
    'TIC_TAC_TOE',
    'VISUAL_CARD_MATCH',
    'FOUR_IN_ROW',
    'CODING_GAME',
  ]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  won: z.boolean(),
  moves: z.number().int().positive(),
  timeSpent: z.number().int().positive(),
  accuracy: z.number().min(0).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await ensureInitialized();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = completeGameSchema.parse(body);
    
    console.log('[Game Complete] Request data:', {
      gameType: validatedData.gameType,
      won: validatedData.won,
      moves: validatedData.moves,
      timeSpent: validatedData.timeSpent,
      accuracy: validatedData.accuracy,
      userId: session.user.id,
    });
    
    // Get or create game in database
    let game = await prisma.game.findUnique({
      where: { type: validatedData.gameType },
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Calculate actual game start time (subtract timeSpent from now)
    const gameStartTime = new Date(Date.now() - (validatedData.timeSpent * 1000));
    
    // Create game session with actual start time
    const gameSession = await GameSessionService.startSession({
      userId: session.user.id,
      gameId: game.id,
      gameType: validatedData.gameType,
      difficulty: validatedData.difficulty,
      startedAt: gameStartTime,
    });
    
    // Complete the session
    const completedSession = await GameSessionService.completeSession({
      sessionId: gameSession.id,
      userId: session.user.id,
      gameId: game.id,
      gameType: validatedData.gameType,
      difficulty: validatedData.difficulty,
      won: validatedData.won,
      moves: validatedData.moves,
      timeSpent: validatedData.timeSpent,
      accuracy: validatedData.accuracy,
    });
    
    console.log('[Game Complete] Session completed:', {
      sessionId: completedSession.id,
      score: completedSession.score,
      won: completedSession.won,
      timeSpent: completedSession.timeSpent,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        sessionId: completedSession.id,
        score: completedSession.score,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    console.error('Game completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save game result' },
      { status: 500 }
    );
  }
}
