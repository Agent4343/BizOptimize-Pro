import Link from "next/link";

const heroStats = [
  { label: "Avg. ROI", value: "340%", trend: "+23% vs last quarter" },
  { label: "Cost savings orchestrated", value: "$72M", trend: "Across 500+ deployments" },
  { label: "Playbooks shipped", value: "1,200+", trend: "Construction • Logistics • F&B" },
];

const featureHighlights = [
  {
    title: "Multi-agent intelligence",
    description:
      "Cost planner, electrical engineer, and labour scheduler agents combine to produce a holistic, client-ready narrative.",
    icon: "🧠",
  },
  {
    title: "Guided ops workspace",
    description:
      "A modern dashboard with scenario templates, recent AI runs, and proactive nudges that keep teams aligned.",
    icon: "🎯",
  },
  {
    title: "Stunning exports",
    description:
      "One-click handoffs generate branded decks with assumptions, savings, and visualized timelines that wow stakeholders.",
    icon: "✨",
  },
];

const workflowSteps = [
  {
    id: "01",
    title: "Answer with natural language",
    body: "Describe the site, constraints, or goals. BizOptimize Agent asks clarifying questions and fills the wizard for you.",
  },
  {
    id: "02",
    title: "Blend modules & agents",
    body: "Activate a construction estimator, trucking optimizer, or restaurant planner, then layer specialized AI agents on top.",
  },
  {
    id: "03",
    title: "Share an executive-grade deck",
    body: "Publish a multi-agent report, complete with savings, service-sizing, and component pricing in under 3 minutes.",
  },
];

const industryUseCases = [
  {
    icon: "🏗️",
    name: "Construction / Garages",
    summary: "Scope garages, tenant improvements, and capital projects with auto labour + electrical assumptions.",
    cta: "Launch estimator",
    href: "/dashboard/modules/construction",
  },
  {
    icon: "🚚",
    name: "Trucking & logistics",
    summary: "Model new lanes, consolidate contracts, and surface driver & fuel savings with fleet AI copilots.",
    cta: "View fleet playbook",
    href: "/dashboard/modules/trucking",
  },
  {
    icon: "🍽️",
    name: "Restaurant & retail",
    summary: "Automate inventory, forecast demand, and generate multi-site profitability packs for franchisees.",
    cta: "Explore retail module",
    href: "/dashboard/modules/restaurant",
  },
];

