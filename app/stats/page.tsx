/**
 * Stats Page
 * User statistics and progress tracking
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, StatCard, Progress } from '@/components/ui';
import { Trophy, Brain, Zap, Target, TrendingUp, Calendar } from 'lucide-react';

interface UserStats {
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  rank: string;
  logicScore: number;
  memoryScore: number;
  strategyScore: number;
  reactionScore: number;
}

interface RecentGame {
  id: string;
  gameName: string;
  gameType: string;
  score: number;
  result: 'WIN' | 'LOSS' | 'DRAW';
  completedAt: Date;
  duration: number;
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/stats');
    }
    
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);
  
  const fetchData = async () => {
    try {
      const [statsRes, gamesRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/user/recent-games'),
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setRecentGames(gamesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!session || !stats) {
    return null;
  }
  
  const pointsToNextLevel = (stats.level * 1000) - (stats.totalScore % (stats.level * 1000));
  const levelProgress = ((stats.totalScore % (stats.level * 1000)) / (stats.level * 1000)) * 100;
  
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Statistics</h1>
          <p className="text-muted-foreground">
            Track your progress and cognitive development
          </p>
        </div>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Score"
            value={stats.totalScore.toLocaleString()}
            icon={<Trophy className="h-4 w-4" />}
            trend={stats.totalScore > 0 ? { value: 12, isPositive: true } : undefined}
          />
          <StatCard
            label="Games Played"
            value={stats.gamesPlayed}
            icon={<Target className="h-4 w-4" />}
            trend={stats.gamesPlayed > 0 ? { value: 8, isPositive: true } : undefined}
          />
          <StatCard
            label="Win Rate"
            value={`${Math.round(stats.winRate)}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={stats.winRate > 50 ? { value: 5, isPositive: true } : undefined}
          />
          <StatCard
            label="Current Streak"
            value={stats.currentStreak}
            icon={<Zap className="h-4 w-4" />}
            trend={stats.currentStreak > 0 ? { value: 2, isPositive: true } : undefined}
          />
        </div>
        
        {/* Level & Rank */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">Level {stats.level}</span>
                  <Badge variant="info">{stats.rank}</Badge>
                </div>
                <Progress value={levelProgress} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {pointsToNextLevel.toLocaleString()} points to Level {stats.level + 1}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-warning" />
                    <span className="text-2xl font-bold">{stats.currentStreak} days</span>
                  </div>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.currentStreak > 0
                    ? 'Keep playing to maintain your streak and earn bonus points!'
                    : 'Play a game today to start your streak!'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Brain Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Cognitive Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Logic</span>
                  <span className="text-sm text-muted-foreground">{stats.logicScore}/1000</span>
                </div>
                <Progress value={stats.logicScore / 10} variant="success" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Memory</span>
                  <span className="text-sm text-muted-foreground">{stats.memoryScore}/1000</span>
                </div>
                <Progress value={stats.memoryScore / 10} variant="success" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Strategy</span>
                  <span className="text-sm text-muted-foreground">{stats.strategyScore}/1000</span>
                </div>
                <Progress value={stats.strategyScore / 10} variant="default" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Reaction</span>
                  <span className="text-sm text-muted-foreground">{stats.reactionScore}/1000</span>
                </div>
                <Progress value={stats.reactionScore / 10} variant="default" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Games */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            {recentGames.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No games played yet. Start playing to see your history!
              </p>
            ) : (
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        game.result === 'WIN' ? 'bg-success' : 
                        game.result === 'LOSS' ? 'bg-danger' : 
                        'bg-warning'
                      }`} />
                      <div>
                        <p className="font-medium">{game.gameName}</p>
                        <p className="text-sm text-muted-foreground">{formatTimeAgo(game.completedAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{game.score.toLocaleString()}</p>
                      <Badge
                        variant={game.result === 'WIN' ? 'success' : game.result === 'LOSS' ? 'destructive' : 'warning'}
                      >
                        {game.result.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
