import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Calendar, Trophy } from "lucide-react";

export default function Events() {
  const { user } = useAuth();
  const events = trpc.event.getAll.useQuery();

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>Please log in to view events</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground">
          Join events to earn rewards and compete with other players
        </p>
      </div>



      {/* Events List */}
      <div className="space-y-4">
        {events.isLoading ? (
          <p>Loading events...</p>
        ) : events.data && events.data.length > 0 ? (
          events.data.map((event) => {
            return (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span>{event.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No events available at the moment</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
