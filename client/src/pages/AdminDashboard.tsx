import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { BarChart3, Settings, Users, ShoppingCart, Trophy, Zap, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch admin data
  const adminStats = trpc.admin.getDashboard.useQuery();
  const users = trpc.admin.getUsers.useQuery();
  const gameStats = trpc.game.getStats.useQuery();
  const pendingRequests = trpc.admin.getPendingPremiumRequests.useQuery();
  const approveMutation = trpc.admin.approvePremiumRequest.useMutation();
  const rejectMutation = trpc.admin.rejectPremiumRequest.useMutation();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg">Access Denied</p>
          <p className="text-muted-foreground">Admin access only</p>
        </div>
      </div>
    );
  }

  const stats = adminStats.data ? {
    totalUsers: adminStats.data.totalUsers,
    totalRevenue: 0,
    premiumUsers: adminStats.data.premiumUsers,
    totalGamesPlayed: 0,
    avgWinRate: 0,
    mostPlayedGame: "N/A",
    totalEnergyCoreInCirculation: adminStats.data.totalEnergyDistributed,
  } : null;
  const userList = users.data || [];
  const games = gameStats.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Admin Control Center</h1>
          <p className="text-slate-400">Manage platform, users, and analytics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-700 overflow-x-auto pb-0">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "pending-requests", label: "Pending Requests", icon: Zap },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
            { id: "users", label: "Users", icon: Users },
            { id: "games", label: "Games", icon: Activity },
            { id: "shop", label: "Shop", icon: ShoppingCart },
            { id: "premium", label: "Premium", icon: Zap },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Active users</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-400">{stats?.totalRevenue || 0} MMK</p>
                  <p className="text-xs text-slate-500 mt-1">From payments</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Premium Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-400">{stats?.premiumUsers || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Active subscriptions</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Games Played</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-400">{stats?.totalGamesPlayed || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Total sessions</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Avg Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-400">{stats?.avgWinRate || 0}%</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Most Played Game</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-white">{stats?.mostPlayedGame || "N/A"}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Energy Core</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-400">{stats?.totalEnergyCoreInCirculation || 0}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Game Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(games) && games.slice(0, 10).map((game: any) => (
                    <div key={game.name} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <div>
                        <p className="font-medium text-white">{game.name}</p>
                        <p className="text-sm text-slate-400">Played: {game.timesPlayed} | Win Rate: {game.winRate}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-400">{game.totalEarned} EC</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Input placeholder="Search user..." className="bg-slate-700 border-slate-600 text-white" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-3 text-slate-400">Name</th>
                      <th className="text-left py-3 text-slate-400">Email</th>
                      <th className="text-left py-3 text-slate-400">Role</th>
                      <th className="text-left py-3 text-slate-400">Energy Core</th>
                      <th className="text-left py-3 text-slate-400">Premium</th>
                      <th className="text-left py-3 text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((u: any) => (
                      <tr key={u.id} className="border-b border-slate-700">
                        <td className="py-3 text-white">{u.name}</td>
                        <td className="py-3 text-slate-400">{u.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            u.role === "admin" ? "bg-red-900 text-red-200" : "bg-blue-900 text-blue-200"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-yellow-400 font-medium">{u.mykBalance}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            u.isPremium ? "bg-purple-900 text-purple-200" : "bg-slate-700 text-slate-400"
                          }`}>
                            {u.isPremium ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="py-3">
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Games Tab */}
        {activeTab === "games" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(games) && games.map((game: any) => (
                  <div key={game.name} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <h3 className="font-bold text-white mb-2">{game.name}</h3>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p>Played: <span className="text-yellow-400 font-medium">{game.timesPlayed}</span></p>
                      <p>Win Rate: <span className="text-green-400 font-medium">{game.winRate}%</span></p>
                      <p>Earned: <span className="text-blue-400 font-medium">{game.totalEarned} EC</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shop Tab */}
        {activeTab === "shop" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Shop Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Item Name</label>
                <Input placeholder="e.g., MLBB Diamond" className="bg-slate-700 border-slate-600 text-white" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Price (EC)</label>
                  <Input type="number" placeholder="50" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Game</label>
                  <Input placeholder="MLBB" className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <Input placeholder="Item description" className="bg-slate-700 border-slate-600 text-white" />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">Add Item</Button>
            </CardContent>
          </Card>
        )}

        {/* Premium Tab */}
        {activeTab === "premium" && (
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Premium Plans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { duration: "1 Month", price: 10000, benefits: "2x points, exclusive rewards" },
                  { duration: "3 Months", price: 30000, benefits: "2x points, exclusive rewards, priority support" },
                  { duration: "1 Year", price: 100000, benefits: "3x points, VIP status, all benefits" },
                ].map((plan) => (
                  <div key={plan.duration} className="p-4 bg-slate-700 rounded border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-white">{plan.duration}</p>
                        <p className="text-sm text-slate-400">{plan.benefits}</p>
                      </div>
                      <p className="text-lg font-bold text-green-400">{plan.price.toLocaleString()} MMK</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                      Edit
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Platform Name</label>
                <Input value="Gaming Platform" className="bg-slate-700 border-slate-600 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Initial Energy Core</label>
                <Input type="number" value="100" className="bg-slate-700 border-slate-600 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Game Win Reward</label>
                <Input type="number" value="5" className="bg-slate-700 border-slate-600 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Game Loss Penalty</label>
                <Input type="number" value="2" className="bg-slate-700 border-slate-600 text-white" />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">Save Settings</Button>
            </CardContent>
          </Card>
        )}

        {/* Pending Requests Tab */}
        {activeTab === "pending-requests" && (
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pending Premium Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests.isLoading ? (
                  <p className="text-slate-400">Loading requests...</p>
                ) : pendingRequests.data && pendingRequests.data.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRequests.data.map((req) => (
                      <div key={req.id} className="bg-slate-700 p-4 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-400">User</p>
                            <p className="text-sm font-semibold text-white">{req.userName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Email</p>
                            <p className="text-sm text-white">{req.userEmail}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Amount</p>
                            <p className="text-sm font-semibold text-green-400">{req.amount} MMK</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Transaction ID</p>
                            <p className="text-sm font-mono text-white">{req.transactionId}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              approveMutation.mutate(
                                { paymentTransactionId: req.id, durationMonths: 1 },
                                {
                                  onSuccess: () => {
                                    toast.success("Premium request approved!");
                                    pendingRequests.refetch();
                                  },
                                  onError: () => toast.error("Failed to approve"),
                                }
                              );
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                              rejectMutation.mutate(
                                { paymentTransactionId: req.id },
                                {
                                  onSuccess: () => {
                                    toast.success("Premium request rejected!");
                                    pendingRequests.refetch();
                                  },
                                  onError: () => toast.error("Failed to reject"),
                                }
                              );
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No pending requests</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
