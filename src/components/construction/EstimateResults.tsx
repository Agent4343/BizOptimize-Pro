"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TradeEstimate } from "@/lib/construction-types";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferredContact: string;
  notes: string;
}

interface EstimateResultsProps {
  selectedTrade: string;
  result: string;
  totalCost: number;
  savings: number;
  trades?: TradeEstimate[];
  isFullConstruction?: boolean;
  projectDetails?: {
    projectType: string;
    location: string;
    squareFootage: string;
    province: string;
  };
}

export function EstimateResults({
  selectedTrade,
  result,
  totalCost,
  savings,
  trades = [],
  isFullConstruction = false,
  projectDetails,
}: EstimateResultsProps) {
  const [selectedTrades, setSelectedTrades] = useState<Record<string, boolean>>({});
  const [showContactForm, setShowContactForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferredContact: "email",
    notes: "",
  });

  // Initialize all trades as selected
  useEffect(() => {
    if (trades.length > 0) {
      const initial: Record<string, boolean> = {};
      trades.forEach(t => {
        initial[t.trade] = t.selected;
      });
      setSelectedTrades(initial);
    }
  }, [trades]);

  const tradeName = selectedTrade
    ? selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1)
    : '';

  // Calculate totals based on selected trades
  const selectedTradesList = trades.filter(t => selectedTrades[t.trade]);
  const selectedTotalCost = selectedTradesList.reduce((sum, t) => sum + t.cost, 0);
  const selectedTotalSavings = selectedTradesList.reduce((sum, t) => sum + t.savings, 0);

  const toggleTrade = (trade: string) => {
    setSelectedTrades(prev => ({
      ...prev,
      [trade]: !prev[trade]
    }));
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitQuote = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const quoteData = {
        customerInfo,
        projectDetails,
        selectedTrades: selectedTradesList,
        totalCost: selectedTotalCost,
        totalSavings: selectedTotalSavings,
        optimizedTotal: selectedTotalCost - selectedTotalSavings,
        submittedAt: new Date().toISOString(),
      };

      // Send to API endpoint
      const response = await fetch('/api/quotes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit quote. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      alert("Failed to submit quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show success message after submission
  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Quote Request Submitted!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Thank You, {customerInfo.name}!</h3>
            <p className="text-gray-600 mb-4">
              Your quote request has been sent to our team. We will review your project details
              and contact you at <strong>{customerInfo.email}</strong> within 1-2 business days.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-left max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Quote Summary:</h4>
              <ul className="text-sm space-y-1">
                {selectedTradesList.map(t => (
                  <li key={t.trade} className="flex justify-between">
                    <span>{t.tradeName}</span>
                    <span>${t.cost.toLocaleString()}</span>
                  </li>
                ))}
                <li className="border-t pt-2 mt-2 font-semibold flex justify-between">
                  <span>Estimated Total</span>
                  <span>${selectedTotalCost.toLocaleString()}</span>
                </li>
              </ul>
            </div>
            <Button
              className="mt-6"
              onClick={() => {
                setSubmitted(false);
                setShowContactForm(false);
              }}
            >
              Request Another Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isFullConstruction
            ? 'Full Construction Estimate - Select Your Trades'
            : selectedTrade
            ? `${tradeName} Estimate`
            : 'Estimate Results'}
        </CardTitle>
        <CardDescription>
          {isFullConstruction
            ? 'Select the trades you need and request a detailed quote from our team'
            : selectedTrade
            ? `Professional ${selectedTrade} estimate for your project`
            : 'AI-generated construction estimate with cost optimization'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-6">
            {/* Trade Selection Cards - for full construction */}
            {isFullConstruction && trades.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Select Trades for Your Quote:</h3>
                <div className="grid gap-3">
                  {trades.map((trade) => (
                    <div
                      key={trade.trade}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTrades[trade.trade]
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTrades[trade.trade] || false}
                            onChange={() => toggleTrade(trade.trade)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <div>
                            <h4 className="font-medium">{trade.tradeName}</h4>
                            <p className="text-sm text-gray-500">
                              Potential savings: ${trade.savings.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">${trade.cost.toLocaleString()}</div>
                          <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTrade(expandedTrade === trade.trade ? null : trade.trade);
                            }}
                          >
                            {expandedTrade === trade.trade ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </div>
                      {/* Expanded trade details */}
                      {expandedTrade === trade.trade && (
                        <div className="mt-4 pt-4 border-t">
                          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-64 overflow-auto">
                            {trade.breakdown}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Selected Trades Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Selected Trades:</span>
                    <span>{selectedTradesList.length} of {trades.length}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Estimated Total:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${selectedTotalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium">Potential Savings:</span>
                    <span className="font-bold">${selectedTotalSavings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Single Trade Display */}
            {!isFullConstruction && trades.length === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${trades[0].cost.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{trades[0].tradeName} Cost</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${trades[0].savings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Potential Savings</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap">{result}</pre>
                </div>
              </div>
            )}

            {/* Legacy Display (no trades breakdown) */}
            {trades.length === 0 && (
              <>
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
              </>
            )}

            {/* Contact Form Toggle */}
            {!showContactForm ? (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowContactForm(true)}
              >
                Request Quote - Get Contacted by Our Team
              </Button>
            ) : (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Your Contact Information</h3>
                <p className="text-sm text-gray-600">
                  Fill out the form below and our team will review your project and contact you with a detailed quote.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={customerInfo.name}
                      onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={customerInfo.email}
                      onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={customerInfo.phone}
                      onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                    <select
                      id="preferredContact"
                      className="w-full h-10 rounded-md border border-gray-200 px-3"
                      value={customerInfo.preferredContact}
                      onChange={(e) => handleCustomerInfoChange('preferredContact', e.target.value)}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="text">Text Message</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Project Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, Province"
                    value={customerInfo.address}
                    onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes or Questions</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific requirements, timeline preferences, or questions for our team..."
                    value={customerInfo.notes}
                    onChange={(e) => handleCustomerInfoChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmitQuote}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Submitting...' : 'Submit Quote Request'}
                  </Button>
                </div>
              </div>
            )}

            <Button variant="outline" className="w-full">
              Export Estimate as PDF
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
  );
}
