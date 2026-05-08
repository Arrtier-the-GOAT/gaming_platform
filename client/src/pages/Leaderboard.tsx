import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, Gift, Users } from "lucide-react";

export default function Leaderboard() {
  const gameLeaderboard = trpc.leaderboard.getTopPlayers.useQuery({ limit: 10 });
  const referrerLeaderboard = trpc.leaderboard.getTopReferrers.useQuery({ limit: 10 });

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Leaderboards</h1>

      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="games">Game Points</TabsTrigger>
          <TabsTrigger value="referrers">Top Referrers</TabsTrigger>
        </TabsList>

        {/* Game Points Leaderboard Tab */}
        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Top Players This Week
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">🎁 Top 3 players earn weekly rewards!</p>
            </CardHeader>
            <CardContent>
              {gameLeaderboard.isLoading ? (
                <p className="text-center py-8">Loading leaderboard...</p>
              ) : gameLeaderboard.data && gameLeaderboard.data.length > 0 ? (
                <div className="space-y-3">
                  {gameLeaderboard.data.map((player, index) => (
                    <div
                      key={player.userId}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getMedalIcon(index + 1)}
                        </div>
                        <div>
                          <p className="font-bold">{player.userName}</p>
                          <p className="text-sm text-muted-foreground">{player.gamesWon} wins</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {index < 3 && (
                          <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <Gift className="w-4 h-4" />
                            Weekly Rewards
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{player.totalPoints}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No leaderboard data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrer Leaderboard Tab */}
        <TabsContent value="referrers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Referrers
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">🎉 Ranked by premium users referred</p>
            </CardHeader>
            <CardContent>
              {referrerLeaderboard.isLoading ? (
                <p className="text-center py-8">Loading referrer leaderboard...</p>
              ) : referrerLeaderboard.data && referrerLeaderboard.data.length > 0 ? (
                <div className="space-y-3">
                  {referrerLeaderboard.data.map((referrer, index) => (
                    <div
                      key={referrer.referrerId}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getMedalIcon(index + 1)}
                        </div>
                        <div>
                          <p className="font-bold">{referrer.referrerName}</p>
                          <p className="text-sm text-muted-foreground">{referrer.referrerEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{referrer.premiumUserCount}</p>
                        <p className="text-xs text-muted-foreground">premium users</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No referrer data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
