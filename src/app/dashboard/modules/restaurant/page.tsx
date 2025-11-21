"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestOptimization } from "@/lib/ai-client";
import { formatCurrency } from "@/lib/format";
import { toNumber } from "@/lib/numbers";

interface RestaurantMetrics {
  monthlySavings?: number;
  annualSavings?: number;
  currentFoodCost?: number;
  optimizedFoodCost?: number;
}

export default function RestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<RestaurantMetrics>({});
  const [formData, setFormData] = useState({
    restaurantName: "",
    monthlyRevenue: "",
    foodCostPercentage: "",
    inventoryItems: "",
    averageWaste: "",
  });

  const optimizeRestaurant = async () => {
    setLoading(true);
    setError(null);

    const monthlyRevenue = toNumber(formData.monthlyRevenue);
    const foodCostPercentage = toNumber(formData.foodCostPercentage);
    const inventoryItems = toNumber(formData.inventoryItems);
    const averageWaste = toNumber(formData.averageWaste);

    try {
      const data = await requestOptimization({
        prompt: `Restaurant: ${formData.restaurantName}, $${formData.monthlyRevenue} revenue, ${formData.foodCostPercentage}% food cost, ${formData.averageWaste}% waste`,
        businessType: "restaurant",
        optimizationType: "inventory",
        metadata: {
          restaurantName: formData.restaurantName,
          monthlyRevenue,
          foodCostPercentage,
          inventoryItems,
          averageWaste,
        },
      });

      const optimizedFoodCost = foodCostPercentage
        ? Math.max(foodCostPercentage - 5, foodCostPercentage * 0.85)
        : undefined;

      setResult(data.result);
      setMetrics({
        monthlySavings: data.estimatedSavings,
        annualSavings: data.estimatedSavings * 12,
        currentFoodCost: foodCostPercentage,
        optimizedFoodCost,
      });
    } catch (apiError) {
      console.error("Error:", apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Error optimizing restaurant. Please try again.",
      );
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
              <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
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
                    onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Food Cost (%)</label>
                  <Input
                    placeholder="35"
                    value={formData.foodCostPercentage}
                    onChange={(e) => setFormData({ ...formData, foodCostPercentage: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Inventory Items</label>
                  <Input
                    placeholder="250"
                    value={formData.inventoryItems}
                    onChange={(e) => setFormData({ ...formData, inventoryItems: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Average Waste (%)</label>
                  <Input
                    placeholder="12"
                    value={formData.averageWaste}
                    onChange={(e) => setFormData({ ...formData, averageWaste: e.target.value })}
                    type="number"
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
                {error && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {(metrics.currentFoodCost ?? 35).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Current Food Cost</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {(metrics.optimizedFoodCost ?? 30).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Optimized Food Cost</div>
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg bg-blue-50 p-4 text-center">
                      <div className="text-sm uppercase tracking-wide text-blue-600">
                        Annual Savings Potential
                      </div>
                      <div className="text-3xl font-bold text-blue-700">
                        {formatCurrency(metrics.annualSavings ?? 105120)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Monthly savings {formatCurrency(metrics.monthlySavings ?? 8760)}
                      </div>
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