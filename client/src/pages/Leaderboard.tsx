import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal } from "lucide-react";

export default function Leaderboard() {
  const leaderboard = trpc.leaderboard.getTopPlayers.useQuery({ limit: 10 });

  if (leaderboard.isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Top Players This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.data?.map((player, index) => (
              <div
                key={player.userId}
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getMedalIcon(index + 1)}
                  </div>
                  <div>
                    <p className="font-bold">{player.userName}</p>
                    <p className="text-sm text-muted-foreground">{player.gamesWon} wins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{player.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
