"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const multiAgentInsights = [
  {
    title: "Cost planner",
    subtitle: "Garage modernization",
    impact: "$118k total · $27k savings",
    detail: "Leveraging copper vs. aluminum hybrid cabling and prefab harnesses.",
    icon: "📈",
    accent: "from-brand-primary to-emerald-400",
  },
  {
    title: "Electrical engineer",
    subtitle: "Service sizing",
    impact: "200A service recommended",
    detail: "Load peaks at 68A w/ EV + shop equipment. 150A acceptable fallback.",
    icon: "⚡",
    accent: "from-purple-500 to-blue-500",
  },
  {
    title: "Labour scheduler",
    subtitle: "Crew 6075-INT",
    impact: "62 hours · 4-person team",
    detail: "Split over rough-in, trim, QA. Utilisation tracking enabled.",
    icon: "👷‍♂️",
    accent: "from-orange-500 to-yellow-400",
  },
];

const activityFeed = [
  {
    time: "2 min ago",
    title: "Agent drafted EV-ready garage summary",
    detail: "Added plugs, switches, service load & labour assumptions to export deck.",
  },
  {
    time: "1 hr ago",
    title: "Fleet optimizer flagged idle assets",
    detail: "Suggested reassigning 3 tractors from idle lot to Quebec corridor.",
  },
  {
    time: "Yesterday",
    title: "Restaurant module closed inventory loop",
    detail: "Auto-generated spoilage report + reorder suggestions for Lonsdale site.",
  },
];

const scenarioTemplates = [
  {
    id: "garage-ev",
    name: "EV-ready garage",
    summary: "28×24’, dual bay, conduit + panel upgrade, EVSE ready.",
    icon: "🔌",
  },
  {
    id: "tenant-fitout",
    name: "Commercial tenant fit-out",
    summary: "600V service, lighting density calc, fire alarm tie-ins.",
    icon: "🏢",
  },
  {
    id: "fleet-expansion",
    name: "Fleet expansion",
    summary: "Add 12 tractors, plan fueling + maintenance cadence.",
    icon: "🚚",
  },
];

const modules = [
  {
    id: "construction",
    name: "Construction Estimator",
    description: "Prefill project assumptions, labour codes, and materials in minutes.",
    icon: "🏗️",
    savings: "$94,610",
    status: "In progress",
    tone: "from-slate-900 via-slate-800 to-slate-900",
  },
  {
    id: "trucking",
    name: "Fleet Optimizer",
    description: "Surface lane profitability, idle assets, and driver schedules.",
    icon: "🚛",
    savings: "$574,720",
    status: "Healthy",
    tone: "from-emerald-700 via-emerald-600 to-emerald-700",
  },
  {
    id: "restaurant",
    name: "Restaurant Manager",
    description: "Predict demand, right-size inventory, and generate waste recaps.",
    icon: "🍽️",
    savings: "$45,250",
    status: "Calibrated",
    tone: "from-amber-600 via-orange-500 to-amber-600",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Command center</p>
            <h1 className="text-2xl font-semibold">BizOptimize Pro · Atlantic Construction</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              Live support
            </Button>
            <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90">
              Export deck
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-10">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <CardHeader className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Today&apos;s pulse</p>
              <CardTitle className="text-3xl font-semibold">Guided plan · Garage modernization</CardTitle>
              <CardDescription className="max-w-2xl text-white/70">
                Agents synced 42 data points overnight (labour codes, service sizing, materials). You&apos;re 1 step away from sending a
                client-ready story.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Total savings", value: "$714,580", change: "+23% vs last month" },
                { label: "Open playbooks", value: "6 active modules", change: "2 require review" },
                { label: "Export queue", value: "3 drafts", change: "Next: Garage w/ EV load" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50">{item.label}</p>
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="text-sm text-white/70">{item.change}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Recent AI activity</CardTitle>
              <CardDescription className="text-white/70">Agents syncing context in the background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {activityFeed.map((item) => (
                <div key={item.title}>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.time}</p>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-white/70">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Multi-agent insights</p>
              <h2 className="text-2xl font-semibold text-white">Live reasoning stream</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => router.push("/dashboard/modules/construction")}
            >
              Open estimator
            </Button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {multiAgentInsights.map((card) => (
              <div
                key={card.title}
                className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-6 text-white shadow-soft`}
              >
                <div className="text-2xl">{card.icon}</div>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/70">{card.title}</p>
                <h3 className="text-xl font-semibold">{card.subtitle}</h3>
                <p className="text-sm text-white/80">{card.detail}</p>
                <p className="mt-4 text-sm font-semibold">{card.impact}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Scenario templates</CardTitle>
              <CardDescription className="text-white/70">Prefill the estimator with one tap</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {scenarioTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/modules/${template.id.includes("fleet") ? "trucking" : "construction"}`)}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:border-white/30 hover:bg-white/5"
                >
                  <div className="text-2xl">{template.icon}</div>
                  <p className="mt-3 text-sm uppercase tracking-wide text-white/60">Template</p>
                  <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                  <p className="text-sm text-white/70">{template.summary}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Next best actions</CardTitle>
              <CardDescription className="text-white/70">Nudges from BizOptimize Agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Send the EV-ready garage deck (agent drafted 87% of it).",
                "Invite electrician partner to review the labour allocation.",
                "Trigger trucking module to reprice the winter lanes contract.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Active modules</CardTitle>
              <CardDescription className="text-white/70">Tap to jump into a guided playbook</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              {modules.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/modules/${module.id}`)}
                  className={`rounded-3xl border border-white/10 bg-gradient-to-br ${module.tone} p-6 text-left text-white transition hover:-translate-y-1`}
                >
                  <div className="text-3xl">{module.icon}</div>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/70">{module.status}</p>
                  <h3 className="text-xl font-semibold">{module.name}</h3>
                  <p className="text-sm text-white/80">{module.description}</p>
                  <p className="mt-4 text-sm font-semibold">{module.savings} saved</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}