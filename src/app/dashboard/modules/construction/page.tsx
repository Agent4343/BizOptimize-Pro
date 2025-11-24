"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConstructionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    squareFootage: "",
    bedrooms: "",
    bathrooms: "",
    stories: "",
    location: "",
    description: ""
  });

  const generateEstimate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Construction project estimate:
Project Name: ${formData.projectName || 'Unnamed Project'}
Project Type: ${formData.projectType || 'Not specified'}
Square Footage: ${formData.squareFootage} sq ft
Stories/Levels: ${formData.stories || '1'}
Bedrooms: ${formData.bedrooms || 'N/A'}
Bathrooms: ${formData.bathrooms || 'N/A'}
Location: ${formData.location || 'Not specified'}
Project Description: ${formData.description || 'No additional details provided'}

Generate a detailed construction estimate with line-item breakdowns for all trades.`,
          businessType: 'construction',
          optimizationType: 'estimate'
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
        setTotalCost(data.totalCost || 0);
        setSavings(data.estimatedSavings || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error generating estimate. Please try again.');
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
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white">🏗️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Construction Estimator</h1>
                <p className="text-sm text-gray-600">Detailed estimates with line-item breakdowns for all construction trades</p>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.projectType}
                  onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                >
                  <option value="">Select project type...</option>
                  <option value="new-construction">New Construction</option>
                  <option value="renovation">Renovation</option>
                  <option value="addition">Addition</option>
                  <option value="garage">Garage</option>
                  <option value="commercial">Commercial</option>
                  <option value="multi-unit">Multi-Unit</option>
                  <option value="custom">Custom/Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Square Footage *</label>
                  <Input
                    placeholder="2000"
                    type="number"
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stories/Levels</label>
                  <Input
                    placeholder="1"
                    type="number"
                    value={formData.stories}
                    onChange={(e) => setFormData({...formData, stories: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <Input
                    placeholder="3"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bathrooms</label>
                  <Input
                    placeholder="2.5"
                    type="number"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="St. John's, NL"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Describe the project in detail: materials, special requirements, existing conditions (for renovations), etc."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
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
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {totalCost > 0 ? `$${totalCost.toLocaleString()}` : 'Calculating...'}
                      </div>
                      <div className="text-sm text-gray-600">Total Project Cost</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {savings > 0 ? `$${savings.toLocaleString()}` : 'Calculating...'}
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
                    Fill out the project details to generate a detailed construction estimate with complete line-item breakdowns for all trades.
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