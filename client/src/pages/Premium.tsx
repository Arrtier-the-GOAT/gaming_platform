import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Premium() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Premium Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Premium plans coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
