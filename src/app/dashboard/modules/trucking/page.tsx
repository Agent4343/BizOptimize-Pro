"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommandPalette } from "@/components/agent/CommandPalette";
import { requestOptimization } from "@/lib/ai-client";
import { formatCurrency } from "@/lib/format";
import { toNumber } from "@/lib/numbers";
import { trackEvent } from "@/lib/telemetry";

interface FleetMetrics {
  monthlyOperatingCost?: number;
  annualSavings?: number;
  threeYearSavings?: number;
}

export default function TruckingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FleetMetrics>({});
  const [formData, setFormData] = useState({
    companyName: "",
    fleetSize: "",
    monthlyFuelCost: "",
    emptyMiles: "",
    primaryRoutes: "",
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen((previous) => !previous);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const applyScenario = (scenario: Partial<typeof formData>) => {
    setFormData((previous) => ({
      ...previous,
      ...scenario,
    }));
  };

  const analyzeFleet = async () => {
    setLoading(true);
    setError(null);

    const fleetSize = toNumber(formData.fleetSize);
    const monthlyFuelCost = toNumber(formData.monthlyFuelCost);
    const emptyMiles = toNumber(formData.emptyMiles);

    const missing: string[] = [];
    if (!formData.companyName) missing.push("company name");
    if (!fleetSize) missing.push("fleet size");
    if (!monthlyFuelCost) missing.push("monthly fuel cost");
    if (!formData.primaryRoutes) missing.push("primary routes");
    if (missing.length) {
      setError(`Add ${missing.join(", ")} before running the analysis.`);
      setLoading(false);
      trackEvent("trucking_validation_failed", { missing });
      return;
    }

    try {
      const data = await requestOptimization({
        prompt: `Fleet analysis: ${formData.fleetSize} trucks, $${formData.monthlyFuelCost} fuel cost, ${formData.emptyMiles}% empty miles, routes: ${formData.primaryRoutes}`,
        businessType: "trucking",
        optimizationType: "fleet",
        metadata: {
          companyName: formData.companyName,
          fleetSize,
          monthlyFuelCost,
          emptyMiles,
          primaryRoutes: formData.primaryRoutes,
        },
      });

      const monthlyOperatingCost = monthlyFuelCost
        ? Math.round(monthlyFuelCost * 1.6)
        : undefined;

      setResult(data.result);
      setMetrics({
        monthlyOperatingCost,
        annualSavings: data.estimatedSavings,
        threeYearSavings: data.estimatedSavings * 3,
      });
      trackEvent("trucking_analysis_generated", {
        fleetSize,
        emptyMiles,
        routes: formData.primaryRoutes,
      });
    } catch (apiError) {
      console.error("Error:", apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Error analyzing fleet. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = async () => {
    if (!metrics.annualSavings && !metrics.monthlyOperatingCost) return;
    const text = `Fleet summary: Monthly operating cost ${formatCurrency(
      metrics.monthlyOperatingCost ?? 0,
    )}, annual savings ${formatCurrency(metrics.annualSavings ?? 0)}, 3-year savings ${formatCurrency(metrics.threeYearSavings ?? 0)}.`;
    await navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    trackEvent("trucking_summary_copied", { companyName: formData.companyName });
  };

  const handleDownloadDeckMarkdown = () => {
    if (!result) return;
    const content = buildFleetDeckMarkdown({ formData, metrics, result });
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData.companyName || "fleet-analysis"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackEvent("trucking_deck_markdown_downloaded", { companyName: formData.companyName });
  };

  const handleExportDeckPdf = () => {
    if (!result) return;
    if (typeof window === "undefined") return;
    const html = buildFleetDeckHtml({ formData, metrics, result });
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    trackEvent("trucking_deck_pdf_exported", { companyName: formData.companyName });
  };

  const handleCommandSubmit = async (command: string) => {
    const text = command.toLowerCase();
    if (text.includes("atlantic loop")) {
      trackEvent("trucking_palette_command", { command: "atlantic loop" });
      applyScenario({
        companyName: "Atlantic Loop Logistics",
        fleetSize: "24",
        monthlyFuelCost: "42000",
        emptyMiles: "28",
        primaryRoutes: "Halifax ↔ Montreal ↔ St. John's",
      });
      setIsCommandPaletteOpen(false);
      return;
    }
    if (text.includes("prairie") || text.includes("calgary")) {
      trackEvent("trucking_palette_command", { command: "prairie west" });
      applyScenario({
        companyName: "Prairie West Freight",
        fleetSize: "18",
        monthlyFuelCost: "36000",
        emptyMiles: "22",
        primaryRoutes: "Calgary ↔ Regina ↔ Winnipeg",
      });
      setIsCommandPaletteOpen(false);
      return;
    }
    if (text.includes("set empty miles") || text.includes("% empty")) {
      const match = text.match(/(\d+)\s*%?/);
      if (match) {
        applyScenario({ emptyMiles: match[1] });
        trackEvent("trucking_palette_command", { command: "set empty miles", value: match[1] });
      }
      setIsCommandPaletteOpen(false);
      return;
    }
    if (text.includes("copy") || text.includes("summary")) {
      trackEvent("trucking_palette_command", { command: "copy summary" });
      await handleCopySummary();
      setIsCommandPaletteOpen(false);
      return;
    }
    if (text.includes("analyze")) {
      trackEvent("trucking_palette_command", { command: "analyze fleet" });
      setIsCommandPaletteOpen(false);
      await analyzeFleet();
      return;
    }
    trackEvent("trucking_palette_command", { command: "unmatched", raw: command });
    setIsCommandPaletteOpen(false);
  };

  const paletteSuggestions = [
    "Load the Atlantic loop scenario.",
    "Preset Prairie West Freight.",
    "Set empty miles to 24%.",
    "Copy the fleet ROI summary.",
    "Analyze the current fleet.",
  ];

  const quickActions = [
    {
      label: "Atlantic loop fleet",
      description: "24 trucks, heavy coastal lanes.",
      icon: "🌊",
      onSelect: () => {
        applyScenario({
          companyName: "Atlantic Loop Logistics",
          fleetSize: "24",
          monthlyFuelCost: "42000",
          emptyMiles: "28",
          primaryRoutes: "Halifax ↔ Montreal ↔ St. John's",
        });
        trackEvent("trucking_palette_quick_action", { action: "atlantic-loop" });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      label: "Prairie West Freight",
      description: "18 tractors, prairie corridor",
      icon: "🌾",
      onSelect: () => {
        applyScenario({
          companyName: "Prairie West Freight",
          fleetSize: "18",
          monthlyFuelCost: "36000",
          emptyMiles: "22",
          primaryRoutes: "Calgary ↔ Regina ↔ Winnipeg",
        });
        trackEvent("trucking_palette_quick_action", { action: "prairie-west" });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      label: "Set empty miles to 24%",
      description: "Apply to form instantly",
      icon: "⚙️",
      onSelect: () => {
        applyScenario({ emptyMiles: "24" });
        trackEvent("trucking_palette_quick_action", { action: "set-empty-miles", value: 24 });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      label: copyFeedback ? "Summary copied ✔" : "Copy ROI summary",
      description: "Grab numbers for an email",
      icon: "📋",
      onSelect: async () => {
        await handleCopySummary();
        trackEvent("trucking_palette_quick_action", { action: "copy-summary" });
        setIsCommandPaletteOpen(false);
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard")} className="border-white/20 text-white">
              ← Dashboard
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Module</p>
              <h1 className="text-2xl font-semibold text-white">Fleet Optimizer</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" onClick={() => setIsCommandPaletteOpen(true)}>
            Command palette · ⌘K
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <Card className="bg-white text-slate-900">
            <CardHeader>
              <CardTitle>Fleet Information</CardTitle>
              <CardDescription>
                Provide fleet details for optimization analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  placeholder="NL Transport Co"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fleet Size</label>
                  <Input
                    placeholder="15"
                    value={formData.fleetSize}
                    onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Fuel Cost ($)</label>
                  <Input
                    placeholder="22000"
                    value={formData.monthlyFuelCost}
                    onChange={(e) => setFormData({ ...formData, monthlyFuelCost: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Empty Miles (%)</label>
                  <Input
                    placeholder="30"
                    value={formData.emptyMiles}
                    onChange={(e) => setFormData({ ...formData, emptyMiles: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Routes</label>
                  <Input
                    placeholder="St. John's - Halifax"
                    value={formData.primaryRoutes}
                    onChange={(e) => setFormData({ ...formData, primaryRoutes: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={analyzeFleet} 
                disabled={loading || !formData.fleetSize}
                className="w-full"
              >
                {loading ? 'Analyzing Fleet...' : 'Generate Fleet Analysis'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-white text-slate-900">
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>
                Fleet efficiency analysis and recommendations
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(metrics.monthlyOperatingCost ?? 35500)}
                        </div>
                        <div className="text-sm text-gray-600">Current Monthly Cost</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(metrics.threeYearSavings ?? 360720)}
                        </div>
                        <div className="text-sm text-gray-600">3-Year Savings</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-center">
                      <div className="text-sm uppercase tracking-wide text-green-700">
                        Annual Savings
                      </div>
                      <div className="text-3xl font-bold text-green-700">
                        {formatCurrency(metrics.annualSavings ?? 120240)}
                      </div>
                    </div>
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-900">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Executive brief</p>
                          <h4 className="text-xl font-semibold text-slate-900">{formData.companyName || "Fleet summary"}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={handleCopySummary} className="border-slate-200 text-slate-700 hover:bg-white">
                            {copyFeedback ? "Copied ✔" : "Copy summary"}
                          </Button>
                          <Button variant="outline" onClick={handleDownloadDeckMarkdown} className="border-slate-200 text-slate-700 hover:bg-white">
                            ⬇️ Markdown
                          </Button>
                          <Button onClick={handleExportDeckPdf} className="bg-slate-900 text-white hover:bg-slate-800">
                            📄 Export PDF
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/80 bg-white p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                        {result}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚛</div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Optimize Fleet</h3>
                    <p className="text-gray-600">
                      Enter your fleet details to generate comprehensive optimization analysis.
                    </p>
                  </div>
                )}
              </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <CommandPalette
        open={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSubmit={handleCommandSubmit}
        suggestions={paletteSuggestions}
        quickActions={quickActions}
      />
    </div>
  );
}

interface FleetDeckContext {
  formData: {
    companyName: string;
    fleetSize: string;
    monthlyFuelCost: string;
    emptyMiles: string;
    primaryRoutes: string;
  };
  metrics: FleetMetrics;
  result: string;
}

function buildFleetDeckMarkdown({ formData, metrics, result }: FleetDeckContext) {
  return [
    `# Fleet Optimization · ${formData.companyName || "Unnamed Fleet"}`,
    "",
    "## Inputs",
    `- Fleet size: ${formData.fleetSize || "N/A"} tractors`,
    `- Monthly fuel: $${formData.monthlyFuelCost || "N/A"}`,
    `- Empty miles: ${formData.emptyMiles || "N/A"}%`,
    `- Routes: ${formData.primaryRoutes || "N/A"}`,
    "",
    "## Financial Impact",
    `- Monthly operating cost: ${formatCurrency(metrics.monthlyOperatingCost ?? 0)}`,
    `- Annual savings: ${formatCurrency(metrics.annualSavings ?? 0)}`,
    `- Three-year savings: ${formatCurrency(metrics.threeYearSavings ?? 0)}`,
    "",
    "## AI Narrative",
    result.trim(),
    "",
    "_Prepared via BizOptimize Pro Fleet Optimizer_",
  ].join("\n");
}

function buildFleetDeckHtml(payload: FleetDeckContext) {
  const markdown = buildFleetDeckMarkdown(payload).replace(/\n/g, "<br />");
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>BizOptimize Fleet Deck</title>
    <style>
      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0f172a;
        margin: 0;
        padding: 32px;
      }
      .frame {
        max-width: 960px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 32px;
        padding: 48px;
        box-shadow: 0 25px 80px rgba(15, 23, 42, 0.25);
      }
      h1 {
        font-size: 32px;
        margin: 0 0 4px;
        color: #0f172a;
      }
      h2 {
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 14px;
        color: #475569;
        margin: 0 0 24px;
      }
      .markdown {
        font-size: 14px;
        line-height: 1.6;
        color: #1e293b;
      }
      @media print {
        body { background: #ffffff; padding: 0; }
        .frame { box-shadow: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <h2>BizOptimize Pro · Fleet Optimizer</h2>
      <h1>${payload.formData.companyName || "Fleet insights"}</h1>
      <div class="markdown">${markdown}</div>
    </div>
  </body>
</html>
`;
}