import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, businessType, optimizationType } = body;

    // Generate dynamic construction estimate based on input
    const generateConstructionEstimate = (promptText: string) => {
      // Extract square footage from prompt
      const sqftMatch = promptText.match(/(\d+)\s*(?:sq\s*ft|square\s*feet|square\s*footage)/i);
      const sqft = sqftMatch ? parseInt(sqftMatch[1]) : 2000; // Default to 2000 if not found
      
      // Extract bedrooms and bathrooms
      const bedroomsMatch = promptText.match(/(\d+)\s*bedroom/i);
      const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : 3;
      const bathroomsMatch = promptText.match(/(\d+(?:\.\d+)?)\s*bathroom/i);
      const bathrooms = bathroomsMatch ? parseFloat(bathroomsMatch[1]) : 2;
      
      // Calculate costs based on square footage
      // Typical construction cost in Canada: $150-300 per sq ft (using $200 as average)
      const costPerSqft = 200;
      const baseCost = sqft * costPerSqft;
      const materials = Math.round(baseCost * 0.55);
      const labor = Math.round(baseCost * 0.25);
      const contractorMarkup = Math.round(baseCost * 0.12);
      const miscellaneous = Math.round(baseCost * 0.08);
      const totalCost = materials + labor + contractorMarkup + miscellaneous;
      
      // Calculate potential savings (15-25% of total cost)
      const savingsPercentage = 0.20; // 20% average
      const potentialSavings = Math.round(totalCost * savingsPercentage);
      const optimizedCost = totalCost - potentialSavings;
      
      // Calculate timeline based on size
      const weeksPer1000Sqft = 3;
      const baseWeeks = Math.ceil((sqft / 1000) * weeksPer1000Sqft);
      const foundationWeeks = Math.max(2, Math.ceil(baseWeeks * 0.15));
      const framingWeeks = Math.max(4, Math.ceil(baseWeeks * 0.30));
      const mechanicalsWeeks = Math.max(3, Math.ceil(baseWeeks * 0.20));
      const finishingWeeks = Math.max(4, Math.ceil(baseWeeks * 0.30));
      const finalWeeks = 1;
      const totalWeeks = foundationWeeks + framingWeeks + mechanicalsWeeks + finishingWeeks + finalWeeks;
      
      // Calculate individual savings opportunities
      const localSourcing = Math.round(totalCost * 0.03);
      const seasonalTiming = Math.round(totalCost * 0.05);
      const rebates = Math.round(totalCost * 0.02);
      const valueEngineering = Math.round(totalCost * 0.07);
      const ownerSupplied = Math.round(totalCost * 0.03);
      
      return `# Construction Estimate Analysis

## Project Details
- **Square Footage**: ${sqft.toLocaleString()} sq ft
- **Bedrooms**: ${bedrooms}
- **Bathrooms**: ${bathrooms}

## Project Cost Breakdown
- **Total Project Cost**: $${totalCost.toLocaleString()} CAD
- **Materials**: $${materials.toLocaleString()} (55%)
- **Labor**: $${labor.toLocaleString()} (25%) 
- **Contractor Markup**: $${contractorMarkup.toLocaleString()} (12%)
- **Miscellaneous**: $${miscellaneous.toLocaleString()} (8%)

## Identified Savings Opportunities
1. **Local Material Sourcing**: Save $${localSourcing.toLocaleString()}
2. **Seasonal Construction Timing**: Save $${seasonalTiming.toLocaleString()}
3. **Energy Efficiency Rebates**: Save $${rebates.toLocaleString()}
4. **Value Engineering**: Save $${valueEngineering.toLocaleString()}
5. **Owner-Supplied Items**: Save $${ownerSupplied.toLocaleString()}

**Total Potential Savings: $${potentialSavings.toLocaleString()}**
**Optimized Project Cost: $${optimizedCost.toLocaleString()}**

## Implementation Timeline
- **Foundation**: ${foundationWeeks} weeks
- **Framing & Envelope**: ${framingWeeks} weeks
- **Mechanicals**: ${mechanicalsWeeks} weeks
- **Interior Finishing**: ${finishingWeeks} weeks
- **Final**: ${finalWeeks} week

**Total Timeline: ${totalWeeks} weeks**`;
    };

    // Simulate AI response for demo (replace with real OpenRouter call)
    const mockResponses = {
      construction: {
        estimate: generateConstructionEstimate(prompt || '')
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

    // Extract cost and savings amounts from response
    const totalCostMatch = defaultResponse.match(/\*\*Total Project Cost\*\*: \$([\d,]+)/);
    const savingsMatch = defaultResponse.match(/\*\*Total Potential Savings\*\*: \$([\d,]+)/);
    
    const totalCost = totalCostMatch ? parseInt(totalCostMatch[1].replace(/,/g, '')) : 0;
    const estimatedSavings = savingsMatch ? parseInt(savingsMatch[1].replace(/,/g, '')) : 0;

    return NextResponse.json({
      success: true,
      result: defaultResponse,
      estimatedSavings,
      totalCost,
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