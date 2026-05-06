import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { BarChart3, Settings, Users, ShoppingCart, Trophy, Zap } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <p className="text-red-600 font-semibold">Access Denied: Admin only</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage platform settings and user data</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "shop", label: "Shop", icon: ShoppingCart },
          { id: "premium", label: "Premium", icon: Zap },
          { id: "rewards", label: "Rewards", icon: Trophy },
          { id: "users", label: "Users", icon: Users },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0 MMK</p>
              <p className="text-xs text-muted-foreground">From payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total sessions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shop Management Tab */}
      {activeTab === "shop" && (
        <Card>
          <CardHeader>
            <CardTitle>Shop Item Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name</label>
              <Input placeholder="e.g., MLBB Diamond" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (MMK)</label>
                <Input type="number" placeholder="10000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input type="number" placeholder="100" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Item description" />
            </div>

            <Button className="w-full">Add Item</Button>
          </CardContent>
        </Card>
      )}

      {/* Premium Management Tab */}
      {activeTab === "premium" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premium Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { duration: "1 Month", price: 10000 },
                { duration: "3 Months", price: 30000 },
                { duration: "5 Months", price: 49000 },
              ].map((plan) => (
                <div key={plan.duration} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{plan.duration}</p>
                    <p className="text-sm text-muted-foreground">{plan.price.toLocaleString()} MMK</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rewards Management Tab */}
      {activeTab === "rewards" && (
        <Card>
          <CardHeader>
            <CardTitle>Reward Code Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm font-medium mb-2">Top 3 Weekly Reward Codes</p>
              <p className="text-xs text-muted-foreground">
                Reward codes are automatically generated for top 3 premium users weekly
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">1st Place Reward (MMK)</label>
              <Input type="number" placeholder="5000" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">2nd Place Reward (MMK)</label>
              <Input type="number" placeholder="3000" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">3rd Place Reward (MMK)</label>
              <Input type="number" placeholder="1000" />
            </div>

            <Button className="w-full">Update Rewards</Button>
          </CardContent>
        </Card>
      )}

      {/* Users Management Tab */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <Input placeholder="Search user by email or phone..." />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Phone</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Energy Core</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">user@example.com</td>
                    <td className="py-2">09123456789</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        User
                      </span>
                    </td>
                    <td className="py-2">100</td>
                    <td className="py-2">
                      <Button variant="outline" size="sm">Edit</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform Name</label>
              <Input value="Gaming Platform" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Energy Core</label>
              <Input type="number" value="100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Bonus</label>
              <Input type="number" value="200" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Game Win Reward</label>
              <Input type="number" value="5" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Game Loss Penalty</label>
              <Input type="number" value="2" />
            </div>

            <Button className="w-full">Save Settings</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
