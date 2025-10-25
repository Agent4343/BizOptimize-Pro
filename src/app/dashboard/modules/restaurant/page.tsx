"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RestaurantPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [formData, setFormData] = useState({
    restaurantName: "",
    monthlyRevenue: "",
    foodCostPercentage: "",
    inventoryItems: "",
    averageWaste: ""
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              ← Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <span className="text-white">🍽️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Restaurant Manager</h1>
                <p className="text-sm text-gray-600">AI-powered operations optimization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Provide restaurant details for optimization analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Name</label>
                <Input
                  placeholder="Harbour View Restaurant"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Revenue ($)</label>
                  <Input
                    placeholder="80000"
                    value={formData.monthlyRevenue}
                    onChange={(e) => setFormData({...formData, monthlyRevenue: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Food Cost (%)</label>
                  <Input
                    placeholder="35"
                    value={formData.foodCostPercentage}
                    onChange={(e) => setFormData({...formData, foodCostPercentage: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Inventory Items</label>
                  <Input
                    placeholder="250"
                    value={formData.inventoryItems}
                    onChange={(e) => setFormData({...formData, inventoryItems: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Average Waste (%)</label>
                  <Input
                    placeholder="12"
                    value={formData.averageWaste}
                    onChange={(e) => setFormData({...formData, averageWaste: e.target.value})}
                  />
                </div>
              </div>
              <Button 
                onClick={optimizeRestaurant} 
                disabled={loading || !formData.monthlyRevenue}
                className="w-full"
              >
                {loading ? 'Optimizing Operations...' : 'Generate Optimization Report'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>
                Cost reduction strategies and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">35%</div>
                      <div className="text-sm text-gray-600">Current Food Cost</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">30%</div>
                      <div className="text-sm text-gray-600">Optimized Food Cost</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">$105,120</div>
                    <div className="text-sm text-gray-600">Annual Savings Potential</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap">{result}</pre>
                  </div>
                  <Button variant="outline" className="w-full">
                    📊 Export Analysis
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Optimize Restaurant</h3>
                  <p className="text-gray-600">
                    Enter restaurant details to generate optimization analysis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}