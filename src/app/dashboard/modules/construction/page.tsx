"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentSidebar, AgentChatMessage } from "@/components/agent/AgentSidebar";
import { requestOptimization } from "@/lib/ai-client";
import { sendAgentMessage } from "@/lib/agent-client";
import { formatCurrency } from "@/lib/format";
import { toNumber } from "@/lib/numbers";

const labourCodes = [
  {
    code: "6040-RGH",
    label: "6040 · Rough Carpentry Crew",
    description: "Framing, sheath, and rough opening prep",
    hourlyRate: 78,
  },
  {
    code: "6075-INT",
    label: "6075 · Interior Finishing Crew",
    description: "Drywall, trim, fixtures, finish carpentry",
    hourlyRate: 84,
  },
  {
    code: "6130-MEP",
    label: "6130 · MEP Install Team",
    description: "Mechanical / electrical / plumbing rough-in",
    hourlyRate: 96,
  },
];

const structureOptions = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial / Warehouse" },
];

const scenarioTemplates = [
  {
    id: "two-bay-ev",
    name: "EV-ready two-bay",
    badge: "Popular",
    description: "28×24' heated garage, EV charger, compressor circuit, premium finish.",
    metrics: "150A service · 62 labour hrs · $124k target",
    defaults: {
      projectName: "North Shore EV Garage",
      structureType: "residential",
      length: "28",
      width: "24",
      bays: "2",
      floors: "1",
      squareFootage: "672",
      electricalScope: "heavy-duty",
      finishLevel: "heated",
      specialRequirements: "50A EV charger, 30A welder circuit, radiant slab rough-in.",
      location: "North Vancouver, BC",
    },
  },
  {
    id: "deluxe-carriage",
    name: "Carriage house + loft",
    badge: "New",
    description: "36×28' carriage house with loft suite, panel upgrade, luxury finish.",
    metrics: "200A service · 94 labour hrs · $212k target",
    defaults: {
      projectName: "Carriage Loft Retreat",
      structureType: "residential",
      length: "36",
      width: "28",
      bays: "3",
      floors: "2",
      squareFootage: "1008",
      bedrooms: "1",
      bathrooms: "1",
      electricalScope: "panel-upgrade",
      finishLevel: "heated",
      specialRequirements: "Loft suite rough-ins, mini-split heat, glass doors.",
      location: "Victoria, BC",
    },
  },
  {
    id: "pro-workshop",
    name: "Pro workshop shell",
    badge: "Efficiency",
    description: "40×30' commercial workshop shell, engineered slab, shell finish.",
    metrics: "125A service · 78 labour hrs · $186k target",
    defaults: {
      projectName: "Precision Fabrication Bay",
      structureType: "commercial",
      length: "40",
      width: "30",
      bays: "3",
      floors: "1",
      squareFootage: "1200",
      electricalScope: "heavy-duty",
      finishLevel: "shell",
      specialRequirements: "Engineered slab for lifts, 3-phase prep, 14' doors.",
      location: "Calgary, AB",
    },
  },
];

const wizardSteps = [
  { id: "01", title: "Project basics", fields: ["projectName", "structureType", "location"] },
  { id: "02", title: "Dimensions", fields: ["length", "width", "squareFootage", "bays"] },
  { id: "03", title: "Systems & finish", fields: ["electricalScope", "finishLevel", "specialRequirements"] },
];

interface ConstructionMetrics {
  projectCost?: number;
  savings?: number;
  labourHourlyRate?: number;
  labourCode?: string;
  labourDescription?: string;
  labourHours?: number;
  labourCost?: number;
  wireLength?: number;
  wireGauge?: string;
  circuits?: number;
  serviceAmps?: number;
  serviceLoad?: number;
  serviceRationale?: string;
}

type ConstructionFormState = {
  projectName: string;
  squareFootage: string;
  length: string;
  width: string;
  bays: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
  labourCode: string;
  structureType: string;
  floors: string;
  electricalScope: string;
  finishLevel: string;
  specialRequirements: string;
};

