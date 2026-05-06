import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Gamepad2, Trophy, Zap } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const GAME_STATS = [
  { name: "UNO", wins: 45, losses: 12, winRate: 79 },
  { name: "Chess", wins: 28, losses: 15, winRate: 65 },
  { name: "Tic Tac Toe", wins: 52, losses: 8, winRate: 87 },
  { name: "2048", wins: 35, losses: 20, winRate: 64 },
];

const PLAYTIME_DATA = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 4.1 },
  { day: "Fri", hours: 3.5 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 2.9 },
];

const EARNINGS_DATA = [
  { week: "Week 1", energy: 450, premium: 0 },
  { week: "Week 2", energy: 620, premium: 200 },
  { week: "Week 3", energy: 580, premium: 0 },
  { week: "Week 4", energy: 750, premium: 300 },
];

const ACHIEVEMENT_PROGRESS = [
  { name: "Completed", value: 24 },
  { name: "In Progress", value: 8 },
  { name: "Locked", value: 18 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export default function Analytics() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Games Played
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-green-600 mt-1">+12 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">74%</div>
              <p className="text-xs text-green-600 mt-1">+5% this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Energy Core Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,400</div>
              <p className="text-xs text-green-600 mt-1">+320 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24/50</div>
              <p className="text-xs text-blue-600 mt-1">48% complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="playtime">Playtime</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Performance</CardTitle>
                <CardDescription>Win/Loss ratio by game</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={GAME_STATS}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wins" fill="#10b981" />
                    <Bar dataKey="losses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Win Rates by Game</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {GAME_STATS.map((game) => (
                    <div key={game.name} className="flex items-center justify-between">
                      <span className="font-medium">{game.name}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${game.winRate}%` }}
                          />
                        </div>
                        <span className="font-semibold w-12 text-right">{game.winRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playtime Tab */}
          <TabsContent value="playtime" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Playtime</CardTitle>
                <CardDescription>Hours played per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={PLAYTIME_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Core Earnings</CardTitle>
                <CardDescription>Weekly earnings breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={EARNINGS_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="energy" fill="#3b82f6" name="Energy Core" />
                    <Bar dataKey="premium" fill="#f59e0b" name="Premium Bonus" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ACHIEVEMENT_PROGRESS}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
