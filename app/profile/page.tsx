'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import AvatarSelector, { getAvatarUrl, AVATAR_TYPE_GOOGLE, AVATAR_TYPE_INITIALS } from '@/components/ui/AvatarSelector';
import Link from 'next/link';
import { X } from 'lucide-react';

/**
 * User Profile Page
 * Displays user information, stats, recent games, and achievements
 */

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
  bio?: string;
}

interface RecentGame {
  id: string;
  gameName: string;
  gameType: string;
  score: number;
  result: string;
  completedAt: string;
  duration: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', bio: '', avatar: 1 as number | string });
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [originalGooglePic, setOriginalGooglePic] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Fetch avatar URL when session changes
  useEffect(() => {
    async function fetchAvatarUrl() {
      if (!session?.user?.image) {
        setAvatarUrl('');
        return;
      }

      const image = session.user.image;

      // If it's a URL or special type, use directly
      if (image.startsWith('http') || image === AVATAR_TYPE_INITIALS) {
        setAvatarUrl(image);
        return;
      }

      // Try to fetch from database
      try {
        const response = await fetch(`/api/avatars/${image}`);
        if (response.ok) {
          const data = await response.json();
          setAvatarUrl(data.avatar.url);
        } else {
          // Fallback to DiceBear
          setAvatarUrl(getAvatarUrl(image));
        }
      } catch (error) {
        // Fallback to DiceBear
        setAvatarUrl(getAvatarUrl(image));
      }
    }

    fetchAvatarUrl();
  }, [session?.user?.image]);

