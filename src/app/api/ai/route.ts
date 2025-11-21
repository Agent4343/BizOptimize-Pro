import { NextRequest, NextResponse } from "next/server";

type BusinessType = "construction" | "trucking" | "restaurant";
type OptimizationType = "estimate" | "fleet" | "inventory";

type OptimizationRequestPayload = {
  prompt?: string;
  businessType?: BusinessType;
  optimizationType?: OptimizationType;
  metadata?: Record<string, string | number>;
};

const mockResponses: Record<BusinessType, Partial<Record<OptimizationType, string>>> = {
  construction: {
    estimate: `# Construction Estimate Analysis

## Project Cost Breakdown
- **Total Project Cost**: $278,241 CAD
- **Materials**: $153,300 (55%)
- **Labor**: $68,040 (25%) 
- **Contractor Markup**: $33,201 (12%)
- **Miscellaneous**: $23,700 (8%)

## Identified Savings Opportunities
1. **Local Material Sourcing**: Save $8,500
2. **Seasonal Construction Timing**: Save $15,000
3. **Energy Efficiency Rebates**: Save $6,200
4. **Value Engineering**: Save $18,500
5. **Owner-Supplied Items**: Save $9,200

**Total Potential Savings: $57,400**
**Optimized Project Cost: $220,841**

## Implementation Timeline
- **Foundation**: 3 weeks (April-May)
- **Framing & Envelope**: 6 weeks (May-June)
- **Mechanicals**: 4 weeks (July)
- **Interior Finishing**: 5 weeks (August)
- **Final**: 1 week (September)

**Total Timeline: 19 weeks**`,
  },
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
      mockResponses[businessType]?.[optimizationType] ||
      "Analysis completed. Optimization recommendations generated based on your business data.";

    const result = buildResponse(prompt, metadata, template);
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

function buildResponse(
  prompt: string,
  metadata: Record<string, string | number> | undefined,
  template: string,
) {
  const promptBlock = `## Prompt Summary\n${prompt}`;
  const metadataEntries = Object.entries(metadata ?? {}).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  const metadataBlock = metadataEntries.length
    ? `## Inputs Provided\n${metadataEntries
        .map(([key, value]) => `- **${humanizeKey(key)}**: ${value}`)
        .join("\n")}`
    : "";

  return [promptBlock, metadataBlock, template].filter(Boolean).join("\n\n");
}

function humanizeKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function calculateSavings({
  businessType,
  metadata,
  fallbackText,
}: {
  businessType: BusinessType;
  metadata?: Record<string, string | number>;
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

function normaliseNumericMetadata(
  metadata?: Record<string, string | number>,
) {
  return Object.entries(metadata ?? {}).reduce<Record<string, number>>(
    (acc, [key, value]) => {
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