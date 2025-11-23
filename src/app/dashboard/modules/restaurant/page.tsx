"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAssistant } from "@/components/ui/chat-assistant";

export default function RestaurantPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [formData, setFormData] = useState({
    restaurantName: "",
    monthlyRevenue: "",
    foodCostPercentage: "",
    inventoryItems: "",
    averageWaste: "",
    staffCount: ""
  });

  const optimizeRestaurant = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Restaurant: ${formData.restaurantName}, $${formData.monthlyRevenue} revenue, ${formData.foodCostPercentage}% food cost, ${formData.averageWaste}% waste`,
          businessType: 'restaurant',
          optimizationType: 'inventory'
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error optimizing restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const optimizationStrategies = [
    { 
      title: "Inventory Management", 
      savings: "$1,680/mo", 
      improvement: "Reduce waste to 6%", 
      icon: "📦", 
      color: "from-blue-500 to-cyan-500",
      description: "Smart tracking and rotation systems"
    },
    { 
      title: "Supplier Consolidation", 
      savings: "$2,240/mo", 
      improvement: "8% cost reduction", 
      icon: "🤝", 
      color: "from-green-500 to-emerald-500",
      description: "Negotiate better bulk pricing"
    },
    { 
      title: "Menu Engineering", 
      savings: "$4,000/mo", 
      improvement: "5% margin increase", 
      icon: "📊", 
      color: "from-purple-500 to-pink-500",
      description: "Optimize high-margin items"
    },
    { 
      title: "Portion Control", 
      savings: "$840/mo", 
      improvement: "3% food cost reduction", 
      icon: "⚖️", 
      color: "from-orange-500 to-red-500",
      description: "Standardize serving sizes"
    }
  ];

  const costComparison = [
    { label: "Current Food Cost", value: 35, color: "bg-red-500", amount: "$28,000/mo" },
    { label: "Optimized Food Cost", value: 30, color: "bg-green-500", amount: "$24,000/mo" },
    { label: "Savings", value: 5, color: "bg-blue-500", amount: "$4,000/mo" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="hover:bg-orange-50">
                ← Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Restaurant Manager
                </h1>
                <p className="text-sm text-gray-600">AI-powered operations optimization & inventory management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="border-2 shadow-lg sticky top-24">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="text-xl">Restaurant Information</CardTitle>
                <CardDescription>
                  Provide restaurant details for comprehensive optimization analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span>🍽️</span>
                    Restaurant Name
                  </label>
                  <Input
                    placeholder="Harbour View Restaurant"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                    className="border-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>💰</span>
                      Monthly Revenue ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="80000"
                      value={formData.monthlyRevenue}
                      onChange={(e) => setFormData({...formData, monthlyRevenue: e.target.value})}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>📊</span>
                      Food Cost (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="35"
                      value={formData.foodCostPercentage}
                      onChange={(e) => setFormData({...formData, foodCostPercentage: e.target.value})}
                      className="border-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>📦</span>
                      Inventory Items
                    </label>
                    <Input
                      type="number"
                      placeholder="250"
                      value={formData.inventoryItems}
                      onChange={(e) => setFormData({...formData, inventoryItems: e.target.value})}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>🗑️</span>
                      Average Waste (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="12"
                      value={formData.averageWaste}
                      onChange={(e) => setFormData({...formData, averageWaste: e.target.value})}
                      className="border-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span>👥</span>
                    Staff Count
                  </label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={formData.staffCount}
                    onChange={(e) => setFormData({...formData, staffCount: e.target.value})}
                    className="border-2"
                  />
                </div>
                
                <Button 
                  onClick={optimizeRestaurant} 
                  disabled={loading || !formData.monthlyRevenue}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-6 text-lg shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⚙️</span>
                      Optimizing Operations...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>✨</span>
                      Generate Optimization Report
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {result ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-2">📉</div>
                      <div className="text-2xl font-bold text-red-600 mb-1">35%</div>
                      <div className="text-sm text-gray-600">Current Food Cost</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-2">📈</div>
                      <div className="text-2xl font-bold text-green-600 mb-1">30%</div>
                      <div className="text-sm text-gray-600">Optimized Food Cost</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-2">💰</div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">$105,120</div>
                      <div className="text-sm text-gray-600">Annual Savings</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cost Comparison Chart */}
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📊</span>
                      Food Cost Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {costComparison.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-gray-600">{item.amount}</span>
                          </div>
                          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full transition-all duration-1000 flex items-center justify-end pr-2 text-white text-xs font-medium`}
                              style={{ width: `${item.value * 2}%` }}
                            >
                              {item.value}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Optimization Strategies */}
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🎯</span>
                      Optimization Strategies
                    </CardTitle>
                    <CardDescription>
                      AI-recommended cost reduction strategies with projected savings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optimizationStrategies.map((strategy, idx) => (
                        <div key={idx} className={`p-5 rounded-xl bg-gradient-to-br ${strategy.color} text-white shadow-lg hover:scale-105 transition-transform`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-4xl">{strategy.icon}</div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{strategy.savings}</div>
                              <div className="text-sm opacity-90">Monthly</div>
                            </div>
                          </div>
                          <div className="font-semibold text-lg mb-1">{strategy.title}</div>
                          <div className="text-sm opacity-90 mb-2">{strategy.improvement}</div>
                          <div className="text-xs opacity-75">{strategy.description}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Savings Breakdown */}
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <span>💵</span>
                      Monthly Savings Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📦</span>
                          <div>
                            <div className="font-semibold">Inventory Management</div>
                            <div className="text-sm text-gray-600">Waste reduction</div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-green-600">$1,680</div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🤝</span>
                          <div>
                            <div className="font-semibold">Supplier Consolidation</div>
                            <div className="text-sm text-gray-600">Bulk pricing</div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-green-600">$2,240</div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📊</span>
                          <div>
                            <div className="font-semibold">Menu Engineering</div>
                            <div className="text-sm text-gray-600">Margin optimization</div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-green-600">$4,000</div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⚖️</span>
                          <div>
                            <div className="font-semibold">Portion Control</div>
                            <div className="text-sm text-gray-600">Standardization</div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-green-600">$840</div>
                      </div>
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg">Total Monthly Savings</div>
                          <div className="text-3xl font-bold text-green-700">$8,760</div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">Annual Savings: $105,120</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📋</span>
                      Detailed Optimization Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-auto border-2 border-gray-200">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">{result}</pre>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" className="flex-1">
                        📄 Export PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        📊 Export Excel
                      </Button>
                      <Button variant="outline" className="flex-1">
                        📧 Email Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-2 shadow-lg">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="text-8xl mb-6 animate-bounce">🍽️</div>
                    <h3 className="text-2xl font-bold mb-3">Ready to Optimize Your Restaurant</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Enter restaurant details to generate comprehensive optimization analysis with inventory management, waste reduction, and cost-saving strategies.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl mb-2">📦</div>
                        <div className="font-semibold">Inventory Management</div>
                        <div className="text-sm text-gray-600">Reduce waste by 50%</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl mb-2">💰</div>
                        <div className="font-semibold">Cost Reduction</div>
                        <div className="text-sm text-gray-600">Save 12-22% on food costs</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-semibold">Menu Optimization</div>
                        <div className="text-sm text-gray-600">Increase margins by 5%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Chat Assistant */}
      <ChatAssistant 
        businessType="restaurant" 
        contextData={formData}
      />
    </div>
  );
}
