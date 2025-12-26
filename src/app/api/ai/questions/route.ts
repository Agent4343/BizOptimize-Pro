import { NextRequest, NextResponse } from 'next/server';
import { extractProvinceEnhanced } from '@/lib/province-data';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { sanitizeForPrompt, sanitizeTrade, sanitizeProvince } from '@/lib/sanitize';

// Helper function to call OpenAI API
async function callOpenAI(prompt: string, systemPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Helper function to call OpenRouter API
async function callOpenRouter(prompt: string, systemPrompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://bizoptimize-pro.vercel.app',
      'X-Title': 'BizOptimize Pro',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Use enhanced province extraction
function extractProvince(location: string): string {
  return extractProvinceEnhanced(location).province;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(`ai-questions:${clientId}`, RATE_LIMITS.aiQuestions);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Sanitize inputs
    const trade = sanitizeTrade(body.trade || '') || 'construction';
    const conversation = body.conversation || [];
    const currentAnswer = sanitizeForPrompt(body.currentAnswer || '');
    const projectType = sanitizeForPrompt(body.projectType || '');
    const location = sanitizeForPrompt(body.location || '');
    const squareFootage = sanitizeForPrompt(body.squareFootage || '');
    const province = sanitizeProvince(body.province || '');

    // Use provided province if available, otherwise extract from location
    const finalProvince = province || extractProvince(location);

    // Build conversation history
    const conversationHistory = conversation || [];
    if (currentAnswer) {
      conversationHistory.push({ role: 'user', content: currentAnswer });
    }

    // Determine if we have enough information
    const hasBasicInfo = projectType && location && squareFootage;
    
    // Determine trade description for prompts
    const isFullConstruction = trade === 'construction';
    const tradeDescription = isFullConstruction
      ? 'full construction (all trades including foundation, framing, electrical, plumbing, HVAC, roofing, drywall, flooring, and painting)'
      : `${trade}`;

    // Build system prompt for question generation
    const systemPrompt = isFullConstruction
      ? `You are an expert construction estimator assistant for full construction projects in ${finalProvince}, Canada.

Your role is to ask intelligent questions to gather information needed for a comprehensive construction estimate covering ALL trades.

IMPORTANT GUIDELINES:
1. Ask ONE question at a time
2. Cover all major aspects: foundation, structure, mechanical (electrical, plumbing, HVAC), exterior, interior finishes
3. Consider ${finalProvince} building codes and regulations
4. For ${projectType === 'garage' ? 'garage' : 'residential'} projects, ask appropriate questions
5. For garages: focus on foundation, framing, roofing, basic electrical, optional plumbing/HVAC
6. For houses: cover all trades comprehensively
7. Once you have enough information (usually 8-10 questions), respond with "READY_TO_ESTIMATE"

Current information gathered:
- Project Type: ${projectType || 'Not specified'}
- Location: ${location || 'Not specified'} (${finalProvince})
- Square Footage: ${squareFootage || 'Not specified'}

Focus on questions that affect MULTIPLE trades or overall project scope.

Respond with either:
- A single, specific question (if more info is needed)
- "READY_TO_ESTIMATE" followed by a summary (if we have enough info)`
      : `You are an expert construction estimator assistant specializing in ${trade} work in ${finalProvince}, Canada.

Your role is to ask intelligent, relevant questions to gather all necessary information for an accurate ${trade} estimate.

IMPORTANT GUIDELINES:
1. Ask ONE question at a time
2. Questions should be specific to ${trade} work
3. Consider ${finalProvince} building codes and regulations
4. For ${projectType === 'garage' ? 'garage' : 'residential'} projects, ask appropriate questions
5. Don't ask about things that don't apply (e.g., don't ask about bathrooms for garages)
6. Once you have enough information, respond with "READY_TO_ESTIMATE" and summarize what you know

Current information gathered:
- Project Type: ${projectType || 'Not specified'}
- Location: ${location || 'Not specified'} (${finalProvince})
- Square Footage: ${squareFootage || 'Not specified'}

Based on the conversation so far, determine:
1. What critical information is still missing for a ${trade} estimate?
2. What is the most important question to ask next?
3. Have we gathered enough information to generate an accurate estimate?

Respond with either:
- A single, specific question (if more info is needed)
- "READY_TO_ESTIMATE" followed by a summary (if we have enough info)`;

    // Build user prompt
    const userPrompt = `Conversation so far:
${conversationHistory.map((msg: any) => `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`).join('\n')}

${currentAnswer ? `\nUser just answered: ${currentAnswer}` : ''}

What should I ask next, or are we ready to estimate?`;

    // Call AI to generate next question
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;

    let aiResponse = '';
    if (hasOpenRouter) {
      aiResponse = await callOpenRouter(userPrompt, systemPrompt);
    } else if (hasOpenAI) {
      aiResponse = await callOpenAI(userPrompt, systemPrompt);
    } else {
      // Fallback: Generate questions based on trade and what we know
      aiResponse = generateFallbackQuestion(trade, projectType, conversationHistory, province);
    }

    // Check if ready to estimate
    const isReady = aiResponse.includes('READY_TO_ESTIMATE') || 
                    conversationHistory.length >= 8; // Safety limit

    if (isReady) {
      return NextResponse.json({
        success: true,
        question: null,
        ready: true,
        summary: aiResponse.replace('READY_TO_ESTIMATE', '').trim(),
        conversation: [...conversationHistory, { role: 'assistant', content: aiResponse }]
      });
    }

    return NextResponse.json({
      success: true,
      question: aiResponse.trim(),
      ready: false,
      conversation: [...conversationHistory, { role: 'assistant', content: aiResponse }]
    });

  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate question'
      },
      { status: 500 }
    );
  }
}

