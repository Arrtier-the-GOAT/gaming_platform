import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const COLORS = ["Red", "Blue", "Green", "Yellow"] as const;
const VALUES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

type UnoCard = {
  color: (typeof COLORS)[number];
  value: (typeof VALUES)[number];
};

function randomCard(): UnoCard {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const value = VALUES[Math.floor(Math.random() * VALUES.length)];
  return { color, value };
}

function matches(a: UnoCard, b: UnoCard) {
  return a.color === b.color || a.value === b.value;
}

export default function UnoCardGame() {
  const [topCard, setTopCard] = useState<UnoCard>(() => randomCard());
  const [hand, setHand] = useState<UnoCard[]>(() =>
    Array.from({ length: 5 }, () => randomCard())
  );
  const [wins, setWins] = useState(0);
  const playableCount = useMemo(
    () => hand.filter(card => matches(card, topCard)).length,
    [hand, topCard]
  );

  const playCard = (index: number) => {
    const card = hand[index];
    if (!matches(card, topCard)) return;
    setTopCard(card);
    setHand(prev => prev.filter((_, i) => i !== index));
    if (hand.length === 1) {
      setWins(prev => prev + 1);
      setHand(Array.from({ length: 5 }, () => randomCard()));
      setTopCard(randomCard());
    }
  };

  const drawCard = () => {
    setHand(prev => [...prev, randomCard()]);
  };

  const resetRound = () => {
    setTopCard(randomCard());
    setHand(Array.from({ length: 5 }, () => randomCard()));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl space-y-4">
        <Link href="/games">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>UNO Card Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Wins: <span className="font-semibold text-foreground">{wins}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Playable cards: <span className="font-semibold text-foreground">{playableCount}</span>
              </p>
            </div>

            <div className="rounded border p-4 bg-white">
              <p className="text-sm text-muted-foreground mb-1">Top Card</p>
              <p className="text-xl font-bold">
                {topCard.color} {topCard.value}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Your Hand</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {hand.map((card, index) => {
                  const canPlay = matches(card, topCard);
                  return (
                    <Button
                      key={`${card.color}-${card.value}-${index}`}
                      variant={canPlay ? "default" : "outline"}
                      onClick={() => playCard(index)}
                      disabled={!canPlay}
                      className="h-16"
                    >
                      {card.color} {card.value}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={drawCard}>
                Draw Card
              </Button>
              <Button variant="outline" onClick={resetRound}>
                New Round
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
