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

// Helper function to call Anthropic API directly
async function callAnthropic(prompt: string, systemPrompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const data = await response.json();
  return data.content[0]?.text || '';
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
          
          // Extract values with better regex patterns and validation
          const panelMatch = prompt.match(/(?:Panel|Main Panel).*?(\d+)\s*(?:amp|amps|A)/i);
          const circuitsMatch = prompt.match(/(?:Circuits|Number of Circuits).*?(\d+)/i);
          // More specific outlet matching - avoid matching voltage (240V) or other numbers
          const outletsMatch = prompt.match(/(?:Outlets|Number of Outlets|Electrical Outlets).*?(\d+)(?!\s*(?:V|volt|amp|amps|A|sq|ft|feet))/i);
          const switchesMatch = prompt.match(/(?:Switches|Number of Switches|Light Switches).*?(\d+)/i);
          
          // Default values adjusted for garage vs house
          let panelSize = panelMatch ? parseInt(panelMatch[1]) : (isGarage ? 100 : 200);
          let circuits = circuitsMatch ? parseInt(circuitsMatch[1]) : (isGarage ? 8 : 20);
          let outlets = outletsMatch ? parseInt(outletsMatch[1]) : (isGarage ? 6 : 30);
          let switches = switchesMatch ? parseInt(switchesMatch[1]) : (isGarage ? 3 : 15);
          
          // Validation and sanity checks
          if (panelSize < 60 || panelSize > 400) panelSize = isGarage ? 100 : 200;
          if (circuits < 1 || circuits > 100) circuits = isGarage ? 8 : 20;
          if (outlets < 0 || outlets > 200) outlets = isGarage ? 6 : 30; // Cap at 200 max
          if (switches < 0 || switches > 100) switches = isGarage ? 3 : 15;

          // Get square footage for calculations
          const sqftMatch = prompt.match(/(\d+)\s*(?:sq\s*ft|square\s*feet)/i);
          const sqft = sqftMatch ? parseInt(sqftMatch[1]) : (isGarage ? 600 : 2000);

          // Additional sanity check: for garages, cap outlets at reasonable number based on size
          if (isGarage) {
            const maxReasonableOutlets = Math.ceil(sqft / 50); // 1 per 50 sq ft max
            if (outlets > maxReasonableOutlets) {
              outlets = Math.min(maxReasonableOutlets, 12); // Cap at 12 for garages
            }
          }

          // CEC Expected values based on project type and size
          const cecExpectedPanel = isGarage ? 100 : 200;
          const cecExpectedCircuits = isGarage ? Math.ceil(sqft / 75) : Math.ceil(sqft / 100);
          const cecExpectedOutlets = isGarage ? Math.ceil(sqft / 60) : Math.ceil(sqft / 60);
          const cecExpectedSwitches = isGarage ? Math.ceil(sqft / 200) : Math.ceil(sqft / 120);

          // Labor hour calculations (industry standard times)
          const panelHours = panelSize >= 200 ? 6 : 4; // Hours to install panel
          const circuitHoursEach = 0.75; // 45 min per circuit
          const outletHoursEach = 0.5; // 30 min per outlet
          const switchHoursEach = 0.4; // 24 min per switch
          const wiringHoursPerSqft = 0.015; // Rough-in wiring time

          const totalCircuitHours = Math.round(circuits * circuitHoursEach * 10) / 10;
          const totalOutletHours = Math.round(outlets * outletHoursEach * 10) / 10;
          const totalSwitchHours = Math.round(switches * switchHoursEach * 10) / 10;
          const totalWiringHours = Math.round(sqft * wiringHoursPerSqft * 10) / 10;
          const totalLaborHours = panelHours + totalCircuitHours + totalOutletHours + totalSwitchHours + totalWiringHours;

          // Crew size calculation (based on project complexity)
          const journeymanRate = 85; // $/hour CAD
          const apprenticeRate = 45; // $/hour CAD
          const needsApprentice = totalLaborHours > 16 || circuits > 10;
          const crewSize = needsApprentice ? 2 : 1;
          const workHoursPerDay = 8;
          const effectiveHoursPerDay = crewSize === 2 ? workHoursPerDay * 1.6 : workHoursPerDay; // 2-person crew is ~60% more efficient
          const projectDays = Math.ceil(totalLaborHours / effectiveHoursPerDay);

          // Travel time estimate (based on location - simplified)
          const isRemote = /rural|remote|outside|country/i.test(locationValue);
          const travelHours = isRemote ? 2 : 0.5;
          const travelCost = Math.round(travelHours * projectDays * 65); // Travel charge per day

          // Labor cost breakdown
          const journeymanHours = totalLaborHours;
          const apprenticeHours = needsApprentice ? Math.round(totalLaborHours * 0.7) : 0;
          const journeymanCost = Math.round(journeymanHours * journeymanRate);
          const apprenticeCost = Math.round(apprenticeHours * apprenticeRate);
          const totalLaborCost = journeymanCost + apprenticeCost + travelCost;

          // Material costs
          const panelMaterial = panelSize >= 200 ? 1200 : (panelSize >= 150 ? 900 : 650);
          const circuitMaterial = circuits * 45; // Wire, breakers per circuit
          const outletMaterial = outlets * 25; // Outlet, box, cover
          const switchMaterial = switches * 20; // Switch, box, cover
          const wireMaterial = Math.round(sqft * 0.85); // Romex, connectors, etc.
          const miscMaterial = Math.round((panelMaterial + circuitMaterial + outletMaterial + switchMaterial) * 0.1); // Misc supplies
          const totalMaterialCost = panelMaterial + circuitMaterial + outletMaterial + switchMaterial + wireMaterial + miscMaterial;

          // Other costs
          const permitCost = isGarage ? 250 : 350;
          const inspectionCost = isGarage ? 150 : 200;
          const overhead = Math.round((totalLaborCost + totalMaterialCost) * 0.15); // 15% overhead/profit

          let totalCost = totalLaborCost + totalMaterialCost + permitCost + inspectionCost + overhead;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);

          // Check if specs differ from CEC expected and generate appropriate note
          let specsNote = '';
          const circuitsDiff = circuits - cecExpectedCircuits;
          const outletsDiff = outlets - cecExpectedOutlets;
          const switchesDiff = switches - cecExpectedSwitches;

          if (circuitsDiff !== 0 || outletsDiff !== 0 || switchesDiff !== 0) {
            const differences: string[] = [];
            if (circuitsDiff > 0) differences.push(`+${circuitsDiff} circuits`);
            if (circuitsDiff < 0) differences.push(`${circuitsDiff} circuits`);
            if (outletsDiff > 0) differences.push(`+${outletsDiff} outlets`);
            if (outletsDiff < 0) differences.push(`${outletsDiff} outlets`);
            if (switchesDiff > 0) differences.push(`+${switchesDiff} switches`);
            if (switchesDiff < 0) differences.push(`${switchesDiff} switches`);

            const isHigher = circuitsDiff > 0 || outletsDiff > 0 || switchesDiff > 0;
            const isLower = circuitsDiff < 0 || outletsDiff < 0 || switchesDiff < 0;

            if (isHigher && !isLower) {
              specsNote = `\n\n**Note**: Your specifications exceed CEC minimums (${differences.join(', ')}). This may indicate workshop/heavy use requirements.`;
            } else if (isLower && !isHigher) {
              specsNote = `\n\n**Note**: Your specifications are below CEC recommendations (${differences.join(', ')}). Consider increasing for code compliance and functionality.`;
            } else {
              specsNote = `\n\n**Note**: Your specifications differ from CEC recommendations (${differences.join(', ')}). Review for your specific needs.`;
            }
          }

          // Generate estimate number
          const estimateNum = `EST-${Date.now().toString(36).toUpperCase()}`;
          const estimateDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
          const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

          return `# ELECTRICAL ESTIMATE

**Estimate #:** ${estimateNum}
**Date:** ${estimateDate}
**Valid Until:** ${validUntil}

---

## Project Information

| Field | Details |
|-------|---------|
| **Project Name** | ${isGarage ? 'Garage' : 'Residential'} Electrical Installation |
| **Location** | ${locationValue || 'Not specified'} |
| **Province** | ${provinceValue} |
| **Project Type** | ${isGarage ? 'Detached Garage' : 'Residential Home'} |
| **Square Footage** | ${sqft.toLocaleString()} sq ft |

---

## Electrical Specifications

| Component | Quoted | CEC Minimum* |
|-----------|--------|--------------|
| Main Panel | ${panelSize}A | ${cecExpectedPanel}A |
| Branch Circuits | ${circuits} | ${cecExpectedCircuits} |
| Receptacle Outlets | ${outlets} | ${cecExpectedOutlets} |
| Light Switches | ${switches} | ${cecExpectedSwitches} |

*Per Canadian Electrical Code (CEC) for ${sqft} sq ft ${isGarage ? 'garage' : 'dwelling'}${specsNote}

---

## Crew Assignment & Schedule

| | Details |
|---|---------|
| **Lead Electrician** | Licensed Journeyman (Red Seal) |
| **Crew Size** | ${crewSize} ${crewSize > 1 ? 'persons' : 'person'} ${needsApprentice ? '(1 Journeyman + 1 Apprentice)' : ''} |
| **Estimated Duration** | ${projectDays} working day${projectDays > 1 ? 's' : ''} (${workHoursPerDay} hrs/day) |
| **Total Labor Hours** | ${totalLaborHours.toFixed(1)} hours |
| **Travel** | ${travelHours} hr${travelHours > 1 ? 's' : ''} per day${isRemote ? ' (remote surcharge applied)' : ''} |

### Work Breakdown Schedule

| Phase | Task | Hours |
|-------|------|-------|
| 1 | Panel Installation & Main Feed | ${panelHours} hrs |
| 2 | Circuit Rough-in (${circuits} circuits) | ${totalCircuitHours} hrs |
| 3 | Receptacle Installation (${outlets} units) | ${totalOutletHours} hrs |
| 4 | Switch Installation (${switches} units) | ${totalSwitchHours} hrs |
| 5 | Wiring, Terminations & Testing | ${totalWiringHours} hrs |
| | **TOTAL LABOR** | **${totalLaborHours.toFixed(1)} hrs** |

---

## Cost Breakdown

### A. Labor

| Description | Hours | Rate | Amount |
|-------------|-------|------|--------|
| Journeyman Electrician | ${journeymanHours.toFixed(1)} | $${journeymanRate}.00/hr | $${journeymanCost.toLocaleString()}.00 |
${needsApprentice ? `| Electrical Apprentice | ${apprenticeHours.toFixed(1)} | $${apprenticeRate}.00/hr | $${apprenticeCost.toLocaleString()}.00 |` : ''}
| Travel Time | ${(travelHours * projectDays).toFixed(1)} | $65.00/hr | $${travelCost.toLocaleString()}.00 |
| **Labor Subtotal** | | | **$${totalLaborCost.toLocaleString()}.00** |

### B. Materials

| Item | Qty | Amount |
|------|-----|--------|
| ${panelSize}A Main Panel w/ Breakers | 1 | $${panelMaterial.toLocaleString()}.00 |
| Branch Circuit Materials | ${circuits} | $${circuitMaterial.toLocaleString()}.00 |
| Receptacles, Boxes & Covers | ${outlets} | $${outletMaterial.toLocaleString()}.00 |
| Switches, Boxes & Covers | ${switches} | $${switchMaterial.toLocaleString()}.00 |
| NMD90 Wire & Connectors | - | $${wireMaterial.toLocaleString()}.00 |
| Miscellaneous Supplies | - | $${miscMaterial.toLocaleString()}.00 |
| **Materials Subtotal** | | **$${totalMaterialCost.toLocaleString()}.00** |

### C. Permits & Inspections

| Item | Amount |
|------|--------|
| Electrical Permit | $${permitCost.toLocaleString()}.00 |
| ESA Inspection Fee | $${inspectionCost.toLocaleString()}.00 |
| **Permits Subtotal** | **$${(permitCost + inspectionCost).toLocaleString()}.00** |

### D. Overhead & Profit

| Item | Amount |
|------|--------|
| Contractor Overhead (15%) | $${overhead.toLocaleString()}.00 |

---

## ESTIMATE SUMMARY

| Category | Amount |
|----------|-------:|
| Labor | $${totalLaborCost.toLocaleString()}.00 |
| Materials | $${totalMaterialCost.toLocaleString()}.00 |
| Permits & Inspections | $${(permitCost + inspectionCost).toLocaleString()}.00 |
| Overhead & Profit | $${overhead.toLocaleString()}.00 |
| | |
| **TOTAL PROJECT COST** | **$${totalCost.toLocaleString()}.00 CAD** |

---

## Terms & Conditions

1. **Payment Terms:** 50% deposit required to schedule work. Balance due upon completion and successful inspection.
2. **Warranty:** 1-year workmanship warranty. Manufacturer warranties apply to all materials.
3. **Permits:** All permits and inspections included in quote.
4. **Changes:** Any changes to scope will be quoted separately.
5. **Access:** Clear access to work area required. Additional charges may apply for obstructed access.
6. **Validity:** This estimate is valid for 30 days from date of issue.

---

## Contractor Requirements (${provinceValue})

- Licensed Master Electrician supervision required
- Valid electrical contractor license
- Minimum $2M liability insurance
- WSIB/WCB coverage for all workers
- ESA/Provincial inspection required before energization

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
      const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;

      if ((hasAnthropic || hasOpenRouter || hasOpenAI) && prompt) {
        try {
          useAI = true;
          
          // Extract province from prompt or use provided value
          const locationMatch = prompt.match(/Location:\s*(.+?)(?:\n|$)/i);
          const provinceMatch = prompt.match(/Province:\s*(.+?)(?:\n|$)/i);
          const extractedLocationForAI: string = locationMatch ? locationMatch[1].trim() : (location || '');
          const providedProvinceForAI: string = province || (provinceMatch ? provinceMatch[1].trim() : '');
          const finalProvinceForAI: string = providedProvinceForAI || extractProvince(extractedLocationForAI);
          
          // Multi-agent system prompt for compliance and pricing validation
          const aiSystemPrompt = `You are a team of specialized construction estimation agents:

