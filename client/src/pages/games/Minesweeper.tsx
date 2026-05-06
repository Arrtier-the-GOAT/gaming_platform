import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function Minesweeper() {
  const recordResult = trpc.game.recordResult.useMutation();

  const handleQuit = () => {
    recordResult.mutate({
      gameName: "Minesweeper",
      won: false,
      points: 0,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Minesweeper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Minesweeper game coming soon...</p>
          <Button onClick={handleQuit} variant="destructive">
            Quit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
