"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAssistant } from "@/components/ui/chat-assistant";

export default function TruckingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [formData, setFormData] = useState({
    companyName: "",
    fleetSize: "",
    monthlyFuelCost: "",
    emptyMiles: "",
    primaryRoutes: "",
    averageMilesPerTruck: ""
  });

  const analyzeFleet = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Fleet analysis: ${formData.fleetSize} trucks, $${formData.monthlyFuelCost} fuel cost, ${formData.emptyMiles}% empty miles, routes: ${formData.primaryRoutes}`,
          businessType: 'trucking',
          optimizationType: 'fleet'
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error analyzing fleet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const optimizationMetrics = [
    { label: "Route Optimization", improvement: "15%", savings: "$3,300/mo", icon: "🗺️", color: "from-blue-500 to-cyan-500" },
    { label: "Predictive Maintenance", improvement: "25%", savings: "$1,625/mo", icon: "🔧", color: "from-green-500 to-emerald-500" },
    { label: "Load Matching", improvement: "35%", savings: "$2,310/mo", icon: "📦", color: "from-purple-500 to-pink-500" },
    { label: "Driver Training", improvement: "8%", savings: "$1,760/mo", icon: "👨‍✈️", color: "from-orange-500 to-red-500" }
  ];

  const yearlyProjection = [
    { year: "Year 1", savings: "$100,320", color: "bg-blue-100 border-blue-300" },
    { year: "Year 2", savings: "$122,400", color: "bg-green-100 border-green-300" },
    { year: "Year 3", savings: "$138,000", color: "bg-purple-100 border-purple-300" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="hover:bg-green-50">
                ← Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🚛</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Fleet Optimizer
                </h1>
                <p className="text-sm text-gray-600">AI-powered trucking efficiency & route optimization</p>
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
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-xl">Fleet Information</CardTitle>
                <CardDescription>
                  Provide fleet details for comprehensive optimization analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span>🏢</span>
                    Company Name
                  </label>
                  <Input
                    placeholder="NL Transport Co"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="border-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>🚛</span>
                      Fleet Size
                    </label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={formData.fleetSize}
                      onChange={(e) => setFormData({...formData, fleetSize: e.target.value})}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>⛽</span>
                      Fuel Cost ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="22000"
                      value={formData.monthlyFuelCost}
                      onChange={(e) => setFormData({...formData, monthlyFuelCost: e.target.value})}
                      className="border-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>📊</span>
                      Empty Miles (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.emptyMiles}
                      onChange={(e) => setFormData({...formData, emptyMiles: e.target.value})}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>📏</span>
                      Avg Miles/Truck
                    </label>
                    <Input
                      type="number"
                      placeholder="8000"
                      value={formData.averageMilesPerTruck}
                      onChange={(e) => setFormData({...formData, averageMilesPerTruck: e.target.value})}
                      className="border-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span>🗺️</span>
                    Primary Routes
                  </label>
                  <Input
                    placeholder="St. John's - Halifax"
                    value={formData.primaryRoutes}
                    onChange={(e) => setFormData({...formData, primaryRoutes: e.target.value})}
                    className="border-2"
                  />
                </div>
                
                <Button 
                  onClick={analyzeFleet} 
                  disabled={loading || !formData.fleetSize}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 text-lg shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⚙️</span>
                      Analyzing Fleet...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>🚀</span>
                      Generate Fleet Analysis
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-2">📉</div>
                      <div className="text-2xl font-bold text-red-600 mb-1">$35,500</div>
                      <div className="text-sm text-gray-600">Current Monthly Cost</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-2">💰</div>
                      <div className="text-2xl font-bold text-green-600 mb-1">$360,720</div>
                      <div className="text-sm text-gray-600">3-Year Total Savings</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Optimization Opportunities */}
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🎯</span>
                      Optimization Opportunities
                    </CardTitle>
                    <CardDescription>
                      AI-identified areas for cost reduction and efficiency improvement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optimizationMetrics.map((metric, idx) => (
                        <div key={idx} className={`p-5 rounded-xl bg-gradient-to-br ${metric.color} text-white shadow-lg hover:scale-105 transition-transform`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-4xl">{metric.icon}</div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{metric.savings}</div>
                              <div className="text-sm opacity-90">Monthly</div>
                            </div>
                          </div>
                          <div className="font-semibold text-lg mb-1">{metric.label}</div>
                          <div className="text-sm opacity-90">Improvement: {metric.improvement}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 3-Year Projection */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <span>📈</span>
                      3-Year Financial Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {yearlyProjection.map((year, idx) => (
                        <div key={idx} className={`p-5 rounded-lg border-2 ${year.color} flex items-center justify-between hover:shadow-md transition-shadow`}>
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-gray-700">{year.year}</div>
                            <div className="text-sm text-gray-600">Projected Savings</div>
                          </div>
                          <div className="text-2xl font-bold text-green-600">{year.savings}</div>
                        </div>
                      ))}
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg">Total 3-Year Savings</div>
                          <div className="text-3xl font-bold text-green-700">$360,720</div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">ROI: 221% | Break-even: 14 months</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📋</span>
                      Detailed Fleet Analysis
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
                    <div className="text-8xl mb-6 animate-bounce">🚛</div>
                    <h3 className="text-2xl font-bold mb-3">Ready to Optimize Your Fleet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Enter your fleet details to generate comprehensive optimization analysis with route planning, fuel efficiency, and cost reduction strategies.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl mb-2">🗺️</div>
                        <div className="font-semibold">Route Optimization</div>
                        <div className="text-sm text-gray-600">Reduce fuel costs by 15-30%</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl mb-2">🔧</div>
                        <div className="font-semibold">Predictive Maintenance</div>
                        <div className="text-sm text-gray-600">Cut maintenance costs by 25%</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl mb-2">📦</div>
                        <div className="font-semibold">Load Matching</div>
                        <div className="text-sm text-gray-600">Reduce empty miles by 35%</div>
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
        businessType="trucking" 
        contextData={formData}
      />
    </div>
  );
}
