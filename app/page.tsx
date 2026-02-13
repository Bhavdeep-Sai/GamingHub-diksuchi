/**
 * Home Page / Dashboard
 * Main landing page for authenticated users
 */

import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { 
  Gamepad2, 
  Trophy, 
  Brain, 
  Zap,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { GAMES } from '@/lib/constants';

export default function Home() {
  // Featured games for the home page
  const featuredGames = [
    {
      type: 'CHESS',
      color: 'from-emerald-50 to-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      type: 'SUDOKU',
      color: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      type: 'TIC_TAC_TOE',
      color: 'from-purple-50 to-purple-100',
      iconColor: 'text-purple-600',
    },
  ] as const;
  
  const features = [
    {
      icon: Brain,
      title: 'Train Your Brain',
      description: 'Improve logic, memory, strategy, and reaction skills through gameplay',
    },
    {
      icon: Trophy,
      title: 'Compete Globally',
      description: 'Climb the leaderboards and prove your skills against players worldwide',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your cognitive growth with detailed analytics and insights',
    },
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="success" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Brain Training Platform
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 tracking-tight">
              Train Your Brain Through
              <span className="text-primary"> Competitive Gaming</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Improve your cognitive skills while having fun. Track your progress, 
              compete with others, and become a mental athlete.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/games">
                <Button variant="outline" size="lg">
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  Browse Games
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Games Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Featured Games</h2>
            <p className="text-muted-foreground">
              Start training your brain with our most popular games
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredGames.map((game) => {
              const gameInfo = GAMES[game.type];
              return (
                <Link key={game.type} href={`/games/${game.type.toLowerCase()}`}>
                  <Card hover className="h-full">
                    <CardContent className="p-6">
                      <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center mb-4`}>
                        <Gamepad2 className={`h-12 w-12 ${game.iconColor}`} />
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{gameInfo.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {gameInfo.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {gameInfo.trainsLogic && (
                          <Badge variant="info">Logic</Badge>
                        )}
                        {gameInfo.trainsMemory && (
                          <Badge variant="success">Memory</Badge>
                        )}
                        {gameInfo.trainsStrategy && (
                          <Badge variant="warning">Strategy</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/games">
              <Button variant="outline">
                View All Games
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-white border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of players improving their cognitive skills 
                through engaging games. Track your progress and compete globally.
              </p>
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-zinc-50"
                >
                  Sign Up Now - It's Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
