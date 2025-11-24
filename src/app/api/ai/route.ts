import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, businessType, optimizationType } = body;

    // Simulate AI response for demo (replace with real OpenRouter call)
    const mockResponses = {
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

**Total Timeline: 19 weeks**`
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
- **3-Year ROI**: 221%`
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
- **Quarter 1**: Achieve 30% food cost target`
      }
    };

    const businessResponses = mockResponses[businessType as keyof typeof mockResponses];
    const defaultResponse = (businessResponses && optimizationType in businessResponses 
      ? (businessResponses as any)[optimizationType] 
      : null) || 
      "Analysis completed. Optimization recommendations generated based on your business data.";

    // Extract savings amount (mock calculation)
    const savingsMatch = defaultResponse.match(/\$[\d,]+/g);
    let estimatedSavings = 50000; // Default
    if (savingsMatch) {
      const amounts = savingsMatch.map((s: string) => parseInt(s.replace(/[$,]/g, '')));
      estimatedSavings = Math.max(...amounts);
    }

    return NextResponse.json({
      success: true,
      result: defaultResponse,
      estimatedSavings,
      businessType,
      optimizationType
    });

  } catch (error) {
    console.error('AI optimization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate optimization analysis' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai',
    description: 'AI-powered business optimization API',
    status: 'active'
  });
}