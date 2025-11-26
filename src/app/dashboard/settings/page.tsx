"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const preferences = [
  {
    title: "Email alerts",
    description: "Daily digest for estimator runs, weekly summary for ROI impact.",
    actions: ["Estimator generated", "Fleet analysis completed", "Restaurant insights ready"],
  },
  {
    title: "Agent access",
    description: "Control which teammates can use the BizOptimize command palette + exports.",
    actions: ["Designate estimator editors", "Allow trucking exports", "Enable restaurant insights"],
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Workspace</p>
            <h1 className="text-2xl font-semibold text-white">Settings & Preferences</h1>
          </div>
          <Link href="/dashboard" className="text-sm text-white/80 hover:text-white">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
        <Card className="bg-white text-slate-900">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Profile, workspace branding, and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace</p>
                <h3 className="text-lg font-semibold">Atlantic Construction · Pro</h3>
                <p className="text-sm text-slate-500">Collaborators: 8 active · 2 pending invites</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-white">
                  Update brand kit
                </Button>
                <Button className="bg-slate-900 text-white hover:bg-slate-800">Manage users</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {preferences.map((preference) => (
            <Card key={preference.title} className="bg-white text-slate-900">
              <CardHeader>
                <CardTitle>{preference.title}</CardTitle>
                <CardDescription>{preference.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {preference.actions.map((action) => (
                  <label key={action} className="flex items-center gap-3 text-sm text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" defaultChecked />
                    {action}
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white text-slate-900">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>Workspace ops that require admin approval</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Reset the estimator wizard</p>
              <p className="text-sm text-slate-500">Clears agent memories + saved templates.</p>
            </div>
            <Button variant="destructive">Reset workspace</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
