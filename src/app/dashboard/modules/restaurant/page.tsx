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
import { useOnboarding } from "@/lib/onboarding-store";
import { trackEvent } from "@/lib/telemetry";

interface RestaurantMetrics {
  monthlySavings?: number;
  annualSavings?: number;
  currentFoodCost?: number;
  optimizedFoodCost?: number;
}

export default function RestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<RestaurantMetrics>({});
  const [formData, setFormData] = useState({
    restaurantName: "",
    monthlyRevenue: "",
    foodCostPercentage: "",
    inventoryItems: "",
    averageWaste: "",
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { state: onboardingState } = useOnboarding();

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

  useEffect(() => {
    if (onboardingState.status === "completed" && onboardingState.companyName && !formData.restaurantName) {
      setFormData((previous) => ({
        ...previous,
        restaurantName: onboardingState.companyName,
      }));
    }
  }, [onboardingState.status, onboardingState.companyName, formData.restaurantName]);

  const applyPreset = (preset: Partial<typeof formData>) => {
    setFormData((previous) => ({
      ...previous,
      ...preset,
    }));
  };

  const optimizeRestaurant = async () => {
    setLoading(true);
    setError(null);

    const monthlyRevenue = toNumber(formData.monthlyRevenue);
    const foodCostPercentage = toNumber(formData.foodCostPercentage);
    const inventoryItems = toNumber(formData.inventoryItems);
    const averageWaste = toNumber(formData.averageWaste);

    const missing: string[] = [];
    if (!formData.restaurantName) missing.push("restaurant name");
    if (!monthlyRevenue) missing.push("monthly revenue");
    if (!foodCostPercentage) missing.push("food cost %");
    if (!inventoryItems) missing.push("inventory count");
    if (!averageWaste) missing.push("average waste %");
    if (missing.length) {
      setError(`Add ${missing.join(", ")} before running the optimization.`);
      setLoading(false);
      trackEvent("restaurant_validation_failed", { missing });
      return;
    }

    try {
      const data = await requestOptimization({
        prompt: `Restaurant: ${formData.restaurantName}, $${formData.monthlyRevenue} revenue, ${formData.foodCostPercentage}% food cost, ${formData.averageWaste}% waste`,
        businessType: "restaurant",
        optimizationType: "inventory",
        metadata: {
          restaurantName: formData.restaurantName,
          monthlyRevenue,
          foodCostPercentage,
          inventoryItems,
          averageWaste,
        },
      });

      const optimizedFoodCost = foodCostPercentage
        ? Math.max(foodCostPercentage - 5, foodCostPercentage * 0.85)
        : undefined;

      setResult(data.result);
      setMetrics({
        monthlySavings: data.estimatedSavings,
        annualSavings: data.estimatedSavings * 12,
        currentFoodCost: foodCostPercentage,
        optimizedFoodCost,
      });
      trackEvent("restaurant_analysis_generated", {
        monthlyRevenue,
        foodCostPercentage,
        averageWaste,
      });
    } catch (apiError) {
      console.error("Error:", apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Error optimizing restaurant. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = async () => {
    if (!metrics.annualSavings && !metrics.currentFoodCost) return;
    const summary = `Restaurant summary: Current food cost ${(metrics.currentFoodCost ?? 0).toFixed(
      1,
    )}%, optimized ${(metrics.optimizedFoodCost ?? 0).toFixed(1)}%, monthly savings ${formatCurrency(
      metrics.monthlySavings ?? 0,
    )}, annual savings ${formatCurrency(metrics.annualSavings ?? 0)}.`;
    await navigator.clipboard.writeText(summary);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    trackEvent("restaurant_summary_copied", { restaurantName: formData.restaurantName });
  };

  const handleDownloadDeckMarkdown = () => {
    if (!result) return;
    const content = buildRestaurantDeckMarkdown({ formData, metrics, result });
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData.restaurantName || "restaurant-report"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackEvent("restaurant_deck_markdown_downloaded", { restaurantName: formData.restaurantName });
  };

  const handleExportDeckPdf = () => {
    if (!result) return;
    if (typeof window === "undefined") return;
    const html = buildRestaurantDeckHtml({ formData, metrics, result });
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    trackEvent("restaurant_deck_pdf_exported", { restaurantName: formData.restaurantName });
  };

  const handleCommandSubmit = async (command: string) => {
    const text = command.toLowerCase();
    if (text.includes("coastal bistro")) {
      trackEvent("restaurant_palette_command", { command: "coastal-bistro" });
      applyPreset({
        restaurantName: "Coastal Bistro",
        monthlyRevenue: "90000",
        foodCostPercentage: "36",
        inventoryItems: "280",
        averageWaste: "14",
      });
      setIsCommandPaletteOpen(false);
      return;
    }
    if (text.includes("downtown cafe")) {
      trackEvent("restaurant_palette_command", { command: "downtown-cafe" });
      applyPreset({
        restaurantName: "Downtown Cafe Collective",
        monthlyRevenue: "65000",
        foodCostPercentage: "32",
        inventoryItems: "180",
        averageWaste: "9",
      });
      setIsCommandPaletteOpen(false);
      return;
    }
    if (text.includes("waste to") || text.includes("set waste")) {
      const match = text.match(/(\d+)\s*%?/);
      if (match) {
        applyPreset({ averageWaste: match[1] });
        trackEvent("restaurant_palette_command", { command: "set-waste", value: match[1] });
      }
      setIsCommandPaletteOpen(false);
      return;
    }
    if (text.includes("copy") || text.includes("summary")) {
      trackEvent("restaurant_palette_command", { command: "copy-summary" });
      await handleCopySummary();
      setIsCommandPaletteOpen(false);
      return;
    }
    if (text.includes("optimize") || text.includes("run report")) {
      trackEvent("restaurant_palette_command", { command: "optimize" });
      setIsCommandPaletteOpen(false);
      await optimizeRestaurant();
      return;
    }
    trackEvent("restaurant_palette_command", { command: "unmatched", raw: command });
    setIsCommandPaletteOpen(false);
  };

  const paletteSuggestions = [
    "Load the Coastal Bistro preset.",
    "Preset Downtown Cafe Collective.",
    "Set average waste to 10%.",
    "Copy the savings summary.",
    "Optimize this restaurant.",
  ];

  const quickActions = [
    {
      label: "Coastal Bistro preset",
      description: "90k revenue, 36% food cost",
      icon: "🌊",
      onSelect: () => {
        applyPreset({
          restaurantName: "Coastal Bistro",
          monthlyRevenue: "90000",
          foodCostPercentage: "36",
          inventoryItems: "280",
          averageWaste: "14",
        });
        trackEvent("restaurant_palette_quick_action", { action: "coastal-bistro" });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      label: "Downtown Cafe preset",
      description: "65k revenue, 32% food cost",
      icon: "🏙️",
      onSelect: () => {
        applyPreset({
          restaurantName: "Downtown Cafe Collective",
          monthlyRevenue: "65000",
          foodCostPercentage: "32",
          inventoryItems: "180",
          averageWaste: "9",
        });
        trackEvent("restaurant_palette_quick_action", { action: "downtown-cafe" });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      label: "Set waste to 10%",
      description: "Apply target waste rate",
      icon: "♻️",
      onSelect: () => {
        applyPreset({ averageWaste: "10" });
        trackEvent("restaurant_palette_quick_action", { action: "set-waste", value: 10 });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      label: copyFeedback ? "Summary copied ✔" : "Copy savings summary",
      description: "Grab food cost delta + savings",
      icon: "📋",
      onSelect: async () => {
        await handleCopySummary();
        trackEvent("restaurant_palette_quick_action", { action: "copy-summary" });
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
              <h1 className="text-2xl font-semibold text-white">Restaurant Manager</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" onClick={() => setIsCommandPaletteOpen(true)}>
            Command palette · ⌘K
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {onboardingState.status !== "completed" ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/80">
            <span>Finish onboarding to prefill restaurant details and goals.</span>
            <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10" onClick={() => router.push("/dashboard")}>
              Finish onboarding
            </Button>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Optimizing for {onboardingState.companyName} · Focus: {onboardingState.focusModule || "restaurant"}.
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <Card className="bg-white text-slate-900">
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Provide restaurant details for optimization analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Name</label>
                <Input
                  placeholder="Harbour View Restaurant"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Revenue ($)</label>
                  <Input
                    placeholder="80000"
                    value={formData.monthlyRevenue}
                    onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Food Cost (%)</label>
                  <Input
                    placeholder="35"
                    value={formData.foodCostPercentage}
                    onChange={(e) => setFormData({ ...formData, foodCostPercentage: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Inventory Items</label>
                  <Input
                    placeholder="250"
                    value={formData.inventoryItems}
                    onChange={(e) => setFormData({ ...formData, inventoryItems: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Average Waste (%)</label>
                  <Input
                    placeholder="12"
                    value={formData.averageWaste}
                    onChange={(e) => setFormData({ ...formData, averageWaste: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <Button 
                onClick={optimizeRestaurant} 
                disabled={loading || !formData.monthlyRevenue}
                className="w-full"
              >
                {loading ? 'Optimizing Operations...' : 'Generate Optimization Report'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-white text-slate-900">
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>
                Cost reduction strategies and recommendations
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
                          {(metrics.currentFoodCost ?? 35).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Current Food Cost</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {(metrics.optimizedFoodCost ?? 30).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Optimized Food Cost</div>
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg bg-blue-50 p-4 text-center">
                      <div className="text-sm uppercase tracking-wide text-blue-600">
                        Annual Savings Potential
                      </div>
                      <div className="text-3xl font-bold text-blue-700">
                        {formatCurrency(metrics.annualSavings ?? 105120)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Monthly savings {formatCurrency(metrics.monthlySavings ?? 8760)}
                      </div>
                    </div>
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-900">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Executive brief</p>
                          <h4 className="text-xl font-semibold text-slate-900">{formData.restaurantName || "Restaurant summary"}</h4>
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
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Optimize Restaurant</h3>
                    <p className="text-gray-600">
                      Enter restaurant details to generate optimization analysis.
                    </p>
                  </div>
                )}
              </CardContent>
          </Card>
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

interface RestaurantDeckContext {
  formData: {
    restaurantName: string;
    monthlyRevenue: string;
    foodCostPercentage: string;
    inventoryItems: string;
    averageWaste: string;
  };
  metrics: RestaurantMetrics;
  result: string;
}

function buildRestaurantDeckMarkdown({ formData, metrics, result }: RestaurantDeckContext) {
  return [
    `# Restaurant Optimization · ${formData.restaurantName || "Location"}`,
    "",
    "## Inputs",
    `- Monthly revenue: $${formData.monthlyRevenue || "N/A"}`,
    `- Food cost: ${formData.foodCostPercentage || "N/A"}%`,
    `- Inventory items: ${formData.inventoryItems || "N/A"}`,
    `- Average waste: ${formData.averageWaste || "N/A"}%`,
    "",
    "## Savings Impact",
    `- Monthly savings: ${formatCurrency(metrics.monthlySavings ?? 0)}`,
    `- Annual savings: ${formatCurrency(metrics.annualSavings ?? 0)}`,
    `- Food cost delta: ${(metrics.currentFoodCost ?? 0).toFixed(1)}% → ${(metrics.optimizedFoodCost ?? 0).toFixed(1)}%`,
    "",
    "## AI Narrative",
    result.trim(),
    "",
    "_Prepared via BizOptimize Pro Restaurant Manager_",
  ].join("\n");
}

function buildRestaurantDeckHtml(payload: RestaurantDeckContext) {
  const markdown = buildRestaurantDeckMarkdown(payload).replace(/\n/g, "<br />");
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>BizOptimize Restaurant Deck</title>
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
      <h2>BizOptimize Pro · Restaurant Manager</h2>
      <h1>${payload.formData.restaurantName || "Restaurant insights"}</h1>
      <div class="markdown">${markdown}</div>
    </div>
  </body>
</html>
`;
}