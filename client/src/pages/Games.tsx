import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Gamepad2, Zap, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const GAMES = [
  {
    id: 1,
    name: "UNO Multiplayer",
    description: "Classic card game for 2-4 players",
    players: "2-4",
    reward: "5 EC",
    icon: "🃏",
    category: "Card",
  },
  {
    id: 2,
    name: "Chess",
    description: "Strategic board game against AI or players",
    players: "1-2",
    reward: "5 EC",
    icon: "♟️",
    category: "Board",
  },
  {
    id: 3,
    name: "Checkers",
    description: "Classic checkers game",
    players: "1-2",
    reward: "5 EC",
    icon: "⚫",
    category: "Board",
  },
  {
    id: 4,
    name: "Tic Tac Toe",
    description: "Quick strategy game",
    players: "1-2",
    reward: "3 EC",
    icon: "⭕",
    category: "Board",
  },
  {
    id: 5,
    name: "Connect 4",
    description: "Connect four pieces to win",
    players: "1-2",
    reward: "5 EC",
    icon: "🔴",
    category: "Board",
  },
  {
    id: 6,
    name: "Sudoku",
    description: "Number puzzle game",
    players: "1",
    reward: "4 EC",
    icon: "🔢",
    category: "Puzzle",
  },
  {
    id: 7,
    name: "2048",
    description: "Merge tiles to reach 2048",
    players: "1",
    reward: "4 EC",
    icon: "2️⃣",
    category: "Puzzle",
  },
  {
    id: 8,
    name: "Memory Game",
    description: "Match pairs of cards",
    players: "1",
    reward: "3 EC",
    icon: "🧠",
    category: "Puzzle",
  },
  {
    id: 9,
    name: "Word Search",
    description: "Find hidden words in grid",
    players: "1",
    reward: "4 EC",
    icon: "📝",
    category: "Word",
  },
  {
    id: 10,
    name: "Crossword",
    description: "Solve crossword puzzles",
    players: "1",
    reward: "5 EC",
    icon: "✏️",
    category: "Word",
  },
  {
    id: 11,
    name: "Trivia Quiz",
    description: "Test your knowledge",
    players: "1",
    reward: "4 EC",
    icon: "❓",
    category: "Quiz",
  },
  {
    id: 12,
    name: "Hangman",
    description: "Guess the word before you lose",
    players: "1",
    reward: "3 EC",
    icon: "🎯",
    category: "Word",
  },
  {
    id: 13,
    name: "Wordle Clone",
    description: "Guess the word in 6 tries",
    players: "1",
    reward: "4 EC",
    icon: "🔤",
    category: "Word",
  },
  {
    id: 14,
    name: "Snake Game",
    description: "Classic snake game",
    players: "1",
    reward: "3 EC",
    icon: "🐍",
    category: "Action",
  },
  {
    id: 15,
    name: "Flappy Bird Clone",
    description: "Navigate through obstacles",
    players: "1",
    reward: "3 EC",
    icon: "🐦",
    category: "Action",
  },
  {
    id: 16,
    name: "Breakout",
    description: "Break bricks with a ball",
    players: "1",
    reward: "4 EC",
    icon: "🧱",
    category: "Action",
  },
  {
    id: 17,
    name: "Pac-Man Clone",
    description: "Eat pellets and avoid ghosts",
    players: "1",
    reward: "4 EC",
    icon: "👾",
    category: "Action",
  },
  {
    id: 18,
    name: "Minesweeper",
    description: "Reveal safe tiles and avoid mines",
    players: "1",
    reward: "4 EC",
    icon: "💣",
    category: "Puzzle",
  },
  {
    id: 19,
    name: "Puzzle Slider",
    description: "Arrange tiles in correct order",
    players: "1",
    reward: "3 EC",
    icon: "🧩",
    category: "Puzzle",
  },
  {
    id: 20,
    name: "Card Memory",
    description: "Match card pairs quickly",
    players: "1",
    reward: "3 EC",
    icon: "🎴",
    category: "Memory",
  },
];

const CATEGORIES = ["All", "Card", "Board", "Puzzle", "Word", "Quiz", "Action", "Memory"];

export default function Games() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredGames = selectedCategory === "All" 
    ? GAMES 
    : GAMES.filter(game => game.category === selectedCategory);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Sign in to play games</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to play games and earn rewards.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Play Games</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Earn energy core by playing and winning games
          </p>
        </div>

        {/* User Energy Core Display */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Energy Core Balance</p>
                <p className="text-3xl font-bold text-blue-600">{user?.energyCoreBalance || 0} EC</p>
              </div>
              <Zap className="w-12 h-12 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
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

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGames.map(game => (
            <Card key={game.id} className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{game.icon}</div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                    {game.reward}
                  </span>
                </div>
                <CardTitle className="text-lg mt-2">{game.name}</CardTitle>
                <CardDescription className="text-xs">{game.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{game.players} players</span>
                  </div>
                </div>
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-white transition"
                  variant="outline"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No games in this category</h3>
            <p className="text-muted-foreground">Try selecting a different category</p>
          </div>
        )}

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Games</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{GAMES.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Available to play</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{CATEGORIES.length - 1}</p>
              <p className="text-xs text-muted-foreground mt-1">Different game types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Max Reward</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5 EC</p>
              <p className="text-xs text-muted-foreground mt-1">Per game win</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React from "react";
