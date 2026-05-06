import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Gamepad2, Trophy, Zap, Users, Gift, Sparkles } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">Gaming Platform</span>
          </div>

          <div className="hidden md:flex gap-6">
            {isAuthenticated && (
              <>
                <Link href="/games" className="text-sm hover:text-primary transition">
                  Games
                </Link>
                <Link href="/shop" className="text-sm hover:text-primary transition">
                  Shop
                </Link>
                <Link href="/leaderboard" className="text-sm hover:text-primary transition">
                  Leaderboard
                </Link>
                <Link href="/premium" className="text-sm hover:text-primary transition">
                  Premium
                </Link>
                <Link href="/events" className="text-sm hover:text-primary transition">
                  Events
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    {user?.name || "Profile"}
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button size="sm" variant="secondary">
                      Admin
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Play Games, Earn Rewards
            </h1>
            <p className="text-xl text-muted-foreground">
              Join our gaming platform and compete with players worldwide. Win games, earn energy core, and climb the leaderboard!
            </p>

            {isAuthenticated ? (
              <div className="flex gap-4">
                <Link href="/games">
                  <Button size="lg" className="gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Play Games
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Zap className="w-5 h-5" />
                    Shop
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="gap-2"
              >
                <Users className="w-5 h-5" />
                Get Started
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                <CardTitle className="text-2xl">20+ Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Including UNO multiplayer and more
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <Zap className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle className="text-2xl">Energy Core</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Earn and trade for rewards
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <Gift className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle className="text-2xl">Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Win prizes and achievements
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <Sparkles className="w-8 h-8 text-purple-500 mb-2" />
                <CardTitle className="text-2xl">Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Unlock exclusive benefits
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Play With Us?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Gamepad2 className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Diverse Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Play 20+ different games including multiplayer UNO, card games, puzzles, and more. No gambling involved!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Trophy className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Competitive Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compete globally, earn leaderboard points, and win MMK E rewards for top 3 positions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Referral Program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your referral code and earn 200 energy core for each friend who joins!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Energy Core Currency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn energy core by playing games, completing daily tasks, and achieving milestones.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Gift className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Shop & Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trade energy core for MLBB diamonds, PUBG UC, Telegram premium, and more!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Premium Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get 2x rewards on leaderboard, exclusive achievements, and special perks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Ready to Play?</CardTitle>
              <CardDescription className="text-lg">
                Sign in now and get 100 energy core as a welcome bonus!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="gap-2"
              >
                <Users className="w-5 h-5" />
                Sign In to Start
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Gaming Platform. All rights reserved. No gambling involved.</p>
        </div>
      </footer>
    </div>
  );
}
