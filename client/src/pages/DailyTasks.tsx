import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

export default function DailyTasks() {
  const { user } = useAuth();
  const dailyTasks = trpc.dailyTask.getTasks.useQuery();
  const userProgress = trpc.dailyTask.getUserProgress.useQuery(undefined, {
    enabled: !!user,
  });
  const completeTask = trpc.dailyTask.completeTask.useMutation();

  const handleCompleteTask = (taskId: number) => {
    completeTask.mutate(
      { taskId },
      {
        onSuccess: () => {
          toast.success("Task completed!");
          userProgress.refetch();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to complete task");
        },
      }
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>Please log in to view daily tasks</p>
      </div>
    );
  }

  const completedCount = userProgress.data?.filter((p) => p.completed).length || 0;
  const totalTasks = dailyTasks.data?.length || 7;
  const progressPercentage = (completedCount / totalTasks) * 100;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Daily Tasks</h1>
        <p className="text-muted-foreground">
          Complete daily tasks to earn energy core rewards
        </p>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tasks Completed</span>
              <span className="font-bold">
                {completedCount} / {totalTasks}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Earned Today</p>
              <p className="text-2xl font-bold text-blue-600">
                {userProgress.data?.filter((p) => p.completed).length || 0} tasks
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-green-600">
                {(totalTasks - completedCount) * 10}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Tasks List */}
      <div className="space-y-3">
        {dailyTasks.isLoading ? (
          <p>Loading daily tasks...</p>
        ) : (
          dailyTasks.data?.map((task) => {
            const userTask = userProgress.data?.find((p) => p.taskId === task.id);
            const isCompleted = userTask?.completed || false;

            return (
              <Card key={task.id} className={isCompleted ? "opacity-60" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                        }`}
                      >
                        <span className="text-lg font-bold">Day {task.day}</span>
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-600" />
                            <span>{task.energyCoreReward} Energy Core</span>
                          </div>
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isCompleted && (
                      <Button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={completeTask.isPending}
                      >
                        {completeTask.isPending ? "Completing..." : "Complete"}
                      </Button>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Daily Tasks Reset
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Tasks reset every day at midnight. Complete all 7 tasks to earn maximum rewards!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
