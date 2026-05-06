import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShoppingCart, Zap, Package } from "lucide-react";

export default function Shop() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [gameId, setGameId] = useState("");
  const [inGameName, setInGameName] = useState("");
  const [serverId, setServerId] = useState("");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const shopItems = trpc.shop.getItems.useQuery();
  const userProfile = trpc.user.getProfile.useQuery();
  const purchaseItem = trpc.shop.purchaseItem.useMutation();

  const games = Array.from(new Set(shopItems.data?.map(item => item.game) || []));
  const filteredItems = selectedGame 
    ? shopItems.data?.filter(item => item.game === selectedGame)
    : shopItems.data;

  const handlePurchase = (itemId: number, cost: number) => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    if ((userProfile.data?.energyCoreBalance || 0) < cost) {
      toast.error("Insufficient energy core balance");
      return;
    }

    if (!gameId || !inGameName) {
      toast.error("Please fill in game ID and in-game name");
      return;
    }

    purchaseItem.mutate(
      {
        shopItemId: itemId,
        gameId,
        inGameName,
        serverId: serverId || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Purchase successful!");
          setGameId("");
          setInGameName("");
          setServerId("");
          setSelectedItem(null);
          userProfile.refetch();
        },
        onError: (error) => {
          toast.error(error.message || "Purchase failed");
        },
      }
    );
  };

  if (shopItems.isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const selectedItemData = shopItems.data?.find(i => i.id === selectedItem);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Shop</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              Browse and purchase game currency
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 px-6 py-3 rounded-lg border border-blue-200 dark:border-blue-700 w-full md:w-auto justify-center md:justify-end">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="font-bold text-2xl text-blue-600 dark:text-blue-300">{userProfile.data?.energyCoreBalance || 0}</span>
            <span className="text-sm text-muted-foreground">EC</span>
          </div>
        </div>

        {/* Game Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedGame === null ? "default" : "outline"}
            onClick={() => setSelectedGame(null)}
            className="rounded-full"
          >
            All Games
          </Button>
          {games.map(game => (
            <Button
              key={game}
              variant={selectedGame === game ? "default" : "outline"}
              onClick={() => setSelectedGame(game)}
              className="rounded-full"
            >
              {game}
            </Button>
          ))}
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredItems?.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedItem === item.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:scale-105"
              }`}
              onClick={() => setSelectedItem(item.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{item.game}</CardDescription>
                  </div>
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Price:</span>
                  <p className="text-lg font-bold text-blue-600 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    {item.energyCorePrice}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems?.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No items available</h3>
            <p className="text-muted-foreground">Try selecting a different game</p>
          </div>
        )}

        {/* Purchase Form */}
        {selectedItem && selectedItemData && (
          <Card className="border-2 border-blue-500 sticky bottom-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Complete Your Purchase: {selectedItemData.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Game ID</label>
                  <Input
                    placeholder="Enter your game ID"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">In-Game Name</label>
                  <Input
                    placeholder="Enter your in-game name"
                    value={inGameName}
                    onChange={(e) => setInGameName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Server ID (optional)</label>
                  <Input
                    placeholder="Enter server ID"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost:</p>
                  <p className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    {selectedItemData.energyCorePrice} EC
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handlePurchase(selectedItemData.id, selectedItemData.energyCorePrice);
                    }}
                    disabled={purchaseItem.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {purchaseItem.isPending ? "Processing..." : "Confirm Purchase"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedItem(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shop Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{shopItems.data?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Available for purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Games</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{games.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Supported games</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{userProfile.data?.energyCoreBalance || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Energy Core</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
