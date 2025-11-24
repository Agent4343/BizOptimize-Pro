# BizOptimize Pro – AI Agent Expansion Plan

This document captures the architecture and implementation steps required to layer “agent” experiences across the construction estimator. The goal is to make the workflow collaborative, conversational, and scenario-driven while keeping the existing `/api/ai` surface area.

---

## 1. Architecture Overview

| Layer | Responsibility | Notes |
| --- | --- | --- |
| UI – Agent Sidebar | Two-pane layout next to the estimator form. Hosts a chat transcript, quick actions, and dynamic suggestions. | Powered by the same `/api/ai` backend with a `mode: "assistant"` flag. |
| UI – Command Palette | Modal triggered via `Cmd/Ctrl + K` or “Ask BizOptimize AI”. Accepts free-form prompts (“price a 4500 sq ft commercial retrofit”) and emits structured estimator inputs. | Uses lightweight DSL + fuzzy matching to map the utterance to known fields/templates. |
| UI – Scenario Templates | Cards (e.g., “Townhome Build”, “Commercial Retrofit”, “Warehouse Expansion”) that prefill the form. Each template references an agent + metadata bundle. | Templates appear in the sidebar and can be swapped mid-session. |
| API – Multi-Agent Pipeline | `/api/ai` accepts `agents: ["cost-planner","electrical","labour"]`. The route fans out to predefined prompt skeletons and merges their reports. | Initial implementation will stub the responses (still mock) but maintain shape for easy OpenRouter integration later. |
| State Orchestration | React context (e.g., `AgentContext`) wrapping the estimator page, sharing form setters, agent history, and busy indicators. | Ensures chat replies can mutate the form without prop-drilling. |

---

## 2. Conversational Agent Sidebar (Task 2)

### UX
1. Split the estimator page into two columns (form + agent).
2. Sidebar features:
   - Conversation transcript with bubbles (“Agent” vs “You”).
   - Suggested questions (chips) such as “What wire gauge should I use for 5,000 sq ft?”.
   - Quick actions (Apply to form, Run Estimate).

### Data Flow
1. User sends a message → `POST /api/ai` with `{ mode: "assistant", message, context: form }`.
2. API returns `reply`, `actions` (structured suggestions), and `fields` (key/value pairs it wants to update).
3. UI applies `fields` to the form (after confirmation) and appends transcript entries.

### Implementation Steps
- [ ] Create `AgentSidebar` component with chat UI.
- [ ] Add `useAgent` hook (manages history, loading, applyChanges).
- [ ] Update `/api/ai` mock to understand `mode: "assistant"` (return synthetic replies + field patches).

---

## 3. Multi-Agent Report Generation (Task 3)

### Agents
| Agent | Prompt Focus | Expected Output |
| --- | --- | --- |
| Cost Planner | Budget, material splits, risk allowances. | Markdown table of costs. |
| Electrical Engineer | Wire gauges, panel sizing, circuit counts. | Bullet list with reasoning. |
| Labour Scheduler | Crew codes, hourly rates, dependency timeline. | Timeline + crew assignments. |

### Backend Changes
- Extend request payload: `{ agents?: string[] }`.
- For each agent, run the corresponding template:
  ```ts
  const agentResults = agents?.map(agent => buildAgentBlock(agent, metadata));
  ```
- Merge into final response under `## Agent Insights`.

### Frontend Changes
- Display agent-specific cards under the estimate results (each card cites the agent).
- Allow toggling agents in the sidebar (checkboxes) before running an estimate.

---

## 4. Command Palette / Natural Language Intent (Task 4)

### UX
- Keyboard shortcut `Cmd/Ctrl + K`.
- Input box with suggestions; hitting enter runs `handleCommand(text)`.

### Parsing Strategy
1. Simple regex / heuristics (e.g., `(\d+)\s*(sq ?ft)` → square footage).
2. Fallback to `/api/ai` with `mode: "intent"` which returns structured data.
3. Display diff preview (“Set square footage to 4500? [Apply]”).

### Implementation Tasks
- [ ] Build `CommandPalette` component (portal/modal).
- [ ] Add parser utility (`parseEstimatorIntent`).
- [ ] Wire to form state + templates.

---

## 5. Scenario Templates (Task 5)

### Template Definition
```ts
type Template = {
  id: "townhome" | "commercial" | ...;
  label: string;
  description: string;
  defaults: Partial<FormState>;
  agents: string[];
};
```

### UX
- Templates shown as cards under the sidebar (or a dropdown near “Project Details”).
- Clicking a card:
  - Prefills the form with `defaults`.
  - Turns on recommended agents.
  - Optionally triggers the agent sidebar to explain the scenario.

### Steps
- [ ] Add `templates.ts` with sample scenarios.
- [ ] Provide UI to apply/reset templates.
- [ ] Emit telemetry event (optional) for future analytics.

---

## 6. Rollout Strategy

1. **Phase 1 (Sidebar + Multi-Agent)**: ship the conversational sidebar plus backend fan-out (even if mock). This delivers immediate UX value.
2. **Phase 2 (Command Palette)**: once sidebar stable, add the command palette for power users.
3. **Phase 3 (Templates + Telemetry)**: finalize scenario presets and measure usage.
4. **Phase 4 (Real AI Calls)**: swap mock responses with OpenRouter multi-call pipeline; reuse the same agent scaffolding.

---

## 7. Risks & Considerations
- **State Sync**: ensure form edits made outside the sidebar don’t conflict with agent suggestions.
- **Latency**: multi-agent runs mean more API time; consider streaming responses or parallel fetches.
- **Cost Control**: when moving to real AI, gate agent counts (maybe 2 max) unless on enterprise plan.
- **Accessibility**: command palette + chat controls should be keyboard navigable.

---

## 8. Next Steps
1. Finalize UI wireframes (sidebar layout, palette modal).
2. Scaffold React context/hooks for shared state.
3. Implement `/api/ai` modes: `assistant`, `intent`, `agents`.
4. Incrementally plug UI components (sidebar → agent cards → palette → templates).
5. Add analytics/logging to understand how users engage with agents.

This plan keeps the estimator backward-compatible while opening the door to much richer agent-driven workflows. Once the team agrees on UX, we can start implementing tasks 2–5 in order.
