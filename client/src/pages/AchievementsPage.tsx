import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Trophy, Lock, CheckCircle, Zap } from "lucide-react";

export default function AchievementsPage() {
  const { user } = useAuth();
  const achievements = trpc.achievement.getAll.useQuery();
  const userAchievements = trpc.achievement.getUserAchievements.useQuery(undefined, {
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>Please log in to view achievements</p>
      </div>
    );
  }

  const getAchievementStatus = (achievementId: number) => {
    return userAchievements.data?.some((a) => a.achievementId === achievementId);
  };

  const categories = [
    { name: "Game Achievements", icon: Trophy, color: "text-yellow-600" },
    { name: "Milestone Achievements", icon: CheckCircle, color: "text-blue-600" },
    { name: "Premium Achievements", icon: Zap, color: "text-purple-600" },
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Unlock achievements by completing challenges and milestones
        </p>
      </div>

      {/* Achievement Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {userAchievements.data?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Unlocked</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <p className="text-3xl font-bold text-gray-600">
                {achievements.data?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {Math.round(
                  ((userAchievements.data?.length || 0) / (achievements.data?.length || 1)) * 100
                )}
                %
              </p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements by Category */}
      {achievements.isLoading ? (
        <p>Loading achievements...</p>
      ) : (
        <div className="space-y-6">
          {achievements.data?.map((achievement) => {
            const isUnlocked = getAchievementStatus(achievement.id);

            return (
              <Card
                key={achievement.id}
                className={`transition ${isUnlocked ? "" : "opacity-75"}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isUnlocked
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-gray-100 dark:bg-gray-900/30"
                      }`}
                    >
                      {isUnlocked ? (
                        <Trophy className="w-8 h-8 text-yellow-600" />
                      ) : (
                        <Lock className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{achievement.name}</h3>
                        {isUnlocked && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Reward: {achievement.energyCoreReward} Energy Core</span>
                        {isUnlocked && (
                          <span className="text-green-600">✓ Unlocked</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {achievement.type}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
