import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GameLobby() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Games</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Games coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
