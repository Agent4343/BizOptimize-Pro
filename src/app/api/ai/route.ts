import { NextRequest, NextResponse } from 'next/server';
import { extractProvinceEnhanced, getProvinceCostMultiplier } from '@/lib/province-data';
import { validateEstimate } from '@/lib/validation';
import { generateCodeComplianceSection, getCodeReference } from '@/lib/building-codes';
import prisma from '@/lib/prisma';

// Interface for contractor settings
interface ContractorSettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  licenseNumber: string;
  insuranceProvider: string;
  insuranceAmount: string;
  journeymanRate: number;
  apprenticeRate: number;
  helperRate: number;
  travelRate: number;
  overheadPercent: number;
  profitPercent: number;
  depositPercent: number;
  paymentTerms: string;
  warrantyYears: number;
  warrantyTerms: string;
  quoteValidDays: number;
}

// Fetch contractor settings from database
async function getContractorSettings(): Promise<ContractorSettings | null> {
  try {
    // Return null if database is not configured
    if (!prisma) return null;

    const contractor = await prisma.contractor.findFirst({
      include: {
        laborRates: true,
        quoteSettings: true,
      },
    });

    if (!contractor) return null;

    // Extract labor rates
    const journeymanRate = contractor.laborRates.find(r => r.workerType === 'journeyman')?.hourlyRate || 85;
    const apprenticeRate = contractor.laborRates.find(r => r.workerType === 'apprentice')?.hourlyRate || 45;
    const helperRate = contractor.laborRates.find(r => r.workerType === 'helper')?.hourlyRate || 35;

    return {
      companyName: contractor.companyName,
      email: contractor.email,
      phone: contractor.phone || '',
      address: contractor.address || '',
      city: contractor.city || '',
      province: contractor.province || '',
      postalCode: contractor.postalCode || '',
      licenseNumber: contractor.licenseNumber || '',
      insuranceProvider: contractor.insuranceProvider || '',
      insuranceAmount: contractor.insuranceAmount || '',
      journeymanRate,
      apprenticeRate,
      helperRate,
      travelRate: contractor.quoteSettings?.travelRate || 65,
      overheadPercent: contractor.quoteSettings?.overheadPercent || 12,
      profitPercent: contractor.quoteSettings?.profitPercent || 10,
      depositPercent: contractor.quoteSettings?.depositPercent || 50,
      paymentTerms: contractor.quoteSettings?.paymentTerms || 'Balance due upon completion',
      warrantyYears: contractor.quoteSettings?.warrantyYears || 1,
      warrantyTerms: contractor.quoteSettings?.warrantyTerms || '',
      quoteValidDays: contractor.quoteSettings?.quoteValidDays || 30,
    };
  } catch (error) {
    console.error('Error fetching contractor settings:', error);
    return null;
  }
}

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