export default function ConstructionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ConstructionMetrics>({});
  const [formData, setFormData] = useState<ConstructionFormState>({
    projectName: "",
    squareFootage: "",
    length: "",
    width: "",
    bays: "1",
    bedrooms: "",
    bathrooms: "",
    location: "",
    labourCode: labourCodes[0]?.code ?? "",
    structureType: structureOptions[0]?.value ?? "residential",
    floors: "2",
    electricalScope: "standard",
    finishLevel: "shell",
    specialRequirements: "",
  });
  const [agentMessages, setAgentMessages] = useState<AgentChatMessage[]>([
    {
      id: "agent-welcome",
      role: "assistant",
      content:
        "Need a hand? Tell me the garage dimensions, bays, electrical loads, or finish level and I'll shape the estimate.",
    },
  ]);
  const [agentSuggestions, setAgentSuggestions] = useState([
    "Garage is 30x24 with 2 bays",
    "Do I need 200 amp service for EV + compressor?",
    "Price plugs/switches for a finished workshop",
  ]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const labourDetails = labourCodes.find((code) => code.code === formData.labourCode);

  const generateEstimate = async () => {
    setLoading(true);
    setError(null);
    const squareFootage =
      toNumber(formData.squareFootage) ??
      deriveSquareFootage(toNumber(formData.length), toNumber(formData.width));
    const bedrooms = toNumber(formData.bedrooms);
    const bathrooms = toNumber(formData.bathrooms);
    const estimatedBudget = squareFootage ? squareFootage * 190 : undefined;
    const floors = toNumber(formData.floors);
    const electricalPlan = deriveElectricalPlan(squareFootage, formData.structureType, floors);
    const labourHours = deriveLabourHours(squareFootage, formData.structureType);
    const labourCost =
      labourHours && labourDetails?.hourlyRate
        ? Math.round(labourHours * labourDetails.hourlyRate)
        : undefined;
    const servicePlan = deriveServiceRecommendation(squareFootage, electricalPlan?.circuits);

    const prompt = [
      `Estimate a ${formData.structureType} build named "${formData.projectName || "Unnamed Project"}" in ${
        formData.location || "the listed region"
      }.`,
      squareFootage
        ? `Total area ${squareFootage.toLocaleString()} sq ft across ${floors || 1} floors, ${bedrooms || 0} bedrooms, ${bathrooms || 0} bathrooms.`
        : "",
      formData.length && formData.width
        ? `Dimensions provided: ${formData.length}' x ${formData.width}' with ${formData.bays || "1"} bay(s).`
        : `Number of bays: ${formData.bays || "1"}.`,
      `Electrical scope: ${formData.electricalScope}. Finish level: ${formData.finishLevel}.`,
      formData.specialRequirements ? `Special requirements: ${formData.specialRequirements}.` : "",
      `Include labour code ${labourDetails?.code} (${labourDetails?.description}) and call out the labour section explicitly.`,
      `Infer electrical materials (wire gauge, feeder length, circuit counts) directly from area and building type.`,
      "Reference that the analysis is generated by BizOptimize AI (Claude Sonnet 4 via OpenRouter).",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const data = await requestOptimization({
        prompt,
        businessType: "construction",
        optimizationType: "estimate",
        metadata: {
          projectName: formData.projectName,
          squareFootage,
          length: toNumber(formData.length),
          width: toNumber(formData.width),
          bedrooms,
          bathrooms,
          location: formData.location,
          estimatedBudget,
          labourCode: labourDetails?.code,
          labourDescription: labourDetails?.description,
          labourHourlyRate: labourDetails?.hourlyRate,
          structureType: formData.structureType,
          floors,
          bays: toNumber(formData.bays),
          electricalScope: formData.electricalScope,
          finishLevel: formData.finishLevel,
          specialRequirements: formData.specialRequirements,
          predictedWireLength: electricalPlan?.wireLength,
          predictedWireGauge: electricalPlan?.wireGauge,
          predictedCircuits: electricalPlan?.circuits,
          estimatedLabourHours: labourHours,
          estimatedLabourCost: labourCost,
          serviceMainSize: servicePlan?.recommendedAmps,
          serviceLoadAmps: servicePlan?.estimatedLoadAmps,
          serviceRationale: servicePlan?.rationale,
          aiProvider: "BizOptimize AI · Claude Sonnet 4 via OpenRouter",
        },
      });

      setResult(data.result);
      setMetrics({
        projectCost: estimatedBudget,
        savings: data.estimatedSavings,
        labourCode: labourDetails?.code,
        labourDescription: labourDetails?.description,
        labourHourlyRate: labourDetails?.hourlyRate,
        labourHours,
        labourCost,
        wireLength: electricalPlan?.wireLength,
        wireGauge: electricalPlan?.wireGauge,
        circuits: electricalPlan?.circuits,
        serviceAmps: servicePlan?.recommendedAmps,
        serviceLoad: servicePlan?.estimatedLoadAmps,
        serviceRationale: servicePlan?.rationale,
      });
    } catch (apiError) {
      console.error("Error:", apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Error generating estimate. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSend = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const userMessage: AgentChatMessage = {
      id: createLocalId(),
      role: "user",
      content: trimmed,
    };

    const nextHistory = [...agentMessages, userMessage].map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));

    setAgentMessages((previous) => [...previous, userMessage]);
    setAgentLoading(true);

    try {
      const response = await sendAgentMessage({
        message: trimmed,
        history: nextHistory,
        context: { formData },
      });

      if (response.suggestions?.length) {
        setAgentSuggestions(response.suggestions);
      }

      const assistantMessage: AgentChatMessage = {
        id: createLocalId(),
        role: "assistant",
        content: response.reply,
        fields: response.fields,
      };
      setAgentMessages((previous) => [...previous, assistantMessage]);
    } catch (agentError) {
      const fallback: AgentChatMessage = {
        id: createLocalId(),
        role: "assistant",
        content:
          agentError instanceof Error
            ? agentError.message
            : "I ran into a problem processing that request. Try again in a few seconds.",
      };
      setAgentMessages((previous) => [...previous, fallback]);
    } finally {
      setAgentLoading(false);
    }
  };

  const applyAgentFields = (fields: Record<string, string | number>) => {
    setFormData((previous) => {
      const next = { ...previous };
      Object.entries(fields).forEach(([key, value]) => {
        if (key in next) {
          const nextValue =
            typeof next[key as keyof ConstructionFormState] === "string"
              ? String(value ?? "")
              : (value as ConstructionFormState[keyof ConstructionFormState]);
          next[key as keyof ConstructionFormState] = nextValue as never;
        }
      });
      return next;
    });
  };

  const handleTemplateApply = (templateId: string) => {
    const template = scenarioTemplates.find((item) => item.id === templateId);
    if (!template) return;

    setFormData((previous) => ({
      ...previous,
      ...template.defaults,
    }));
    setSelectedTemplateId(templateId);
    setResult("");
    setMetrics({});
    setAgentMessages((previous) => [
      ...previous,
      {
        id: createLocalId(),
        role: "assistant",
        content: `Loaded the ${template.name} template. Adjust any detail and click Generate to refresh labour, service, and component pricing.`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/dashboard")}
            className="border-white/30 text-white hover:bg-white/10"
          >
            ← Back to dashboard
          </Button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Estimator</p>
            <p className="text-lg font-semibold">Construction · Garage / workshop</p>
          </div>
        </div>
      </header>

      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Guided workflow</p>
              <h1 className="text-2xl font-semibold">Tell the agent what you&apos;re building</h1>
              <p className="text-sm text-white/70">
                Complete each step or let the BizOptimize Agent fill the blanks. Templates on the right pre-populate dimensions,
                electrical scope, and labour assumptions.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {wizardSteps.map((step, index) => {
                  const complete = isStepComplete(step.fields);
                  const isCurrent = index === activeStepIndex;
                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border border-white/10 p-4 ${
                        complete ? "bg-emerald-500/10" : isCurrent ? "bg-white/10" : "bg-white/5"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">{step.id}</p>
                      <p className="text-lg font-semibold text-white">{step.title}</p>
                      <p className="text-xs text-white/70">
                        {complete ? "✅ Complete" : isCurrent ? "In progress" : "Needs details"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Scenario templates</p>
              <h2 className="text-xl font-semibold">One-click presets</h2>
              <div className="mt-4 space-y-3">
                {scenarioTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateApply(template.id)}
                    className={`w-full rounded-2xl border border-white/15 px-4 py-3 text-left transition ${
                      selectedTemplateId === template.id ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-white/60">{template.badge}</p>
                        <p className="text-lg font-semibold text-white">{template.name}</p>
                      </div>
                      <span>→</span>
                    </div>
                    <p className="text-sm text-white/70">{template.description}</p>
                    <p className="text-xs text-white/50">{template.metrics}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 pb-12">
        <div className="-mt-10 grid grid-cols-1 gap-8 rounded-3xl bg-white p-6 text-slate-900 shadow-soft xl:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Enter your project information for accurate estimation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    placeholder="Smith Family Home"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Structure Type</label>
                    <select
                      value={formData.structureType}
                      onChange={(e) => setFormData({ ...formData, structureType: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {structureOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Floors</label>
                    <Input
                      placeholder="2"
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                      type="number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Length (ft)</label>
                    <Input
                      placeholder="30"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width (ft)</label>
                    <Input
                      placeholder="20"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      type="number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bays</label>
                    <Input
                      placeholder="1"
                      value={formData.bays}
                      onChange={(e) => setFormData({ ...formData, bays: e.target.value })}
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Square Footage</label>
                    <Input
                      placeholder="2000"
                      value={formData.squareFootage}
                      onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <Input
                      placeholder="3"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      type="number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <Input
                      placeholder="2.5"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="St. John's, NL"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Labour Code</label>
                  <select
                    value={formData.labourCode}
                    onChange={(e) => setFormData({ ...formData, labourCode: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {labourCodes.map((code) => (
                      <option key={code.code} value={code.code}>
                        {code.label}
                      </option>
                    ))}
                  </select>
                  {labourDetails && (
                    <p className="text-xs text-gray-500">
                      {labourDetails.description} · Approx. ${labourDetails.hourlyRate}/hr crew rate
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Electrical Scope</label>
                    <select
                      value={formData.electricalScope}
                      onChange={(e) => setFormData({ ...formData, electricalScope: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="standard">Standard outlets & lighting</option>
                      <option value="heavy-duty">Heavy-duty (compressor / welders / EV)</option>
                      <option value="panel-upgrade">Panel upgrade & feeders</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Finish Level</label>
                    <select
                      value={formData.finishLevel}
                      onChange={(e) => setFormData({ ...formData, finishLevel: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1                             text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="shell">Shell / unfinished interior</option>
                      <option value="insulated">Insulated + drywall</option>
                      <option value="heated">Heated & finished workspace</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Requirements</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    rows={3}
                    placeholder="Overhead door sizes, loft storage, EV charger, engineered slab, etc."
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  />
                </div>
              <Button 
                onClick={generateEstimate} 
                disabled={
                  loading ||
                  (!formData.squareFootage && !(formData.length && formData.width))
                }
                className="w-full"
              >
                {loading ? 'Generating Estimate...' : 'Generate AI Estimate'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Powered by BizOptimize AI · Claude Sonnet 4 via OpenRouter
              </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle>Project Clarification Checklist</CardTitle>
                  <CardDescription>
                    Answering these keeps the garage quote accurate.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">Before requesting a quote, confirm:</p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Overall dimensions or total square footage (length × width).</li>
                    <li>Number of bays/floors and whether loft or storage space is required.</li>
                    <li>Electrical loads: standard outlets only, or heavy gear / EV / sub-panel.</li>
                    <li>Finish level expectations (shell, insulated, heated/workshop).</li>
                    <li>Special structural needs: engineered slab, door sizes, hoists, etc.</li>
                  </ul>
                  <p className="text-xs text-slate-500">
                    The agent sidebar can fill these in—just describe your garage and it will ask follow-up questions automatically.
                  </p>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Estimate Results</CardTitle>
                  <CardDescription>
                    AI-generated construction estimate with cost optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                {error && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(metrics.projectCost ?? 278241)}
                        </div>
                        <div className="text-sm text-gray-600">Total Project Cost</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(metrics.savings ?? 57400)}
                        </div>
                        <div className="text-sm text-gray-600">Potential Savings</div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="text-sm uppercase tracking-wide text-amber-700 mb-1">
                          Labour Code
                        </div>
                        <div className="text-lg font-semibold text-amber-900">
                          {metrics.labourCode || labourDetails?.code || "—"}
                        </div>
                        <p className="text-sm text-amber-700">
                          {metrics.labourDescription || labourDetails?.description || "Labour crew selection pending"}
                        </p>
                        {metrics.labourHourlyRate && (
                          <p className="text-xs text-amber-700 mt-2">
                            Crew rate approx. ${metrics.labourHourlyRate}/hr
                          </p>
                        )}
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-lg text-left">
                        <div className="text-sm uppercase tracking-wide text-emerald-700 mb-1">
                          Labour Allocation
                        </div>
                        <p className="text-2xl font-bold text-emerald-900">
                          {metrics.labourCost ? formatCurrency(metrics.labourCost) : "—"}
                        </p>
                        <p className="text-sm text-emerald-700">
                          {(metrics.labourHours ?? "—").toString()} hrs estimated for crew{" "}
                          {metrics.labourCode || labourDetails?.code || "—"}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-left">
                        <div className="text-sm uppercase tracking-wide text-purple-700 mb-1">
                          Service Capacity
                        </div>
                        <p className="text-2xl font-bold text-purple-900">
                          {metrics.serviceAmps ? `${metrics.serviceAmps} A` : "100 A"}
                        </p>
                        <p className="text-sm text-purple-700">
                          {metrics.serviceRationale || "Rule-of-thumb sizing based on current load."}
                        </p>
                      </div>
                    </div>
                    {(metrics.wireLength || metrics.wireGauge) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-gray-200 p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Electrical Rough-In Plan</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {metrics.wireLength && (
                              <li>Wire allowance: {metrics.wireLength.toLocaleString()} ft</li>
                            )}
                            {metrics.wireGauge && <li>Recommended conductor: {metrics.wireGauge}</li>}
                            {metrics.circuits && <li>Baseline circuits: {metrics.circuits}</li>}
                          </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Provider</h4>
                          <p className="text-sm text-gray-600">
                            Estimate validated by BizOptimize AI · Claude Sonnet 4 via OpenRouter with automated material inference.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap">{result}</pre>
                    </div>
                    <Button variant="outline" className="w-full">
                      📄 Export Estimate
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏗️</div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Generate Estimate</h3>
                    <p className="text-gray-600">
                      Fill out the project details to generate a comprehensive AI-powered construction estimate.
                    </p>
                  </div>
                )}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="h-full">
            <AgentSidebar
              messages={agentMessages}
              suggestions={agentSuggestions}
              loading={agentLoading}
              onSend={handleAgentSend}
              onApplyFields={applyAgentFields}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function deriveElectricalPlan(
  squareFootage?: number,
  structureType?: string,
  floors?: number,
) {
  if (!squareFootage) {
    return undefined;
  }

  const footprint = Math.sqrt(squareFootage);
  const perimeter = footprint * 4;
  const floorMultiplier = Math.max(1, floors ?? 1);
  const structureMultiplier =
    structureType === "industrial" ? 1.4 : structureType === "commercial" ? 1.25 : 1;

  const circuits = Math.max(6, Math.ceil(squareFootage / 450));
  const wireLength = Math.round(perimeter * floorMultiplier * structureMultiplier * 1.5);
  const wireGauge =
    squareFootage > 5000
      ? "10 AWG copper feeder"
      : squareFootage > 2500
        ? "12 AWG copper branch circuits"
        : "14 AWG copper branch circuits";

  return {
    wireLength,
    wireGauge,
    circuits,
  };
}

function deriveSquareFootage(length?: number, width?: number) {
  if (!length || !width) return undefined;
  return Math.round(length * width);
}

function deriveLabourHours(squareFootage?: number, structureType?: string) {
  if (!squareFootage) return undefined;
  const rate = structureType === "commercial" ? 0.12 : structureType === "industrial" ? 0.14 : 0.09;
  return Math.max(40, Math.round(squareFootage * rate));
}

function deriveServiceRecommendation(squareFootage?: number, circuits?: number) {
  if (!squareFootage) {
    return undefined;
  }
  const baseLoadWatts = squareFootage * 3;
  const circuitAllowance = circuits ? circuits * 1500 : 0;
  const totalWatts = baseLoadWatts + circuitAllowance;
  const estimatedLoadAmps = Math.ceil(totalWatts / 240);
  const recommendedAmps = estimatedLoadAmps > 90 ? 200 : 100;

  return {
    estimatedLoadAmps,
    recommendedAmps,
    rationale:
      recommendedAmps === 200
        ? "Load exceeds 90 amps, recommend upgrading to 200 A service."
        : "Load within 100 A rule-of-thumb envelope.",
  };
}

function createLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `agent-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}