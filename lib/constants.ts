/**
 * Application constants
 */

import { GameType } from '@/types';

// ============================================
// APPLICATION
// ============================================

export const APP_NAME = 'GamingHub';
export const APP_DESCRIPTION = 'Train your brain through competitive gaming';
export const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// ============================================
// GAME METADATA
// ============================================

export const GAMES: Record<GameType, {
  name: string;
  description: string;
  icon: string;
  trainsLogic: boolean;
  trainsMemory: boolean;
  trainsStrategy: boolean;
  trainsReaction: boolean;
  minPlayers: number;
  maxPlayers: number;
  avgDuration: number;
}> = {
  CHESS: {
    name: 'Chess',
    description: 'Master the timeless game of strategy and tactics',
    icon: 'chess',
    trainsLogic: true,
    trainsMemory: false,
    trainsStrategy: true,
    trainsReaction: false,
    minPlayers: 2,
    maxPlayers: 2,
    avgDuration: 1800, // 30 minutes
  },
  SUDOKU: {
    name: 'Sudoku',
    description: 'Solve number puzzles and sharpen your logic',
    icon: 'grid',
    trainsLogic: true,
    trainsMemory: false,
    trainsStrategy: false,
    trainsReaction: false,
    minPlayers: 1,
    maxPlayers: 1,
    avgDuration: 600, // 10 minutes
  },
  HANGMAN: {
    name: 'Hangman',
    description: 'Guess the word before time runs out',
    icon: 'message-square',
    trainsLogic: true,
    trainsMemory: true,
    trainsStrategy: false,
    trainsReaction: false,
    minPlayers: 1,
    maxPlayers: 1,
    avgDuration: 180, // 3 minutes
  },
  LUDO: {
    name: 'Ludo',
    description: 'Classic board game of chance and strategy',
    icon: 'dice-6',
    trainsLogic: false,
    trainsMemory: false,
    trainsStrategy: true,
    trainsReaction: false,
    minPlayers: 2,
    maxPlayers: 4,
    avgDuration: 900, // 15 minutes
  },
  UNO: {
    name: 'Uno',
    description: 'Fast-paced card game for all ages',
    icon: 'layers',
    trainsLogic: false,
    trainsMemory: true,
    trainsStrategy: true,
    trainsReaction: true,
    minPlayers: 2,
    maxPlayers: 4,
    avgDuration: 600, // 10 minutes
  },
  TIC_TAC_TOE: {
    name: 'Tic Tac Toe',
    description: 'Simple strategy game on a 3x3 grid',
    icon: 'grid-3x3',
    trainsLogic: true,
    trainsMemory: false,
    trainsStrategy: true,
    trainsReaction: false,
    minPlayers: 2,
    maxPlayers: 2,
    avgDuration: 60, // 1 minute
  },
  VISUAL_CARD_MATCH: {
    name: 'Card Match',
    description: 'Test your memory by matching pairs',
    icon: 'layout-grid',
    trainsLogic: false,
    trainsMemory: true,
    trainsStrategy: false,
    trainsReaction: true,
    minPlayers: 1,
    maxPlayers: 1,
    avgDuration: 300, // 5 minutes
  },
  FOUR_IN_ROW: {
    name: '4 in a Row',
    description: 'Connect four pieces in a row to win',
    icon: 'circle',
    trainsLogic: true,
    trainsMemory: false,
    trainsStrategy: true,
    trainsReaction: false,
    minPlayers: 2,
    maxPlayers: 2,
    avgDuration: 300, // 5 minutes
  },
  CODING_GAME: {
    name: 'Code Challenge',
    description: 'Solve coding problems and improve your skills',
    icon: 'code',
    trainsLogic: true,
    trainsMemory: true,
    trainsStrategy: false,
    trainsReaction: false,
    minPlayers: 1,
    maxPlayers: 1,
    avgDuration: 1200, // 20 minutes
  },
};

// ============================================
// SCORING CONSTANTS
// ============================================

export const SCORING = {
  // Base points multipliers
  DIFFICULTY_MULTIPLIERS: {
    EASY: 1.0,
    MEDIUM: 1.5,
    HARD: 2.0,
    EXPERT: 3.0,
  },
  
  // Bonus thresholds
  SPEED_BONUS: {
    THRESHOLD_PERCENTAGE: 0.5, // Complete in 50% of avg time
    POINTS: 100,
  },
  
  ACCURACY_BONUS: {
    THRESHOLD_PERCENTAGE: 95,
    POINTS: 50,
  },
  
  STREAK_BONUS: {
    POINTS_PER_GAME: 10,
    MAX_BONUS: 500,
  },
  
  // Brain power points
  BRAIN_POWER_BASE: 10,
  
  // XP rewards
  XP_PER_GAME: 50,
  XP_WIN_BONUS: 50,
  XP_PERFECT_BONUS: 100,
} as const;

// ============================================
// RANK THRESHOLDS
// ============================================

export const RANK_THRESHOLDS = {
  Beginner: 0,
  Intermediate: 1000,
  Advanced: 5000,
  Expert: 15000,
  Master: 50000,
} as const;

// ============================================
// LEADERBOARD SETTINGS
// ============================================

export const LEADERBOARD = {
  TOP_ENTRIES_COUNT: 100,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in ms
  ENTRIES_PER_PAGE: 25,
} as const;

// ============================================
// ACHIEVEMENTS
// ============================================

export const ACHIEVEMENTS = {
  FIRST_GAME: {
    title: 'First Steps',
    description: 'Complete your first game',
    xpReward: 50,
  },
  GAMES_10: {
    title: 'Getting Started',
    description: 'Play 10 games',
    xpReward: 100,
  },
  GAMES_50: {
    title: 'Regular Player',
    description: 'Play 50 games',
    xpReward: 250,
  },
  GAMES_100: {
    title: 'Committed',
    description: 'Play 100 games',
    xpReward: 500,
  },
  SCORE_1000: {
    title: 'Rising Star',
    description: 'Reach 1,000 total score',
    xpReward: 150,
  },
  SCORE_10000: {
    title: 'Top Performer',
    description: 'Reach 10,000 total score',
    xpReward: 500,
  },
  STREAK_5: {
    title: 'On Fire',
    description: 'Win 5 games in a row',
    xpReward: 200,
  },
  STREAK_10: {
    title: 'Unstoppable',
    description: 'Win 10 games in a row',
    xpReward: 500,
  },
  PERFECT_GAME: {
    title: 'Perfectionist',
    description: 'Complete a game with 100% accuracy',
    xpReward: 300,
  },
  SPEED_DEMON: {
    title: 'Speed Demon',
    description: 'Complete a game in record time',
    xpReward: 200,
  },
} as const;

// ============================================
// UI CONSTANTS
// ============================================

export const THEME = {
  colors: {
    primary: {
      DEFAULT: '#059669', // emerald-600
      dark: '#047857', // emerald-700
      light: '#10b981', // emerald-500
    },
    background: '#ffffff',
    foreground: '#18181b', // zinc-900
    muted: '#f4f4f5', // zinc-100
    border: '#e4e4e7', // zinc-200
  },
} as const;

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================
// VALIDATION
// ============================================

export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
} as const;
