import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Send, UserPlus, Trophy } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const MOCK_FRIENDS = [
  { id: 1, name: "Player One", level: 15, points: 2500, status: "online" },
  { id: 2, name: "Player Two", level: 12, points: 1800, status: "offline" },
  { id: 3, name: "Player Three", level: 18, points: 3200, status: "online" },
];

const MOCK_FRIEND_REQUESTS = [
  { id: 1, name: "New Player", level: 5 },
  { id: 2, name: "Gaming Master", level: 25 },
];

const MOCK_MESSAGES = [
  { id: 1, sender: "Player One", message: "Great game!", timestamp: "2 min ago" },
  { id: 2, sender: "You", message: "Thanks! Want to play again?", timestamp: "1 min ago" },
];

export default function Social() {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  
  // Use real data from API when available, fallback to mock data
  const friends = MOCK_FRIENDS; // Replace with: trpc.social.getFriends.useQuery()?.data || MOCK_FRIENDS
  const friendRequests = MOCK_FRIEND_REQUESTS; // Replace with: trpc.social.getFriendRequests.useQuery()?.data || MOCK_FRIEND_REQUESTS

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Social</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Friends List */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Friends</CardTitle>
                  <CardDescription>{friends.length} friends online</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              friend.status === "online" ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          <span className="font-medium">{friend.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Level {friend.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{friend.points}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Add Friend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add Friend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="Search player username"
                      className="h-10"
                    />
                  </div>
                  <Button className="w-full" size="lg">
                    Search
                  </Button>

                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">Suggested Friends</h4>
                    {[
                      { name: "Pro Gamer", level: 20 },
                      { name: "Casual Player", level: 8 },
                    ].map((player, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{player.name}</p>
                          <p className="text-xs text-muted-foreground">Level {player.level}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Friend Requests</CardTitle>
                  <CardDescription>{friendRequests.length} pending requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-muted-foreground">Level {request.level}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                      <Button size="sm">Accept</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Friends List */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Friends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedFriend === friend.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            friend.status === "online" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm font-medium">{friend.name}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="md:col-span-2 flex flex-col h-96">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">
                    {selectedFriend
                      ? MOCK_FRIENDS.find((f) => f.id === selectedFriend)?.name
                      : "Select a friend"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedFriend && MOCK_MESSAGES.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === "You"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                {selectedFriend && (
                  <div className="border-t p-4 flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="h-10"
                    />
                    <Button size="sm" className="px-4">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