const testimonials = [
  {
    quote:
      "We replaced a patchwork of spreadsheets with BizOptimize Pro. Clients now receive polished executive summaries minutes after a site walk.",
    author: "Emily Zhao, VP of Operations · Northwind Build Group",
  },
  {
    quote:
      "The AI agents are a game changer. Our teams ask plain-English questions (\"Can we justify 200A service?\") and get defensible answers instantly.",
    author: "Marcus Doyle, Director of Field Services · Aurora Energy",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <header className="relative z-10 border-b border-border bg-white/80 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-2xl text-white shadow-glow">
              ⚙️
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">AI OPS</p>
              <p className="text-lg font-semibold">BizOptimize Pro</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link className="hover:text-foreground" href="/dashboard">
              Product
            </Link>
            <Link className="hover:text-foreground" href="/dashboard/modules/construction">
              Modules
            </Link>
            <Link className="hover:text-foreground" href="#stories">
              Customer stories
            </Link>
            <Link className="hover:text-foreground" href="#contact">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted md:block"
            >
              View demo
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-brand-primary/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary"
            >
              Launch workspace
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
          <div className="absolute -right-20 top-16 h-96 w-96 rounded-full bg-brand-primary/30 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-80 w-80 rounded-full bg-brand-secondary/30 blur-3xl" />

          <div className="container relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-24 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
                <span className="text-sm">★</span> Trusted by builders, brokers, and operators
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Wow clients with AI-crafted ops plans in minutes.
              </h1>
              <p className="text-lg text-white/70">
                Combine domain-specific modules with conversational agents that prefill complex forms, size electrical loads, and produce executive-ready decks. No more spreadsheet sprawl—just confident recommendations that win deals.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/dashboard/modules/construction"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-soft transition hover:-translate-y-0.5"
                >
                  Try the garage estimator
                  <span className="ml-2 text-lg">→</span>
                </Link>
                <Link
                  href="#stories"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white/90 hover:bg-white/10"
                >
                  See customer stories
                </Link>
              </div>
            </div>

            <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Live scenario: EV-ready garage</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                  AI agent typing...
                </span>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Assistant</p>
                  <p className="text-white/90">
                    “For a 2-bay, 28×24’ garage with EV charging, I sized a 150A service, 12 dedicated circuits, and 68 receptacles. Estimated labour: 62 hrs · $4.9k. Ready for export?”
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Multi-agent output</p>
                  <ul className="space-y-2 text-white/85">
                    <li>• Cost planner → $118k total, $27k savings.</li>
                    <li>• Electrical engineer → 200A recommended, load @ 68A.</li>
                    <li>• Labour scheduler → crew 6075-INT, 4-person sprint in 10 days.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto max-w-6xl px-4 pb-16">
            <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 shadow-soft sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-white/50">{stat.label}</p>
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="text-white/60">{stat.trend}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white py-20">
          <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Why BizOptimize</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                An AI control room for ops, finance, and field teams.
              </h2>
              <p className="text-lg text-muted-foreground">
                We combine deterministic playbooks with natural-language copilots. That means your estimators, dispatchers, and analysts can ask the platform anything, get audited numbers back, and move straight to client wow moments.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {featureHighlights.map((feature) => (
                  <div key={feature.title} className="rounded-2xl border border-border p-5 shadow-soft">
                    <div className="mb-3 text-2xl">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white to-muted p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Workflow</p>
              <h3 className="mt-2 text-2xl font-semibold">How teams use BizOptimize</h3>
              <div className="mt-6 space-y-5">
                {workflowSteps.map((step) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary">
                      {step.id}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Use cases</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                Tailored modules with agent presets
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Launch prewired playbooks for each vertical, complete with scenario templates and recommended AI copilots.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {industryUseCases.map((useCase) => (
                <div key={useCase.name} className="flex flex-col rounded-3xl border border-border bg-white p-6 shadow-soft">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-2xl">
                    {useCase.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{useCase.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{useCase.summary}</p>
                  <Link
                    href={useCase.href}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-brand-primary hover:underline"
                  >
                    {useCase.cta}
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="stories" className="border-b border-border bg-white py-20">
          <div className="container mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2">
            {testimonials.map((story) => (
              <div key={story.author} className="rounded-3xl border border-border bg-muted/40 p-6 shadow-soft">
                <p className="text-lg italic text-foreground">“{story.quote}”</p>
                <p className="mt-4 text-sm font-semibold text-muted-foreground">{story.author}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-brand-primary to-brand-secondary py-16 text-white">
          <div className="container mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Ready when you are</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Wow your next client meeting</h2>
            <p className="text-base text-white/80">
              Spin up BizOptimize Pro, apply a garage or logistics template, and let the agent craft a shareable deck in minutes.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-soft hover:-translate-y-0.5"
              >
                Open the workspace
              </Link>
              <Link
                href="/dashboard/modules/construction"
                className="rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
              >
                Preview the estimator
              </Link>
            </div>
          </div>
        </section>

        <footer id="contact" className="bg-slate-950 py-16 text-white">
          <div className="container mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xl">⚙️</div>
                <p className="text-lg font-semibold">BizOptimize Pro</p>
              </div>
              <p className="mt-3 text-sm text-white/60">
                AI copilots for operations, finance, and field teams. Built in Canada, deployed worldwide.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/dashboard">Platform overview</Link>
                </li>
                <li>
                  <Link href="/dashboard/modules/construction">Construction estimator</Link>
                </li>
                <li>
                  <Link href="/dashboard/modules/trucking">Fleet optimizer</Link>
                </li>
                <li>
                  <Link href="/dashboard/modules/restaurant">Retail planner</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Resources</p>
              <ul className="mt-3 space-y-2 text-sm text-white/60">
                <li>Playbooks</li>
                <li>Security</li>
                <li>Status</li>
                <li>APIs</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Connect</p>
              <p className="mt-3 text-sm text-white/60">enterprise@bizoptimize.pro</p>
              <p className="text-sm text-white/60">+1 (604) 555-0112</p>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
            © {new Date().getFullYear()} BizOptimize Pro. Built for teams who ship results.
          </div>
        </footer>
      </main>
    </div>
  );
}
