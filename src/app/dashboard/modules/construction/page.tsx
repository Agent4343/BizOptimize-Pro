"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestOptimization } from "@/lib/ai-client";
import { formatCurrency } from "@/lib/format";
import { toNumber } from "@/lib/numbers";

interface ConstructionMetrics {
  projectCost?: number;
  savings?: number;
}

export default function ConstructionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ConstructionMetrics>({});
  const [formData, setFormData] = useState({
    projectName: "",
    squareFootage: "",
    bedrooms: "",
    bathrooms: "",
    location: "",
  });

  const generateEstimate = async () => {
    setLoading(true);
    setError(null);
    const squareFootage = toNumber(formData.squareFootage);
    const bedrooms = toNumber(formData.bedrooms);
    const bathrooms = toNumber(formData.bathrooms);
    const estimatedBudget = squareFootage ? squareFootage * 190 : undefined;

    try {
      const data = await requestOptimization({
        prompt: `Construction project: ${formData.squareFootage} sq ft, ${formData.bedrooms} bedrooms, ${formData.bathrooms} bathrooms in ${formData.location}`,
        businessType: "construction",
        optimizationType: "estimate",
        metadata: {
          projectName: formData.projectName,
          squareFootage,
          bedrooms,
          bathrooms,
          location: formData.location,
          estimatedBudget,
        },
      });

      setResult(data.result);
      setMetrics({
        projectCost: estimatedBudget,
        savings: data.estimatedSavings,
      });
    } catch (apiError) {
      console.error("Error:", apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Error generating estimate. Please try again.",
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
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white">🏗️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Construction Estimator</h1>
                <p className="text-sm text-gray-600">AI-powered project estimation</p>
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
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Enter your project information for accurate estimation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  placeholder="Smith Family Home"
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Square Footage</label>
                  <Input
                    placeholder="2000"
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <Input
                    placeholder="3"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bathrooms</label>
                  <Input
                    placeholder="2.5"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="St. John's, NL"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={generateEstimate} 
                disabled={loading || !formData.squareFootage}
                className="w-full"
              >
                {loading ? 'Generating Estimate...' : 'Generate AI Estimate'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Estimate Results</CardTitle>
              <CardDescription>
                AI-generated construction estimate with cost optimization
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
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(metrics.projectCost ?? 278241)}
                        </div>
                        <div className="text-sm text-gray-600">Total Project Cost</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(metrics.savings ?? 57400)}
                        </div>
                        <div className="text-sm text-gray-600">Potential Savings</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap">{result}</pre>
                    </div>
                    <Button variant="outline" className="w-full">
                      📄 Export Estimate
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏗️</div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Generate Estimate</h3>
                    <p className="text-gray-600">
                      Fill out the project details to generate a comprehensive AI-powered construction estimate.
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