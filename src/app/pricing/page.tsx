"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  basePrice: number;
  discountedPrice?: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscribedModules, setSubscribedModules] = useState<string[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, [session]);

  const loadSubscriptions = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      if (data.subscriptions) {
        setSubscribedModules(data.subscriptions.map((s: any) => s.module_id));
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const modules: Module[] = [
    {
      id: "construction",
      name: "Construction Estimator",
      description: "AI-powered project estimation with building code compliance",
      icon: "🏗️",
      features: [
        "Professional construction estimates",
        "Multi-trade cost breakdown",
        "Canadian provincial regulations",
        "Three-tier pricing options",
        "CSI MasterFormat line items",
        "Payment schedules & terms",
        "AI chat assistant"
      ],
      basePrice: 99,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: "trucking",
      name: "Fleet Optimizer",
      description: "Route optimization and fuel efficiency tracking",
      icon: "🚛",
      features: [
        "Route optimization",
        "Fuel cost tracking",
        "Maintenance scheduling",
        "Driver analytics",
        "Fleet performance reports",
        "Cost reduction strategies",
        "AI chat assistant"
      ],
      basePrice: 99,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: "restaurant",
      name: "Restaurant Manager",
      description: "Inventory optimization and waste reduction",
      icon: "🍽️",
      features: [
        "Inventory management",
        "Waste reduction analysis",
        "Menu optimization",
        "Supplier analysis",
        "Food cost tracking",
        "Profitability reports",
        "AI chat assistant"
      ],
      basePrice: 99,
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  const hasSubscription = subscribedModules.length > 0;
  const additionalModuleDiscount = 0.25; // 25% off additional modules

  const getModulePrice = (moduleId: string) => {
    if (subscribedModules.includes(moduleId)) {
      return null; // Already subscribed
    }
    if (hasSubscription && !subscribedModules.includes(moduleId)) {
      // Additional module - apply discount
      const module = modules.find(m => m.id === moduleId);
      return module ? Math.round(module.basePrice * (1 - additionalModuleDiscount)) : null;
    }
    // First module - full price
    const module = modules.find(m => m.id === moduleId);
    return module?.basePrice || null;
  };

  const startDemo = (moduleId: string) => {
    setIsDemoMode(prev => ({ ...prev, [moduleId]: true }));
    // Store demo start time
    const demoData = {
      moduleId,
      startTime: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    localStorage.setItem(`demo_${moduleId}`, JSON.stringify(demoData));
    // Redirect to module with demo mode
    window.location.href = `/dashboard/modules/${moduleId}?demo=true`;
  };

  const purchaseModule = async (moduleId: string) => {
    if (!session?.user) {
      router.push('/auth/signin?redirect=/pricing');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
      });

      const data = await response.json();

      if (data.error) {
        alert(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  BizOptimize Pro
                </h1>
                <p className="text-sm text-gray-600">Choose Your Modules</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Choose Your Optimization Modules
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Select the modules that fit your business. Try a free demo before you buy, and save 25% on additional modules!
          </p>
          {hasSubscription && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
              <span>✓</span>
              <span>You have {subscribedModules.length} active subscription{subscribedModules.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Pricing Info Banner */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="text-lg font-bold mb-2">Flexible Pricing</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• <strong>First Module:</strong> $99/month (full price)</li>
                  <li>• <strong>Additional Modules:</strong> $74/month (25% discount)</li>
                  <li>• <strong>Free Demo:</strong> Try any module for 15 minutes before purchasing</li>
                  <li>• <strong>Cancel Anytime:</strong> No long-term contracts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {modules.map((module) => {
            const isSubscribed = subscribedModules.includes(module.id);
            const price = getModulePrice(module.id);
            const showDiscount = hasSubscription && !isSubscribed && price !== null;

            return (
              <Card
                key={module.id}
                className={`border-2 ${module.borderColor} hover:shadow-xl transition-all duration-300 h-full flex flex-col`}
              >
                <CardHeader className={`${module.bgColor} pb-4`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-3xl shadow-lg`}>
                      {module.icon}
                    </div>
                    {isSubscribed && (
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">{module.name}</CardTitle>
                  <CardDescription className="text-base">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Features List */}
                  <div className="mb-6 flex-1">
                    <h4 className="font-semibold mb-3 text-sm text-gray-700">Features Included:</h4>
                    <ul className="space-y-2">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6 pt-4 border-t">
                    {isSubscribed ? (
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Current Subscription</div>
                        <div className="text-2xl font-bold text-green-600">Active</div>
                        <Link href={`/dashboard/modules/${module.id}`}>
                          <Button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                            Open Module →
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center">
                        {showDiscount && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-500 line-through">${module.basePrice}/mo</span>
                            <Badge className="ml-2 bg-green-500">25% Off</Badge>
                          </div>
                        )}
                        <div className="text-3xl font-bold mb-1">
                          ${price || module.basePrice}
                          <span className="text-lg text-gray-500 font-normal">/mo</span>
                        </div>
                        {showDiscount && (
                          <div className="text-xs text-green-600 mb-2">
                            Additional module discount applied!
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isSubscribed && (
                    <div className="space-y-3">
                      <Button
                        onClick={() => startDemo(module.id)}
                        variant="outline"
                        className="w-full border-2 hover:bg-gray-50"
                      >
                        🎬 Try Free Demo (15 min)
                      </Button>
                      <Button
                        onClick={() => purchaseModule(module.id)}
                        disabled={loading || !session}
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      >
                        {!session ? 'Sign In to Subscribe' : loading ? 'Processing...' : '💳 Subscribe Now'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How does the demo work?</h4>
              <p className="text-sm text-gray-600">
                Click "Try Free Demo" on any module to access it for 15 minutes. You'll have full access to all features during the demo period. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What's the discount for additional modules?</h4>
              <p className="text-sm text-gray-600">
                When you subscribe to your first module at $99/month, any additional modules are only $74/month (25% discount). This applies to all modules you add.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do I need to subscribe to all modules?</h4>
              <p className="text-sm text-gray-600">
                No, you only pay for the modules you need. Start with one module and add more as your business grows.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

