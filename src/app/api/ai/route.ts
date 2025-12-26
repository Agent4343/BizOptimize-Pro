import { NextRequest, NextResponse } from 'next/server';
import { extractProvinceEnhanced, getProvinceCostMultiplier } from '@/lib/province-data';
import { validateEstimate } from '@/lib/validation';
import { generateCodeComplianceSection, getCodeReference } from '@/lib/building-codes';

// Helper function to call OpenAI API with function calling for code compliance
async function callOpenAI(prompt: string, systemPrompt: string, functions?: any[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const requestBody: any = {
    model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for cheaper option
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  };

  if (functions && functions.length > 0) {
    requestBody.tools = functions;
    requestBody.tool_choice = 'auto';
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Helper function to call OpenRouter API with function calling
async function callOpenRouter(prompt: string, systemPrompt: string, functions?: any[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const requestBody: any = {
    model: 'anthropic/claude-3.5-sonnet', // or 'openai/gpt-4-turbo'
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  };

  if (functions && functions.length > 0) {
    requestBody.tools = functions;
    requestBody.tool_choice = 'auto';
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://bizoptimize-pro.vercel.app',
      'X-Title': 'BizOptimize Pro',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Helper to extract province from location (backward compatible)
function extractProvince(location: string): string {
  return extractProvinceEnhanced(location).province;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, businessType, optimizationType, trade, province, location } = body;

    // Generate trade-specific estimate
    const generateTradeSpecificEstimate = (promptText: string, tradeType: string) => {
      // Extract location and province from prompt or use provided values
      const locationMatch = promptText.match(/Location:\s*(.+?)(?:\n|$)/i);
      const provinceMatch = promptText.match(/Province:\s*(.+?)(?:\n|$)/i);
      
      // Use provided province if available, otherwise extract from location
      const extractedLocation: string = locationMatch ? locationMatch[1].trim() : (location || '');
      const providedProvince: string = province || (provinceMatch ? provinceMatch[1].trim() : '');
      
      // If province is provided directly, use it; otherwise extract from location
      let finalProvince: string;
      let costMultiplier: number;
      
      if (providedProvince) {
        // Province was provided directly from dropdown
        const provinceData = extractProvinceEnhanced(providedProvince);
        finalProvince = providedProvince; // Use the provided province name
        costMultiplier = provinceData.costMultiplier;
      } else {
        // Fallback to extracting from location
        const provinceData = extractProvinceEnhanced(extractedLocation);
        finalProvince = provinceData.province;
        costMultiplier = provinceData.costMultiplier;
      }
      
      // Use these values in the trade calculators
      const locationValue: string = extractedLocation;
      const provinceValue: string = finalProvince;
      
      // Trade-specific calculation functions
      const tradeCalculators: Record<string, (prompt: string) => string> = {
        electrical: (prompt: string) => {
          const isGarage = /garage/i.test(prompt) || /Project Type.*garage/i.test(prompt);

          // Extract square footage for calculations
          const sqftMatch = prompt.match(/(\d+)\s*(?:sq\s*ft|square\s*feet)/i);
          const sqft = sqftMatch ? parseInt(sqftMatch[1]) : (isGarage ? 600 : 2000);

          // Calculate expected electrical requirements based on sq ft and CEC guidelines
          // Garage: simpler layout, perimeter outlets, basic lighting
          // House: CEC requires outlets within 1.8m of any point, more circuits
          const calculateExpectedElectrical = (sqft: number, isGarage: boolean) => {
            if (isGarage) {
              // Garage calculations:
              // - Circuits: 1 lighting + 1 per 100 sq ft for outlets + 1-2 dedicated (door opener, heater, EV)
              // - Outlets: perimeter spacing ~8ft apart, roughly 1 per 60 sq ft
              // - Switches: 1-2 for main lighting zones
              const baseCircuits = 2; // lighting + general
              const additionalCircuits = Math.ceil(sqft / 150); // 1 per 150 sq ft
              const dedicatedCircuits = sqft >= 400 ? 2 : 1; // EV prep, heater for larger garages

              return {
                circuits: Math.min(baseCircuits + additionalCircuits + dedicatedCircuits, 15),
                outlets: Math.max(4, Math.min(Math.ceil(sqft / 60), 20)), // 1 per 60 sq ft, min 4, max 20
                switches: Math.max(2, Math.min(Math.ceil(sqft / 200), 6)), // 1 per 200 sq ft, min 2
                panel: sqft >= 800 ? 150 : 100 // Larger garages may need 150A
              };
            } else {
              // House calculations (CEC compliance):
              // - General circuits: 1 per 75 sq ft
              // - Dedicated circuits: kitchen (2), laundry, bathroom, HVAC, etc.
              // - Outlets: CEC requires within 1.8m of any wall point, roughly 1 per 35 sq ft
              // - Switches: 1 per 80 sq ft (room-based zones)
              const generalCircuits = Math.ceil(sqft / 75);
              const dedicatedCircuits = 8; // kitchen x2, laundry, bathroom, HVAC, water heater, dryer, range

              return {
                circuits: Math.min(generalCircuits + dedicatedCircuits, 50),
                outlets: Math.max(15, Math.min(Math.ceil(sqft / 35), 100)), // 1 per 35 sq ft
                switches: Math.max(8, Math.min(Math.ceil(sqft / 80), 40)), // 1 per 80 sq ft
                panel: sqft >= 2500 ? 200 : (sqft >= 1500 ? 150 : 100)
              };
            }
          };

          const expected = calculateExpectedElectrical(sqft, isGarage);

          // Extract user-specified values with regex patterns
          const panelMatch = prompt.match(/(?:Panel|Main Panel).*?(\d+)\s*(?:amp|amps|A)/i);
          const circuitsMatch = prompt.match(/(?:Circuits|Number of Circuits).*?(\d+)/i);
          const outletsMatch = prompt.match(/(?:Outlets|Number of Outlets|Electrical Outlets).*?(\d+)(?!\s*(?:V|volt|amp|amps|A|sq|ft|feet))/i);
          const switchesMatch = prompt.match(/(?:Switches|Number of Switches|Light Switches).*?(\d+)/i);

          // Use user values if provided, otherwise use calculated expected values
          let panelSize = panelMatch ? parseInt(panelMatch[1]) : expected.panel;
          let circuits = circuitsMatch ? parseInt(circuitsMatch[1]) : expected.circuits;
          let outlets = outletsMatch ? parseInt(outletsMatch[1]) : expected.outlets;
          let switches = switchesMatch ? parseInt(switchesMatch[1]) : expected.switches;

          // Validation: ensure values are within reasonable bounds
          if (panelSize < 60 || panelSize > 400) panelSize = expected.panel;
          if (circuits < 1 || circuits > 100) circuits = expected.circuits;
          if (outlets < 0 || outlets > 200) outlets = expected.outlets;
          if (switches < 0 || switches > 100) switches = expected.switches;

          // Electrical pricing (CAD) - garage vs house rates
          // Garage work is typically simpler: shorter runs, less complexity
          const panelInstall = panelSize >= 200 ? 2500 : (panelSize >= 150 ? 2000 : 1500);
          // Circuit cost: $110/circuit for garages (simpler routing), $150 for houses
          const circuitRate = isGarage ? 110 : 150;
          const circuitCost = circuits * circuitRate;
          // Outlet cost: $65/outlet for garages (surface mount common), $85 for houses
          const outletRate = isGarage ? 65 : 85;
          const outletCost = outlets * outletRate;
          const switchCost = switches * 65;
          // Wire cost: garage uses shorter runs, less labor
          const wireRate = isGarage ? 35 : 45;
          const outletWireRate = isGarage ? 20 : 30;
          const wireCost = (circuits * wireRate) + (outlets * outletWireRate);
          const permitCost = isGarage ? 250 : 350; // Lower permit cost for garages
          const inspectionCost = isGarage ? 150 : 200; // Lower inspection cost for garages
          // Contractor overhead (20%) on all costs including permits/inspections
          const subtotal = panelInstall + circuitCost + outletCost + switchCost + wireCost + permitCost + inspectionCost;
          const contractorOverhead = Math.round(subtotal * 0.20);

          let totalCost = subtotal + contractorOverhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);
          // Potential savings: 5% is realistic for electrical (regulated trade with limited discount options)
          const potentialSavings = Math.round(totalCost * 0.05);
          
          // Check if user values differ significantly from expected
          const userSpecified = circuitsMatch || outletsMatch || switchesMatch;
          const circuitsDiff = circuits !== expected.circuits;
          const outletsDiff = outlets !== expected.outlets;

          return `# Electrical Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Project Type**: ${isGarage ? 'Garage' : 'Residential'}
- **Square Footage**: ${sqft.toLocaleString()} sq ft

## Electrical Specifications
| Component | Your Spec | CEC Expected* |
|-----------|-----------|---------------|
| Panel Size | ${panelSize}A | ${expected.panel}A |
| Circuits | ${circuits} | ${expected.circuits} |
| Outlets | ${outlets} | ${expected.outlets} |
| Switches | ${switches} | ${expected.switches} |

*CEC Expected: Based on ${sqft} sq ft ${isGarage ? 'garage' : 'house'} per Canadian Electrical Code guidelines${userSpecified && (circuitsDiff || outletsDiff) ? `

**Note**: Your specifications differ from typical requirements. ${circuits > expected.circuits ? 'Higher circuit count may indicate workshop/heavy use.' : ''} ${outlets > expected.outlets ? 'Higher outlet count suitable for workshops with many tools.' : ''}` : ''}

## Detailed Cost Breakdown

### Electrical Components
- **Main Panel Installation**: $${panelInstall.toLocaleString()}
- **Circuit Installation** (${circuits} circuits @ $${circuitRate}): $${circuitCost.toLocaleString()}
- **Outlet Installation** (${outlets} outlets @ $${outletRate}): $${outletCost.toLocaleString()}
- **Switch Installation** (${switches} switches @ $65): $${switchCost.toLocaleString()}
- **Wiring & Materials**: $${wireCost.toLocaleString()}

### Other Costs
- **Permits**: $${permitCost.toLocaleString()}
- **Inspections**: $${inspectionCost.toLocaleString()}
- **Contractor Overhead (20%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total Electrical Cost**: $${totalCost.toLocaleString()} CAD
- **Potential Savings**: $${potentialSavings.toLocaleString()}
- **Optimized Cost**: $${(totalCost - potentialSavings).toLocaleString()}

${generateCodeComplianceSection(provinceValue, 'electrical')}`;
        },
        
        plumbing: (prompt: string) => {
          const isGarage = /garage/i.test(prompt) || /Project Type.*garage/i.test(prompt);
          const fixturesMatch = prompt.match(/Fixtures.*?(\d+)/i);
          const fixtures = fixturesMatch ? parseInt(fixturesMatch[1]) : (isGarage ? 0 : 5);
          const waterHeater = /water.*heater/i.test(prompt) && !isGarage;
          
          // For garages, typically only utility sink if any plumbing
          const fixtureCost = isGarage ? (fixtures > 0 ? fixtures * 300 : 0) : fixtures * 450;
          const waterHeaterCost = waterHeater ? 2500 : 0;
          const pipeCost = isGarage ? (fixtures > 0 ? fixtures * 120 : 0) : fixtures * 180;
          const drainCost = isGarage ? (fixtures > 0 ? fixtures * 80 : 0) : fixtures * 120;
          const permitCost = isGarage ? 150 : 300;
          const inspectionCost = isGarage ? 100 : 150;
          const contractorOverhead = Math.round((fixtureCost + waterHeaterCost + pipeCost + drainCost) * 0.20);
          
          let totalCost = fixtureCost + waterHeaterCost + pipeCost + drainCost + permitCost + inspectionCost + contractorOverhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);
          const potentialSavings = Math.round(totalCost * 0.15);
          
          return `# Plumbing Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Project Type**: ${isGarage ? 'Garage' : 'Residential'}
- **Fixtures**: ${fixtures}${isGarage ? ' (Utility sink if applicable)' : ''}
- **Water Heater**: ${waterHeater ? 'Yes' : 'No'}${isGarage ? ' (Not typically required for garages)' : ''}

## Detailed Cost Breakdown

### Plumbing Components
- **Fixture Installation** (${fixtures} fixtures @ $450): $${fixtureCost.toLocaleString()}
${waterHeater ? `- **Water Heater Installation**: $${waterHeaterCost.toLocaleString()}\n` : ''}- **Water Lines** (${fixtures} fixtures @ $180): $${pipeCost.toLocaleString()}
- **Drain Lines** (${fixtures} fixtures @ $120): $${drainCost.toLocaleString()}

### Other Costs
- **Permits**: $${permitCost.toLocaleString()}
- **Inspections**: $${inspectionCost.toLocaleString()}
- **Contractor Overhead (20%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total Plumbing Cost**: $${totalCost.toLocaleString()} CAD
- **Potential Savings**: $${potentialSavings.toLocaleString()}
- **Optimized Cost**: $${(totalCost - potentialSavings).toLocaleString()}

${generateCodeComplianceSection(provinceValue, 'plumbing')}`;
        },
        
        hvac: (prompt: string) => {
          const isGarage = /garage/i.test(prompt) || /Project Type.*garage/i.test(prompt);
          const capacityMatch = prompt.match(/(\d+).*?(?:BTU|btu|ton)/i);
          const capacity = capacityMatch ? parseInt(capacityMatch[1]) : (isGarage ? 0 : 36000);
          const systemType = /heat.*pump/i.test(prompt) ? 'Heat Pump' : (/space.*heater|radiant/i.test(prompt) ? 'Space Heater/Radiant' : 'Forced Air');
          const ductwork = /ductwork/i.test(prompt) && !isGarage;
          const noHVAC = /no.*hvac|none.*required/i.test(prompt) || (isGarage && !capacityMatch);
          
          // For garages, typically no HVAC or minimal heating
          const systemCost = noHVAC ? 0 : (isGarage ? 1200 : (capacity >= 36000 ? 8500 : 6500));
          const ductworkCost = ductwork ? 3500 : 0;
          const installationCost = isGarage ? 600 : 2500;
          const permitCost = isGarage ? 200 : 400;
          const inspectionCost = isGarage ? 100 : 200;
          const contractorOverhead = Math.round((systemCost + ductworkCost + installationCost) * 0.20);
          
          let totalCost = systemCost + ductworkCost + installationCost + permitCost + inspectionCost + contractorOverhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);
          const potentialSavings = Math.round(totalCost * 0.15);
          
          return `# HVAC Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Project Type**: ${isGarage ? 'Garage' : 'Residential'}
- **System Type**: ${noHVAC ? 'No HVAC Required' : systemType}
- **Capacity**: ${capacity > 0 ? capacity.toLocaleString() + ' BTU' : 'N/A'}
- **Ductwork**: ${ductwork ? 'Required' : 'Not Required'}${isGarage ? ' (Garages typically don\'t require ductwork)' : ''}

## Detailed Cost Breakdown

### HVAC Components
- **HVAC System**: $${systemCost.toLocaleString()}
${ductwork ? `- **Ductwork Installation**: $${ductworkCost.toLocaleString()}\n` : ''}- **Installation Labor**: $${installationCost.toLocaleString()}

### Other Costs
- **Permits**: $${permitCost.toLocaleString()}
- **Inspections**: $${inspectionCost.toLocaleString()}
- **Contractor Overhead (20%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total HVAC Cost**: $${totalCost.toLocaleString()} CAD
- **Potential Savings**: $${potentialSavings.toLocaleString()}
- **Optimized Cost**: $${(totalCost - potentialSavings).toLocaleString()}

${generateCodeComplianceSection(provinceValue, 'hvac')}`;
        },
        
        roofing: (prompt: string) => {
          const materialMatch = prompt.match(/Material.*?(\w+)/i);
          const material = materialMatch ? materialMatch[1] : 'Asphalt Shingles';
          const sizeMatch = prompt.match(/Size.*?(\d+)/i);
          const sqft = sizeMatch ? parseInt(sizeMatch[1]) : 2000;
          
          const materialCosts: Record<string, number> = {
            'asphalt': 4,
            'metal': 8,
            'tile': 12,
            'slate': 15,
            'rubber': 6
          };
          const costPerSqft = materialCosts[material.toLowerCase()] || 4;
          
          const materialCost = sqft * costPerSqft;
          const laborCost = sqft * 3;
          const underlayment = sqft * 1.5;
          const flashing = 800;
          const permitCost = 250;
          const contractorOverhead = Math.round((materialCost + laborCost + underlayment + flashing) * 0.20);
          
          let totalCost = materialCost + laborCost + underlayment + flashing + permitCost + contractorOverhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);
          const potentialSavings = Math.round(totalCost * 0.15);
          
          return `# Roofing Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Material**: ${material}
- **Roof Size**: ${sqft.toLocaleString()} sq ft

## Detailed Cost Breakdown

### Roofing Components
- **Roofing Material** (${sqft} sq ft @ $${costPerSqft}/sq ft): $${materialCost.toLocaleString()}
- **Installation Labor** (${sqft} sq ft @ $3/sq ft): $${laborCost.toLocaleString()}
- **Underlayment**: $${underlayment.toLocaleString()}
- **Flashing & Trim**: $${flashing.toLocaleString()}

### Other Costs
- **Permits**: $${permitCost.toLocaleString()}
- **Contractor Overhead (20%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total Roofing Cost**: $${totalCost.toLocaleString()} CAD
- **Cost per Square Foot**: $${Math.round(totalCost / sqft).toLocaleString()}/sq ft
- **Potential Savings**: $${potentialSavings.toLocaleString()}
- **Optimized Cost**: $${(totalCost - potentialSavings).toLocaleString()}

${generateCodeComplianceSection(provinceValue, 'roofing')}`;
        },
        
        foundation: (prompt: string) => {
          const typeMatch = prompt.match(/Type.*?(\w+)/i);
          const type = typeMatch ? typeMatch[1] : 'Slab';
          const sizeMatch = prompt.match(/Size.*?(\d+)/i);
          const sqft = sizeMatch ? parseInt(sizeMatch[1]) : 1000;
          
          const costPerSqft = type.toLowerCase().includes('basement') ? 45 : (type.toLowerCase().includes('crawl') ? 25 : 20);
          const excavation = sqft * 8;
          const concrete = sqft * costPerSqft;
          const rebar = sqft * 3;
          const waterproofing = sqft * 2;
          const permitCost = 500;
          const inspectionCost = 200;
          const contractorOverhead = Math.round((excavation + concrete + rebar + waterproofing) * 0.20);
          
          let totalCost = excavation + concrete + rebar + waterproofing + permitCost + inspectionCost + contractorOverhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);
          const potentialSavings = Math.round(totalCost * 0.15);
          
          return `# Foundation Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Foundation Type**: ${type}
- **Size**: ${sqft.toLocaleString()} sq ft

## Detailed Cost Breakdown

### Foundation Components
- **Excavation**: $${excavation.toLocaleString()}
- **Concrete** (${sqft} sq ft @ $${costPerSqft}/sq ft): $${concrete.toLocaleString()}
- **Rebar**: $${rebar.toLocaleString()}
- **Waterproofing**: $${waterproofing.toLocaleString()}

### Other Costs
- **Permits**: $${permitCost.toLocaleString()}
- **Inspections**: $${inspectionCost.toLocaleString()}
- **Contractor Overhead (20%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total Foundation Cost**: $${totalCost.toLocaleString()} CAD
- **Potential Savings**: $${potentialSavings.toLocaleString()}
- **Optimized Cost**: $${(totalCost - potentialSavings).toLocaleString()}

${generateCodeComplianceSection(provinceValue, 'foundation')}`;
        },
        
        drywall: (prompt: string) => {
          const areaMatch = prompt.match(/Area.*?(\d+)/i);
          const area = areaMatch ? parseInt(areaMatch[1]) : 2000;
          const finishMatch = prompt.match(/Finish.*?(level|Level).*?(\d)/i);
          const finishLevel = finishMatch ? parseInt(finishMatch[2]) : 4;
          
          const materialCost = area * 1.2;
          const laborCost = area * (finishLevel >= 4 ? 2.5 : 1.5);
          const mudding = area * 1.8;
          const sanding = area * 0.8;
          const contractorOverhead = Math.round((materialCost + laborCost + mudding + sanding) * 0.20);
          
          let totalCost = materialCost + laborCost + mudding + sanding + contractorOverhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);
          const potentialSavings = Math.round(totalCost * 0.10);
          
          return `# Drywall Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Area**: ${area.toLocaleString()} sq ft
- **Finish Level**: Level ${finishLevel}

## Detailed Cost Breakdown

### Drywall Components
- **Drywall Material** (${area} sq ft @ $1.20/sq ft): $${materialCost.toLocaleString()}
- **Installation Labor** (${area} sq ft @ $${finishLevel >= 4 ? '2.50' : '1.50'}/sq ft): $${laborCost.toLocaleString()}
- **Mudding & Taping**: $${mudding.toLocaleString()}
- **Sanding**: $${sanding.toLocaleString()}

### Other Costs
- **Contractor Overhead (20%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total Drywall Cost**: $${totalCost.toLocaleString()} CAD
- **Cost per Square Foot**: $${Math.round(totalCost / area).toLocaleString()}/sq ft
- **Potential Savings**: $${potentialSavings.toLocaleString()}
- **Optimized Cost**: $${(totalCost - potentialSavings).toLocaleString()}

${generateCodeComplianceSection(provinceValue, 'drywall')}`;
        },
        
        flooring: (prompt: string) => {
          const typeMatch = prompt.match(/Type.*?(\w+)/i);
          const type = typeMatch ? typeMatch[1] : 'Laminate';
          const areaMatch = prompt.match(/Area.*?(\d+)/i);
          const area = areaMatch ? parseInt(areaMatch[1]) : 2000;
          
          const materialCosts: Record<string, number> = {
            'hardwood': 8,
            'laminate': 3,
            'vinyl': 4,
            'tile': 6,
            'carpet': 5,
            'concrete': 2
          };
          const costPerSqft = materialCosts[type.toLowerCase()] || 3;
          
          const materialCost = area * costPerSqft;
          const laborCost = area * 2;
          const underlayment = area * 0.5;
          const contractorOverhead = Math.round((materialCost + laborCost + underlayment) * 0.20);
          
          let totalCost = materialCost + laborCost + underlayment + contractorOverhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);
          const potentialSavings = Math.round(totalCost * 0.10);
          
          return `# Flooring Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Flooring Type**: ${type}
- **Area**: ${area.toLocaleString()} sq ft

## Detailed Cost Breakdown

### Flooring Components
- **Flooring Material** (${area} sq ft @ $${costPerSqft}/sq ft): $${materialCost.toLocaleString()}
- **Installation Labor** (${area} sq ft @ $2/sq ft): $${laborCost.toLocaleString()}
- **Underlayment**: $${underlayment.toLocaleString()}

### Other Costs
- **Contractor Overhead (20%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total Flooring Cost**: $${totalCost.toLocaleString()} CAD
- **Cost per Square Foot**: $${Math.round(totalCost / area).toLocaleString()}/sq ft
- **Potential Savings**: $${potentialSavings.toLocaleString()}
- **Optimized Cost**: $${(totalCost - potentialSavings).toLocaleString()}

${generateCodeComplianceSection(provinceValue, 'flooring')}`;
        },
        
        painting: (prompt: string) => {
          const areaMatch = prompt.match(/Area.*?(\d+)/i);
          const area = areaMatch ? parseInt(areaMatch[1]) : 2000;
          const coatsMatch = prompt.match(/Coats.*?(\d+)/i);
          const coats = coatsMatch ? parseInt(coatsMatch[1]) : 2;
          
          const paintCost = area * 0.8;
          const laborCost = area * (coats * 1.2);
          const prepCost = area * 0.5;
          const contractorOverhead = Math.round((paintCost + laborCost + prepCost) * 0.20);
          
          let totalCost = paintCost + laborCost + prepCost + contractorOverhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);
          const potentialSavings = Math.round(totalCost * 0.10);
          
          return `# Painting Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Area**: ${area.toLocaleString()} sq ft
- **Number of Coats**: ${coats}

## Detailed Cost Breakdown

### Painting Components
- **Paint & Materials** (${area} sq ft @ $0.80/sq ft): $${paintCost.toLocaleString()}
- **Labor** (${area} sq ft @ $${(coats * 1.2).toFixed(2)}/sq ft): $${laborCost.toLocaleString()}
- **Preparation** (${area} sq ft @ $0.50/sq ft): $${prepCost.toLocaleString()}

### Other Costs
- **Contractor Overhead (20%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total Painting Cost**: $${totalCost.toLocaleString()} CAD
- **Cost per Square Foot**: $${Math.round(totalCost / area).toLocaleString()}/sq ft
- **Potential Savings**: $${potentialSavings.toLocaleString()}
- **Optimized Cost**: $${(totalCost - potentialSavings).toLocaleString()}

${generateCodeComplianceSection(provinceValue, 'painting')}`;
        }
      };
      
      const calculator = tradeCalculators[tradeType.toLowerCase()];
      if (calculator) {
        return calculator(promptText);
      }
      
      // Fallback to general construction estimate
      return generateConstructionEstimate(promptText);
    };

    // Generate dynamic construction estimate based on input (for full construction)
    const generateConstructionEstimate = (promptText: string) => {
      // Extract square footage from prompt
      const sqftMatch = promptText.match(/(\d+)\s*(?:sq\s*ft|square\s*feet|square\s*footage)/i);
      const sqft = sqftMatch ? parseInt(sqftMatch[1]) : 2000; // Default to 2000 if not found
      
      // Determine project type (garage, house, etc.)
      // Check both the prompt text and explicit project type field
      const projectTypeMatch = promptText.match(/Project Type:\s*([^\n]+)/i);
      const projectTypeValue = projectTypeMatch ? projectTypeMatch[1].toLowerCase() : '';
      const isGarage = /garage/i.test(promptText) || projectTypeValue.includes('garage');
      const isHouse = (/house|home|residential/i.test(promptText) && !isGarage) || projectTypeValue.includes('house') || projectTypeValue.includes('residential');
      
      // Cost per sq ft varies by project type
      // Garage: $40-60/sq ft, House: $150-300/sq ft
      const costPerSqft = isGarage ? 50 : (isHouse ? 200 : 150);
      
      // Extract bedrooms and bathrooms (for houses)
      const bedroomsMatch = promptText.match(/(\d+)\s*bedroom/i);
      const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : 0;
      const bathroomsMatch = promptText.match(/(\d+(?:\.\d+)?)\s*bathroom/i);
      const bathrooms = bathroomsMatch ? parseFloat(bathroomsMatch[1]) : 0;
      
      // Detailed construction line items
      const foundationCost = Math.round(sqft * (isGarage ? 8 : 15));
      const sitePrepCost = Math.round(foundationCost * 0.3); // Site prep is 30% of foundation
      const framingCost = Math.round(sqft * (isGarage ? 12 : 25));
      const roofingCost = Math.round(sqft * (isGarage ? 6 : 12));
      const sidingCost = Math.round(sqft * (isGarage ? 5 : 10));
      const electricalCost = Math.round(sqft * (isGarage ? 3 : 8));
      const plumbingCost = isGarage ? 0 : Math.round(sqft * 6);
      const hvacCost = isGarage ? 0 : Math.round(sqft * 8);
      const insulationCost = Math.round(sqft * (isGarage ? 2 : 4));
      const drywallCost = Math.round(sqft * (isGarage ? 3 : 6));
      const flooringCost = Math.round(sqft * (isGarage ? 2 : 8));
      const doorsWindowsCost = Math.round(sqft * (isGarage ? 3 : 10));
      const paintCost = Math.round(sqft * (isGarage ? 1 : 3));
      const permitsCost = Math.round(sqft * 2);
      
      // Calculate base cost (all costs before overhead)
      const baseCost = foundationCost + sitePrepCost + framingCost + roofingCost + sidingCost + 
                       electricalCost + plumbingCost + hvacCost + insulationCost + drywallCost + 
                       flooringCost + doorsWindowsCost + paintCost + permitsCost;
      
      // Overhead & profit is 15% of base cost
      const contractorOverhead = Math.round(baseCost * 0.15);
      
      // Total cost includes everything
      const totalCost = baseCost + contractorOverhead;
      
      // Calculate potential savings (15-25% of total cost)
      const savingsPercentage = 0.20; // 20% average
      const potentialSavings = Math.round(totalCost * savingsPercentage);
      const optimizedCost = totalCost - potentialSavings;
      
      // Calculate timeline based on size and type
      const weeksPer1000Sqft = isGarage ? 2 : 3;
      const baseWeeks = Math.ceil((sqft / 1000) * weeksPer1000Sqft);
      const foundationWeeks = Math.max(1, Math.ceil(baseWeeks * 0.20));
      const framingWeeks = Math.max(2, Math.ceil(baseWeeks * 0.35));
      const roofingWeeks = Math.max(1, Math.ceil(baseWeeks * 0.15));
      const mechanicalsWeeks = isGarage ? 1 : Math.max(2, Math.ceil(baseWeeks * 0.20));
      const finishingWeeks = Math.max(1, Math.ceil(baseWeeks * 0.25));
      const finalWeeks = 1;
      const totalWeeks = foundationWeeks + framingWeeks + roofingWeeks + mechanicalsWeeks + finishingWeeks + finalWeeks;
      
      // Calculate individual savings opportunities (must sum to potentialSavings)
      // Total should be 20%: 3% + 5% + 2% + 7% + 3% = 20%
      const localSourcing = Math.round(potentialSavings * 0.15); // 15% of savings
      const seasonalTiming = Math.round(potentialSavings * 0.25); // 25% of savings
      const rebates = Math.round(potentialSavings * 0.10); // 10% of savings
      const valueEngineering = Math.round(potentialSavings * 0.35); // 35% of savings
      const ownerSupplied = Math.round(potentialSavings * 0.15); // 15% of savings
      
      // Ensure they sum exactly to potentialSavings (handle rounding)
      const savingsSum = localSourcing + seasonalTiming + rebates + valueEngineering + ownerSupplied;
      const savingsDifference = potentialSavings - savingsSum;
      // Add any rounding difference to valueEngineering (largest component)
      const adjustedValueEngineering = valueEngineering + savingsDifference;
      
      const projectType = isGarage ? 'Garage' : (isHouse ? 'Residential Home' : 'Building');
      
      return `# Construction Estimate Analysis

## Project Details
- **Project Type**: ${projectType}
- **Square Footage**: ${sqft.toLocaleString()} sq ft${bedrooms > 0 ? `\n- **Bedrooms**: ${bedrooms}` : ''}${bathrooms > 0 ? `\n- **Bathrooms**: ${bathrooms}` : ''}

## Detailed Cost Breakdown

### Site Preparation & Foundation
- **Foundation**: $${foundationCost.toLocaleString()}
- **Site Prep & Excavation**: $${sitePrepCost.toLocaleString()}

### Structure
- **Framing (Walls & Roof)**: $${framingCost.toLocaleString()}
- **Roofing Materials & Installation**: $${roofingCost.toLocaleString()}
- **Siding/Exterior Finish**: $${sidingCost.toLocaleString()}

### Systems
- **Electrical**: $${electricalCost.toLocaleString()}${plumbingCost > 0 ? `\n- **Plumbing**: $${plumbingCost.toLocaleString()}` : ''}${hvacCost > 0 ? `\n- **HVAC**: $${hvacCost.toLocaleString()}` : ''}
- **Insulation**: $${insulationCost.toLocaleString()}

### Interior Finishes
- **Drywall**: $${drywallCost.toLocaleString()}
- **Flooring**: $${flooringCost.toLocaleString()}
- **Doors & Windows**: $${doorsWindowsCost.toLocaleString()}
- **Paint**: $${paintCost.toLocaleString()}

### Other Costs
- **Permits & Inspections**: $${permitsCost.toLocaleString()}
- **Contractor Overhead & Profit (15%)**: $${contractorOverhead.toLocaleString()}

## Summary
- **Total Project Cost**: $${totalCost.toLocaleString()} CAD
- **Cost per Square Foot**: $${Math.round(totalCost / sqft).toLocaleString()}/sq ft

## Identified Savings Opportunities
1. **Local Material Sourcing**: Save $${localSourcing.toLocaleString()}
2. **Seasonal Construction Timing**: Save $${seasonalTiming.toLocaleString()}
3. **Energy Efficiency Rebates**: Save $${rebates.toLocaleString()}
4. **Value Engineering**: Save $${adjustedValueEngineering.toLocaleString()}
5. **Owner-Supplied Items**: Save $${ownerSupplied.toLocaleString()}

**Total Potential Savings: $${potentialSavings.toLocaleString()}**
**Optimized Project Cost: $${optimizedCost.toLocaleString()}**

## Implementation Timeline
- **Foundation**: ${foundationWeeks} week${foundationWeeks > 1 ? 's' : ''}
- **Framing & Structure**: ${framingWeeks} week${framingWeeks > 1 ? 's' : ''}
- **Roofing**: ${roofingWeeks} week${roofingWeeks > 1 ? 's' : ''}
- **Mechanical Systems**: ${mechanicalsWeeks} week${mechanicalsWeeks > 1 ? 's' : ''}
- **Interior Finishing**: ${finishingWeeks} week${finishingWeeks > 1 ? 's' : ''}
- **Final Inspection**: ${finalWeeks} week

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

    // For construction estimates, always use our detailed calculation system
    // For other business types, use AI if available, otherwise use mock responses
    let defaultResponse: string = "Analysis completed. Optimization recommendations generated based on your business data.";
    let useAI = false;

    // Construction estimates: use our calculation system, then enhance with AI if available
    if (businessType === 'construction' && optimizationType === 'estimate') {
      // If a specific trade is selected, generate trade-specific estimate
      let baseResponse: string;
      if (trade && trade !== '') {
        baseResponse = generateTradeSpecificEstimate(prompt || '', trade);
      } else {
        // Otherwise, generate full construction estimate
        const businessResponses = mockResponses[businessType as keyof typeof mockResponses];
        baseResponse = (businessResponses && optimizationType in businessResponses 
          ? (businessResponses as any)[optimizationType] 
          : null) || 
          defaultResponse;
      }
      
      // If AI is available, enhance the estimate with compliance agents
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
      
      if ((hasOpenRouter || hasOpenAI) && prompt) {
        try {
          useAI = true;
          
          // Extract province from prompt or use provided value
          const locationMatch = prompt.match(/Location:\s*(.+?)(?:\n|$)/i);
          const provinceMatch = prompt.match(/Province:\s*(.+?)(?:\n|$)/i);
          const extractedLocationForAI: string = locationMatch ? locationMatch[1].trim() : (location || '');
          const providedProvinceForAI: string = province || (provinceMatch ? provinceMatch[1].trim() : '');
          const finalProvinceForAI: string = providedProvinceForAI || extractProvince(extractedLocationForAI);
          
          // Multi-agent system prompt for compliance and pricing validation
          const aiSystemPrompt = `You are a team of specialized construction estimation agents creating professional quotes that contractors will trust and use:

1. **Pricing Expert Agent**: Validate and enhance pricing for ${finalProvinceForAI}
   - Verify labor rates match current ${finalProvinceForAI} market (2024-2025 rates)
   - Validate material costs with current supplier pricing
   - Add value engineering suggestions (cost savings without sacrificing quality)
   - Include contingency recommendations (5-10% for typical projects)

2. **Code Compliance Agent**: Expert in ${finalProvinceForAI} building codes
   - Electrical: CEC (Canadian Electrical Code) - GFCI protection, AFCI where required, wire sizing
   - Plumbing: NPC (National Plumbing Code) compliance
   - Structural: NBC (National Building Code) - load requirements, seismic, snow loads
   - Fire: Fire separation requirements, smoke/CO detectors

3. **Contractor Success Agent**: Make this quote professional and sellable
   - Add a clear scope of work summary
   - Include payment milestone suggestions (e.g., 30% deposit, 40% rough-in, 30% completion)
   - List key materials with quality specifications
   - Add warranty information (standard 1-year workmanship)
   - Include exclusions to protect the contractor
   - Suggest timeline with key milestones

IMPORTANT FORMATTING:
- Use clear headers and bullet points
- Include specific product recommendations where applicable
- Add "Exclusions" section (permits obtained by owner, unforeseen conditions, etc.)
- Add "Terms & Conditions" suggestions
- Keep language professional but accessible

IMPORTANT NOTES FOR GARAGES:
- Garages do NOT require egress windows (storage/workshop spaces)
- Focus on: GFCI outlets, proper ventilation, fire separation from house
- Include door opener prep, heater circuit, adequate lighting

Enhance this estimate to be professional, accurate, and ready for a contractor to present to their customer.`;
          
          // Enhanced prompt with province and project details
          const enhancedPrompt = `Base Estimate:\n\n${baseResponse}\n\n\nProject Details:\n${prompt}\n\nProvince: ${finalProvinceForAI}\n\nPlease enhance this estimate to be a professional contractor quote. Include:\n\n1. **Scope of Work Summary** - Clear bullet points of what's included\n2. **Material Specifications** - Specific brands/models where applicable\n3. **Code Compliance Notes** - Key ${finalProvinceForAI} code requirements met\n4. **Payment Schedule** - Suggested milestone payments\n5. **Timeline** - Realistic project duration with phases\n6. **Exclusions** - What's NOT included (protect the contractor)\n7. **Terms & Conditions** - Standard warranty, change order process\n8. **Value Engineering** - Optional cost savings the customer could consider\n\nMake this quote professional, complete, and ready to present to a customer.`;
          
          let aiEnhancement = '';
          if (hasOpenRouter) {
            aiEnhancement = await callOpenRouter(enhancedPrompt, aiSystemPrompt);
          } else {
            aiEnhancement = await callOpenAI(enhancedPrompt, aiSystemPrompt);
          }
          
          // Combine base estimate with AI agent enhancements
          defaultResponse = baseResponse + `\n\n---\n\n## Professional Quote Enhancement\n\n` + aiEnhancement;
        } catch (aiError) {
          console.error('AI enhancement error, using base estimate:', aiError);
          // Use base estimate if AI fails
          defaultResponse = baseResponse;
          useAI = false;
        }
      } else {
        // No AI available, use base estimate
        defaultResponse = baseResponse;
      }
    } else {
      // For other business types, try AI if available
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;

      if (hasOpenRouter || hasOpenAI) {
        try {
          useAI = true;
          // Build system prompt based on business type
          const systemPrompts: Record<string, Record<string, string>> = {
            trucking: {
              fleet: `You are a fleet optimization expert. Generate detailed fleet analysis reports in markdown format with:
- Current performance metrics
- Optimization recommendations
- Financial projections
- ROI analysis
- All costs in CAD dollars
- Use specific numbers, not ranges`
            },
            restaurant: {
              inventory: `You are a restaurant operations expert. Generate detailed optimization analysis in markdown format with:
- Current metrics
- Optimization strategies
- Cost savings breakdown
- Implementation timeline
- All costs in CAD dollars
- Use specific numbers, not ranges`
            }
          };

          const systemPrompt = systemPrompts[businessType]?.[optimizationType] || 
            'You are a business optimization expert. Generate detailed analysis and recommendations in markdown format with specific numbers, not ranges.';

          // Use OpenRouter if available, otherwise OpenAI
          if (hasOpenRouter) {
            defaultResponse = await callOpenRouter(prompt, systemPrompt);
          } else {
            defaultResponse = await callOpenAI(prompt, systemPrompt);
          }
        } catch (aiError) {
          console.error('AI API error, falling back to mock:', aiError);
          // Fall back to mock responses if AI fails
          useAI = false;
        }
      }

      // Use mock responses if AI is not configured or failed
      if (!useAI) {
        const businessResponses = mockResponses[businessType as keyof typeof mockResponses];
        defaultResponse = (businessResponses && optimizationType in businessResponses 
          ? (businessResponses as any)[optimizationType] 
          : null) || 
          defaultResponse;
      }
    }

    // Extract cost and savings amounts from response
    const totalCostMatch = defaultResponse.match(/\*\*Total Project Cost\*\*: \$([\d,]+)/) ||
                          defaultResponse.match(/Total.*Cost.*\$([\d,]+)/i);
    const savingsMatch = defaultResponse.match(/\*\*Total Potential Savings\*\*: \$([\d,]+)/) ||
                        defaultResponse.match(/Total.*Savings.*\$([\d,]+)/i);
    
    const totalCost = totalCostMatch ? parseInt(totalCostMatch[1].replace(/,/g, '')) : 0;
    const estimatedSavings = savingsMatch ? parseInt(savingsMatch[1].replace(/,/g, '')) : 0;

    return NextResponse.json({
      success: true,
      result: defaultResponse,
      estimatedSavings,
      totalCost,
      businessType,
      optimizationType,
      aiGenerated: useAI
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