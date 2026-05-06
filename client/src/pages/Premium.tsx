import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, Check, Zap, Gift, Trophy, Users } from "lucide-react";
import { useState } from "react";

const PREMIUM_PLANS = [
  {
    id: 1,
    duration: "1 Month",
    price: 10000,
    pricePerDay: 333,
    description: "Try premium features",
    features: [
      "2x leaderboard points",
      "Exclusive rewards",
      "Priority support",
      "Ad-free experience",
    ],
    popular: false,
  },
  {
    id: 2,
    duration: "3 Months",
    price: 30000,
    pricePerDay: 333,
    description: "Best value",
    features: [
      "2x leaderboard points",
      "Exclusive rewards",
      "Priority support",
      "Ad-free experience",
      "Bonus 500 EC",
      "Early access to new games",
    ],
    popular: true,
  },
  {
    id: 3,
    duration: "1 Year",
    price: 100000,
    pricePerDay: 274,
    description: "Maximum savings",
    features: [
      "3x leaderboard points",
      "VIP status",
      "All exclusive rewards",
      "24/7 priority support",
      "Bonus 2000 EC",
      "Early access to new games",
      "Monthly bonus rewards",
      "Custom profile badge",
    ],
    popular: false,
  },
];

export default function Premium() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const userProfile = trpc.user.getProfile.useQuery();
  const purchasePremium = trpc.premium.purchasePremium.useMutation();

  const handlePurchase = (planId: number) => {
    const selectedPlanData = PREMIUM_PLANS.find(p => p.id === planId);
    if (!selectedPlanData) return;

    if (!user) {
      toast.error("Please log in first");
      return;
    }

    if ((userProfile.data?.energyCoreBalance || 0) < selectedPlanData.price) {
      toast.error(`Insufficient balance. You need ${selectedPlanData.price} EC`);
      return;
    }

    const plan = PREMIUM_PLANS.find(p => p.id === planId);
    if (!plan) return;

    const durationMonths = planId === 1 ? 1 : planId === 2 ? 3 : 12;

    purchasePremium.mutate(
      { durationMonths, paymentMethod: "kbz_pay" },
      {
        onSuccess: () => {
          toast.success(`Premium activated for ${selectedPlanData.duration}!`);
          userProfile.refetch();
          setSelectedPlan(null);
        },
        onError: (error: any) => {
          toast.error(error.message || "Purchase failed");
        },
      }
    );
  };

  const isPremium = userProfile.data?.isPremium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 py-12">
      <div className="container mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">Premium Membership</h1>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock exclusive features and boost your gaming experience with premium benefits
          </p>
          {isPremium && (
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
              ✓ You are a premium member
            </div>
          )}
        </div>

        {/* Benefits Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <Zap className="w-6 h-6 text-yellow-500 mb-2" />
              <CardTitle className="text-lg">2-3x Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Earn more leaderboard points per game</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <Gift className="w-6 h-6 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Exclusive Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Access premium-only rewards and items</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <Trophy className="w-6 h-6 text-green-500 mb-2" />
              <CardTitle className="text-lg">VIP Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Get VIP badge and special recognition</p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-pink-50">
            <CardHeader className="pb-3">
              <Users className="w-6 h-6 text-pink-500 mb-2" />
              <CardTitle className="text-lg">Priority Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Get faster support and assistance</p>
            </CardContent>
          </Card>
        </div>

        {/* Your Balance */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-2">Your Energy Core Balance</p>
          <p className="text-4xl font-bold text-purple-600 flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            {userProfile.data?.energyCoreBalance || 0} EC
          </p>
        </div>

        {/* Premium Plans */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Choose Your Plan</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {PREMIUM_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all hover:shadow-xl ${
                  plan.popular
                    ? "border-purple-500 border-2 md:scale-105 bg-gradient-to-br from-purple-50 to-blue-50"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className={plan.popular ? "pt-8" : ""}>
                  <CardTitle className="text-2xl">{plan.duration}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-purple-600">{plan.price.toLocaleString()}</span>
                      <span className="text-muted-foreground">EC</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ~{plan.pricePerDay.toLocaleString()} EC per day
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchasePremium.isPending || (userProfile.data?.energyCoreBalance || 0) < plan.price || isPremium}
                    className={`w-full h-11 text-base font-semibold ${
                      plan.popular
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {purchasePremium.isPending ? "Processing..." : "Upgrade Now"}
                  </Button>

                  {(userProfile.data?.energyCoreBalance || 0) < plan.price && (
                    <p className="text-xs text-red-600 text-center">
                      You need {(plan.price - (userProfile.data?.energyCoreBalance || 0)).toLocaleString()} more EC
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your premium benefits will remain active until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What happens when my subscription expires?</h3>
              <p className="text-muted-foreground">
                Your account will revert to free tier. You'll still have access to all your games and data, but premium benefits will be disabled.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I upgrade my plan?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade to a longer plan at any time. The difference will be calculated and applied to your account.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Do I get a refund if I cancel?</h3>
              <p className="text-muted-foreground">
                Refunds are not available for used subscription time. However, you can continue using premium features until your billing period ends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
