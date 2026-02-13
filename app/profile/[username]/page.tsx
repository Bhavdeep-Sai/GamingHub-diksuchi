'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { getAvatarUrl } from '@/components/ui/AvatarSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { StatCard } from '@/components/ui/StatCard';
import {
  Trophy,
  Swords,
  BrainCircuit,
  Zap,
  Star,
  TrendingUp,
  BarChart,
  Calendar,
} from 'lucide-react';
import { User } from 'next-auth';

type PublicProfile = Omit<User, 'id' | 'email' | 'emailVerified'> & {
  bio?: string;
  createdAt: string;
  level: number;
  rank: number;
  totalGamesPlayed: number;
  winRate: number;
  longestStreak: number;
  totalScore: number;
  logicScore: number;
  memoryScore: number;
  strategyScore: number;
  reactionScore: number;
};

export default function PublicProfilePage() {
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to render avatar content
  const renderAvatarContent = (avatarValue?: string | null) => {
    if (!avatarValue) return null;
    
    // Handle legacy profile image URLs
    if (avatarValue.startsWith('http')) {
      return <AvatarImage src={avatarValue} alt="Profile" />;
    }
    
    // Handle legacy letter avatars
    if (avatarValue.startsWith('letter:')) {
      const [, letter, color] = avatarValue.split(':');
      return (
        <div 
          className="w-full h-full rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: color, fontFamily: 'Bungee, cursive' }}
        >
          {letter}
        </div>
      );
    }
    
    // Handle legacy generated avatars
    if (avatarValue.startsWith('generated:')) {
      const [, style, seed] = avatarValue.split(':');
      const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
      return <AvatarImage src={url} alt="Avatar" />;
    }
    
    // Handle new avatar IDs - convert string to number if needed
    const avatarId = parseInt(avatarValue) || 1;
    return <AvatarImage src={getAvatarUrl(avatarId)} alt="Avatar" />;
  };

  useEffect(() => {
    if (username) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/users/${username}`);
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }
          const data = await response.json();
          setProfile(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">User not found.</div>;
  }

  const skillScores = [
    { name: 'Logic', score: profile.logicScore, icon: <BrainCircuit className="h-6 w-6" /> },
    { name: 'Strategy', score: profile.strategyScore, icon: <Swords className="h-6 w-6" /> },
    { name: 'Reaction', score: profile.reactionScore, icon: <Zap className="h-6 w-6" /> },
    { name: 'Memory', score: profile.memoryScore, icon: <Star className="h-6 w-6" /> },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 p-6">
          <Avatar className="h-24 w-24">
            {profile.image ? (
              renderAvatarContent(profile.image)
            ) : (
              <AvatarFallback>{profile.name?.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            <p className="mt-2 text-sm">{profile.bio ?? 'No bio available.'}</p>
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex-grow" />
          <div className="flex flex-col items-center space-y-2">
            <Badge variant="secondary">Level {profile.level}</Badge>
            <div className="text-center">
                <p className="font-bold text-2xl">#{profile.rank}</p>
                <p className="text-sm text-muted-foreground">Global Rank</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Score"
          value={profile.totalScore.toLocaleString()}
          icon={<Trophy className="h-8 w-8 text-yellow-500" />}
        />
        <StatCard
          label="Win Rate"
          value={`${profile.winRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-8 w-8 text-green-500" />}
        />
        <StatCard
          label="Games Played"
          value={profile.totalGamesPlayed.toLocaleString()}
          icon={<BarChart className="h-8 w-8 text-blue-500" />}
        />
        <StatCard
          label="Longest Streak"
          value={profile.longestStreak.toLocaleString()}
          icon={<Zap className="h-8 w-8 text-purple-500" />}
        />
      </div>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Distribution</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillScores.map((skill) => (
            <div key={skill.name} className="flex flex-col items-center text-center">
              {skill.icon}
              <h3 className="font-semibold mt-2">{skill.name}</h3>
              <p className="text-2xl font-bold">{skill.score}</p>
              <Progress value={skill.score} className="w-full mt-2 h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}