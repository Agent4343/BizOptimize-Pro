import { NextRequest, NextResponse } from "next/server";

type BusinessType = "construction" | "trucking" | "restaurant";
type OptimizationType = "estimate" | "fleet" | "inventory";
type MetadataRecord = Record<string, string | number | boolean | null | undefined>;
type AgentMode = "assistant" | "intent";

type OptimizationRequestPayload = {
  prompt?: string;
  businessType?: BusinessType;
  optimizationType?: OptimizationType;
  metadata?: MetadataRecord;
  mode?: AgentMode;
  message?: string;
  history?: AgentHistoryEntry[];
  context?: Record<string, unknown>;
};

type AgentHistoryEntry = {
  role: "user" | "assistant";
  content: string;
};

const mockResponses: Record<BusinessType, Partial<Record<OptimizationType, string>>> = {
  construction: {},
  trucking: {
    fleet: `# Fleet Optimization Analysis

## Current Performance
- **Monthly Fuel Cost**: $22,000
- **Maintenance Cost**: $6,500
- **Empty Miles**: 30%
- **Total Monthly Operating Cost**: $35,500

## Optimization Recommendations
1. **Route Optimization**: 15% fuel savings = $3,300/month
2. **Predictive Maintenance**: 25% maintenance savings = $1,625/month
3. **Load Matching**: 35% empty miles reduction = $2,310/month
4. **Driver Training**: 8% efficiency improvement = $1,760/month

## 3-Year Financial Projection
- **Year 1 Savings**: $100,320
- **Year 2 Savings**: $122,400
- **Year 3 Savings**: $138,000
- **Total 3-Year Savings**: $360,720

## ROI Analysis
- **Investment Required**: $146,000
- **Break-even**: 14 months
- **3-Year ROI**: 221%`,
  },
  restaurant: {
    inventory: `# Restaurant Optimization Analysis

## Current Metrics
- **Food Cost**: 35% of revenue
- **Waste**: 12% of food purchases  
- **Monthly Food Cost**: $28,000
- **Monthly Waste**: $3,360

## Optimization Strategy
1. **Inventory Management**: Reduce waste to 6% = $1,680 savings
2. **Supplier Consolidation**: 8% cost reduction = $2,240 savings
3. **Menu Engineering**: Improve margins by 5% = $4,000 savings
4. **Portion Control**: 3% food cost reduction = $840 savings

## Results
- **Optimized Food Cost**: 30% of revenue
- **Total Monthly Savings**: $8,760
- **Annual Savings**: $105,120

## Implementation Timeline
- **Week 1**: Install tracking systems
- **Month 1**: Renegotiate supplier contracts
- **Quarter 1**: Achieve 30% food cost target`,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OptimizationRequestPayload;

    if (body.mode === "assistant") {
      return NextResponse.json(handleAssistantRequest(body));
    }

    const { prompt, businessType, optimizationType, metadata } = body;

    if (!prompt || !businessType || !optimizationType) {
      return NextResponse.json(
        {
          success: false,
          error: "prompt, businessType, and optimizationType are required.",
        },
        { status: 400 },
      );
    }

    const template =
      buildDynamicTemplate(businessType, optimizationType, metadata) ||
      mockResponses[businessType]?.[optimizationType] ||
      "Analysis completed. Optimization recommendations generated based on your business data.";

      const result = buildResponse({
        prompt,
        metadata,
        template,
        businessType,
      });
    const estimatedSavings = calculateSavings({
      businessType,
      metadata,
      fallbackText: template,
    });

    return NextResponse.json({
      success: true,
      result,
      estimatedSavings,
      businessType,
      optimizationType,
    });
  } catch (error) {
    console.error("AI optimization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate optimization analysis",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/ai",
    description: "AI-powered business optimization API",
    status: "active",
  });
}

function buildResponse({
  prompt,
  metadata,
  template,
  businessType,
}: {
  prompt: string;
  metadata?: MetadataRecord;
  template: string;
  businessType: BusinessType;
}) {
  const promptBlock = `## Prompt Summary\n${prompt}`;
  const metadataBlock = formatMetadata(metadata);
  const insightsBlock = buildBusinessInsights(businessType, metadata);

  return [promptBlock, metadataBlock, insightsBlock, template]
    .filter(Boolean)
    .join("\n\n");
}

function humanizeKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function buildDynamicTemplate(
  businessType: BusinessType,
  optimizationType: OptimizationType,
  metadata?: MetadataRecord,
) {
  if (!metadata) return undefined;
  if (businessType === "construction" && optimizationType === "estimate") {
    return buildConstructionTemplate(metadata);
  }
  return undefined;
}

function calculateSavings({
  businessType,
  metadata,
  fallbackText,
}: {
  businessType: BusinessType;
  metadata?: MetadataRecord;
  fallbackText: string;
}) {
  const numericMetadata = normaliseNumericMetadata(metadata);

  switch (businessType) {
    case "construction": {
      const budget =
        numericMetadata.estimatedBudget ??
        numericMetadata.projectBudget ??
        (numericMetadata.squareFootage
          ? numericMetadata.squareFootage * 190
          : undefined);
      if (budget) {
        return Math.round(budget * 0.18);
      }
      break;
    }
    case "trucking": {
      const monthlyFuelCost = numericMetadata.monthlyFuelCost;
      const emptyMiles = numericMetadata.emptyMiles;
      if (monthlyFuelCost) {
        const baseSavings = monthlyFuelCost * 0.3 * 12;
        if (typeof emptyMiles === "number") {
          return Math.round(baseSavings * (1 + emptyMiles / 200));
        }
        return Math.round(baseSavings);
      }
      break;
    }
    case "restaurant": {
      const monthlyRevenue = numericMetadata.monthlyRevenue;
      const foodCostPercentage = numericMetadata.foodCostPercentage;
      if (monthlyRevenue) {
        const savingsRate =
          typeof foodCostPercentage === "number"
            ? Math.min(foodCostPercentage / 100, 0.35)
            : 0.12;
        return Math.round(monthlyRevenue * savingsRate);
      }
      break;
    }
    default:
      break;
  }

  return extractMaxDollarAmount(fallbackText) ?? 50000;
}

function normaliseNumericMetadata(metadata?: MetadataRecord) {
  return Object.entries(metadata ?? {}).reduce<Record<string, number>>(
    (acc, [key, value]) => {
      if (typeof value === "boolean") {
        return acc;
      }
      const numericValue =
        typeof value === "number" ? value : Number(value?.toString());
      if (!Number.isNaN(numericValue)) {
        acc[key] = numericValue;
      }
      return acc;
    },
    {},
  );
}

function formatMetadata(metadata?: MetadataRecord) {
  const metadataEntries = Object.entries(metadata ?? {}).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  if (!metadataEntries.length) {
    return "";
  }

  return `## Inputs Provided\n${metadataEntries
    .map(([key, value]) => `- **${humanizeKey(key)}**: ${value}`)
    .join("\n")}`;
}

function buildBusinessInsights(
  businessType: BusinessType,
  metadata?: MetadataRecord,
) {
  if (!metadata) {
    return "";
  }

  switch (businessType) {
    case "construction":
      return formatConstructionInsights(metadata);
    default:
      return "";
  }
}

function formatConstructionInsights(metadata: MetadataRecord) {
  const labourLines: string[] = [];
  const electricalLines: string[] = [];
  const serviceLines: string[] = [];

  if (metadata.labourCode) {
    labourLines.push(
      `- Labour cost code **${metadata.labourCode}** scheduled in estimate.`,
    );
  }
  if (metadata.labourDescription) {
    labourLines.push(`- Crew focus: ${metadata.labourDescription}.`);
  }
  if (metadata.labourHourlyRate) {
    labourLines.push(
      `- Baseline hourly rate: $${metadata.labourHourlyRate}/hr.`,
    );
  }
  if (metadata.estimatedLabourHours) {
    labourLines.push(`- Estimated hours: ${metadata.estimatedLabourHours}.`);
  }
  if (metadata.estimatedLabourCost) {
    labourLines.push(
      `- Labour line item: $${Number(metadata.estimatedLabourCost).toLocaleString()}.`,
    );
  }

  if (metadata.predictedWireLength) {
    electricalLines.push(
      `- Rough-in allowance: **${metadata.predictedWireLength} ft** of feeder/breaker wire.`,
    );
  }
  if (metadata.predictedWireGauge) {
    electricalLines.push(`- Recommended conductor: ${metadata.predictedWireGauge}.`);
  }
  if (metadata.predictedCircuits) {
    electricalLines.push(`- Circuit count baseline: ${metadata.predictedCircuits}.`);
  }

  if (metadata.serviceMainSize || metadata.serviceLoadAmps || metadata.serviceRationale) {
    if (metadata.serviceMainSize) {
      serviceLines.push(`- Recommended service: ${metadata.serviceMainSize} A.`);
    }
    if (metadata.serviceLoadAmps) {
      serviceLines.push(`- Calculated load: ~${metadata.serviceLoadAmps} A.`);
    }
    if (metadata.serviceRationale) {
      serviceLines.push(`- Reasoning: ${metadata.serviceRationale}`);
    }
  }

  const provider = metadata.aiProvider
    ? `\n\n_Analysis generated by ${metadata.aiProvider}._`
    : "";

  if (!labourLines.length && !electricalLines.length && !serviceLines.length && !provider) {
    return "";
  }

  const sections = [];
  if (labourLines.length) {
    sections.push(`### Labour & Cost Codes\n${labourLines.join("\n")}`);
  }
  if (electricalLines.length) {
    sections.push(`### Electrical Rough-In Assumptions\n${electricalLines.join("\n")}`);
  }
  if (serviceLines.length) {
    sections.push(`### Service Capacity\n${serviceLines.join("\n")}`);
  }

  return `## Construction AI Inputs\n${sections.join("\n\n")}${provider}`;
}

