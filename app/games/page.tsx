/**
 * Games Listing Page
 */

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { GAMES } from '@/lib/constants';
import { GameType } from '@/types';
import { Gamepad2, Clock, Users } from 'lucide-react';

export default function GamesPage() {
  const gamesList = Object.entries(GAMES).map(([type, game]) => ({
    type: type as GameType,
    ...game,
  }));
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Choose Your Game</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Train different cognitive skills through our collection of carefully 
          selected games. Each game targets specific brain functions.
        </p>
      </div>
      
      {/* Games Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gamesList.map((game) => {
          const isActive = game.type === 'TIC_TAC_TOE'; // Only Tic Tac Toe is implemented
          
          return (
            <Link
              key={game.type}
              href={isActive ? `/games/${game.type.toLowerCase().replace(/_/g, '-')}` : '#'}
              className={!isActive ? 'pointer-events-none' : ''}
            >
              <Card hover={isActive} className={`h-full ${!isActive ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-primary-50 rounded-lg">
                      <Gamepad2 className="h-6 w-6 text-primary" />
                    </div>
                    {!isActive && (
                      <Badge variant="default">Coming Soon</Badge>
                    )}
                  </div>
                  <CardTitle>{game.name}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {game.description}
                  </p>
                  
                  {/* Skills trained */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {game.trainsLogic && <Badge variant="info">Logic</Badge>}
                    {game.trainsMemory && <Badge variant="success">Memory</Badge>}
                    {game.trainsStrategy && <Badge variant="warning">Strategy</Badge>}
                    {game.trainsReaction && <Badge variant="error">Reaction</Badge>}
                  </div>
                  
                  {/* Game info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(game.avgDuration / 60)}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {game.minPlayers === game.maxPlayers
                          ? `${game.minPlayers}P`
                          : `${game.minPlayers}-${game.maxPlayers}P`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      
      {/* Info Section */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto bg-primary-50 border-primary">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-3">More Games Coming Soon</h3>
            <p className="text-muted-foreground">
              We're actively developing new games to help you train different 
              cognitive skills. Check back regularly for updates!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Games - GamingHub',
  description: 'Browse all brain training games',
};
