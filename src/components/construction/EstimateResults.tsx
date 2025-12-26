"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EstimateResultsProps {
  selectedTrade: string;
  result: string;
  totalCost: number;
  savings: number;
}

export function EstimateResults({
  selectedTrade,
  result,
  totalCost,
  savings,
}: EstimateResultsProps) {
  const tradeName = selectedTrade
    ? selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1)
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedTrade
            ? `${tradeName} Estimate Results`
            : 'Estimate Results'}
        </CardTitle>
        <CardDescription>
          {selectedTrade
            ? `AI-generated ${selectedTrade} estimate with cost optimization and code compliance`
            : 'AI-generated construction estimate with cost optimization'}
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
              Export Estimate
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">construction</div>
            <h3 className="text-lg font-semibold mb-2">Ready to Generate Estimate</h3>
            <p className="text-gray-600">
              Fill out the project details to generate a detailed construction estimate with complete line-item breakdowns for all trades.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