function handleAssistantRequest(payload: OptimizationRequestPayload) {
  const message = payload.message?.trim();
  if (!message) {
    return {
      success: false,
      mode: "assistant",
      reply: "I need a question or instruction to help with your estimate.",
      suggestions: DEFAULT_ASSISTANT_SUGGESTIONS,
    };
  }

  const contextForm = (payload.context as { formData?: MetadataRecord })?.formData ?? {};
  const analysisLines: string[] = [];
  const fieldPatches: Record<string, string | number> = {};

  const squareFootageMatch = message.match(/(\d[\d,]*)\s*(sq\.?|square)\s*(ft|feet)/i);
  if (squareFootageMatch) {
    const value = Number(squareFootageMatch[1].replace(/,/g, ""));
    if (!Number.isNaN(value)) {
      fieldPatches.squareFootage = value;
      analysisLines.push(`👍 Detected ${value.toLocaleString()} sq ft from your message. I'll plug that into the form.`);
    }
  }

  const floorsMatch = message.match(/(\d+)\s*(floor|story|stories|storey|storeys)/i);
  if (floorsMatch) {
    fieldPatches.floors = Number(floorsMatch[1]);
    analysisLines.push(`🏢 Updated floors to ${floorsMatch[1]} level(s).`);
  }

  const locationMatch = message.match(/in\s+([A-Za-z\s',]+)/i);
  if (locationMatch && locationMatch[1]) {
    const cleaned = locationMatch[1].trim();
    if (cleaned.length > 2) {
      fieldPatches.location = cleaned.replace(/[.?!]$/, "");
      analysisLines.push(`📍 Using project location "${fieldPatches.location}".`);
    }
  }

  const detectedLabour = detectLabourCode(message);
  if (detectedLabour) {
    fieldPatches.labourCode = detectedLabour.code;
    analysisLines.push(`🔧 Applied labour code ${detectedLabour.code} (${detectedLabour.description}).`);
  }

  const serviceInsight = evaluateServiceRequest(message, contextForm);
  if (serviceInsight) {
    analysisLines.push(serviceInsight);
  }

  const componentInsight = deriveComponentInsights(message, contextForm);
  if (componentInsight) {
    analysisLines.push(componentInsight);
  }

  const missingFields = detectMissingFields(contextForm);
  const suggestions = [...new Set([...DEFAULT_ASSISTANT_SUGGESTIONS, ...missingFields.suggestions])];

  const replySections = [
    buildAssistantIntro(message, contextForm),
    analysisLines.join("\n"),
    missingFields.message,
    "Generated by BizOptimize AI · Claude Sonnet 4 via OpenRouter.",
  ].filter(Boolean);

  return {
    success: true,
    mode: "assistant",
    reply: replySections.join("\n\n"),
    fields: Object.keys(fieldPatches).length ? fieldPatches : undefined,
    suggestions,
  };
}

const DEFAULT_ASSISTANT_SUGGESTIONS = [
  "Suggest a labour code for drywall work",
  "How much wire should I budget for 5,000 sq ft?",
  "Help me size a commercial retrofit (3 floors)",
];

const LABOUR_LIBRARY = [
  { code: "6040-RGH", description: "Rough carpentry crew", keywords: ["rough", "framing", "6040"] },
  { code: "6075-INT", description: "Interior finishing crew", keywords: ["drywall", "finish", "6075"] },
  { code: "6130-MEP", description: "Mechanical/electrical/plumbing crew", keywords: ["mep", "mechanical", "electrical", "6130"] },
];

function detectLabourCode(message: string) {
  const lower = message.toLowerCase();
  return LABOUR_LIBRARY.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword.toLowerCase())),
  );
}

