import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Zap, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const GAMES = [
  {
    id: 1,
    name: "Candy Crush",
    description: "Match candies and get the highest score",
    players: "1",
    reward: "10 EC",
    icon: "🍬",
    category: "Puzzle",
  },
  {
    id: 2,
    name: "Bubble Pop",
    description: "Shoot same-color bubbles with combos",
    players: "1",
    reward: "14 EC",
    icon: "🫧",
    category: "Action",
  },
  {
    id: 3,
    name: "Wordle Clone",
    description: "Guess the 5-letter word in 6 attempts",
    players: "1",
    reward: "10 EC",
    icon: "🔤",
    category: "Word",
  },
  {
    id: 4,
    name: "Gold Miner",
    description: "Drop your hook to collect gold and avoid rocks",
    players: "1",
    reward: "12 EC",
    icon: "⛏️",
    category: "Arcade",
  },
  {
    id: 5,
    name: "Memory Match",
    description: "Flip two cards and match all pairs before time runs out",
    players: "1",
    reward: "13 EC",
    icon: "🧠",
    category: "Puzzle",
  },
];

const CATEGORIES = ["All", "Puzzle", "Action", "Word", "Arcade"];

export default function Games() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredGames =
    selectedCategory === "All"
      ? GAMES
      : GAMES.filter(game => game.category === selectedCategory);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Sign in to play games</h1>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to play games and earn rewards.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Play Games</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Earn energy core by playing and winning games
          </p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Your Energy Core Balance
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {user?.mykBalance || 0} EC
                </p>
              </div>
              <Zap className="w-12 h-12 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredGames.map(game => (
            <Card
              key={game.id}
              className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
            >
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-5xl leading-none">{game.icon}</div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                    {game.reward}
                  </span>
                </div>
                <CardTitle className="text-sm md:text-lg mt-2 line-clamp-2">
                  {game.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {game.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                  {game.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{game.players}</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const gameRoute = game.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "");
                    window.location.href = `/play/${gameRoute}`;
                  }}
                  className="w-full group-hover:bg-primary group-hover:text-white transition text-xs md:text-sm h-9 md:h-10"
                >
                  <Gamepad2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              No games in this category
            </h3>
            <p className="text-muted-foreground">
              Try selecting a different category
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-8 md:mt-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{GAMES.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Available to play
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{CATEGORIES.length - 1}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Different game types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Max Reward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">14 EC</p>
              <p className="text-xs text-muted-foreground mt-1">Per game win</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