// Fallback question generator when AI is not available
function generateFallbackQuestion(
  trade: string, 
  projectType: string, 
  conversation: any[], 
  province: string
): string {
  const answeredQuestions = conversation
    .filter((msg: any) => msg.role === 'user')
    .map((msg: any) => msg.content.toLowerCase());

  const isGarage = projectType === 'garage';

  // Trade-specific question sequences - comprehensive for professional estimates
  // Includes pricing and material quality questions for accurate quoting
  const questionSets: Record<string, string[]> = {
    construction: isGarage ? [
      'Will this be a detached garage or attached to the main building?',
      'What are the garage dimensions? (length x width in feet)',
      'Will the garage be finished (insulated, drywalled) or unfinished?',
      'What foundation type? (concrete slab, frost wall, full foundation)',
      'What size overhead door(s)? (single 8-10ft, double 16ft, or both)',
      'Will you need a man door (walk-through door)?',
      'How many windows do you need, if any?',
      'What roofing material to match your home? (asphalt shingles, metal)',
      'What electrical do you need? (basic lighting/outlets, 240V for tools, sub-panel for EV charger)',
      'Will you need any plumbing? (utility sink, hose bib, floor drain)',
      'Do you need heating/cooling? (none, space heater, radiant floor, mini-split)',
      'What insulation level? (none, basic R-12, premium R-20+)',
      // Pricing questions
      'What quality level for materials? (Economy/budget, Standard, Premium)',
      'Are you supplying any materials yourself or contractor supplies all?',
      'Do you have a target budget for this project?',
      'Do you want an itemized parts list with the quote?'
    ] : [
      'Is this new construction, major renovation, or an addition?',
      'How many floors/stories will the home be?',
      'How many bedrooms and bathrooms?',
      'What is the approximate lot size and any site preparation needs?',
      'What foundation type? (slab, crawl space, full basement, walkout basement)',
      'Will the basement be finished or unfinished?',
      'What heating/cooling system? (forced air gas/electric, heat pump, boiler, geothermal)',
      'What exterior finish? (vinyl siding, fiber cement, brick, stone, stucco, mixed)',
      'What roofing material? (asphalt shingles, metal, tile, cedar shake)',
      'What interior finish level? (builder basic, standard, upgraded, luxury/custom)',
      'What flooring throughout? (hardwood, laminate, tile, carpet, or mixed)',
      'Do you have a general contractor or managing trades separately?',
      'Any energy efficiency goals? (standard code, high-efficiency, Net-Zero ready)',
      // Pricing questions
      'What overall quality level for materials and finishes? (Builder grade, Standard, Premium, Luxury)',
      'Are you or another supplier providing any materials?',
      'What is your total budget range for this project?',
      'Do you want itemized pricing by trade so you can choose which to proceed with?'
    ],
    electrical: isGarage ? [
      'Is this new electrical or upgrading an existing garage?',
      'What panel size do you need? (60 Amp sub-panel, 100 Amp, 200 Amp main)',
      'How many 120V outlets do you need and where?',
      'Do you need 240V outlets? (for welder, compressor, EV charger - specify amperage)',
      'What lighting do you need? (LED shop lights, recessed, exterior motion lights)',
      'Do you need a garage door opener circuit?',
      'Will you need outdoor outlets (GFCI protected)?',
      // Pricing questions
      'What quality level for electrical components? (Economy, Standard, Commercial-grade)',
      'Any preferred brands? (Eaton, Siemens, Square D, Leviton)',
      'Are you supplying any fixtures or switches yourself?',
      'Do you need an itemized quote with each part/component priced?'
    ] : [
      'Is this new electrical installation or upgrading/expanding existing?',
      'What main panel size? (100 Amp, 200 Amp, 400 Amp)',
      'How many 15A and 20A circuits do you need?',
      'What 240V appliances? (stove, dryer, AC, water heater, EV charger - list all)',
      'How many outlets per room on average?',
      'What type of lighting? (recessed LED, pendant, chandelier, under-cabinet - by room)',
      'Do you need GFCI protection? (required for bathrooms, kitchen, outdoor, garage)',
      'Do you need AFCI protection? (required for bedrooms in most provinces)',
      'Any dedicated circuits needed? (home office, workshop, server room)',
      'Smart home features? (smart switches, whole-home automation, structured wiring)',
      // Pricing questions
      'What quality level? (Builder-grade outlets/switches, Standard, Decora-style premium)',
      'Any preferred brands? (Leviton, Lutron, Legrand, or budget options)',
      'What brand for the panel? (Eaton, Siemens, Square D)',
      'Are you supplying any light fixtures or do you need a fixture allowance?',
      'Do you want an itemized parts list showing each component cost?'
    ],
    plumbing: isGarage ? [
      'Do you need any plumbing in the garage?',
      'What fixtures? (utility sink, floor drain, hose bib)',
      'Do you need hot water to the garage? (for utility sink)',
      'Is there existing plumbing nearby or is this a new run?',
      // Pricing questions
      'What quality for fixtures? (Basic utility, Standard, Premium)',
      'Do you want an itemized quote with parts and labor separated?'
    ] : [
      'Is this new plumbing or extending/upgrading existing?',
      'Is the property on municipal water/sewer or well/septic?',
      'How many full bathrooms? (toilet, sink, shower/tub)',
      'How many half bathrooms? (toilet, sink only)',
      'How many kitchen sinks and what type? (single, double, prep sink)',
      'What type of water heater? (tank 40/50/80 gal, tankless, heat pump)',
      'Do you need a laundry room with washer hookups?',
      'Will there be basement plumbing? (bathroom, utility sink, floor drain)',
      'Do you need a backwater valve for flood protection?',
      'Do you need water treatment? (softener, filtration, reverse osmosis)',
      'Do you need gas line work? (for water heater, stove, dryer, fireplace)',
      // Pricing questions
      'What quality level for fixtures? (Builder-basic, Mid-range, Premium brands like Kohler/Moen)',
      'Any specific fixture brands preferred?',
      'What pipe material preference? (PEX standard, copper premium, ABS for drains)',
      'Are you supplying any fixtures yourself (toilets, sinks, faucets)?',
      'Do you want an itemized breakdown showing fixture costs vs labor?'
    ],
    hvac: isGarage ? [
      'Do you need heating in the garage?',
      'What heating type? (electric space heater, gas unit heater, radiant floor, mini-split)',
      'What temperature do you want to maintain? (just above freezing, comfortable workspace)',
      'Do you need cooling or just ventilation?',
      // Pricing questions
      'What quality/efficiency level? (Basic, Mid-efficiency, High-efficiency)',
      'Any brand preference? (Lennox, Carrier, Goodman, etc.)',
      'Do you want an itemized quote with equipment and labor separated?'
    ] : [
      'Is this a new HVAC system or replacing existing?',
      'What heating type? (gas forced air, electric forced air, heat pump, boiler, geothermal)',
      'What cooling type? (central AC, heat pump, ductless mini-split)',
      'What is the approximate square footage per floor?',
      'Do you need new ductwork or can existing be used/modified?',
      'How many zones/thermostats do you want?',
      'Where will equipment be located? (basement, attic, outdoor, utility room)',
      'Do you need a humidifier or dehumidifier?',
      'Do you need air quality improvements? (HEPA filtration, UV purification, ERV/HRV)',
      'What thermostat type? (basic programmable, smart/WiFi like Nest/Ecobee)',
      // Pricing questions
      'What efficiency level? (Standard 80% furnace/14 SEER AC, High-efficiency 96%/18+ SEER)',
      'Any brand preference? (Lennox, Carrier, Trane, Goodman, Daikin for mini-splits)',
      'Do you want the quote to show equipment cost separately from installation?',
      'Are there any rebates in ${province} we should factor in?'
    ],
    framing: isGarage ? [
      'Is this new construction or adding to existing structure?',
      'What are the exterior dimensions?',
      'What wall height? (standard 8ft, 9ft, 10ft, taller)',
      'What material? (wood 2x4, wood 2x6 for insulation, steel)',
      'What roof style? (gable, hip, shed, match existing home)',
      'What roof pitch?',
      // Pricing questions
      'What lumber grade? (SPF standard, Pressure-treated where needed, Premium)',
      'Are you supplying any materials or contractor supplies all?',
      'Do you want an itemized materials list with quantities and costs?'
    ] : [
      'Is this new framing or renovation/addition?',
      'What material type? (wood 2x4, 2x6 for better insulation, steel, engineered)',
      'What are the wall heights per floor? (8ft, 9ft, 10ft, vaulted areas)',
      'What roof style and pitch?',
      'Any vaulted or cathedral ceilings?',
      'Any exposed beam ceilings or tray ceilings?',
      'Are there load-bearing walls to work around or remove?',
      'Any open-concept areas requiring long beam spans?',
      'Do you need engineered trusses or stick-built?',
      // Pricing questions
      'What lumber grade? (Standard SPF, #2 or better, Premium)',
      'Will you need engineered lumber? (LVL beams, I-joists, TJIs)',
      'Are trusses being ordered or built on-site?',
      'Do you want an itemized materials list with current lumber pricing?'
    ],
    roofing: [
      'Is this a complete roof replacement or new construction?',
      'If replacement, what is the current roofing condition?',
      'What roofing material? (3-tab shingles, architectural, metal standing seam, metal shingle)',
      'What is the roof pitch? (4/12, 6/12, 8/12, 12/12, etc.)',
      'What is the approximate roof area in square feet?',
      'How many layers to remove? (if replacement)',
      'Are there any roof penetrations? (chimney, skylights, plumbing vents)',
      'What type of roof ventilation? (soffit/ridge vents, gable vents)',
      'Do you need ice dam protection? (ice and water shield at eaves)',
      'Do you need new gutters and downspouts?',
      // Pricing questions
      'What shingle grade? (25-year basic, 30-year standard, Lifetime premium)',
      'Any brand preference? (BP, IKO, GAF, CertainTeed, Owens Corning)',
      'What warranty level? (standard, extended, transferable)',
      'Do you want the quote itemized showing materials vs labor?'
    ],
    foundation: [
      'Is this a new foundation or repair/underpinning existing?',
      'What foundation type? (slab-on-grade, crawl space, full basement, walkout)',
      'What are the foundation dimensions?',
      'What is the local frost line depth?',
      'Do you know the soil conditions? (rock, clay, sand, fill)',
      'Will excavation encounter rock or require blasting?',
      'What concrete thickness and strength? (standard 4", 6" for garage floors)',
      'Do you need reinforcement? (rebar, wire mesh, fiber)',
      'Will the basement be finished? (affects waterproofing and egress)',
      'What waterproofing is needed? (damp-proofing, membrane, interior/exterior)',
      'Do you need a sump pump and pit?',
      'Do you need radon mitigation piping roughed in?',
      // Pricing questions
      'What concrete strength? (Standard 25MPa, High-strength 30MPa+)',
      'What floor finish? (bare concrete, sealed, epoxy, polished)',
      'What quality waterproofing? (Basic damp-proofing, Standard membrane, Premium system)',
      'Do you want an itemized quote showing excavation, concrete, and waterproofing separately?'
    ],
    drywall: [
      'Is this new drywall or patching/repairing existing?',
      'What total area needs drywall? (walls and ceilings in square feet)',
      'What drywall type needed by area? (standard, moisture-resistant, fire-rated Type X)',
      'What thickness? (1/2" standard, 5/8" for fire rating or ceilings)',
      'What finish level? (Level 3 for texture, Level 4 for flat paint, Level 5 for smooth/gloss)',
      'Any soundproofing needed? (between floors, media room, bedrooms)',
      'Any curved walls or special shapes?',
      'Will taping and mudding be included?',
      'Are high ceilings involved? (affects scaffolding needs)',
      // Pricing questions
      'What drywall brand? (CertainTeed, CGC/USG, or economy)',
      'What mud/compound type? (all-purpose, lightweight, premium)',
      'Is priming included or separate painting quote?',
      'Do you want an itemized quote showing materials vs labor?'
    ],
    flooring: [
      'Is existing flooring being removed? What type and how much?',
      'What is the subfloor type? (plywood, OSB, concrete)',
      'What is the subfloor condition? (level, needs repair, moisture issues)',
      'What flooring type for each area? (hardwood, engineered wood, laminate, LVP/LVT, tile, carpet)',
      'What is the total area per flooring type? (square feet)',
      'Is underlayment needed? (foam, cork, moisture barrier)',
      'Any radiant floor heating under the flooring?',
      'Are transitions between rooms/materials needed?',
      'Do you need baseboards and shoe molding installed?',
      // Pricing questions
      'What quality/grade level? (Economy $2-4/sqft, Mid-range $4-8/sqft, Premium $8+/sqft)',
      'Any preferred brands? (e.g., for LVP: Shaw, Mohawk, or budget options)',
      'Are you supplying the flooring materials or contractor provides?',
      'Do you want an itemized quote showing material cost vs installation labor?'
    ],
    painting: [
      'Is this new construction or repainting existing surfaces?',
      'Interior, exterior, or both?',
      'What is the total wall area? (square feet - or number of rooms)',
      'What is the ceiling area if included?',
      'What is the surface condition? (new drywall, good, needs prep/repair)',
      'Do you need primer? (new surfaces, stains, color change)',
      'How many coats of finish paint? (typically 2)',
      'What sheen levels? (flat for ceilings, eggshell for walls, semi-gloss for trim)',
      'Are trim, doors, and baseboards included?',
      'Any high ceilings or difficult access areas?',
      // Pricing questions
      'What paint quality? (Economy like Glidden, Mid-grade like Behr, Premium like Benjamin Moore/Sherwin-Williams)',
      'Any specific brand preference?',
      'Are you supplying the paint or contractor provides?',
      'Do you want paint costs itemized separately from labor?',
      'Do you need a color consultation or are colors already selected?'
    ]
  };

  const questions = questionSets[trade] || ['Please provide more details about your project.'];
  
  // Find the first question that hasn't been answered
  for (const question of questions) {
    const questionKey = question.toLowerCase().substring(0, 30);
    const alreadyAnswered = answeredQuestions.some((answer: string) => 
      answer.includes(questionKey) || questionKey.includes(answer.substring(0, 20))
    );
    
    if (!alreadyAnswered) {
      return question;
    }
  }

  // If all questions answered, check if we have enough info
  if (answeredQuestions.length >= questions.length - 1) {
    return 'READY_TO_ESTIMATE: I have gathered sufficient information. Ready to generate your estimate.';
  }

  return questions[answeredQuestions.length] || 'Do you have any additional requirements or specifications?';
}