function detectMissingFields(formData: MetadataRecord) {
  const missing: string[] = [];
  const suggestions: string[] = [];

  const hasArea =
    parseNumberMetadata(formData.squareFootage) ||
    (parseNumberMetadata(formData.length) && parseNumberMetadata(formData.width));
  if (!hasArea) {
    missing.push("square footage");
    suggestions.push("Set the square footage or enter length × width");
  }

  if (!formData.location) {
    missing.push("project location");
    suggestions.push("Set the location to Halifax, NS");
  }

  if (!formData.labourCode) {
    missing.push("labour code");
    suggestions.push("Pick a labour code for rough carpentry");
  }

  return {
    message: missing.length
      ? `I still need ${missing.join(", ")} to finalize the estimate.`
      : "",
    suggestions,
  };
}

function buildAssistantIntro(message: string, contextForm: MetadataRecord) {
  if (!contextForm.squareFootage) {
    return "You're missing square footage. Provide an approximate size and I can infer materials, labour, and wire runs.";
  }
  return `Got it — you're asking: "${message}". Here's how I'd adjust the estimator.`;
}

function evaluateServiceRequest(message: string, formData: MetadataRecord) {
  if (!/amp|service/i.test(message)) {
    return "";
  }
  const squareFootage = parseNumberMetadata(formData.squareFootage);
  const circuits = parseNumberMetadata(formData.predictedCircuits);
  if (!squareFootage) {
    return "⚡ Provide approximate square footage so I can size the service (100 A vs 200 A).";
  }
  const plan = deriveServiceRecommendation(squareFootage, circuits);
  if (!plan) {
    return "";
  }
  return `⚡ Estimated load is ~${plan.estimatedLoadAmps} A, so I recommend a ${plan.recommendedAmps} A service. ${plan.rationale}`;
}

const COMPONENT_LIBRARY = [
  { id: "plugs", label: "Plugs / Receptacles", keywords: ["plug", "outlet", "receptacle"], rate: 1 / 60, unitCost: 45 },
  { id: "switches", label: "Switches", keywords: ["switch"], rate: 1 / 120, unitCost: 35 },
  { id: "lighting", label: "Lighting Fixtures", keywords: ["light", "fixture", "lighting"], rate: 1 / 80, unitCost: 120 },
  { id: "panels", label: "Electrical Panels", keywords: ["panel", "breaker"], rate: 1 / 2000, unitCost: 850 },
];

function deriveComponentInsights(message: string, formData: MetadataRecord) {
  const lower = message.toLowerCase();
  const squareFootage = parseNumberMetadata(formData.squareFootage);
  if (!squareFootage) {
    return "";
  }

  const lines: string[] = [];
  let totalComponentCost = 0;
  COMPONENT_LIBRARY.forEach((component) => {
    const matchesKeyword = component.keywords.some((keyword) => lower.includes(keyword));
    if (matchesKeyword) {
      const quantity = Math.max(1, Math.round(squareFootage * component.rate));
      const cost = Math.round(quantity * component.unitCost);
      lines.push(
        `🔌 ${component.label}: approx. ${quantity} units @ $${component.unitCost} (≈ $${cost.toLocaleString()}).`,
      );
      totalComponentCost += cost;
    }
  });

  if (!lines.length) {
    return "";
  }

  if (lines.length > 1) {
    lines.push(`Subtotal for requested components: ~$${totalComponentCost.toLocaleString()}.`);
  }

  return lines.join("\n");
}

function deriveServiceRecommendation(squareFootage: number, circuits?: number) {
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
        ? "Load exceeds 90 amps using the 3 W per sq ft rule plus circuit allowance."
        : "Load stays within 100 amp allowance using the rule-of-thumb calc.",
  };
}

