"use client";

/**
 * MODULE TEMPLATE
 * 
 * Copy this file to create a new module:
 * 1. Create directory: src/app/dashboard/modules/[your-module-id]/
 * 2. Copy this file to: src/app/dashboard/modules/[your-module-id]/page.tsx
 * 3. Replace all instances of:
 *    - "your-module-id" with your actual module ID
 *    - "Your Module Name" with your module name
 *    - "Module description" with your description
 *    - "🏭" with your module icon emoji
 *    - "your-module-type" with your business type
 * 4. Customize the form fields and API call
 * 5. Add module to database via Developer Dashboard (/admin)
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAssistant } from "@/components/ui/chat-assistant";
import { hasAccess, isDemoActive, getDemoTimeRemaining, startDemo } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";

const MODULE_ID = "your-module-id"; // CHANGE THIS
const MODULE_NAME = "Your Module Name"; // CHANGE THIS
const MODULE_DESCRIPTION = "Module description"; // CHANGE THIS
const MODULE_ICON = "🏭"; // CHANGE THIS
const BUSINESS_TYPE = "construction" as "construction" | "trucking" | "restaurant"; // CHANGE THIS to match your business type

export default function TemplateModulePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [hasModuleAccess, setHasModuleAccess] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoTimeRemaining, setDemoTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [formData, setFormData] = useState({
    // Add your form fields here
    field1: "",
    field2: "",
  });

  useEffect(() => {
    // Check for demo mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    const isDemoMode = urlParams.get('demo') === 'true';
    
    if (isDemoMode && !isDemoActive(MODULE_ID)) {
      startDemo(MODULE_ID);
    }

    const access = hasAccess(MODULE_ID);
    const demo = isDemoActive(MODULE_ID);
    
    setHasModuleAccess(access);
    setIsDemo(demo);

    if (!access) {
      router.push('/pricing');
      return;
    }

    // Update demo timer
    if (demo) {
      const updateTimer = () => {
        const remaining = getDemoTimeRemaining(MODULE_ID);
        setDemoTimeRemaining(remaining);
        if (remaining <= 0) {
          alert('Demo time has expired. Please subscribe to continue using this module.');
          router.push('/pricing');
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Customize this API call for your module
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Your module prompt: ${formData.field1}, ${formData.field2}`,
          businessType: BUSINESS_TYPE,
          optimizationType: 'estimate', // or 'analysis', 'optimization', etc.
          details: formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setResult('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error processing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="hover:bg-blue-50">
                ← Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">{MODULE_ICON}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {MODULE_NAME}
                </h1>
                <p className="text-sm text-gray-600">{MODULE_DESCRIPTION}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Banner */}
        {isDemo && (
          <Card className="mb-6 border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⏱️</div>
                  <div>
                    <div className="font-semibold text-orange-700">Demo Mode Active</div>
                    <div className="text-sm text-orange-600">
                      Time remaining: {Math.floor(demoTimeRemaining / 60)}:{(demoTimeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    Subscribe to Continue →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>{MODULE_NAME}</CardTitle>
                <CardDescription>Enter your information to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Customize these form fields */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Field 1</label>
                    <Input
                      placeholder="Enter value"
                      value={formData.field1}
                      onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
                      className="border-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Field 2</label>
                    <Input
                      placeholder="Enter value"
                      value={formData.field2}
                      onChange={(e) => setFormData({ ...formData, field2: e.target.value })}
                      className="border-2"
                    />
                  </div>

                  {/* Add more fields as needed */}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Generate"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="prose max-w-none">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 bg-blue-50 p-4 rounded border">
                      {result}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Fill out the form and click "Generate" to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      <ChatAssistant 
        businessType={BUSINESS_TYPE} 
        contextData={formData}
      />
    </div>
  );
}

