"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TRADES, getPurchasedTrades, purchaseTrade, type Trade } from "@/lib/trade-access";

function PricingPageContent() {
  const searchParams = useSearchParams();
  const selectedTrade = searchParams?.get('trade') || '';
  const [purchased, setPurchased] = useState<Trade[]>([]);

  useEffect(() => {
    setPurchased(getPurchasedTrades());
  }, []);

  const handlePurchase = (trade: Trade) => {
    // In production, this would integrate with Stripe
    // For demo, we'll just add it to sessionStorage
    purchaseTrade(trade);
    setPurchased(getPurchasedTrades());
    alert(`${TRADES[trade].name} has been added to your account!`);
    window.location.href = '/dashboard';
  };

  const individualTrades = Object.values(TRADES).filter(t => t.trade !== 'construction');
  const fullConstruction = TRADES.construction;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Trade Estimator Pricing</h1>
              <p className="text-sm text-gray-600">Purchase access to trade-specific estimators</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Full Construction Package */}
          <Card className="mb-8 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-2xl">Full Construction Package</CardTitle>
              <CardDescription>
                Access to ALL trade estimators at a discounted price
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-4xl font-bold text-blue-600">${fullConstruction.price}/month</div>
                  <div className="text-sm text-gray-600">All {individualTrades.length} trades included</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 line-through">
                    ${individualTrades.reduce((sum, t) => sum + t.price, 0)}/month
                  </div>
                  <div className="text-green-600 font-semibold">
                    Save ${individualTrades.reduce((sum, t) => sum + t.price, 0) - fullConstruction.price}/month
                  </div>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handlePurchase('construction')}
                disabled={purchased.includes('construction')}
              >
                {purchased.includes('construction') ? '✓ Already Purchased' : 'Purchase Full Package'}
              </Button>
            </CardContent>
          </Card>

          {/* Individual Trades */}
          <div>
            <h2 className="text-xl font-bold mb-4">Individual Trade Estimators</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {individualTrades.map((trade) => {
                const isPurchased = purchased.includes(trade.trade) || purchased.includes('construction');
                return (
                  <Card key={trade.trade} className={isPurchased ? 'border-green-500' : ''}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{trade.icon}</span>
                        <CardTitle className="text-lg">{trade.name}</CardTitle>
                      </div>
                      <CardDescription>{trade.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-blue-600">${trade.price}</div>
                        <div className="text-sm text-gray-600">per month</div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(trade.trade)}
                        disabled={isPurchased}
                        variant={isPurchased ? "outline" : "default"}
                      >
                        {isPurchased ? '✓ Purchased' : 'Purchase Access'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Info Section */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">How It Works</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Purchase access to specific trade estimators you need</li>
                <li>• Each trade estimator includes detailed line-item breakdowns</li>
                <li>• AI-powered code compliance and pricing validation</li>
                <li>• Province-specific building code verification</li>
                <li>• Cancel anytime - no long-term contracts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">💰</div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  );
}

