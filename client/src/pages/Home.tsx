import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "react-router-dom";
import { Trophy, Zap, Users, Gift, Sparkles } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Play Games, Earn Rewards</h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">Join our Gaming Hub and compete with players worldwide. Win games, earn energy core, and climb the leaderboard!</p>
            {!isAuthenticated ? (
              <Button size="lg" onClick={() => (window.location.href = getLoginUrl())} className="text-base md:text-lg h-12 md:h-14">
                Get Started
              </Button>
            ) : (
              <Link to="/games">
                <Button size="lg" className="text-base md:text-lg h-12 md:h-14">
                  Play Games
                </Button>
              </Link>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <Card className="hover:shadow-lg transition">
              <CardHeader className="pb-3 md:pb-4">
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 mb-2" />
                <CardTitle className="text-lg md:text-xl">20+ Games</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">Including UNO multiplayer and more</CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardHeader className="pb-3 md:pb-4">
                <Zap className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-2" />
                <CardTitle className="text-lg md:text-xl">Energy Core</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">Earn and trade for rewards</CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardHeader className="pb-3 md:pb-4">
                <Gift className="w-8 h-8 md:w-10 md:h-10 text-green-500 mb-2" />
                <CardTitle className="text-lg md:text-xl">Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">Win prizes and achievements</CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardHeader className="pb-3 md:pb-4">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-500 mb-2" />
                <CardTitle className="text-lg md:text-xl">Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">Unlock exclusive benefits</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Play Section */}
      <section className="bg-accent/50 py-12 md:py-20 mt-8 md:mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12 text-center">Why Play With Us?</h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 md:w-10 md:h-10 text-primary mb-3" />
                <CardTitle className="text-lg md:text-xl">Multiplayer Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground">Play with friends and compete in multiplayer games like UNO</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 mb-3" />
                <CardTitle className="text-lg md:text-xl">Leaderboards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground">Climb the leaderboard and earn exclusive rewards as a top player</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-3" />
                <CardTitle className="text-lg md:text-xl">Daily Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground">Complete daily tasks and earn energy core every day</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 py-8 md:py-12 mt-12 md:mt-20">
        <div className="container mx-auto px-4 text-center text-sm md:text-base text-muted-foreground">
          <p>&copy; 2026 Gaming Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
