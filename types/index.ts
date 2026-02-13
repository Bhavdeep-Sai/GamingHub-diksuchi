// Type definitions for GamingHub

export type GameType = 
  | 'CHESS'
  | 'SUDOKU'
  | 'HANGMAN'
  | 'LUDO'
  | 'UNO'
  | 'TIC_TAC_TOE'
  | 'VISUAL_CARD_MATCH'
  | 'FOUR_IN_ROW'
  | 'CODING_GAME';

export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export type UserRank = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';

export type LeaderboardType = 'GLOBAL' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export type AchievementCategory = 
  | 'GAMES_PLAYED'
  | 'SCORE_MILESTONE'
  | 'STREAK'
  | 'SKILL_MASTERY'
  | 'SPEED'
  | 'ACCURACY'
  | 'SPECIAL';

// ============================================
// USER TYPES
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  totalGamesPlayed: number;
  totalScore: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  rank: UserRank;
  level: number;
  xp: number;
  logicScore: number;
  memoryScore: number;
  strategyScore: number;
  reactionScore: number;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface BrainPowerMetrics {
  logic: number;
  memory: number;
  strategy: number;
  reaction: number;
  overall: number;
}

// ============================================
// GAME TYPES
// ============================================

export interface GameInfo {
  id: string;
  type: GameType;
  name: string;
  description: string;
  trainsLogic: boolean;
  trainsMemory: boolean;
  trainsStrategy: boolean;
  trainsReaction: boolean;
  minPlayers: number;
  maxPlayers: number;
  avgDuration: number;
  isActive: boolean;
}

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  gameType: GameType;
  status: SessionStatus;
  difficulty?: GameDifficulty;
  score: number;
  moves: number;
  timeSpent: number;
  accuracy?: number;
  won?: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface GameState {
  // Generic game state structure
  [key: string]: unknown;
}

// ============================================
// SCORING TYPES
// ============================================

export interface ScoreEntry {
  id: string;
  userId: string;
  gameType: GameType;
  points: number;
  rank?: number;
  timeSpent: number;
  accuracy?: number;
  moves?: number;
  difficulty?: GameDifficulty;
  speedBonus: number;
  accuracyBonus: number;
  streakBonus: number;
  logicPoints: number;
  memoryPoints: number;
  strategyPoints: number;
  reactionPoints: number;
  isPersonalBest: boolean;
  createdAt: Date;
}

export interface ScoreCalculation {
  baseScore: number;
  speedBonus: number;
  accuracyBonus: number;
  streakBonus: number;
  totalScore: number;
  brainPoints: {
    logic: number;
    memory: number;
    strategy: number;
    reaction: number;
  };
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string | null;
  name: string | null;
  image: string | null;
  score: number;
  gamesPlayed: number;
  winRate: number;
  level: number;
}

export interface LeaderboardData {
  type: LeaderboardType;
  gameType?: GameType;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
  userRank?: number; // Current user's rank
}

// ============================================
// ACHIEVEMENT TYPES
// ============================================

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  gameType?: GameType;
  requirement: string;
  value?: number;
  xpReward: number;
  unlockedAt: Date;
}

export interface AchievementProgress {
  achievement: {
    title: string;
    description: string;
    xpReward: number;
  };
  currentValue: number;
  targetValue: number;
  percentage: number;
  unlocked: boolean;
}

// ============================================
// STATS TYPES
// ============================================

export interface StatsSnapshot {
  date: Date;
  periodType: 'daily' | 'weekly' | 'monthly';
  gamesPlayed: number;
  totalScore: number;
  avgScore: number;
  winRate: number;
  logicScore: number;
  memoryScore: number;
  strategyScore: number;
  reactionScore: number;
}

export interface UserStats {
  overview: {
    totalGamesPlayed: number;
    totalScore: number;
    winRate: number;
    currentStreak: number;
    longestStreak: number;
    rank: UserRank;
    level: number;
    xp: number;
  };
  brainPower: BrainPowerMetrics;
  recentGames: GameSession[];
  achievements: Achievement[];
  progress: StatsSnapshot[];
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// GAME ENGINE TYPES
// ============================================

export interface GameEngine<TState = GameState, TMove = unknown> {
  // Initialize game
  initialize: (difficulty?: GameDifficulty) => TState;
  
  // Make a move
  makeMove: (state: TState, move: TMove) => TState;
  
  // Validate move
  isValidMove: (state: TState, move: TMove) => boolean;
  
  // Check game over
  isGameOver: (state: TState) => boolean;
  
  // Get winner
  getWinner: (state: TState) => 'player' | 'opponent' | 'draw' | null;
  
  // Calculate score
  calculateScore: (state: TState, timeSpent: number) => ScoreCalculation;
  
  // Serialize state
  serialize: (state: TState) => string;
  
  // Deserialize state
  deserialize: (data: string) => TState;
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  name: string;
  password: string;
}

export interface ProfileUpdateForm {
  name?: string;
  username?: string;
  bio?: string;
  image?: string;
}
