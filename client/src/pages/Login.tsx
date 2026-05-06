import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [referralCode, setReferralCode] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Gaming Platform</CardTitle>
          <CardDescription>Sign in to play games and earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="referral">Referral Code (Optional)</Label>
            <Input
              id="referral"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If you have a referral code, enter it to get 200 bonus energy core
            </p>
          </div>

          <Button
            onClick={() => {
              if (referralCode) {
                // Store referral code in session storage for sign-up
                sessionStorage.setItem("referralCode", referralCode);
              }
              window.location.href = loginUrl;
            }}
            className="w-full"
            size="lg"
          >
            Sign In with Manus
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Don't have an account?</p>
            <p>Sign in to create one automatically</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Welcome Bonus!</p>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
              <li>✓ 100 Energy Core on sign up</li>
              <li>✓ Unique referral code for your account</li>
              <li>✓ 200 bonus Energy Core for each referral</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
