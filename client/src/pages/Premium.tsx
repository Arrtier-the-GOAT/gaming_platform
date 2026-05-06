import { useState } from "react";
import { Sparkles, Zap, Gift, Trophy, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PAYMENT_DETAILS = {
  name: "Aung Han Thin",
  phoneNumber: "09787398133",
};

const PREMIUM_PLANS = [
  {
    id: 1,
    duration: "1 Month",
    description: "Try premium features",
    price: 10000,
    pricePerDay: 333,
    features: [
      "2x leaderboard points",
      "Exclusive rewards",
      "Priority support",
      "Ad-free experience",
      "Bonus rewards",
      "Early access to new games",
    ],
    popular: false,
  },
  {
    id: 2,
    duration: "3 Months",
    description: "Best value",
    price: 30000,
    pricePerDay: 333,
    features: [
      "2x leaderboard points",
      "Exclusive rewards",
      "Priority support",
      "Ad-free experience",
      "Bonus rewards",
      "Early access to new games",
      "Monthly bonus rewards",
      "Custom profile badge",
    ],
    popular: false,
  },
  {
    id: 3,
    duration: "5 Months",
    description: "Best savings",
    price: 70000,
    pricePerDay: 467,
    features: [
      "3x leaderboard points",
      "VIP status",
      "All exclusive rewards",
      "24/7 priority support",
      "Bonus rewards",
      "Early access to new games",
      "Monthly bonus rewards",
      "Custom profile badge",
      "20% discount on next purchase",
    ],
    popular: true,
  },
];

export default function Premium() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<typeof PREMIUM_PLANS[0] | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const userProfile = trpc.user.getProfile.useQuery();
  const purchasePremium = trpc.premium.purchasePremium.useMutation();

  const handlePurchase = (planId: number) => {
    const selectedPlanData = PREMIUM_PLANS.find(p => p.id === planId);
    if (!selectedPlanData) return;

    if (!user) {
      toast.error("Please log in first");
      return;
    }

    let finalPrice = selectedPlanData.price;
    if (userProfile.data?.isPremium && userProfile.data?.premiumExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(userProfile.data.premiumExpiresAt);
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft >= 140) {
        finalPrice = Math.floor(selectedPlanData.price * 0.8);
      }
    }

    // No balance check required - user can purchase premium anytime
    setSelectedPlanForPayment({...selectedPlanData, price: finalPrice});
    setShowPaymentModal(true);
    setPaymentConfirmed(false);
    setTransactionId("");
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlanForPayment || transactionId.length !== 5) {
      toast.error("Please enter a valid 5-digit transaction ID");
      return;
    }

    try {
      await purchasePremium.mutateAsync({
        durationMonths: selectedPlanForPayment.id === 1 ? 1 : selectedPlanForPayment.id === 2 ? 3 : 5,
        paymentMethod: "kbz_pay",
        transactionId: transactionId,
      });
      
      toast.success("Payment request submitted! Waiting for admin approval.");
      setShowPaymentModal(false);
      setSelectedPlanForPayment(null);
      setPaymentConfirmed(false);
      setTransactionId("");
      userProfile.refetch();
    } catch (error: any) {
      toast.error(error.message || "Purchase failed");
    }
  };

  const isPremium = userProfile.data?.isPremium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 py-6 md:py-12">
      <div className="container mx-auto px-3 md:px-4 space-y-6 md:space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
            <h1 className="text-2xl md:text-4xl font-bold">Premium Membership</h1>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
          </div>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock exclusive features and boost your gaming experience with premium benefits
          </p>
          {isPremium && (
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
              ✓ You are a premium member
            </div>
          )}
        </div>

        {/* Benefits Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-12">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2 md:pb-3">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mb-2" />
              <CardTitle className="text-sm md:text-lg">2-3x Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">Earn more leaderboard points per game</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2 md:pb-3">
              <Gift className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mb-2" />
              <CardTitle className="text-sm md:text-lg">Exclusive Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">Access premium-only rewards and items</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2 md:pb-3">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-green-500 mb-2" />
              <CardTitle className="text-sm md:text-lg">VIP Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">Get VIP badge and special recognition</p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-pink-50">
            <CardHeader className="pb-2 md:pb-3">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-pink-500 mb-2" />
              <CardTitle className="text-sm md:text-lg">Priority Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">Get faster support and assistance</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Info */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-4 md:p-6 text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-2">Payment Method</p>
          <p className="text-lg md:text-xl font-semibold text-purple-600">KBZ Pay / AYA Pay</p>
          <p className="text-sm text-muted-foreground mt-2">Click 'Upgrade Now' to proceed with payment</p>
        </div>

        {/* Premium Plans */}
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Choose Your Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
                      <span className="text-muted-foreground">MMK</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ~{plan.pricePerDay.toLocaleString()} MMK per day
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
                    disabled={(userProfile.data?.mykBalance || 0) < plan.price && !userProfile.data?.isPremium}
                    className={`w-full ${
                      plan.popular
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Upgrade Now
                  </Button>
                  {(userProfile.data?.mykBalance || 0) < plan.price && !userProfile.data?.isPremium && (
                    <p className="text-xs text-red-600 text-center">
                      You need {(plan.price - (userProfile.data?.mykBalance || 0)).toLocaleString()} more MMK
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

        {/* Payment Modal */}
        {showPaymentModal && selectedPlanForPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plan</p>
                    <p className="text-lg font-semibold">{selectedPlanForPayment.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedPlanForPayment.price.toLocaleString()} MMK</p>
                  </div>
                </div>

                {!paymentConfirmed ? (
                  <>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-purple-900">Send Payment To:</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border">
                            <p className="font-medium">{PAYMENT_DETAILS.name}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(PAYMENT_DETAILS.name);
                                toast.success("Name copied!");
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border">
                            <p className="font-medium">{PAYMENT_DETAILS.phoneNumber}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(PAYMENT_DETAILS.phoneNumber);
                                toast.success("Phone number copied!");
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        📝 After payment, click "I've Sent Payment" to enter your transaction ID for verification.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowPaymentModal(false);
                          setSelectedPlanForPayment(null);
                          setPaymentConfirmed(false);
                          setTransactionId("");
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setPaymentConfirmed(true)}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                      >
                        I've Sent Payment
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-green-900">Enter Transaction ID</h3>
                      <p className="text-sm text-green-700">Please enter the 5-digit transaction ID from your bank transfer to verify the payment.</p>
                      <input
                        type="text"
                        placeholder="e.g., 12345"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        maxLength={5}
                        className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl font-bold tracking-widest"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setPaymentConfirmed(false);
                          setTransactionId("");
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConfirmPayment}
                        disabled={transactionId.length !== 5 || purchasePremium.isPending}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {purchasePremium.isPending ? "Verifying..." : "Verify & Activate"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
