"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

const invoiceHistory = [
  { period: "November 2024", amount: 890, status: "Paid" },
  { period: "October 2024", amount: 870, status: "Paid" },
  { period: "September 2024", amount: 910, status: "Paid" },
];

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Workspace</p>
            <h1 className="text-2xl font-semibold text-white">Billing</h1>
          </div>
          <Link href="/dashboard" className="text-sm text-white/80 hover:text-white">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
        <Card className="bg-white text-slate-900">
          <CardHeader>
            <CardTitle>Plan overview</CardTitle>
            <CardDescription>Your Pro subscription is billed monthly.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current plan</p>
              <h3 className="text-xl font-semibold">Professional · $890/mo</h3>
              <p className="text-sm text-slate-500">Includes unlimited estimators, trucking, and restaurant modules.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-white">
                Update payment method
              </Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800">Switch to annual</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white text-slate-900">
          <CardHeader>
            <CardTitle>Usage snapshot</CardTitle>
            <CardDescription>Billable actions in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Construction estimates", value: 34 },
              { label: "Fleet analyses", value: 12 },
              { label: "Restaurant optimizations", value: 9 },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white text-slate-900">
          <CardHeader>
            <CardTitle>Invoice history</CardTitle>
            <CardDescription>Download invoices for your records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoiceHistory.map((invoice) => (
              <div key={invoice.period} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{invoice.period}</p>
                  <p className="text-xs text-slate-500">{invoice.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(invoice.amount)}</p>
                  <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-white">
                    Download PDF
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