1. **Code Compliance Agent**: Expert in ${finalProvinceForAI} building codes and regulations
   - Verify all trades comply with ${finalProvinceForAI} building codes
   - Check electrical code (CEC), plumbing code, fire code
   - Ensure structural requirements are met
   - Validate permit requirements

2. **Pricing Validation Agent**: Expert in ${finalProvinceForAI} construction pricing
   - Verify labor rates are current for ${finalProvinceForAI} market
   - Validate material costs against ${finalProvinceForAI} market rates
   - Check if pricing aligns with industry standards
   - Flag any unusually high or low costs

3. **Trade-Specific Code Agent**: Expert in trade-specific codes
   - Electrical: CEC (Canadian Electrical Code) compliance, including GFCI protection, dedicated circuits, proper burial depth
   - Plumbing: NPC (National Plumbing Code) compliance
   - Structural: NBC (National Building Code) compliance for load-bearing, wind, snow loads
   - HVAC: Mechanical code compliance
   - Fire: Fire code requirements, especially fire separation for detached structures

IMPORTANT NOTES:
- For garages: Windows and doors must meet NBC requirements for structural performance, safety glazing where required, and ventilation. Garages typically do NOT require egress windows (egress is for habitable spaces, not storage/workshop areas).
- For garages: Focus on structural requirements, fire separation from main house, and proper electrical (GFCI, dedicated circuits for door openers/heaters).

