# BizOptimize Pro – UI & Experience Refresh Plan

The goal is to elevate BizOptimize Pro from “nice demo” to a polished, professional product that impresses prospects. The refresh breaks down into four themes.

---

## 1. Brand & Visual System

- **Color palette**: adopt a coherent gradient (existing blue→green) plus supporting neutrals. Introduce semantic colors for trust (teal), alerts (amber), success (emerald).
- **Typography**: use a consistent type scale (e.g., Inter with defined sizes/weights). Ensure headings, subheads, body, microcopy are visually separated.
- **Spacing/Grid**: establish section spacing (e.g., 80px hero, 48px interior sections). Base layout on a 12-column grid with consistent gutters.
- **Iconography/Illustrations**: add simple line icons for trust tiles, agent callouts, and scenario cards. Optional: custom hero illustration of AI/analytics.

Deliverables:
- Update `globals.css` with CSS variables for the palette + typography tokens.
- Create a `BrandSection` / `Hero` component that uses the gradient background, layered cards, and CTA grouping.

---

## 2. Landing & Dashboard Flow

### Landing Page Enhancements
- **Hero**: headline + subhead clarifying the AI angle; two CTAs (Start Free Trial, See the Dashboard). Add company logos / trust metrics directly beneath.
- **Use-case cards**: convert the current module grid into illustrated cards with bullet benefits + quick actions (e.g., “Launch module demo”).
- **Proof Section**: add testimonial slider and data bar (“$2.3M saved, 500 companies, etc.”).
- **Footer**: include social icons, newsletter field, and contact info for enterprise deals.

### Dashboard
- Replace the simple header with a two-column hero: greeting + snapshot on the left, CTA to connect with an agent / export on the right.
- Convert the stats cards to a single component with micro animations (numbers count up on load).
- Add “Recent AI Runs” list so it feels like a live system.

---

## 3. Guided Workflow & Templates

- **Wizard**: embed a sticky stepper in the estimator (“1. Basics, 2. Dimensions, 3. Electrical, 4. Summary”). Each section collapses once complete.
- **Templates Gallery**: On the right/agent panel, add quick-start cards (“Two-car garage”, “Workshop + EV”, “Commercial bay”). Clicking a card pre-populates form + suggested agents.
- **Inline Tips**: surface microcopy near each field (e.g., “Tip: add bay count so we can size doors & slab.”). Use small info icons.
- **Agent UX**: style chat bubbles with avatars, show timestamps, and include “Apply all” button for patches.

Implementation steps:
- Create a `WizardSection` component to wrap each form step.
- Build `templates.ts` with scenario defaults + recommended agents.
- Extend `AgentSidebar` to support system tips (chips) and reveal when all required info is provided.

---

## 4. Multi-Agent Insights & Exports

- **Agent Cards**: after running an estimate, show three tabs/cards: Cost Planner, Electrical Engineer, Labour Scheduler. Each contains AI-generated highlights + “Include in Report” toggle.
- **Export Modal**: button near results that opens options (PDF, share link, email). For now, generate a printable view (styled page) with brand colors and agent insights appended.
- **Animations**: use subtle fade/slide for card transitions and agent replies; animate progress through the wizard.

Backend notes:
- `/api/ai` should accept `agents: ["cost", "electrical", "labour"]` and return structured sections (mock for now). These feed the UI cards and the export.

---

## Rollout Order
1. **Visual foundation**: palette, typography, hero redesign, footer (Landing + Dashboard).
2. **Guided estimator**: wizard layout + templates + agent improvements.
3. **Multi-agent cards + export view**.

Each phase should include QA across desktop/tablet, ensuring the agent interactions and estimator remain fully functional.
