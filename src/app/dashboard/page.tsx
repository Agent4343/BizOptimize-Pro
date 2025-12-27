"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPurchasedTradesWithDetails, getAvailableTrades, type TradeAccess } from "@/lib/trade-access";

export default function DashboardPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [purchasedTrades, setPurchasedTrades] = useState<TradeAccess[]>([]);
  const [availableTrades, setAvailableTrades] = useState<TradeAccess[]>([]);

  useEffect(() => {
    // Load purchased and available trades
    setPurchasedTrades(getPurchasedTradesWithDetails());
    setAvailableTrades(getAvailableTrades());
  }, []);

  // Business optimization modules (always available)
  const businessModules = [
    {
      id: "trucking",
      name: "Fleet Optimizer",
      description: "Route optimization and fuel efficiency tracking",
      icon: "🚛",
      savings: "Reduce fuel costs by 18-30%",
      status: "Active",
      path: "/dashboard/modules/trucking"
    },
    {
      id: "restaurant",
      name: "Restaurant Manager",
      description: "Inventory optimization and waste reduction",
      icon: "🍽️",
      savings: "Cut food costs by 12-22%",
      status: "Active",
      path: "/dashboard/modules/restaurant"
    },
    {
      id: "manufacturing",
      name: "Manufacturing Optimizer",
      description: "Production efficiency and quality control",
      icon: "🏭",
      savings: "Boost efficiency by 20-35%",
      status: "Active",
      path: "/dashboard/modules/manufacturing"
    },
    {
      id: "retail",
      name: "Retail Analytics",
      description: "Sales forecasting and inventory management",
      icon: "🛍️",
      savings: "Increase margins by 10-18%",
      status: "Active",
      path: "/dashboard/modules/retail"
    },
    {
      id: "services",
      name: "Service Scheduler",
      description: "Appointment and resource optimization",
      icon: "📅",
      savings: "Reduce downtime by 25-40%",
      status: "Active",
      path: "/dashboard/modules/services"
    }
  ];

  // Only show purchased trades in the trade estimators list
  const tradeModules = purchasedTrades.map(trade => ({
    id: trade.trade,
    name: trade.name,
    description: trade.description,
    icon: trade.icon,
    savings: "Active",
    status: "Active",
    path: `/dashboard/modules/construction?trade=${trade.trade}`
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">BizOptimize Pro</h1>
                <p className="text-sm text-gray-600">Atlantic Construction Ltd</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/pricing">
                <Button variant="outline" size="sm">
                  Manage Trades
                </Button>
              </Link>
              <Link href="/dashboard/admin">
                <Button variant="outline" size="sm">
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-gray-600">
            Your construction business has saved <strong className="text-green-600">$714,580</strong> using our AI optimization tools.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Savings</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$714,580</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <span>📈</span>
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Plan Status</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Professional</div>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 mt-2">
                Subscription Active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Modules</CardTitle>
              <span className="text-2xl">🔧</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-600 mt-1">Optimization tools</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ROI</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">340%</div>
              <p className="text-xs text-gray-600 mt-1">Return on investment</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Optimization Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Business Optimization Modules</CardTitle>
            <CardDescription>
              AI-powered optimization tools for your business operations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {businessModules.map((module) => (
              <button
                key={module.id}
                onClick={() => window.location.href = module.path}
                className="p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {module.icon}
                </div>
                <h3 className="font-semibold mb-2">{module.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {module.status}
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {module.savings}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Purchased Trade Estimators */}
        {tradeModules.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Construction Trade Estimators</CardTitle>
              <CardDescription>
                Click on any estimator to generate quotes for your clients
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tradeModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => window.location.href = module.path}
                  className="p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                    {module.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{module.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Active
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      ✓ Purchased
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Trades Purchased Message */}
        {tradeModules.length === 0 && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">No Trade Estimators Purchased</h3>
              <p className="text-gray-600 mb-4">
                Purchase access to trade-specific estimators to start generating quotes for your clients.
              </p>
              <Link href="/dashboard/pricing">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Available Trades & Pricing
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Available Trades to Purchase */}
        {availableTrades.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Available Trade Estimators</CardTitle>
              <CardDescription>
                Purchase access to additional trade estimators
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableTrades.map((trade) => (
                <div
                  key={trade.trade}
                  className="p-6 border rounded-lg border-gray-200 bg-gray-50"
                >
                  <div className="text-3xl mb-3">{trade.icon}</div>
                  <h3 className="font-semibold mb-2">{trade.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{trade.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-blue-600">
                      ${trade.price}/month
                    </span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      Not Purchased
                    </span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => window.location.href = `/dashboard/pricing?trade=${trade.trade}`}
                  >
                    Purchase Access
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Trial Status */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Platform Active - Generating Savings</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Our AI optimization tools have identified significant cost savings across your business operations. 
                  Your subscription remains active as we continue to deliver measurable value.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-blue-600">
                    <span>✅</span>
                    <span>Proven savings: $714,580</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <span>✅</span>
                    <span>ROI: 340%</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <span>✅</span>
                    <span>All modules active</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}