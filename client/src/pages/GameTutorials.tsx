import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Play, CheckCircle2 } from "lucide-react";

const GAME_TUTORIALS = {
  uno: {
    name: "UNO",
    description: "Classic card game for 2-4 players",
    rules: [
      "Match cards by color or number",
      "Draw cards if you can't play",
      "Shout 'UNO' when you have one card left",
      "First player to empty their hand wins"
    ],
    tips: [
      "Save your Wild cards for critical moments",
      "Remember what cards other players have played",
      "Use Draw Two and Skip cards strategically",
      "Pay attention to the discard pile"
    ]
  },
  chess: {
    name: "Chess",
    description: "Strategic board game of kings and queens",
    rules: [
      "Each player starts with 16 pieces",
      "Pawns move forward, other pieces have unique moves",
      "Capture opponent's pieces to win",
      "Checkmate the opponent's king to win"
    ],
    tips: [
      "Control the center of the board",
      "Develop your pieces early",
      "Protect your king with castling",
      "Don't leave pieces undefended"
    ]
  },
  sudoku: {
    name: "Sudoku",
    description: "Number puzzle game",
    rules: [
      "Fill a 9x9 grid with numbers 1-9",
      "Each row must contain 1-9",
      "Each column must contain 1-9",
      "Each 3x3 box must contain 1-9"
    ],
    tips: [
      "Start with cells that have fewer possibilities",
      "Look for hidden singles in rows, columns, and boxes",
      "Use elimination to narrow down options",
      "Don't guess - use logic"
    ]
  },
  "2048": {
    name: "2048",
    description: "Merge tiles to reach 2048",
    rules: [
      "Swipe to move tiles in any direction",
      "Tiles with same number merge when they touch",
      "After each move, a new tile appears",
      "Game ends when no moves are possible"
    ],
    tips: [
      "Keep your highest tile in a corner",
      "Build in one direction at a time",
      "Don't fill the board completely",
      "Plan ahead for tile merges"
    ]
  }
};

export default function GameTutorials() {
  const [selectedGame, setSelectedGame] = useState("uno");
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  const tutorial = GAME_TUTORIALS[selectedGame as keyof typeof GAME_TUTORIALS];

  const handleCompleteTutorial = () => {
    if (!completedTutorials.includes(selectedGame)) {
      setCompletedTutorials([...completedTutorials, selectedGame]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Game Tutorials</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Game List */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Games</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(GAME_TUTORIALS).map(([key, game]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedGame(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                      selectedGame === key
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span className="font-medium">{game.name}</span>
                    {completedTutorials.includes(key) && (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tutorial Content */}
          <div className="md:col-span-2">
            {tutorial && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{tutorial.name}</CardTitle>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="rules" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="rules">Rules</TabsTrigger>
                      <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="rules" className="space-y-4 mt-6">
                      <h3 className="font-semibold text-lg">Game Rules</h3>
                      <ul className="space-y-3">
                        {tutorial.rules.map((rule, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                              {idx + 1}
                            </span>
                            <span className="text-muted-foreground">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="tips" className="space-y-4 mt-6">
                      <h3 className="font-semibold text-lg">Tips & Tricks</h3>
                      <ul className="space-y-3">
                        {tutorial.tips.map((tip, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center text-sm">
                              💡
                            </span>
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-8 flex gap-3">
                    <Button
                      size="lg"
                      onClick={handleCompleteTutorial}
                      disabled={completedTutorials.includes(selectedGame)}
                      className="flex-1"
                    >
                      {completedTutorials.includes(selectedGame) ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Tutorial Completed
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
