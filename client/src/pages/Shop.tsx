import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShoppingCart, Zap } from "lucide-react";

export default function Shop() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [gameId, setGameId] = useState("");
  const [inGameName, setInGameName] = useState("");
  const [serverId, setServerId] = useState("");

  const shopItems = trpc.shop.getItems.useQuery();
  const userProfile = trpc.user.getProfile.useQuery();
  const purchaseItem = trpc.shop.purchaseItem.useMutation();

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
        <p>Loading shop...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shop</h1>
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          <span className="font-bold text-lg">{userProfile.data?.energyCoreBalance || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopItems.data?.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition ${
              selectedItem === item.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedItem(item.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{item.name}</span>
                <ShoppingCart className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-lg font-bold text-blue-600">
                {item.energyCorePrice} Energy Core
              </p>
              <p className="text-xs text-muted-foreground">Game: {item.game}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedItem && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <label className="text-sm font-medium">Server ID (if applicable)</label>
              <Input
                placeholder="Enter server ID (optional)"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const item = shopItems.data?.find((i) => i.id === selectedItem);
                  if (item) {
                    handlePurchase(item.id, item.energyCorePrice);
                  }
                }}
                disabled={purchaseItem.isPending}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
