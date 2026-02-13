/**
 * Tic Tac Toe Game UI Component
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Card, Badge } from '@/components/ui';
import { TicTacToeEngine, TicTacToeState, Player } from './engine';
import { GameDifficulty } from '@/types';
import { RotateCcw, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TicTacToeGameProps {
  difficulty?: GameDifficulty;
  mode?: 'single' | 'multiplayer';
}

const engine = new TicTacToeEngine();

export function TicTacToeGame({ difficulty = 'MEDIUM', mode = 'single' }: TicTacToeGameProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [gameState, setGameState] = useState<TicTacToeState>(() => engine.initialize(difficulty));
  const [isThinking, setIsThinking] = useState(false);
  
  // AI turn
  useEffect(() => {
    if (
      mode === 'single' &&
      gameState.currentPlayer === 'O' &&
      !gameState.winner &&
      !isThinking
    ) {
      setIsThinking(true);
      
      // Delay for better UX
      setTimeout(() => {
        const aiMove = engine.getAIMove(gameState, difficulty);
        const newState = engine.makeMove(gameState, aiMove);
        setGameState(newState);
        setIsThinking(false);
        
        // Check if game ended
        if (newState.winner) {
          handleGameEnd(newState);
        }
      }, 500);
    }
  }, [gameState, mode, difficulty, isThinking]);
  
  const handleCellClick = (index: number) => {
    if (gameState.winner || isThinking) return;
    if (mode === 'single' && gameState.currentPlayer === 'O') return;
    
    const newState = engine.makeMove(gameState, index);
    if (newState !== gameState) {
      setGameState(newState);
      
      // Check if game ended
      if (newState.winner) {
        handleGameEnd(newState);
      }
    }
  };
  
  const handleGameEnd = async (state: TicTacToeState) => {
    const timeSpent = Math.floor((Date.now() - state.startTime) / 1000);
    const winner = engine.getWinner(state);
    
    if (winner === 'player') {
      toast.success('You won!');
    } else if (winner === 'opponent') {
      toast.error('You lost!');
    } else {
      toast('It\'s a draw!');
    }
    
    // Save game result if authenticated
    if (session) {
      try {
        await fetch('/api/games/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameType: 'TIC_TAC_TOE',
            difficulty,
            won: winner === 'player',
            moves: state.moves,
            timeSpent,
            accuracy: winner === 'player' ? 100 : winner === 'draw' ? 50 : 0,
          }),
        });
      } catch (error) {
        console.error('Failed to save game:', error);
      }
    }
  };
  
  const handleReset = () => {
    setGameState(engine.initialize(difficulty));
    setIsThinking(false);
  };
  
  const renderCell = (index: number) => {
    const value = gameState.board[index];
    const isWinning = false; // Could enhance to highlight winning combination
    
    return (
      <button
        onClick={() => handleCellClick(index)}
        disabled={!!gameState.winner || value !== null || isThinking}
        className={`
          aspect-square w-full rounded-lg border-2 border-border
          flex items-center justify-center text-4xl font-bold
          transition-all duration-200
          ${value === null && !gameState.winner && !isThinking
            ? 'hover:border-primary hover:bg-primary-50 cursor-pointer'
            : 'cursor-not-allowed'
          }
          ${isWinning ? 'bg-primary-50 border-primary' : 'bg-white'}
          ${value === 'X' ? 'text-primary' : 'text-zinc-600'}
        `}
      >
        {value}
      </button>
    );
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tic Tac Toe</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'single' ? `Playing against AI (${difficulty})` : 'Multiplayer Mode'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={gameState.currentPlayer === 'X' ? 'success' : 'default'}>
              {isThinking ? 'AI Thinking...' : `Turn: ${gameState.currentPlayer}`}
            </Badge>
          </div>
        </div>
        
        {/* Game Board */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index}>{renderCell(index)}</div>
          ))}
        </div>
        
        {/* Game Status */}
        {gameState.winner && (
          <div className="mb-4 p-4 rounded-lg bg-primary-50 border border-primary text-center">
            <p className="font-semibold text-lg">
              {gameState.winner === 'X' && 'You Won!'}
              {gameState.winner === 'O' && 'AI Won!'}
              {gameState.winner === 'draw' && 'It\'s a Draw!'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Moves: {gameState.moves} | Time: {Math.floor((Date.now() - gameState.startTime) / 1000)}s
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            New Game
          </Button>
          <Button onClick={() => router.push('/games')} variant="ghost">
            <Home className="h-4 w-4 mr-2" />
            All Games
          </Button>
        </div>
      </Card>
    </div>
  );
}
