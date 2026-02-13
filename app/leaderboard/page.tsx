/**
 * Leaderboard Page
 * Global and game-specific rankings
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react';
import { GAMES } from '@/lib/constants';

type LeaderboardType = 'global' | 'weekly' | keyof typeof GAMES;

interface LeaderboardEntry {
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

interface LeaderboardData {
  type: string;
  gameType?: string;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
  userRank?: number;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);
  
  const fetchLeaderboard = async (type: LeaderboardType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const tabs = [
    { id: 'global' as const, label: 'Global', icon: Trophy },
    { id: 'weekly' as const, label: 'This Week', icon: TrendingUp },
    { id: 'CHESS' as const, label: 'Chess', icon: Trophy },
    { id: 'SUDOKU' as const, label: 'Sudoku', icon: Trophy },
    { id: 'TIC_TAC_TOE' as const, label: 'Tic Tac Toe', icon: Trophy },
  ];
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-warning" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-zinc-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge variant="warning">1st Place</Badge>;
    if (rank === 2) return <Badge variant="info">2nd Place</Badge>;
    if (rank === 3) return <Badge variant="success">3rd Place</Badge>;
    return null;
  };
  
  const getDisplayName = (entry: LeaderboardEntry) => {
    return entry.username || entry.name || 'Anonymous';
  };
  
  const getAvatar = (entry: LeaderboardEntry) => {
    if (entry.image) return entry.image;
    // Generate avatar based on username/name
    const name = getDisplayName(entry);
    const emojis = ['🏆', '🧠', '♟️', '👑', '🥷', '🎯', '🧩', '⚡', '💭', '🔥', '🎮', '🌟'];
    const index = name.charCodeAt(0) % emojis.length;
    return emojis[index];
  };
  
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Compete with players worldwide and climb the rankings
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Leaderboard */}
        {!loading && leaderboardData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {activeTab === 'global' && 'Global Rankings'}
                {activeTab === 'weekly' && 'Weekly Rankings'}
                {activeTab !== 'global' && activeTab !== 'weekly' && `${GAMES[activeTab]?.name || ''} Rankings`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardData.entries.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  No rankings available yet. Be the first to play and claim the top spot!
                </p>
              ) : (
                <>
                  {/* Top 3 Podium */}
                  {leaderboardData.entries.length >= 3 && (
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      {leaderboardData.entries.slice(0, 3).map((player, index) => (
                        <Card
                          key={player.userId}
                          className={`text-center ${
                            index === 0 ? 'md:order-2 border-warning bg-warning/5' :
                            index === 1 ? 'md:order-1' :
                            'md:order-3'
                          }`}
                        >
                          <CardContent className="pt-6 pb-6">
                            <div className="flex flex-col items-center gap-3">
                              <div className="relative">
                                <div className="text-4xl">{getAvatar(player)}</div>
                                {index === 0 && (
                                  <Crown className="absolute -top-2 -right-2 h-6 w-6 text-warning" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-lg">{getDisplayName(player)}</p>
                                <p className="text-sm text-muted-foreground">Level {player.level}</p>
                              </div>
                              <div className="text-2xl font-bold text-primary">
                                {player.score.toLocaleString()}
                              </div>
                              {getRankBadge(player.rank)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Rest of Rankings */}
                  {leaderboardData.entries.length > 3 && (
                    <div className="space-y-2">
                      {leaderboardData.entries.slice(3).map((player) => (
                        <div
                          key={player.userId}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-hover transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 flex justify-center">
                              {getRankIcon(player.rank)}
                            </div>
                            <div className="text-2xl">{getAvatar(player)}</div>
                            <div>
                              <p className="font-semibold">{getDisplayName(player)}</p>
                              <p className="text-sm text-muted-foreground">Level {player.level}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">{player.score.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* User Position (if not in top entries and logged in) */}
                  {leaderboardData.userRank && leaderboardData.userRank > leaderboardData.entries.length && (
                    <div className="mt-8 p-4 rounded-lg border-2 border-primary bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 flex justify-center">
                            <span className="text-sm font-semibold">#{leaderboardData.userRank}</span>
                          </div>
                          <div className="text-2xl">🎮</div>
                          <div>
                            <p className="font-semibold">Your Rank</p>
                            <p className="text-sm text-muted-foreground">Keep playing to climb higher!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