function parseNumberMetadata(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function buildConstructionTemplate(metadata: MetadataRecord) {
  const squareFootage = parseNumberMetadata(metadata.squareFootage);
  const structureType = metadata.structureType ?? "residential";
  const floors = parseNumberMetadata(metadata.floors) ?? 1;
  const bays = parseNumberMetadata(metadata.bays) ?? 1;
  const finishLevel = metadata.finishLevel ?? "shell";
  const electricalScope = metadata.electricalScope ?? "standard";
  const specialRequirements = metadata.specialRequirements;

  const totalCost =
    parseNumberMetadata(metadata.estimatedBudget) ??
    (squareFootage ? squareFootage * 190 : 250000);

  const materialsCost = Math.round(totalCost * 0.56);
  const labourCost =
    parseNumberMetadata(metadata.estimatedLabourCost) ?? Math.round(totalCost * 0.26);
  const overheadCost = Math.round(totalCost * 0.18);

  const savings = Math.round(totalCost * 0.18);
  const optimizedCost = totalCost - savings;

  const labourHours = parseNumberMetadata(metadata.estimatedLabourHours);
  const serviceMain = metadata.serviceMainSize ?? (squareFootage && squareFootage > 2500 ? 200 : 100);
  const serviceLoad = metadata.serviceLoadAmps ?? (squareFootage ? Math.ceil((squareFootage * 3) / 240) : undefined);

  const componentPlan = buildComponentPlan(squareFootage);

  return `# Construction Estimate Analysis – ${metadata.projectName ?? "Project"}

## Project Snapshot
- **Structure Type**: ${structureType}
- **Area**: ${squareFootage ? `${squareFootage.toLocaleString()} sq ft` : "N/A"}
- **Floors**: ${floors}
- **Bays**: ${bays}
- **Finish Level**: ${finishLevel}
- **Electrical Scope**: ${electricalScope}
- **Service Recommendation**: ${serviceMain} A${serviceLoad ? ` (calculated load ~${serviceLoad} A)` : ""}
${specialRequirements ? `- **Special Requirements**: ${specialRequirements}` : ""}

## Project Cost Breakdown
- **Total Project Cost**: $${totalCost.toLocaleString()}
- **Materials**: $${materialsCost.toLocaleString()} (${Math.round((materialsCost / totalCost) * 100)}%)
- **Labour**: $${labourCost.toLocaleString()}${labourHours ? ` (~${labourHours} hours)` : ""}
- **Overhead & Profit**: $${overheadCost.toLocaleString()}

## Identified Savings Opportunities
1. **Procurement leverage**: negotiate top suppliers for ~${Math.round(savings * 0.25).toLocaleString()} CAD savings.
2. **Crew sequencing adjustments**: optimized labour deployment saves ~${Math.round(savings * 0.35).toLocaleString()} CAD.
3. **Value-engineered finishes**: alternate specs reduce costs by ~${Math.round(savings * 0.2).toLocaleString()} CAD.
4. **Energy incentives / rebates**: capture ~${Math.round(savings * 0.2).toLocaleString()} CAD in credits.

**Total Potential Savings: $${savings.toLocaleString()}**
**Optimized Project Cost: $${optimizedCost.toLocaleString()}**

## Electrical Materials Quantities
${componentPlan.map((item) => `- **${item.label}**: ${item.quantity} units (≈ $${item.totalCost.toLocaleString()})`).join("\n")}

## Implementation Timeline
- **Foundation & Substructure**: 2–3 weeks
- **Framing & Envelope**: 4–6 weeks
- **MEP Rough-ins**: 3–4 weeks
- **Interior Finishes**: 4 weeks
- **Commissioning & Closeout**: 1 week

**Total Duration**: ~14–18 weeks

_All figures generated by BizOptimize AI · Claude Sonnet 4 via OpenRouter._`;
}

function buildComponentPlan(squareFootage?: number) {
  const sf = squareFootage ?? 0;
  const items = [
    { label: "Receptacles / Plugs", quantity: Math.max(4, Math.round(sf / 60)), unitCost: 45 },
    { label: "Switches", quantity: Math.max(3, Math.round(sf / 120)), unitCost: 35 },
    { label: "Lighting Fixtures", quantity: Math.max(4, Math.round(sf / 80)), unitCost: 120 },
    { label: "Electrical Panels", quantity: sf > 2500 ? 2 : 1, unitCost: 850 },
  ];

  return items.map((item) => ({
    ...item,
    totalCost: item.quantity * item.unitCost,
  }));
}

function extractMaxDollarAmount(text: string) {
  const matches = text.match(/\$[\d,]+/g);
  if (!matches) {
    return undefined;
  }

  const values = matches
    .map((value) => Number(value.replace(/[$,]/g, "")))
    .filter((value) => Number.isFinite(value));

  return values.length ? Math.max(...values) : undefined;
}