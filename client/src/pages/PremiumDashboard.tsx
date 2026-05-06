import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Copy, CheckCircle, Clock, Gift } from "lucide-react";
import { toast } from "sonner";

export default function PremiumDashboard() {
  const { user } = useAuth();
  const rewardCodes = trpc.rewardCode.getUserRewardCodes.useQuery(undefined, {
    enabled: !!user,
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>Please log in to view your premium dashboard</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Premium Dashboard</h1>
        <p className="text-muted-foreground">
          View your exclusive premium rewards and benefits
        </p>
      </div>

      {/* Premium Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Premium Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div>
              <p className="font-semibold">Bonus Leaderboard Points</p>
              <p className="text-sm text-muted-foreground">+2 points per game win</p>
            </div>
            <span className="text-2xl font-bold text-purple-600">+2</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <p className="font-semibold">Reward Code Eligibility</p>
              <p className="text-sm text-muted-foreground">Earn codes in top 3 leaderboard</p>
            </div>
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="font-semibold">Exclusive Access</p>
              <p className="text-sm text-muted-foreground">Premium-only features</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Reward Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Your Reward Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rewardCodes.isLoading ? (
            <p>Loading reward codes...</p>
          ) : rewardCodes.data && rewardCodes.data.length > 0 ? (
            <div className="space-y-3">
              {rewardCodes.data.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        #{reward.leaderboardPosition}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        Position
                      </span>
                    </div>
                    <p className="text-sm">
                      Reward: <span className="font-bold">{reward.rewardAmount} MMK</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-muted px-3 py-2 rounded font-mono text-sm font-bold">
                      {reward.code}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(reward.code)}
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reward codes yet</p>
              <p className="text-sm">
                Reach top 3 in the leaderboard to earn reward codes!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Your Reward Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="space-y-2 list-decimal list-inside">
            <li>Copy your reward code from above</li>
            <li>Contact support or visit the redemption page</li>
            <li>Enter the code to claim your reward</li>
            <li>Reward will be credited to your account</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
