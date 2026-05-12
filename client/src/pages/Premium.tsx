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
    description: "Starter premium package",
    price: 20000,
    pricePerDay: 667,
    features: [
      "2x leaderboard points",
      "Exclusive rewards",
      "Priority support",
      "Ad-free experience",
      "Bonus rewards",
      "Early access to new games",
      "Shop Redeem access",
      "Weekly Prize 30,000 MMK for leaderboard top 1 player",
      "MCGG MLBB match winner prize x0.5",
    ],
    popular: false,
  },
  {
    id: 2,
    duration: "3 Months",
    description: "Best value package",
    price: 50000,
    pricePerDay: 556,
    features: [
      "2x leaderboard points",
      "Exclusive rewards",
      "Priority support",
      "Ad-free experience",
      "Bonus rewards",
      "Early access to new games",
      "Monthly bonus rewards",
      "Custom profile badge",
      "Shop Redeem access",
      "Weekly Prize 35,000 MMK for leaderboard top 1 player",
      "MCGG MLBB match winner prize x2",
    ],
    popular: false,
  },
  {
    id: 3,
    duration: "5 Months",
    description: "Maximum rewards package",
    price: 130000,
    pricePerDay: 867,
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
      "Shop Redeem access",
      "Weekly Prize 40,000 MMK for leaderboard top 1 player",
      "MCGG MLBB match winner prize x3",
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
  const selectedDurationMonths =
    selectedPlanForPayment?.id === 1 ? 1 : selectedPlanForPayment?.id === 2 ? 3 : selectedPlanForPayment?.id === 3 ? 5 : 1;
  const checkoutQuote = trpc.premium.getCheckoutQuote.useQuery(
    { durationMonths: selectedDurationMonths },
    { enabled: !!user && !!selectedPlanForPayment }
  );

  const handlePurchase = (planId: number) => {
    const selectedPlanData = PREMIUM_PLANS.find(p => p.id === planId);
    if (!selectedPlanData) return;

    if (!user) {
      toast.error("Please log in first");
      return;
    }

    // No balance check required - user can purchase premium anytime
    setSelectedPlan(planId);
    setSelectedPlanForPayment(selectedPlanData);
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
        durationMonths: selectedDurationMonths,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background py-6 md:py-12">
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
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            Referral invite နဲ့ register ဝင်ထားသူတွေက first premium purchase မှာ 10% discount ရနိုင်ပါတယ်
          </div>
        </div>

        {/* Benefits Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-12">
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-2 md:pb-3">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 mb-2" />
              <CardTitle className="text-sm md:text-lg">2-3x Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">Earn more leaderboard points per game</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-2 md:pb-3">
              <Gift className="w-5 h-5 md:w-6 md:h-6 text-blue-400 mb-2" />
              <CardTitle className="text-sm md:text-lg">Exclusive Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">Access premium-only rewards and items</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-2 md:pb-3">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-green-400 mb-2" />
              <CardTitle className="text-sm md:text-lg">VIP Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">Get VIP badge and special recognition</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-2 md:pb-3">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-pink-400 mb-2" />
              <CardTitle className="text-sm md:text-lg">Priority Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">Get faster support and assistance</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Info */}
        <div className="bg-card border border-primary/20 rounded-lg p-4 md:p-6 text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-2">Payment Method</p>
          <p className="text-lg md:text-xl font-semibold text-primary">KBZ Pay / AYA Pay</p>
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
                    ? "border-primary border-2 md:scale-105 bg-card"
                    : "border-border"
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
                    disabled={userProfile.data?.isPremium}
                    className={`w-full ${
                      plan.popular
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <section className="rounded-xl border border-primary/20 bg-card p-5 md:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">
              Common answers about premium plans, upgrades, and billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h3 className="font-semibold">Can I cancel my subscription anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes. Premium stays active until your current billing period ends.
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h3 className="font-semibold">What happens when my subscription expires?</h3>
              <p className="text-sm text-muted-foreground">
                Your account returns to free tier and premium benefits are disabled.
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h3 className="font-semibold">Can I upgrade my plan?</h3>
              <p className="text-sm text-muted-foreground">
                Yes. You can upgrade anytime and the plan change is applied to your account.
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h3 className="font-semibold">Do I get a refund if I cancel?</h3>
              <p className="text-sm text-muted-foreground">
                Refunds are not available for used subscription time.
              </p>
            </div>
          </div>
        </section>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlanForPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-primary/20 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-7 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Premium Checkout</p>
                  <h2 className="text-2xl font-bold">Payment Details</h2>
                  <p className="text-sm text-muted-foreground">Complete the steps below to activate your premium plan.</p>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Selected Plan</p>
                    <p className="font-semibold">{selectedPlanForPayment.duration}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-sm text-muted-foreground">Amount to Pay</p>
                    <div className="text-right">
                      {checkoutQuote.data?.hasReferralDiscount && (
                        <p className="text-sm text-muted-foreground line-through">
                          {checkoutQuote.data.basePrice.toLocaleString()} MMK
                        </p>
                      )}
                      <p className="text-3xl font-bold text-primary">
                        {(checkoutQuote.data?.finalPrice ?? selectedPlanForPayment.price).toLocaleString()} MMK
                      </p>
                    </div>
                  </div>
                  {checkoutQuote.data?.hasReferralDiscount && (
                    <p className="text-sm text-green-600 font-medium">
                      Referral discount applied: -{checkoutQuote.data.discountAmount.toLocaleString()} MMK ({checkoutQuote.data.discountPercent}%)
                    </p>
                  )}
                  {checkoutQuote.data?.abuseBlocked && (
                    <p className="text-sm text-amber-600 font-medium">
                      Referral discount is blocked because this account was flagged by same-device abuse detection.
                    </p>
                  )}
                </div>

                {!paymentConfirmed ? (
                  <>
                    <div className="rounded-lg border border-primary/20 p-4 space-y-4">
                      <h3 className="font-semibold">Step 1: Send Payment To</h3>
                      <div className="space-y-3">
                        <div className="rounded-md border border-primary/15 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Account Name</p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{PAYMENT_DETAILS.name}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(PAYMENT_DETAILS.name);
                                toast.success("Name copied!");
                              }}
                              className="text-xs font-semibold text-primary hover:opacity-80"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div className="rounded-md border border-primary/15 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{PAYMENT_DETAILS.phoneNumber}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(PAYMENT_DETAILS.phoneNumber);
                                toast.success("Phone number copied!");
                              }}
                              className="text-xs font-semibold text-primary hover:opacity-80"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">
                        After transfer, click <span className="font-semibold text-foreground">I've Sent Payment</span> and enter your 5-digit transaction ID.
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
                        className="flex-1 px-4 py-2.5 border border-primary/30 rounded-lg hover:bg-primary/5 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setPaymentConfirmed(true)}
                        className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium"
                      >
                        I've Sent Payment
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-primary/20 p-4 space-y-4">
                      <h3 className="font-semibold">Step 2: Verify Transaction</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter the 5-digit transaction ID from your bank transfer.
                      </p>
                      <input
                        type="text"
                        placeholder="12345"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        maxLength={5}
                        className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl font-bold tracking-widest bg-background"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setPaymentConfirmed(false);
                          setTransactionId("");
                        }}
                        className="flex-1 px-4 py-2.5 border border-primary/30 rounded-lg hover:bg-primary/5 font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConfirmPayment}
                        disabled={transactionId.length !== 5 || purchasePremium.isPending}
                        className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
