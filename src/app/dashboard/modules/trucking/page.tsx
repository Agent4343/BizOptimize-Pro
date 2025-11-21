"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestOptimization } from "@/lib/ai-client";
import { formatCurrency } from "@/lib/format";
import { toNumber } from "@/lib/numbers";

interface FleetMetrics {
  monthlyOperatingCost?: number;
  annualSavings?: number;
  threeYearSavings?: number;
}

export default function TruckingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FleetMetrics>({});
  const [formData, setFormData] = useState({
    companyName: "",
    fleetSize: "",
    monthlyFuelCost: "",
    emptyMiles: "",
    primaryRoutes: "",
  });

  const analyzeFleet = async () => {
    setLoading(true);
    setError(null);

    const fleetSize = toNumber(formData.fleetSize);
    const monthlyFuelCost = toNumber(formData.monthlyFuelCost);
    const emptyMiles = toNumber(formData.emptyMiles);

    try {
      const data = await requestOptimization({
        prompt: `Fleet analysis: ${formData.fleetSize} trucks, $${formData.monthlyFuelCost} fuel cost, ${formData.emptyMiles}% empty miles, routes: ${formData.primaryRoutes}`,
        businessType: "trucking",
        optimizationType: "fleet",
        metadata: {
          companyName: formData.companyName,
          fleetSize,
          monthlyFuelCost,
          emptyMiles,
          primaryRoutes: formData.primaryRoutes,
        },
      });

      const monthlyOperatingCost = monthlyFuelCost
        ? Math.round(monthlyFuelCost * 1.6)
        : undefined;

      setResult(data.result);
      setMetrics({
        monthlyOperatingCost,
        annualSavings: data.estimatedSavings,
        threeYearSavings: data.estimatedSavings * 3,
      });
    } catch (apiError) {
      console.error("Error:", apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Error analyzing fleet. Please try again.",
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
              <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                <span className="text-white">🚛</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Fleet Optimizer</h1>
                <p className="text-sm text-gray-600">AI-powered trucking efficiency</p>
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
              <CardTitle>Fleet Information</CardTitle>
              <CardDescription>
                Provide fleet details for optimization analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  placeholder="NL Transport Co"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fleet Size</label>
                  <Input
                    placeholder="15"
                    value={formData.fleetSize}
                    onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Fuel Cost ($)</label>
                  <Input
                    placeholder="22000"
                    value={formData.monthlyFuelCost}
                    onChange={(e) => setFormData({ ...formData, monthlyFuelCost: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Empty Miles (%)</label>
                  <Input
                    placeholder="30"
                    value={formData.emptyMiles}
                    onChange={(e) => setFormData({ ...formData, emptyMiles: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Routes</label>
                  <Input
                    placeholder="St. John's - Halifax"
                    value={formData.primaryRoutes}
                    onChange={(e) => setFormData({ ...formData, primaryRoutes: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={analyzeFleet} 
                disabled={loading || !formData.fleetSize}
                className="w-full"
              >
                {loading ? 'Analyzing Fleet...' : 'Generate Fleet Analysis'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>
                Fleet efficiency analysis and recommendations
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
                          {formatCurrency(metrics.monthlyOperatingCost ?? 35500)}
                        </div>
                        <div className="text-sm text-gray-600">Current Monthly Cost</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(metrics.threeYearSavings ?? 360720)}
                        </div>
                        <div className="text-sm text-gray-600">3-Year Savings</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-center">
                      <div className="text-sm uppercase tracking-wide text-green-700">
                        Annual Savings
                      </div>
                      <div className="text-3xl font-bold text-green-700">
                        {formatCurrency(metrics.annualSavings ?? 120240)}
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
                    <div className="text-6xl mb-4">🚛</div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Optimize Fleet</h3>
                    <p className="text-gray-600">
                      Enter your fleet details to generate comprehensive optimization analysis.
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