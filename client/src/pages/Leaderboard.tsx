import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, Gift, Users, Calendar } from "lucide-react";
import { useState, useMemo } from "react";

export default function Leaderboard() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  
  const currentSeason = trpc.leaderboard.getCurrentSeason.useQuery();
  const allSeasons = trpc.leaderboard.getAllSeasons.useQuery({ limit: 50 });
  
  // Current season leaderboards
  const gameLeaderboard = trpc.leaderboard.getTopPlayers.useQuery({ limit: 10 });
  const referrerLeaderboard = trpc.leaderboard.getTopReferrers.useQuery({ limit: 10 });
  
  // Historical season leaderboards
  const seasonGameLeaderboard = trpc.leaderboard.getGameLeaderboardForSeason.useQuery(
    { seasonId: selectedSeasonId || 0, limit: 10 },
    { enabled: !!selectedSeasonId }
  );
  const seasonReferrerLeaderboard = trpc.leaderboard.getReferrerLeaderboardForSeason.useQuery(
    { seasonId: selectedSeasonId || 0, limit: 10 },
    { enabled: !!selectedSeasonId }
  );

  const activeSeason = useMemo(() => {
    return selectedSeasonId 
      ? allSeasons.data?.find(s => s.id === selectedSeasonId)
      : currentSeason.data;
  }, [selectedSeasonId, currentSeason.data, allSeasons.data]);

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentGameData = selectedSeasonId ? seasonGameLeaderboard.data : gameLeaderboard.data;
  const currentReferrerData = selectedSeasonId ? seasonReferrerLeaderboard.data : referrerLeaderboard.data;
  const isLoading = selectedSeasonId 
    ? (seasonGameLeaderboard.isLoading || seasonReferrerLeaderboard.isLoading)
    : (gameLeaderboard.isLoading || referrerLeaderboard.isLoading);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Leaderboards</h1>
        
        {/* Season Selector */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div className="flex-1">
            <label className="text-sm font-medium">Select Season</label>
            <Select 
              value={selectedSeasonId ? selectedSeasonId.toString() : "current"}
              onValueChange={(value) => {
                if (value === "current") {
                  setSelectedSeasonId(null);
                } else {
                  setSelectedSeasonId(parseInt(value));
                }
              }}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  Current Season {currentSeason.data && `(#${currentSeason.data.seasonNumber})`}
                </SelectItem>
                {allSeasons.data?.map((season) => (
                  <SelectItem key={season.id} value={season.id.toString()}>
                    Season {season.seasonNumber} - {formatDate(season.startDate)} to {formatDate(season.endDate)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Season Info */}
        {activeSeason && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm">
              <span className="font-semibold">Season {activeSeason.seasonNumber}</span>
              {activeSeason.seasonName && ` - ${activeSeason.seasonName}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(activeSeason.startDate)} to {formatDate(activeSeason.endDate)}
            </p>
          </div>
        )}
      </div>

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
                {selectedSeasonId ? "Season" : "Top"} Players
              </CardTitle>
              {!selectedSeasonId && (
                <p className="text-sm text-muted-foreground mt-2">🎁 Top 3 players earn weekly rewards!</p>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8">Loading leaderboard...</p>
              ) : currentGameData && currentGameData.length > 0 ? (
                <div className="space-y-3">
                  {currentGameData.map((player: any, index: number) => (
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
                        {!selectedSeasonId && index < 3 && (
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
              {isLoading ? (
                <p className="text-center py-8">Loading referrer leaderboard...</p>
              ) : currentReferrerData && currentReferrerData.length > 0 ? (
                <div className="space-y-3">
                  {currentReferrerData.map((referrer: any, index: number) => (
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
