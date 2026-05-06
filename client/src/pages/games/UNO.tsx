import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface Card {
  id: string;
  color: "red" | "blue" | "green" | "yellow" | "wild";
  number?: number;
  action?: "skip" | "reverse" | "draw2" | "draw4" | "wild";
}

interface Player {
  id: number;
  name: string;
  cards: Card[];
  score: number;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  discardPile: Card[];
  drawPile: Card[];
  gameStarted: boolean;
  winner: Player | null;
}

const COLORS = ["red", "blue", "green", "yellow"] as const;
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function generateDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;

  // Number cards (0-9) for each color
  COLORS.forEach((color) => {
    NUMBERS.forEach((number) => {
      deck.push({ id: `${id++}`, color, number });
      if (number !== 0) {
        deck.push({ id: `${id++}`, color, number });
      }
    });
  });

  // Action cards
  COLORS.forEach((color) => {
    ["skip", "reverse", "draw2"].forEach((action) => {
      deck.push({ id: `${id++}`, color, action: action as any });
      deck.push({ id: `${id++}`, color, action: action as any });
    });
  });

  // Wild cards
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `${id++}`, color: "wild", action: "wild" });
    deck.push({ id: `${id++}`, color: "wild", action: "draw4" });
  }

  return deck.sort(() => Math.random() - 0.5);
}

function canPlayCard(card: Card, topCard: Card | null): boolean {
  if (!topCard) return true;
  if (card.color === "wild") return true;
  if (card.color === topCard.color) return true;
  if (card.number !== undefined && card.number === topCard.number) return true;
  if (card.action && card.action === topCard.action) return true;
  return false;
}

export default function UNOGame() {
  const { user } = useAuth();
  const recordResult = trpc.game.recordResult.useMutation();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Initialize game
    const deck = generateDeck();
    const players: Player[] = [
      { id: user?.id || 0, name: user?.name || "You", cards: [], score: 0 },
      { id: 1, name: "AI 1", cards: [], score: 0 },
      { id: 2, name: "AI 2", cards: [], score: 0 },
      { id: 3, name: "AI 3", cards: [], score: 0 },
    ];

    // Deal 7 cards to each player
    players.forEach((player) => {
      for (let i = 0; i < 7; i++) {
        player.cards.push(deck.pop()!);
      }
    });

    // Start with first card from deck
    const firstCard = deck.pop()!;

    setGameState({
      players,
      currentPlayerIndex: 0,
      discardPile: [firstCard],
      drawPile: deck,
      gameStarted: true,
      winner: null,
    });

    setMessage("Game started! Your turn.");
  }, [user]);

  const handlePlayCard = (cardId: string) => {
    if (!gameState || gameState.currentPlayerIndex !== 0) return;

    const currentPlayer = gameState.players[0];
    const cardIndex = currentPlayer.cards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const card = currentPlayer.cards[cardIndex];
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];

    if (!canPlayCard(card, topCard)) {
      setMessage("Cannot play this card!");
      return;
    }

    // Remove card from hand
    currentPlayer.cards.splice(cardIndex, 1);

    // Add to discard pile
    const newDiscardPile = [...gameState.discardPile, card];

    // Check if player won
    if (currentPlayer.cards.length === 0) {
      recordResult.mutate({
        gameName: "UNO",
        won: true,
        points: 50,
      });

      setGameState({
        ...gameState,
        discardPile: newDiscardPile,
        winner: currentPlayer,
      });
      setMessage("You won! 🎉");
      return;
    }

    // Move to next player
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % 4;

    setGameState({
      ...gameState,
      discardPile: newDiscardPile,
      currentPlayerIndex: nextPlayerIndex,
    });

    setSelectedCard(null);
    setMessage("Next player's turn");
  };

  const handleDrawCard = () => {
    if (!gameState || gameState.currentPlayerIndex !== 0) return;

    if (gameState.drawPile.length === 0) {
      // Reshuffle discard pile
      const topCard = gameState.discardPile.pop()!;
      gameState.drawPile = gameState.discardPile.sort(() => Math.random() - 0.5);
      gameState.discardPile = [topCard];
    }

    const card = gameState.drawPile.pop()!;
    gameState.players[0].cards.push(card);

    // Move to next player
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % 4;

    setGameState({
      ...gameState,
      currentPlayerIndex: nextPlayerIndex,
    });

    setMessage("Card drawn. Next player's turn");
  };

  const handleQuitGame = () => {
    recordResult.mutate({
      gameName: "UNO",
      won: false,
      points: 0,
    });

    setGameState(null);
  };

  if (!gameState) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>UNO Game</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState.winner) {
    return (
      <div className="container mx-auto py-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xl">
              {gameState.winner.id === user?.id
                ? "You won! 🎉"
                : `${gameState.winner.name} won!`}
            </p>
            <Button onClick={() => window.location.reload()}>Play Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const playerCards = gameState.players[0].cards;

  const getCardColor = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-500";
      case "blue":
        return "bg-blue-500";
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-400";
      case "wild":
        return "bg-gray-800";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UNO - 4 Player Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current player info */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Current Player</p>
            <p className="text-2xl font-bold">{currentPlayer.name}</p>
            {currentPlayer.id === user?.id && (
              <p className="text-sm text-green-600">Your turn!</p>
            )}
          </div>

          {/* Discard pile */}
          <div className="flex justify-center">
            <div className="w-16 h-24 md:w-24 md:h-32 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center">
              {topCard && (
                <div
                  className={`w-14 h-20 md:w-20 md:h-28 rounded flex items-center justify-center text-white font-bold text-lg md:text-2xl ${getCardColor(
                    topCard.color
                  )}`}
                >
                  {topCard.number !== undefined ? topCard.number : topCard.action?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
            {message}
          </div>

          {/* Player cards */}
          {currentPlayer.id === user?.id && (
            <div className="space-y-4">
              <p className="text-sm font-semibold">Your Cards ({playerCards.length})</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {playerCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      if (selectedCard === card.id) {
                        handlePlayCard(card.id);
                      } else {
                        setSelectedCard(card.id);
                      }
                    }}
                    className={`w-12 h-18 md:w-16 md:h-24 rounded text-white font-bold text-xs md:text-sm flex items-center justify-center transition touch-manipulation ${getCardColor(
                      card.color
                    )} ${selectedCard === card.id ? "ring-2 md:ring-4 ring-white" : "hover:opacity-80 active:opacity-60"}`}
                  >
                    {card.number !== undefined ? card.number : card.action?.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleDrawCard}
                  variant="outline"
                  disabled={recordResult.isPending}
                >
                  Draw Card
                </Button>
                <Button
                  onClick={handleQuitGame}
                  variant="destructive"
                  disabled={recordResult.isPending}
                >
                  {recordResult.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Quitting...
                    </>
                  ) : (
                    "Quit Game"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Other players */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {gameState.players.slice(1).map((player) => (
              <div key={player.id} className="text-center p-3 bg-muted rounded">
                <p className="font-semibold">{player.name}</p>
                <p className="text-sm text-muted-foreground">
                  {player.cards.length} cards
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
