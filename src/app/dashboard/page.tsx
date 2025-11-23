"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const modules = [
    {
      id: "construction",
      name: "Construction Estimator",
      description: "AI-powered project estimation",
      icon: "🏗️",
      savings: "$94,610",
      status: "Active"
    },
    {
      id: "trucking", 
      name: "Fleet Optimizer",
      description: "Route and fuel optimization",
      icon: "🚛",
      savings: "$574,720",
      status: "Active"
    },
    {
      id: "restaurant",
      name: "Restaurant Manager", 
      description: "Inventory and waste optimization",
      icon: "🍽️",
      savings: "$45,250",
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">BizOptimize Pro</h1>
                <p className="text-sm text-gray-600">Atlantic Construction Ltd</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                Settings
              </Button>
              <Button variant="outline" size="sm">
                Billing
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-gray-600">
            Your construction business has saved <strong className="text-green-600">$714,580</strong> using our AI optimization tools.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Savings</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$714,580</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <span>📈</span>
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Plan Status</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Professional</div>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 mt-2">
                Subscription Active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Modules</CardTitle>
              <span className="text-2xl">🔧</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-600 mt-1">Optimization tools</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ROI</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">340%</div>
              <p className="text-xs text-gray-600 mt-1">Return on investment</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Business Optimization Modules</CardTitle>
            <CardDescription>
              Click on any module to start optimizing your operations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => window.location.href = `/dashboard/modules/${module.id}`}
                className="p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {module.icon}
                </div>
                <h3 className="font-semibold mb-2">{module.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {module.status}
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {module.savings} saved
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Trial Status */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Platform Active - Generating Savings</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Our AI optimization tools have identified significant cost savings across your business operations. 
                  Your subscription remains active as we continue to deliver measurable value.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-blue-600">
                    <span>✅</span>
                    <span>Proven savings: $714,580</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <span>✅</span>
                    <span>ROI: 340%</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <span>✅</span>
                    <span>All modules active</span>
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