  // Helper function to render avatar in Avatar component
  const renderAvatarContent = (avatarValue: string | number, userName?: string, userEmail?: string) => {
    if (!avatarValue) return null;
    
    // Handle initials avatar
    if (avatarValue === AVATAR_TYPE_INITIALS || !avatarUrl) {
      return (
        <AvatarFallback>
          {userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 
           userEmail?.substring(0, 2).toUpperCase() || 'U'}
        </AvatarFallback>
      );
    }
    
    // Use the fetched avatar URL
    return <AvatarImage src={avatarUrl} alt="Avatar" />;
  };



  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      setError('Please sign in to view your profile');
      setLoading(false);
      return;
    }

    console.log('Session data:', {
      userId: session.user?.id,
      email: session.user?.email,
      name: session.user?.name,
      image: session.user?.image,
    });

    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const statsResponse = await fetch('/api/user/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const stats = await statsResponse.json();
      setUserStats(stats);

      // Fetch recent games
      const gamesResponse = await fetch('/api/user/recent-games');
      if (!gamesResponse.ok) {
        throw new Error('Failed to fetch recent games');
      }
      const games = await gamesResponse.json();
      setRecentGames(games);

      // Fetch Google profile picture if available
      try {
        const profileResponse = await fetch('/api/user/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('Fetched profile data:', profileData);
          if (profileData.googleProfilePic) {
            console.log('Setting originalGooglePic to:', profileData.googleProfilePic);
            setOriginalGooglePic(profileData.googleProfilePic);
          } else {
            console.log('No googleProfilePic in response');
            // If user has Google account but changed avatar, try to get from session
            if (session?.user?.image && session.user.image.startsWith('http')) {
              console.log('Using session image as Google pic:', session.user.image);
              setOriginalGooglePic(session.user.image);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const gameDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const handleEditProfile = () => {
    if (session?.user) {
      // Determine current avatar type
      let defaultAvatar: number | string = 1;
      if (session.user.image) {
        // Check if it's a Google profile picture URL
        if (session.user.image.startsWith('http')) {
          defaultAvatar = AVATAR_TYPE_GOOGLE;
        } 
        // Check if it's the initials type
        else if (session.user.image === AVATAR_TYPE_INITIALS) {
          defaultAvatar = AVATAR_TYPE_INITIALS;
        }
        // Otherwise it's a database avatar ID
        else {
          defaultAvatar = session.user.image;
        }
      }
      
      // If user signed in with Google but doesn't have their Google pic set,
      // we should still preserve it for the option
      if (!originalGooglePic && session.user.image && session.user.image.startsWith('http')) {
        setOriginalGooglePic(session.user.image);
      }
      
      setEditForm({
        name: session.user.name || '',
        username: session.user.username || '',
        bio: userStats?.bio || session.user?.bio || '',
        avatar: defaultAvatar,
      });
    }
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setEditLoading(true);
      setEditError(null);

      // Convert avatar selection to appropriate format for saving
      let imageValue: string = '';
      if (editForm.avatar === AVATAR_TYPE_GOOGLE && originalGooglePic) {
        // Save the actual Google profile picture URL
        imageValue = originalGooglePic;
      } else if (editForm.avatar === AVATAR_TYPE_INITIALS) {
        // Save 'initials' as the image value
        imageValue = AVATAR_TYPE_INITIALS;
      } else {
        // Database avatar ID (MongoDB ObjectId string)
        imageValue = String(editForm.avatar);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          username: editForm.username,
          bio: editForm.bio,
          image: imageValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setIsEditModalOpen(false);
      
      // Reload the page - JWT callback will fetch fresh data
      window.location.reload();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getResultBadgeVariant = (result: string) => {
    switch (result?.toUpperCase()) {
      case 'WIN':
      case 'WON':
      case 'VICTORY':
        return 'success';
      case 'LOSS':
      case 'LOST':
      case 'DEFEAT':
        return 'destructive';
      case 'DRAW':
      case 'TIE':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchUserData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Profile data not available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate XP progress (simplified calculation)
  const currentLevelXP = userStats.level * 1000;
  const nextLevelXP = (userStats.level + 1) * 1000;
  const xpProgress = ((userStats.totalScore % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 py-8">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>

        {/* User Info Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar size="xl">
                {session.user?.image ? (
                  renderAvatarContent(session.user.image, session.user.name || undefined, session.user.email || undefined)
                ) : (
                  <AvatarFallback>
                    {session.user?.name?.split(' ').map(n => n[0]).join('') || 
                     session.user?.email?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{session.user?.name || 'Player'}</h2>
                {(userStats?.bio || session.user?.bio) && (
                  <p className="text-muted-foreground mt-1">{userStats?.bio || session.user?.bio}</p>
                )}
                <p className="text-muted-foreground">{session.user?.email}</p>
                <p className="text-sm text-muted-foreground">Rank: {userStats.rank}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">Level {userStats.level}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {userStats.totalScore} total points
              </div>
              <div className="w-32 bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="primary" onClick={handleEditProfile}>Edit Profile</Button>
            {session?.user?.username && (
              <Link href={`/profile/${session.user.username}`} passHref>
                <Button variant="secondary">View Public Profile</Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Games"
            value={userStats.gamesPlayed.toString()}
          />
          <StatCard
            label="Win Rate"
            value={`${userStats.winRate}%`}
          />
          <StatCard
            label="Current Streak"
            value={userStats.currentStreak.toString()}
          />
          <StatCard
            label="Total Score"
            value={userStats.totalScore.toString()}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Games */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Recent Games</h3>
            <div className="space-y-4">
              {recentGames.length > 0 ? (
                recentGames.slice(0, 5).map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium text-foreground">{game.gameName}</div>
                      <div className="text-sm text-muted-foreground">
                        Score: {game.score} • {formatDuration(game.duration)} • {formatTimeAgo(game.completedAt)}
                      </div>
                    </div>
                    <Badge variant={getResultBadgeVariant(game.result)}>
                      {game.result}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent games found</p>
              )}
            </div>
            {recentGames.length > 5 && (
              <Button variant="ghost" className="w-full mt-4">
                View All Games
              </Button>
            )}
          </Card>

          {/* Brain Power Metrics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Brain Power</h3>
            <div className="space-y-4">
              {[
                { label: 'Logic', score: userStats.logicScore, color: 'bg-blue-500' },
                { label: 'Memory', score: userStats.memoryScore, color: 'bg-green-500' },
                { label: 'Strategy', score: userStats.strategyScore, color: 'bg-purple-500' },
                { label: 'Reaction', score: userStats.reactionScore, color: 'bg-orange-500' },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-foreground font-medium">{metric.label}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className={`${metric.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${(metric.score / 1000) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {metric.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-6xl h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
                  {editError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {editError}
                    </div>
                  )}

                  {/* 2-Column Layout */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left Column - Avatar Selector */}
                    <div className="border-r border-border pr-6">
                      <AvatarSelector 
                        currentAvatar={editForm.avatar}
                        onSelect={(avatarId) => setEditForm({ ...editForm, avatar: avatarId })}
                        googleProfilePic={originalGooglePic}
                        userInitials={session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 
                                      session?.user?.email?.substring(0, 2).toUpperCase() || 'U'}
                        userName={session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}
                      />
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Name</label>
                        <Input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">Username</label>
                        <Input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          placeholder="your_username"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          3-20 characters, letters, numbers, and underscores only
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">Bio</label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
              </div>

              <div className="flex space-x-3 px-6 py-4 border-t shrink-0 bg-background">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  disabled={editLoading}
                  className="flex-1"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}