Review the provided estimate and provide:
- Code compliance verification for ${finalProvinceForAI}
- Pricing validation against ${finalProvinceForAI} market rates
- Trade-specific code references
- Any compliance issues or missing requirements
- Recommended adjustments for accuracy

Format your response with clear sections for each agent's findings.`;
          
          // Enhanced prompt with province and project details
          const enhancedPrompt = `Base Estimate:\n\n${baseResponse}\n\n\nProject Details:\n${prompt}\n\nProvince: ${finalProvinceForAI}\n\nPlease review this estimate with your specialized agents to ensure:\n1. Code compliance for ${finalProvinceForAI}\n2. Accurate pricing for ${finalProvinceForAI} market\n3. All trade-specific codes are followed`;
          
          let aiEnhancement = '';
          if (hasAnthropic) {
            aiEnhancement = await callAnthropic(enhancedPrompt, aiSystemPrompt);
          } else if (hasOpenRouter) {
            aiEnhancement = await callOpenRouter(enhancedPrompt, aiSystemPrompt);
          } else {
            aiEnhancement = await callOpenAI(enhancedPrompt, aiSystemPrompt);
          }
          
          // Combine base estimate with AI agent enhancements
          defaultResponse = baseResponse + `\n\n---\n\n## Compliance & Pricing Validation (${finalProvinceForAI})\n\n` + aiEnhancement;
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
      const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;

      if (hasAnthropic || hasOpenRouter || hasOpenAI) {
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

          // Use Anthropic if available, then OpenRouter, then OpenAI
          if (hasAnthropic) {
            defaultResponse = await callAnthropic(prompt, systemPrompt);
          } else if (hasOpenRouter) {
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

    // Extract cost from response
    const totalCostMatch = defaultResponse.match(/\*\*Total Project Cost\*\*: \$([\d,]+)/) ||
                          defaultResponse.match(/Total.*Cost.*\$([\d,]+)/i);

    const totalCost = totalCostMatch ? parseInt(totalCostMatch[1].replace(/,/g, '')) : 0;

    return NextResponse.json({
      success: true,
      result: defaultResponse,
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