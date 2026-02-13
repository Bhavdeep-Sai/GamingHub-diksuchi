/**
 * Tic Tac Toe Game Engine
 * Clean game logic separated from UI
 */

import { GameEngine, GameDifficulty, ScoreCalculation } from '@/types';
import { SCORING, GAMES } from '@/lib/constants';

export type Player = 'X' | 'O' | null;
export type Board = Player[];

export interface TicTacToeState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  moves: number;
  startTime: number;
}

export type TicTacToeMove = number; // Board position 0-8

export class TicTacToeEngine implements GameEngine<TicTacToeState, TicTacToeMove> {
  initialize(difficulty?: GameDifficulty): TicTacToeState {
    return {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      moves: 0,
      startTime: Date.now(),
    };
  }
  
  makeMove(state: TicTacToeState, move: TicTacToeMove): TicTacToeState {
    if (!this.isValidMove(state, move)) {
      return state;
    }
    
    const newBoard = [...state.board];
    newBoard[move] = state.currentPlayer;
    
    const winner = this.checkWinner(newBoard);
    const nextPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    
    return {
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      winner,
      moves: state.moves + 1,
    };
  }
  
  isValidMove(state: TicTacToeState, move: TicTacToeMove): boolean {
    if (move < 0 || move > 8) return false;
    if (state.board[move] !== null) return false;
    if (state.winner !== null) return false;
    return true;
  }
  
  isGameOver(state: TicTacToeState): boolean {
    return state.winner !== null;
  }
  
  getWinner(state: TicTacToeState): 'player' | 'opponent' | 'draw' | null {
    if (state.winner === 'X') return 'player';
    if (state.winner === 'O') return 'opponent';
    if (state.winner === 'draw') return 'draw';
    return null;
  }
  
  /**
   * Check for winner or draw
   */
  private checkWinner(board: Board): Player | 'draw' | null {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6],             // Diagonals
    ];
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    // Check for draw
    if (board.every(cell => cell !== null)) {
      return 'draw';
    }
    
    return null;
  }
  
  /**
   * AI move for single player mode
   */
  getAIMove(state: TicTacToeState, difficulty: GameDifficulty = 'MEDIUM'): TicTacToeMove {
    switch (difficulty) {
      case 'EASY':
        return this.getRandomMove(state);
      case 'MEDIUM':
        return Math.random() > 0.5 ? this.getBestMove(state) : this.getRandomMove(state);
      case 'HARD':
      case 'EXPERT':
        return this.getBestMove(state);
      default:
        return this.getRandomMove(state);
    }
  }
  
  /**
   * Random AI move
   */
  private getRandomMove(state: TicTacToeState): TicTacToeMove {
    const availableMoves = state.board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index): index is number => index !== null);
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }
  
  /**
   * Minimax algorithm for optimal play
   */
  private getBestMove(state: TicTacToeState): TicTacToeMove {
    let bestScore = -Infinity;
    let bestMove = 0;
    
    for (let i = 0; i < 9; i++) {
      if (state.board[i] === null) {
        const newBoard = [...state.board];
        newBoard[i] = state.currentPlayer;
        const score = this.minimax(newBoard, 0, false, state.currentPlayer);
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  }
  
  /**
   * Minimax algorithm implementation
   */
  private minimax(board: Board, depth: number, isMaximizing: boolean, player: Player): number {
    const winner = this.checkWinner(board);
    
    if (winner === player) return 10 - depth;
    if (winner === (player === 'X' ? 'O' : 'X')) return depth - 10;
    if (winner === 'draw') return 0;
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = player;
          const score = this.minimax(board, depth + 1, false, player);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      const opponent = player === 'X' ? 'O' : 'X';
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = opponent;
          const score = this.minimax(board, depth + 1, true, player);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }
  
  calculateScore(state: TicTacToeState, timeSpent: number): ScoreCalculation {
    const game = GAMES.TIC_TAC_TOE;
    const winner = this.getWinner(state);
    
    let baseScore = 100;
    
    if (winner === 'player') {
      baseScore = 200;
    } else if (winner === 'draw') {
      baseScore = 50;
    } else {
      baseScore = 0;
    }
    
    // Speed bonus
    const speedBonus = timeSpent < game.avgDuration * 0.5 && winner === 'player' ? 50 : 0;
    
    // Perfect game bonus (win in minimum moves)
    const accuracyBonus = winner === 'player' && state.moves <= 5 ? 100 : 0;
    
    const totalScore = baseScore + speedBonus + accuracyBonus;
    
    return {
      baseScore,
      speedBonus,
      accuracyBonus,
      streakBonus: 0,
      totalScore,
      brainPoints: {
        logic: game.trainsLogic ? Math.round(totalScore * 0.1) : 0,
        memory: 0,
        strategy: game.trainsStrategy ? Math.round(totalScore * 0.1) : 0,
        reaction: 0,
      },
    };
  }
  
  serialize(state: TicTacToeState): string {
    return JSON.stringify(state);
  }
  
  deserialize(data: string): TicTacToeState {
    return JSON.parse(data);
  }
}
