"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getModules, type Module } from "@/lib/modules";
import { isDeveloper } from "@/lib/admin-auth";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<Record<string, boolean>>({});
  const [demoStatus, setDemoStatus] = useState<Record<string, boolean>>({});
  const [demoTimeRemaining, setDemoTimeRemaining] = useState<Record<string, number>>({});
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'loading' || !session) {
      return;
    }

    loadData();
  }, [session, status, router]);

  const loadData = async () => {
    // Load modules dynamically
    const loadedModules = getModules().filter(m => m.status === 'active');
    setModules(loadedModules);

    // Load subscriptions from database
    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      
      const status: Record<string, boolean> = {};
      const demo: Record<string, boolean> = {};
      const timeRemaining: Record<string, number> = {};

      if (data.subscriptions) {
        data.subscriptions.forEach((sub: any) => {
          status[sub.module_id] = true;
        });
      }

      // Check demos (you can add API endpoint for this or use client-side)
      // For now, we'll check localStorage as fallback
      loadedModules.forEach(module => {
        const demoData = localStorage.getItem(`demo_${module.id}`);
        if (demoData) {
          try {
            const demo = JSON.parse(demoData);
            const now = Date.now();
            if (now < demo.expiresAt) {
              demo[module.id] = true;
              timeRemaining[module.id] = Math.max(0, Math.floor((demo.expiresAt - now) / 1000));
            }
          } catch (e) {
            // Invalid demo data
          }
        }
      });

      setSubscriptionStatus(status);
      setDemoStatus(demo);
      setDemoTimeRemaining(timeRemaining);

      // Update demo timer every second
      const interval = setInterval(() => {
        const updated: Record<string, number> = {};
        loadedModules.forEach(module => {
          const demoData = localStorage.getItem(`demo_${module.id}`);
          if (demoData) {
            try {
              const demo = JSON.parse(demoData);
              const now = Date.now();
              if (now < demo.expiresAt) {
                updated[module.id] = Math.max(0, Math.floor((demo.expiresAt - now) / 1000));
                if (updated[module.id] <= 0) {
                  window.location.reload();
                }
              }
            } catch (e) {
              // Invalid demo data
            }
          }
        });
        setDemoTimeRemaining(prev => ({ ...prev, ...updated }));
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  BizOptimize Pro
                </h1>
                <p className="text-sm text-gray-600">Atlantic Construction Ltd</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  💳 Pricing
                </Button>
              </Link>
              {/* Developer link - only show if user is developer */}
              {session?.user?.email?.toLowerCase() === 'mathesonashley@hotmail.com' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    ⚙️ Developer
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome back! 👋
              </h2>
              <p className="text-lg text-gray-600">
                Your business has saved <strong className="text-green-600 text-xl">$714,580</strong> using our AI optimization tools.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-sm text-gray-500">This Month</div>
                <div className="text-2xl font-bold text-green-600">+23%</div>
                <div className="text-xs text-green-600">↑ Growth</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Savings</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-1">$714,580</div>
              <div className="flex items-center gap-2 text-xs text-green-600">
                <span className="flex items-center gap-1">
                  <span>📈</span>
                  <span>+23% from last month</span>
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Plan Status</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">Professional</div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-medium">
                ✓ Subscription Active
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Modules</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                <span className="text-xl">🔧</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">3</div>
              <p className="text-xs text-gray-600">Optimization tools running</p>
              <div className="mt-2 flex gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ROI</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-1">340%</div>
              <p className="text-xs text-gray-600">Return on investment</p>
              <div className="mt-2 text-xs text-blue-600 font-medium">
                ⭐ Excellent Performance
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Modules */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Business Optimization Modules</h3>
              <p className="text-gray-600">
              {Object.values(subscriptionStatus).some(s => s) || Object.values(demoStatus).some(d => d)
                ? "Click on any module to start optimizing your operations"
                : "Subscribe to modules or try a free demo to get started"}
            </p>
            </div>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                💳 View Pricing
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((module) => {
              const isModuleSubscribed = subscriptionStatus[module.id];
              const isModuleDemo = demoStatus[module.id];
              const timeRemaining = demoTimeRemaining[module.id] || 0;
              const hasModuleAccess = isModuleSubscribed || isModuleDemo;

              return (
                <Card
                  key={module.id}
                  className={`border-2 ${module.borderColor} ${hasModuleAccess ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : 'opacity-75'} transition-all duration-300 h-full flex flex-col`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-3xl shadow-lg transition-transform`}>
                        {module.icon}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {isModuleSubscribed && (
                          <Badge className="bg-green-500 text-white">Subscribed</Badge>
                        )}
                        {isModuleDemo && !isModuleSubscribed && (
                          <Badge className="bg-orange-500 text-white">
                            Demo: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                          </Badge>
                        )}
                        {!hasModuleAccess && (
                          <Badge className="bg-gray-400 text-white">Locked</Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {module.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Key Features:</div>
                      <div className="flex flex-wrap gap-2">
                        {module.features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                            {feature}
                          </span>
                        ))}
                        {module.features.length > 2 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                            +{module.features.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <div className="text-xs text-gray-500">Base Price</div>
                        <div className="text-lg font-bold text-green-600">${module.basePrice}/mo</div>
                      </div>
                      {hasModuleAccess ? (
                        <Link href={module.route}>
                          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                            Open →
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/pricing">
                          <Button variant="outline">
                            Subscribe
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Platform Status */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Platform Active - Generating Savings</h3>
                <p className="text-blue-700 mb-4">
                  Our AI optimization tools have identified significant cost savings across your business operations. 
                  Your subscription remains active as we continue to deliver measurable value.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-blue-600 bg-white/60 px-3 py-2 rounded-lg">
                    <span className="text-lg">✅</span>
                    <div>
                      <div className="text-xs text-blue-500">Proven Savings</div>
                      <div className="font-bold">$714,580</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 bg-white/60 px-3 py-2 rounded-lg">
                    <span className="text-lg">📈</span>
                    <div>
                      <div className="text-xs text-blue-500">ROI</div>
                      <div className="font-bold">340%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 bg-white/60 px-3 py-2 rounded-lg">
                    <span className="text-lg">🔧</span>
                    <div>
                      <div className="text-xs text-blue-500">Modules</div>
                      <div className="font-bold">All Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