// Get province-specific electrical inspection authority name
function getInspectionAuthority(province: string): string {
  const authorities: Record<string, string> = {
    'Ontario': 'ESA Inspection',
    'British Columbia': 'Technical Safety BC Inspection',
    'Alberta': 'Safety Codes Inspection',
    'Saskatchewan': 'TSASK Inspection',
    'Manitoba': 'Manitoba Hydro Inspection',
    'Quebec': 'RBQ Inspection',
    'Nova Scotia': 'Provincial Electrical Inspection',
    'New Brunswick': 'Provincial Electrical Inspection',
    'Prince Edward Island': 'Provincial Electrical Inspection',
    'Newfoundland and Labrador': 'Provincial Electrical Inspection',
    'Yukon': 'Territorial Electrical Inspection',
    'Northwest Territories': 'Territorial Electrical Inspection',
    'Nunavut': 'Territorial Electrical Inspection'
  };
  return authorities[province] || 'Electrical Inspection';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, businessType, optimizationType, trade, province, location } = body;

    // Fetch contractor settings from database
    const contractorSettings = await getContractorSettings();

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

          // ============ DETECT SPECIAL REQUIREMENTS FROM CONVERSATION ============
          // Check if user requested special equipment (look for "yes" answers, not just mentions)
          const promptLower = prompt.toLowerCase();

          // EV Charger detection - look for affirmative responses
          const wantsEVCharger = (
            (/ev\s*charg/i.test(prompt) && !/no\s+ev|don't\s+need\s+ev|not\s+need.*ev/i.test(prompt)) ||
            /yes.*ev|ev.*yes|want.*ev.*charg|need.*ev.*charg|install.*ev/i.test(prompt)
          );

          // Welder detection
          const wantsWelder = (
            (/welder|welding/i.test(prompt) && !/no\s+weld|don't\s+need.*weld|not\s+need.*weld/i.test(prompt)) ||
            /yes.*weld|weld.*yes|want.*weld|need.*weld|have.*weld/i.test(prompt)
          );

          // Workshop/heavy tools detection
          const wantsWorkshop = (
            (/workshop|power\s*tools|heavy\s*tools|table\s*saw|compressor/i.test(prompt) &&
             !/no\s+workshop|basic\s+garage|just.*storage|not.*workshop/i.test(prompt)) ||
            /yes.*workshop|workshop.*yes|want.*workshop|use.*workshop/i.test(prompt)
          );

          // Heat pump detection
          const wantsHeatPump = (
            (/heat\s*pump|mini\s*split/i.test(prompt) && !/no\s+heat|don't\s+need.*heat/i.test(prompt)) ||
            /yes.*heat.*pump|want.*heat.*pump|install.*heat.*pump/i.test(prompt)
          );

          // 200A explicitly requested
          const wants200A = /200\s*a|200\s*amp/i.test(prompt);

          // Underground/long run detection
          const hasUndergroundRun = /underground|buried|trench/i.test(prompt);
          const runLengthMatch = prompt.match(/(\d+)\s*(?:feet|ft|foot|meter|m)\s*(?:run|underground|from|to\s+garage)/i);
          const runLength = runLengthMatch ? parseInt(runLengthMatch[1]) : 0;

          // Determine if heavy-duty installation needed
          const needsHeavyDuty = wantsEVCharger || wantsWelder || wantsWorkshop || wantsHeatPump || wants200A;

          // ============ SCOPE CLASSIFICATION ============
          // Classify project scope for accurate estimating
          let scopeType: string;
          let scopeDescription: string;
          if (wantsEVCharger && !wantsWelder && !wantsWorkshop) {
            scopeType = 'EV-Ready';
            scopeDescription = 'Standard installation with EV charging capability';
          } else if (wantsWelder || wantsWorkshop || (wantsEVCharger && (wantsWelder || wantsWorkshop))) {
            scopeType = 'Workshop / Heavy-Duty';
            scopeDescription = 'Heavy-duty installation for workshop or industrial equipment';
          } else if (isGarage && !needsHeavyDuty) {
            scopeType = 'Garage (Basic)';
            scopeDescription = 'Basic garage electrical with standard lighting and outlets';
          } else if (isGarage) {
            scopeType = 'Garage (Standard)';
            scopeDescription = 'Standard garage electrical installation';
          } else {
            scopeType = 'Standard Residential';
            scopeDescription = 'Residential electrical installation per CEC requirements';
          }

          // ============ END SCOPE CLASSIFICATION ============

          // Extract values with better regex patterns and validation
          const panelMatch = prompt.match(/(?:Panel|Main Panel).*?(\d+)\s*(?:amp|amps|A)/i);
          const circuitsMatch = prompt.match(/(?:Circuits|Number of Circuits).*?(\d+)/i);
          // More specific outlet matching - avoid matching voltage (240V) or other numbers
          const outletsMatch = prompt.match(/(?:Outlets|Number of Outlets|Electrical Outlets).*?(\d+)(?!\s*(?:V|volt|amp|amps|A|sq|ft|feet))/i);
          const switchesMatch = prompt.match(/(?:Switches|Number of Switches|Light Switches).*?(\d+)/i);

          // Default values - UPGRADE TO 200A if heavy-duty requirements detected
          let panelSize = panelMatch ? parseInt(panelMatch[1]) : (needsHeavyDuty ? 200 : (isGarage ? 100 : 200));
          let circuits = circuitsMatch ? parseInt(circuitsMatch[1]) : (needsHeavyDuty ? 16 : (isGarage ? 8 : 20));
          let outlets = outletsMatch ? parseInt(outletsMatch[1]) : (needsHeavyDuty ? 12 : (isGarage ? 6 : 30));
          let switches = switchesMatch ? parseInt(switchesMatch[1]) : (isGarage ? 3 : 15);

          // Force 200A if heavy-duty equipment requested
          if (needsHeavyDuty && panelSize < 200) {
            panelSize = 200;
          }

          // Add circuits for special equipment
          let evCircuits = 0;
          let welderCircuits = 0;
          let workshopCircuits = 0;
          let heatPumpCircuits = 0;

          if (wantsEVCharger) evCircuits = 1; // 240V/50A circuit
          if (wantsWelder) welderCircuits = 1; // 240V/50A circuit
          if (wantsWorkshop) workshopCircuits = 2; // Extra 20A circuits for tools
          if (wantsHeatPump) heatPumpCircuits = 1; // 240V circuit for heat pump

          const specialCircuits = evCircuits + welderCircuits + workshopCircuits + heatPumpCircuits;
          circuits += specialCircuits;

          // Validation and sanity checks
          if (panelSize < 60 || panelSize > 400) panelSize = needsHeavyDuty ? 200 : (isGarage ? 100 : 200);
          if (circuits < 1 || circuits > 100) circuits = needsHeavyDuty ? 16 : (isGarage ? 8 : 20);
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

          // Labor hour calculations (realistic - no double counting)
          // Circuit hours INCLUDE outlet/switch installation, not separate
          const panelHours = panelSize >= 200 ? 5 : 3; // Hours to install panel
          const circuitHoursEach = isGarage ? 0.6 : 0.75; // Per circuit (rough-in + device)
          const lightingHours = isGarage ? 2 : 4; // Lighting installation

          // Special equipment labor hours
          const evChargerHours = wantsEVCharger ? 2.5 : 0; // 240V/50A EV circuit
          const welderHours = wantsWelder ? 2 : 0; // Welder outlet
          const heatPumpHours = wantsHeatPump ? 1.5 : 0; // Heat pump circuit
          const workshopHours = wantsWorkshop ? 2 : 0; // Extra workshop circuits
          const undergroundHours = hasUndergroundRun ? (runLength > 0 ? Math.ceil(runLength / 25) : 3) : 0;

          const totalCircuitHours = Math.round(circuits * circuitHoursEach * 10) / 10;
          const totalOutletHours = 0; // Included in circuit hours
          const totalSwitchHours = 0; // Included in circuit hours
          const totalWiringHours = lightingHours; // Just lighting, circuits cover wire runs
          const specialEquipmentHours = evChargerHours + welderHours + heatPumpHours + workshopHours + undergroundHours;
          const totalLaborHours = panelHours + totalCircuitHours + totalWiringHours + specialEquipmentHours;

          // Crew size calculation (based on project complexity)
          // Use contractor settings if available, otherwise use defaults
          const journeymanRate = contractorSettings?.journeymanRate || 75; // $/hour CAD
          const apprenticeRate = contractorSettings?.apprenticeRate || 40; // $/hour CAD
          const travelRate = contractorSettings?.travelRate || 55; // $/hour CAD
          const needsApprentice = totalLaborHours > 16 || circuits > 10 || needsHeavyDuty;
          const crewSize = needsApprentice ? 2 : 1;
          const workHoursPerDay = 8;
          const effectiveHoursPerDay = crewSize === 2 ? workHoursPerDay * 1.6 : workHoursPerDay; // 2-person crew is ~60% more efficient
          const projectDays = Math.ceil(totalLaborHours / effectiveHoursPerDay);

          // Travel time estimate (based on location - simplified)
          const isRemote = /rural|remote|outside|country/i.test(locationValue);
          const travelHours = isRemote ? 2 : 0.5;
          const travelCost = Math.round(travelHours * projectDays * travelRate); // Travel charge per day

          // Labor cost breakdown
          // Bill based on actual project days, not theoretical task hours
          // With 2-person crew, work gets done faster
          const journeymanHours = projectDays * workHoursPerDay; // Actual on-site hours
          const apprenticeHours = needsApprentice ? Math.round(projectDays * workHoursPerDay * 0.85) : 0; // Apprentice ~85% of journeyman time
          const journeymanCost = Math.round(journeymanHours * journeymanRate);
          const apprenticeCost = Math.round(apprenticeHours * apprenticeRate);
          const totalLaborCost = journeymanCost + apprenticeCost + travelCost;

          // Material costs (realistic 2024 pricing)
          const panelMaterial = panelSize >= 200 ? 950 : (panelSize >= 150 ? 700 : 450);
          const circuitMaterial = circuits * 32; // Wire, breakers per circuit
          const outletMaterial = outlets * 18; // Outlet, box, cover
          const switchMaterial = switches * 15; // Switch, box, cover
          const wireMaterial = Math.round(sqft * (isGarage ? 0.45 : 0.70)); // Romex, connectors

          // Special equipment materials
          const evChargerMaterial = wantsEVCharger ? 320 : 0; // 50A outlet, 6/3 wire, breaker
          const welderMaterial = wantsWelder ? 280 : 0; // 50A outlet, 6/3 wire, breaker
          const heatPumpMaterial = wantsHeatPump ? 220 : 0; // Disconnect, whip, breaker
          const workshopMaterial = wantsWorkshop ? 150 : 0; // Extra 20A circuits materials

          // Underground run materials (if applicable)
          const undergroundMaterial = hasUndergroundRun ? (
            runLength > 0 ? Math.round(runLength * 12) : 800 // ~$12/ft for conduit + wire, or $800 default
          ) : 0;

          const specialEquipmentMaterial = evChargerMaterial + welderMaterial + heatPumpMaterial + workshopMaterial + undergroundMaterial;

          const miscMaterial = Math.round((panelMaterial + circuitMaterial + outletMaterial + switchMaterial) * 0.1); // Misc supplies
          const totalMaterialCost = panelMaterial + circuitMaterial + outletMaterial + switchMaterial + wireMaterial + miscMaterial + specialEquipmentMaterial;

          // Other costs
          const permitCost = isGarage ? 250 : 350;
          const inspectionCost = isGarage ? 150 : 200;

          // Direct costs (before overhead/profit)
          const directCosts = totalLaborCost + totalMaterialCost + permitCost + inspectionCost;

          // Overhead and Profit calculation (INTERNAL - separated for contractor visibility)
          const overheadPercent = contractorSettings?.overheadPercent || 12;
          const profitPercent = contractorSettings?.profitPercent || 10;
          const overheadAmount = Math.round(directCosts * (overheadPercent / 100));
          const profitAmount = Math.round(directCosts * (profitPercent / 100));
          const overheadAndProfit = overheadAmount + profitAmount; // Combined for customer display

          let totalCost = directCosts + overheadAndProfit;
          // Apply province-specific cost multiplier
          totalCost = Math.round(totalCost * costMultiplier);

          // Internal profit metrics
          const grossProfit = totalCost - (totalLaborCost + totalMaterialCost + permitCost + inspectionCost);
          const profitMargin = Math.round((grossProfit / totalCost) * 100);
          const riskLevel = profitMargin < 15 ? 'High' : (profitMargin < 20 ? 'Medium' : 'Low');

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
          const quoteValidDays = contractorSettings?.quoteValidDays || 30;
          const validUntil = new Date(Date.now() + quoteValidDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

          // Get contractor info for header
          const companyName = contractorSettings?.companyName || '';
          const companyPhone = contractorSettings?.phone || '';
          const companyEmail = contractorSettings?.email || '';
          const companyAddress = contractorSettings ?
            [contractorSettings.address, contractorSettings.city, contractorSettings.province, contractorSettings.postalCode]
              .filter(Boolean).join(', ') : '';
          const licenseNumber = contractorSettings?.licenseNumber || '';

          // Get terms from contractor settings
          const depositPercent = contractorSettings?.depositPercent || 50;
          const paymentTerms = contractorSettings?.paymentTerms || 'Balance due upon completion and successful inspection';
          const warrantyYears = contractorSettings?.warrantyYears || 1;
          const warrantyTerms = contractorSettings?.warrantyTerms || 'Manufacturer warranties apply to all materials.';

          // Build company header if contractor info is available
          const companyHeader = companyName ? `
${companyName}
${companyAddress ? companyAddress + '\n' : ''}${companyPhone ? 'Phone: ' + companyPhone + ' | ' : ''}${companyEmail ? 'Email: ' + companyEmail : ''}
${licenseNumber ? 'License: ' + licenseNumber : ''}

---
` : '';

          return `# ELECTRICAL ESTIMATE
${companyHeader}
**Estimate #:** ${estimateNum}
**Date:** ${estimateDate}
**Valid Until:** ${validUntil}

---

## Project Information

| Field | Details |
|-------|---------|
| **Project Name** | ${isGarage ? (needsHeavyDuty ? 'Workshop Garage' : 'Garage') : 'Residential'} Electrical Installation |
| **Location** | ${locationValue || 'Not specified'} |
| **Province** | ${provinceValue} |
| **Project Type** | ${isGarage ? (needsHeavyDuty ? 'Workshop/Heavy-Duty Garage' : 'Detached Garage') : 'Residential Home'} |
| **Square Footage** | ${sqft.toLocaleString()} sq ft |
| **Scope Classification** | ${scopeType} |

**Scope:** ${scopeDescription}

---

## Electrical Specifications

| Component | Quoted | CEC Minimum* |
|-----------|--------|--------------|
| Main Panel | ${panelSize}A | ${cecExpectedPanel}A |
| Branch Circuits | ${circuits} | ${cecExpectedCircuits} |
| Receptacle Outlets | ${outlets} | ${cecExpectedOutlets} |
| Light Switches | ${switches} | ${cecExpectedSwitches} |
${wantsEVCharger ? '| **EV Charger Circuit** | 240V/50A | N/A |\n' : ''}${wantsWelder ? '| **Welder Circuit** | 240V/50A | N/A |\n' : ''}${wantsHeatPump ? '| **Heat Pump Circuit** | 240V/30A | N/A |\n' : ''}${wantsWorkshop ? '| **Workshop Circuits** | 2x 120V/20A | N/A |\n' : ''}${hasUndergroundRun ? `| **Underground Feed** | ${runLength > 0 ? runLength + ' ft' : 'Yes'} | N/A |\n` : ''}
*Per Canadian Electrical Code (CEC) for ${sqft} sq ft ${isGarage ? 'garage' : 'dwelling'}${needsHeavyDuty ? ' (upgraded for heavy-duty equipment)' : ''}${specsNote}

---

## Crew Assignment & Schedule

| | Details |
|---|---------|
| **Lead Electrician** | Licensed Journeyman (Red Seal) |
| **Crew Size** | ${crewSize} ${crewSize > 1 ? 'persons' : 'person'} ${needsApprentice ? '(1 Journeyman + 1 Apprentice)' : ''} |
| **Estimated Duration** | ${projectDays} working day${projectDays > 1 ? 's' : ''} (${workHoursPerDay} hrs/day) |
| **Billable Hours** | ${journeymanHours}${needsApprentice ? ` + ${apprenticeHours} apprentice` : ''} hours |
| **Travel** | ${travelHours} hr${travelHours > 1 ? 's' : ''} per day${isRemote ? ' (remote surcharge applied)' : ''} |

### Work Breakdown Schedule

| Phase | Task | Hours |
|-------|------|-------|
| 1 | Panel Installation & Main Feed | ${panelHours} hrs |
| 2 | Circuit Rough-in (${circuits} circuits) | ${totalCircuitHours} hrs |
| 3 | Receptacle Installation (${outlets} units) | ${totalOutletHours} hrs |
| 4 | Switch Installation (${switches} units) | ${totalSwitchHours} hrs |
| 5 | Wiring, Terminations & Testing | ${totalWiringHours} hrs |
${specialEquipmentHours > 0 ? `| 6 | Special Equipment Installation | ${specialEquipmentHours} hrs |\n` : ''}| | **TOTAL LABOR** | **${totalLaborHours.toFixed(1)} hrs** |

---

## Cost Breakdown

### A. Labor

| Description | Hours | Rate | Amount |
|-------------|-------|------|--------|
| Journeyman Electrician | ${journeymanHours.toFixed(1)} | $${journeymanRate}.00/hr | $${journeymanCost.toLocaleString()}.00 |
${needsApprentice ? `| Electrical Apprentice | ${apprenticeHours.toFixed(1)} | $${apprenticeRate}.00/hr | $${apprenticeCost.toLocaleString()}.00 |` : ''}
| Travel Time | ${(travelHours * projectDays).toFixed(1)} | $${travelRate}.00/hr | $${travelCost.toLocaleString()}.00 |
| **Labor Subtotal** | | | **$${totalLaborCost.toLocaleString()}.00** |

### B. Materials

| Item | Qty | Amount |
|------|-----|--------|
| ${panelSize}A Main Panel w/ Breakers | 1 | $${panelMaterial.toLocaleString()}.00 |
| Branch Circuit Materials | ${circuits} | $${circuitMaterial.toLocaleString()}.00 |
| Receptacles, Boxes & Covers | ${outlets} | $${outletMaterial.toLocaleString()}.00 |
| Switches, Boxes & Covers | ${switches} | $${switchMaterial.toLocaleString()}.00 |
| NMD90 Wire & Connectors | - | $${wireMaterial.toLocaleString()}.00 |
${wantsEVCharger ? `| EV Charger Circuit (50A outlet, 6/3 wire, breaker) | 1 | $${evChargerMaterial.toLocaleString()}.00 |\n` : ''}${wantsWelder ? `| Welder Circuit (50A outlet, 6/3 wire, breaker) | 1 | $${welderMaterial.toLocaleString()}.00 |\n` : ''}${wantsHeatPump ? `| Heat Pump Circuit (disconnect, whip, breaker) | 1 | $${heatPumpMaterial.toLocaleString()}.00 |\n` : ''}${wantsWorkshop ? `| Workshop Circuit Materials (20A circuits) | 2 | $${workshopMaterial.toLocaleString()}.00 |\n` : ''}${hasUndergroundRun ? `| Underground Feed (conduit, wire, fittings) | ${runLength > 0 ? runLength + ' ft' : '1'} | $${undergroundMaterial.toLocaleString()}.00 |\n` : ''}| Miscellaneous Supplies | - | $${miscMaterial.toLocaleString()}.00 |
| **Materials Subtotal** | | **$${totalMaterialCost.toLocaleString()}.00** |

### C. Permits & Inspections

| Item | Amount |
|------|--------|
| Electrical Permit | $${permitCost.toLocaleString()}.00 |
| ${getInspectionAuthority(provinceValue)} | $${inspectionCost.toLocaleString()}.00 |
| **Permits Subtotal** | **$${(permitCost + inspectionCost).toLocaleString()}.00** |

### D. Overhead & Profit

| Item | Amount |
|------|--------|
| Overhead & Profit | $${overheadAndProfit.toLocaleString()}.00 |

---

## ESTIMATE SUMMARY

| Category | Amount |
|----------|-------:|
| Labor | $${totalLaborCost.toLocaleString()}.00 |
| Materials | $${totalMaterialCost.toLocaleString()}.00 |
| Permits & Inspections | $${(permitCost + inspectionCost).toLocaleString()}.00 |
| Overhead & Profit | $${overheadAndProfit.toLocaleString()}.00 |
| | |
| **TOTAL PROJECT COST** | **$${totalCost.toLocaleString()}.00 CAD** |

---

## Terms & Conditions

1. **Payment Terms:** ${depositPercent}% deposit required to schedule work. ${paymentTerms}.
2. **Warranty:** ${warrantyYears}-year workmanship warranty. ${warrantyTerms}
3. **Permits:** All permits and inspections included in quote.
4. **Changes:** Any changes to scope will be quoted separately.
5. **Access:** Clear access to work area required. Additional charges may apply for obstructed access.
6. **Validity:** This estimate is valid for ${quoteValidDays} days from date of issue.

---

## Contractor Requirements (${provinceValue})

- Licensed Master Electrician supervision required
- Valid electrical contractor license${licenseNumber ? ` (${licenseNumber})` : ''}
- ${contractorSettings?.insuranceAmount ? contractorSettings.insuranceAmount : 'Minimum $2M liability insurance'}
- WSIB/WCB coverage for all workers
- Provincial inspection required before energization

${generateCodeComplianceSection(provinceValue, 'electrical')}

<!-- INTERNAL_START -->
---

## INTERNAL CONTRACTOR SUMMARY
**FOR CONTRACTOR USE ONLY - DO NOT INCLUDE IN CUSTOMER QUOTE**

| Metric | Value |
|--------|-------|
| **Direct Costs** | $${directCosts.toLocaleString()}.00 |
| Labor | $${totalLaborCost.toLocaleString()}.00 |
| Materials | $${totalMaterialCost.toLocaleString()}.00 |
| Permits & Inspections | $${(permitCost + inspectionCost).toLocaleString()}.00 |
| | |
| **Overhead (${overheadPercent}%)** | $${overheadAmount.toLocaleString()}.00 |
| **Profit (${profitPercent}%)** | $${profitAmount.toLocaleString()}.00 |
| | |
| **Gross Profit** | $${grossProfit.toLocaleString()}.00 |
| **Profit Margin** | ${profitMargin}% |
| **Risk Level** | ${riskLevel} |

| Risk Assessment |
|-----------------|
| Below 15% = High Risk |
| 15-20% = Medium Risk |
| Above 20% = Low Risk |
<!-- INTERNAL_END -->`;
        },
        
        plumbing: (prompt: string) => {
          const isGarage = /garage/i.test(prompt) || /Project Type.*garage/i.test(prompt);

          // Fix: Use more specific regex patterns to avoid matching square footage
          // Look for explicit fixture count patterns like "Fixtures: 5" or "5 fixtures"
          const fixturesColonMatch = prompt.match(/Fixtures:\s*(\d+)/i);
          const fixturesCountMatch = prompt.match(/(\d+)\s*(?:plumbing\s*)?fixtures/i);

          // Detect utility sink requests for garages
          const wantsUtilitySink = /utility\s*sink|laundry\s*sink|slop\s*sink|garage\s*sink/i.test(prompt) &&
            !/no\s+utility|don't\s+need\s+utility|not\s+need.*utility|no\s+sink/i.test(prompt);

          // Detect bathroom/washroom for garages that want them
          const wantsBathroom = /bathroom|washroom|toilet|half\s*bath/i.test(prompt) &&
            !/no\s+bathroom|don't\s+need\s+bathroom|no\s+toilet/i.test(prompt);

          // Calculate fixtures based on explicit count or detected needs
          let fixtures: number;
          if (fixturesColonMatch) {
            fixtures = parseInt(fixturesColonMatch[1]);
          } else if (fixturesCountMatch && parseInt(fixturesCountMatch[1]) <= 50) {
            // Only use if count is reasonable (<=50), not square footage
            fixtures = parseInt(fixturesCountMatch[1]);
          } else if (isGarage) {
            // For garages: 0 by default, 1 for utility sink, 3 for bathroom (toilet, sink, maybe shower)
            fixtures = wantsBathroom ? 3 : (wantsUtilitySink ? 1 : 0);
          } else {
            // Default for residential
            fixtures = 5;
          }

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
          
          // Generate fixture description based on what was detected
          const getFixtureDescription = () => {
            if (isGarage) {
              if (fixtures === 0) return 'None required';
              if (wantsBathroom) return `${fixtures} (Bathroom: toilet, sink${fixtures > 2 ? ', shower' : ''})`;
              if (wantsUtilitySink) return '1 (Utility sink)';
              return `${fixtures}`;
            }
            return `${fixtures}`;
          };

          return `# Plumbing Estimate

## Project Details
- **Location**: ${locationValue || 'Not specified'}
- **Province**: ${provinceValue}
- **Project Type**: ${isGarage ? 'Garage' : 'Residential'}
- **Fixtures**: ${getFixtureDescription()}
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

    // Generate Framing Only estimate (specialized scope)
    const generateFramingOnlyEstimate = (promptText: string, sqft: number, isGarage: boolean) => {
      // Wall height detection
      const wallHeightMatch = promptText.match(/(\d+)['′]?\s*(?:foot|ft|feet)?\s*(?:wall|ceiling|height)/i);
      const wallHeight = wallHeightMatch ? parseInt(wallHeightMatch[1]) : (isGarage ? 10 : 9);

      // Roof type detection
      const isTruss = /truss/i.test(promptText);
      const isStickFrame = /stick\s*frame|rafter|conventional/i.test(promptText);
      const roofType = isStickFrame ? 'Stick Frame (Rafters)' : 'Prefab Trusses';

      // Calculate wall perimeter (assume roughly square for estimation)
      const sideLength = Math.sqrt(sqft);
      const perimeter = sideLength * 4;
      const wallArea = perimeter * wallHeight;

      // ============ MATERIALS ============
      // Lumber: studs, plates, headers (realistic 2024 pricing)
      const studSpacing = 16; // 16" OC
      const studsNeeded = Math.ceil((perimeter * 12) / studSpacing) + 16; // +16 for corners, headers, cripples
      const studCost = studsNeeded * (isGarage ? 5.50 : 7); // $5.50-7 per 2x4/2x6 stud
      const platesCost = Math.round(perimeter * 3 * 1.10); // 3 plates (bot + double top) x $1.10/lf
      const headersCost = Math.round(isGarage ? 120 : 350); // Headers for doors/windows

      const lumberTotal = Math.round(studCost + platesCost + headersCost);

      // Roof structure: trusses or rafters
      const trussCount = Math.ceil(sideLength / 2) + 1; // Trusses at 24" OC
      const trussCost = isStickFrame
        ? Math.round(sqft * 3.50) // Stick frame materials
        : Math.round(trussCount * (isGarage ? 110 : 180)); // Prefab trusses $110-180 each

      // Sheathing: walls and roof
      const sheetsWall = Math.ceil(wallArea / 32); // 4x8 sheets = 32 sq ft
      const sheetsRoof = Math.ceil(sqft * 1.15 / 32); // 15% extra for roof pitch
      const sheetCost = 32; // 7/16" OSB per sheet
      const sheathingTotal = (sheetsWall + sheetsRoof) * sheetCost;

      // Fasteners & hardware
      const fastenersCost = Math.round(sqft * 0.50); // Nails, screws
      const hardwareCost = Math.round(isGarage ? 200 : 450); // Hurricane straps, anchors, joist hangers

      const materialsTotal = lumberTotal + trussCost + sheathingTotal + fastenersCost + hardwareCost;

      // ============ LABOR ============
      // Framing labor: walls, standing, roof set
      const laborRate = 48; // $/hour for framer (realistic rate)
      const hoursPerSqft = isGarage ? 0.08 : 0.12; // Hours per sq ft (garage is simpler)
      const framingHours = Math.round(sqft * hoursPerSqft);
      const crewSize = sqft > 400 ? 3 : 2;
      const laborDays = Math.ceil(framingHours / (8 * crewSize));
      const laborCost = Math.round(framingHours * laborRate);

      // ============ INSPECTION ============
      const framingInspection = 200; // Framing inspection only

      // ============ TOTALS ============
      const directCosts = materialsTotal + laborCost + framingInspection;
      const overheadPercent = 12;
      const profitPercent = 10;
      const overheadAmount = Math.round(directCosts * (overheadPercent / 100));
      const profitAmount = Math.round(directCosts * (profitPercent / 100));
      const overheadAndProfit = overheadAmount + profitAmount;

      const framingTotal = directCosts + overheadAndProfit;
      const costPerSqft = Math.round(framingTotal / sqft);

      // ============ INTERNAL METRICS ============
      const grossProfit = overheadAndProfit;
      const profitMargin = Math.round((grossProfit / framingTotal) * 100);
      const riskLevel = profitMargin < 15 ? 'High' : (profitMargin < 20 ? 'Medium' : 'Low');

      const projectType = isGarage ? 'Garage' : 'Residential';

      return `# FRAMING ESTIMATE
**Scope: Framing Only**

---

## Project Information

| Field | Details |
|-------|---------|
| **Project Type** | ${projectType} |
| **Square Footage** | ${sqft.toLocaleString()} sq ft |
| **Wall Height** | ${wallHeight} ft |
| **Roof Type** | ${roofType} |
| **Perimeter** | ${Math.round(perimeter)} linear ft |

---

## Framing Scope Includes

- Bottom plates, top plates (double), studs at 16" OC
- Headers for door/window openings
- Roof structure (${roofType.toLowerCase()})
- Wall sheathing (OSB/plywood)
- Roof sheathing (OSB/plywood)
- Fasteners (nails, screws, connectors)
- Hardware (hurricane straps, anchors, joist hangers)
- Labor to frame walls, stand walls, set roof

**NOT INCLUDED:** Foundation, roofing shingles/metal, siding, electrical, insulation, drywall, paint, flooring, doors, windows

---

## Materials Breakdown

| Item | Quantity | Amount |
|------|----------|--------|
| Lumber (studs, plates, headers) | ${studsNeeded} studs + plates | $${lumberTotal.toLocaleString()}.00 |
| Roof Structure (${roofType}) | ${isStickFrame ? 'Rafters/ridgeboard' : trussCount + ' trusses'} | $${trussCost.toLocaleString()}.00 |
| Wall Sheathing | ${sheetsWall} sheets | $${(sheetsWall * sheetCost).toLocaleString()}.00 |
| Roof Sheathing | ${sheetsRoof} sheets | $${(sheetsRoof * sheetCost).toLocaleString()}.00 |
| Fasteners | - | $${fastenersCost.toLocaleString()}.00 |
| Hardware (straps, anchors, hangers) | - | $${hardwareCost.toLocaleString()}.00 |
| **Materials Subtotal** | | **$${materialsTotal.toLocaleString()}.00** |

---

## Labor Breakdown

| Description | Hours | Rate | Amount |
|-------------|-------|------|--------|
| Framing Crew (${crewSize} person) | ${framingHours} | $${laborRate}.00/hr | $${laborCost.toLocaleString()}.00 |
| **Estimated Duration** | ${laborDays} day${laborDays > 1 ? 's' : ''} | | |
| **Labor Subtotal** | | | **$${laborCost.toLocaleString()}.00** |

---

## Other Costs

| Item | Amount |
|------|--------|
| Framing Inspection | $${framingInspection.toLocaleString()}.00 |
| **Subtotal** | **$${framingInspection.toLocaleString()}.00** |

---

## Overhead & Profit

| Item | Amount |
|------|--------|
| Overhead & Profit | $${overheadAndProfit.toLocaleString()}.00 |

---

## FRAMING TOTAL

| Category | Amount |
|----------|-------:|
| Materials | $${materialsTotal.toLocaleString()}.00 |
| Labor | $${laborCost.toLocaleString()}.00 |
| Inspection | $${framingInspection.toLocaleString()}.00 |
| Overhead & Profit | $${overheadAndProfit.toLocaleString()}.00 |
| | |
| **FRAMING TOTAL** | **$${framingTotal.toLocaleString()}.00 CAD** |
| **Cost per Sq Ft** | **$${costPerSqft}/sq ft** |

<!-- INTERNAL_START -->
---

## INTERNAL CONTRACTOR SUMMARY
**FOR CONTRACTOR USE ONLY - DO NOT INCLUDE IN CUSTOMER QUOTE**

| Metric | Value |
|--------|-------|
| **Direct Costs** | $${directCosts.toLocaleString()}.00 |
| Materials | $${materialsTotal.toLocaleString()}.00 |
| Labor | $${laborCost.toLocaleString()}.00 |
| Inspection | $${framingInspection.toLocaleString()}.00 |
| | |
| **Overhead (${overheadPercent}%)** | $${overheadAmount.toLocaleString()}.00 |
| **Profit (${profitPercent}%)** | $${profitAmount.toLocaleString()}.00 |
| | |
| **Gross Profit** | $${grossProfit.toLocaleString()}.00 |
| **Profit Margin** | ${profitMargin}% |
| **Risk Level** | ${riskLevel} |

| Risk Assessment |
|-----------------|
| Below 15% = High Risk |
| 15-20% = Medium Risk |
| Above 20% = Low Risk |
<!-- INTERNAL_END -->
`;
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

      // Detect scope - Framing Only
      const isFramingOnly = /framing\s*only|frame\s*only|framing\s*package|just.*framing/i.test(promptText);

      // If Framing Only scope, generate specialized estimate
      if (isFramingOnly) {
        return generateFramingOnlyEstimate(promptText, sqft, isGarage);
      }

      // Cost per sq ft varies by project type
      // Garage: $40-60/sq ft, House: $150-300/sq ft
      const costPerSqft = isGarage ? 50 : (isHouse ? 200 : 150);
      
      // Extract bedrooms and bathrooms (for houses)
      const bedroomsMatch = promptText.match(/(\d+)\s*bedroom/i);
      const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : 0;
      const bathroomsMatch = promptText.match(/(\d+(?:\.\d+)?)\s*bathroom/i);
      const bathrooms = bathroomsMatch ? parseFloat(bathroomsMatch[1]) : 0;
      
      // Detailed construction line items (aligned with trade-specific estimates)
      const foundationCost = Math.round(sqft * (isGarage ? 8 : 15));
      const sitePrepCost = Math.round(foundationCost * 0.25); // Site prep is 25% of foundation
      const framingCost = Math.round(sqft * (isGarage ? 14 : 28)); // Matches framing-only estimate
      const roofingCost = Math.round(sqft * (isGarage ? 5 : 10)); // Shingles/metal install
      const sidingCost = Math.round(sqft * (isGarage ? 4 : 8));
      const electricalCost = Math.round(sqft * (isGarage ? 6 : 10)); // Matches electrical estimate
      const plumbingCost = isGarage ? 0 : Math.round(sqft * 5);
      const hvacCost = isGarage ? 0 : Math.round(sqft * 7);
      const insulationCost = Math.round(sqft * (isGarage ? 1.50 : 3));
      const drywallCost = Math.round(sqft * (isGarage ? 2.50 : 5));
      const flooringCost = Math.round(sqft * (isGarage ? 1.50 : 6)); // Garage = concrete seal
      const doorsWindowsCost = Math.round(sqft * (isGarage ? 4 : 8)); // Overhead door + man door
      const paintCost = Math.round(sqft * (isGarage ? 0.75 : 2));
      const permitsCost = Math.round(isGarage ? 800 : sqft * 1.5); // Flat permit for garage
      
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
          
          // Extract basic project info for agents
          // IMPORTANT: Strip out conversation text - only include basic project info
          const projectTypeMatch = prompt.match(/Project Type:\s*([^\n]+)/i);
          const sqftMatch = prompt.match(/Square Footage:\s*([^\n]+)/i);
          const tradeMatch = prompt.match(/Selected Trade:\s*([^\n]+)/i);
          const projectType = projectTypeMatch?.[1]?.trim() || 'construction project';
          const sqft = sqftMatch?.[1]?.trim() || 'Not specified';
          const tradeName = tradeMatch?.[1]?.trim() || trade || 'electrical';

          const basicProjectInfo = `Project Type: ${projectType}
Location: ${extractedLocationForAI || 'Not specified'}
Province: ${finalProvinceForAI}
Square Footage: ${sqft}
Trade: ${tradeName}`;

          // CRITICAL instruction for all agents - DO NOT HALLUCINATE
          const antiHallucinationRule = `CRITICAL RULE: Only review what is EXPLICITLY in the estimate. Do NOT invent or assume requirements like EV chargers, welding, 200A upgrades, workshops, or anything else not listed. If the estimate shows a basic ${projectType}, review it as exactly that.`;

          // ============ SPECIALIST AGENT DEFINITIONS ============

          // Agent 1: Code Compliance Specialist
          const codeCompliancePrompt = `You are a **Code Compliance Specialist** for ${finalProvinceForAI}, Canada.
Your expertise: Canadian Electrical Code (CEC), provincial amendments, permit requirements.

${antiHallucinationRule}

Review ONLY the code compliance aspects of this estimate:
- Does the panel size meet CEC minimums for the stated square footage?
- Are the number of circuits adequate per CEC requirements?
- Are outlet/switch counts within code requirements?
- Any permit or inspection requirements missing?

Provide 2-3 bullet points. Use ✅ for compliant items, ⚠️ for concerns.
Do NOT suggest upgrades or additional equipment the customer didn't request.`;

          // Agent 2: Pricing Analyst
          const pricingAnalystPrompt = `You are a **Pricing Analyst** specializing in ${finalProvinceForAI} construction costs.
Your expertise: Regional labor rates, material costs, market pricing for Atlantic Canada.

${antiHallucinationRule}

Review ONLY the pricing aspects of this estimate:
- Are labor rates reasonable for ${finalProvinceForAI}? (Journeyman: $75-95/hr, Apprentice: $40-55/hr typical)
- Are material costs in line with current ${finalProvinceForAI} pricing?
- Is the overhead percentage (15-20%) reasonable?
- Note: Atlantic Canada prices are typically 15-25% higher than mainland

Provide 2-3 bullet points.
Focus on whether the customer is getting fair value for the STATED scope.`;

          // Agent 3: Materials Specialist
          const materialsSpecialistPrompt = `You are a **Materials Specialist** for electrical installations.
Your expertise: Electrical components, panel specifications, wire gauges, quality standards.

${antiHallucinationRule}

Review ONLY the materials specified in this estimate:
- Is the panel specification appropriate for the stated load?
- Are wire types and gauges appropriate (NMD90, etc.)?
- Are the receptacle and switch quantities reasonable for the space?
- Any quality concerns with specified materials?

Provide 2-3 bullet points.
Only comment on what IS in the estimate, not what you think SHOULD be added.`;

          // Agent 4: Safety Inspector
          const safetyInspectorPrompt = `You are a **Safety Inspector** for electrical installations in ${finalProvinceForAI}.
Your expertise: Electrical safety, GFCI/AFCI requirements, grounding, hazard prevention.

${antiHallucinationRule}

Review ONLY the safety aspects for the STATED scope:
- For a ${projectType}: Are appropriate safety devices included? (GFCI for garages/wet areas)
- Is proper grounding addressed?
- Any safety concerns with the installation as specified?

Provide 2-3 bullet points.
Do NOT invent hazards for equipment that wasn't requested (no EV chargers, welders, etc. unless explicitly listed).`;

          // Agent 5: Project Manager Summary
          const projectManagerPrompt = `You are a **Senior Project Manager** reviewing this estimate for a client in ${finalProvinceForAI}.
Your role: Provide executive summary and overall assessment.

${antiHallucinationRule}

Provide a brief executive summary (3-4 sentences):
- Overall assessment: Is this estimate reasonable for a ${projectType} of ${sqft}?
- Value assessment: Is the customer getting fair pricing for ${finalProvinceForAI}?
- Recommendation: Approve, approve with minor notes, or needs revision?

Be concise and professional. Use plain language the customer can understand.
Do NOT suggest scope changes or additions the customer didn't request.`;

          // Helper function to call an agent
          const callAgent = async (agentPrompt: string, agentName: string): Promise<string> => {
            const userPrompt = `Estimate to review:

${baseResponse}

---
Project Details:
${basicProjectInfo}
---

Provide your specialist review for this ${projectType}.`;

            try {
              if (hasAnthropic) {
                return await callAnthropic(userPrompt, agentPrompt);
              } else if (hasOpenRouter) {
                return await callOpenRouter(userPrompt, agentPrompt);
              } else {
                return await callOpenAI(userPrompt, agentPrompt);
              }
            } catch (err) {
              console.error(`${agentName} agent error:`, err);
              return `*${agentName} review unavailable*`;
            }
          };

          // Run all agents in parallel for speed
          const [
            codeComplianceReview,
            pricingReview,
            materialsReview,
            safetyReview,
            projectManagerReview
          ] = await Promise.all([
            callAgent(codeCompliancePrompt, 'Code Compliance'),
            callAgent(pricingAnalystPrompt, 'Pricing'),
            callAgent(materialsSpecialistPrompt, 'Materials'),
            callAgent(safetyInspectorPrompt, 'Safety'),
            callAgent(projectManagerPrompt, 'Project Manager')
          ]);

          // Combine all agent reviews into formatted output
          const agentReviews = `## AI Specialist Team Review

### Executive Summary
${projectManagerReview}

---

### Code Compliance Review
${codeComplianceReview}

### Pricing Analysis
${pricingReview}

### Materials Assessment
${materialsReview}

### Safety Review
${safetyReview}

---
*Review generated by AI specialist team for ${finalProvinceForAI}. Always verify with licensed professionals.*`;

          // Combine base estimate with AI agent enhancements
          defaultResponse = baseResponse + `\n\n---\n\n` + agentReviews;
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
