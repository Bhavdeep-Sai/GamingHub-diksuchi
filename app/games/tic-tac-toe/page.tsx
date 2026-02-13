/**
 * Tic Tac Toe Game Page
 */

import { TicTacToeGame } from '@/games/tic-tac-toe/TicTacToeGame';
import { GameDifficulty } from '@/types';

interface PageProps {
  searchParams: {
    difficulty?: GameDifficulty;
    mode?: 'single' | 'multiplayer';
  };
}

export default function TicTacToePage({ searchParams }: PageProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <TicTacToeGame
        difficulty={searchParams.difficulty || 'MEDIUM'}
        mode={searchParams.mode || 'single'}
      />
    </div>
  );
}

export const metadata = {
  title: 'Tic Tac Toe - GamingHub',
  description: 'Play Tic Tac Toe and improve your strategic thinking',
};
