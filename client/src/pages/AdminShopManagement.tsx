import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, ShoppingCart } from "lucide-react";

export default function AdminShopManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    energyCorePrice: 0,
    game: "",
    category: "",
  });

  // Queries and mutations
  const shopItems = trpc.admin.getShopItems.useQuery();
  const createMutation = trpc.admin.createShopItem.useMutation();
  const updateMutation = trpc.admin.updateShopItem.useMutation();
  const deleteMutation = trpc.admin.deleteShopItem.useMutation();

  const handleCreate = async () => {
    if (!formData.name || !formData.game || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success("Shop item created successfully");
      setFormData({
        name: "",
        description: "",
        energyCorePrice: 0,
        game: "",
        category: "",
      });
      setIsCreateOpen(false);
      shopItems.refetch();
    } catch (error) {
      toast.error("Failed to create shop item");
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await updateMutation.mutateAsync({
        itemId: editingItem.id,
        ...formData,
      });
      toast.success("Shop item updated successfully");
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        energyCorePrice: 0,
        game: "",
        category: "",
      });
      shopItems.refetch();
    } catch (error) {
      toast.error("Failed to update shop item");
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteMutation.mutateAsync({ itemId });
      toast.success("Shop item deleted successfully");
      shopItems.refetch();
    } catch (error) {
      toast.error("Failed to delete shop item");
    }
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      energyCorePrice: item.energyCorePrice,
      game: item.game,
      category: item.category,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Shop Management</h2>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Shop Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Item Name *</label>
                <Input
                  placeholder="e.g., MLBB Diamond"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Description</label>
                <Input
                  placeholder="Item description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">Energy Core Price *</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.energyCorePrice}
                    onChange={(e) => setFormData({ ...formData, energyCorePrice: parseInt(e.target.value) || 0 })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Game *</label>
                  <Input
                    placeholder="MLBB"
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Category *</label>
                <Input
                  placeholder="e.g., In-Game Currency"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? "Creating..." : "Create Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Shop Items ({shopItems.data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {shopItems.isLoading ? (
            <p className="text-center py-8 text-slate-400">Loading shop items...</p>
          ) : shopItems.data && shopItems.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Game</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Price (EC)</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shopItems.data.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white">{item.name}</td>
                      <td className="py-3 px-4 text-slate-300">{item.game}</td>
                      <td className="py-3 px-4 text-slate-300">{item.category}</td>
                      <td className="py-3 px-4 text-green-400 font-semibold">{item.energyCorePrice}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                        }`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 text-slate-300"
                                onClick={() => openEditDialog(item)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">Edit Shop Item</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-slate-300">Item Name</label>
                                  <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-slate-300">Description</label>
                                  <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white mt-1"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-slate-300">Energy Core Price</label>
                                    <Input
                                      type="number"
                                      value={formData.energyCorePrice}
                                      onChange={(e) => setFormData({ ...formData, energyCorePrice: parseInt(e.target.value) || 0 })}
                                      className="bg-slate-700 border-slate-600 text-white mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-300">Game</label>
                                    <Input
                                      value={formData.game}
                                      onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                                      className="bg-slate-700 border-slate-600 text-white mt-1"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-slate-300">Category</label>
                                  <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white mt-1"
                                  />
                                </div>
                                <Button
                                  onClick={handleUpdate}
                                  disabled={updateMutation.isPending}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  {updateMutation.isPending ? "Updating..." : "Update Item"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-900"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-slate-400">No shop items found. Create one to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
