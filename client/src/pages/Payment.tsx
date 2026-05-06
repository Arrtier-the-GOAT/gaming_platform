import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Smartphone, Copy, CheckCircle } from "lucide-react";

export default function Payment() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"kbz" | "aya" | "uab">("kbz");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleInitiatePayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // Generate payment reference
    const paymentRef = `PAY-${user?.id || 'unknown'}-${Date.now()}`;

    const paymentMethods: any = {
      kbz: {
        method: 'KBZ Pay',
        phoneNumber: '09787398133',
        name: 'Aung Han Thin',
        amount: parseFloat(amount),
        reference: paymentRef,
      },
      aya: {
        method: 'AYA Pay',
        phoneNumber: '09787398133',
        name: 'Aung Han Thin',
        amount: parseFloat(amount),
        reference: paymentRef,
      },
      uab: {
        method: 'UAB Pay',
        phoneNumber: '09787398133',
        name: 'Aung Han Thin',
        amount: parseFloat(amount),
        reference: paymentRef,
      },
    };

    setPaymentDetails(paymentMethods[selectedMethod]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>Please log in to make payments</p>
      </div>
    );
  }

  if (!user.id) {
    return (
      <div className="container mx-auto py-8">
        <p>Error: User information not available</p>
      </div>
    );
  }

  const methods = [
    {
      id: "kbz",
      name: "KBZ Pay",
      icon: "🏦",
      color: "bg-red-50 border-red-200",
      textColor: "text-red-600",
    },
    {
      id: "aya",
      name: "AYA Pay",
      icon: "📱",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-600",
    },
    {
      id: "uab",
      name: "UAB Pay",
      icon: "💳",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-600",
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Payment</h1>
        <p className="text-muted-foreground">
          Add funds to your account using KBZ Pay, AYA Pay, or UAB Pay
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (MMK)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1000"
                step="1000"
              />
              <p className="text-xs text-muted-foreground">
                Minimum: 1,000 MMK
              </p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-1 gap-3">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      selectedMethod === method.id
                        ? `${method.color} border-current`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className={`font-semibold ${method.textColor}`}>
                          {method.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fast and secure payment
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleInitiatePayment}
              disabled={!amount}
              className="w-full"
              size="lg"
            >
              Continue to Payment
            </Button>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        {paymentDetails && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Send money to:</p>
                <div className="bg-white p-4 rounded-lg space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-bold">
                        {paymentDetails.phoneNumber}
                      </p>
                      <button
                        onClick={() => copyToClipboard(paymentDetails.phoneNumber)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{paymentDetails.name}</p>
                      <button
                        onClick={() => copyToClipboard(paymentDetails.name)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-bold">{paymentDetails.amount.toLocaleString()} MMK</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Reference</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm font-bold">
                        {paymentDetails.reference}
                      </p>
                      <button
                        onClick={() => copyToClipboard(paymentDetails.reference)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                <p className="font-medium text-yellow-800 mb-1">⚠️ Important</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Include the reference number in your transfer</li>
                  <li>• Funds will be credited within 5-10 minutes</li>
                  <li>• Keep your transaction receipt for records</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPaymentDetails(null)}
              >
                Back to Payment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Your payment transactions will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
