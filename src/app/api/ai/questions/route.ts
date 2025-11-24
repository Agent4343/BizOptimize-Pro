import { NextRequest, NextResponse } from 'next/server';
import { extractProvinceEnhanced } from '@/lib/province-data';

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
    const body = await request.json();
    const { 
      trade, 
      conversation, 
      currentAnswer,
      projectType,
      location,
      squareFootage,
      province
    } = body;

    // Use provided province if available, otherwise extract from location
    const finalProvince = province || extractProvince(location || '');

    // Build conversation history
    const conversationHistory = conversation || [];
    if (currentAnswer) {
      conversationHistory.push({ role: 'user', content: currentAnswer });
    }

    // Determine if we have enough information
    const hasBasicInfo = projectType && location && squareFootage;
    
    // Build system prompt for question generation
    const systemPrompt = `You are an expert construction estimator assistant specializing in ${trade} work in ${finalProvince}, Canada.

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

  // Trade-specific question sequences
  const questionSets: Record<string, string[]> = {
    electrical: isGarage ? [
      'What is the main electrical panel size needed? (e.g., 100 Amp, 200 Amp)',
      'How many electrical outlets do you need?',
      'Do you need lighting? If yes, what type? (LED, fluorescent, etc.)',
      'Do you need a 240V outlet for tools or EV charging?',
      'Will there be any special electrical requirements? (generator, sub-panel, etc.)'
    ] : [
      'What is the main electrical panel size? (e.g., 100 Amp, 200 Amp)',
      'How many circuits do you need?',
      'How many outlets are required?',
      'How many switches are needed?',
      'What type of lighting fixtures? (recessed, pendant, chandelier, etc.)',
      'Do you need any special features? (smart home, EV charger, generator, etc.)'
    ],
    plumbing: isGarage ? [
      'Do you need any plumbing at all? (utility sink, etc.)',
      'If yes, what type of fixture? (utility sink, hose bib, etc.)',
      'Do you need hot water service?'
    ] : [
      'How many bathrooms?',
      'How many fixtures per bathroom? (toilet, sink, shower/tub)',
      'What type of water heater? (tank, tankless, heat pump)',
      'Do you need a kitchen sink?',
      'Any special plumbing needs? (garbage disposal, water softener, etc.)'
    ],
    hvac: isGarage ? [
      'Do you need any heating? (space heater, radiant floor, etc.)',
      'If yes, what type of heating system?',
      'What is the desired temperature range?',
      'Do you need any cooling/ventilation?'
    ] : [
      'What type of HVAC system? (forced air, heat pump, boiler, etc.)',
      'What capacity is needed? (BTU or tons)',
      'Do you need new ductwork or can existing be used?',
      'How many zones/rooms need climate control?',
      'Any special requirements? (smart thermostat, air quality, etc.)'
    ],
    framing: [
      'What material type? (wood 2x4, wood 2x6, steel, engineered lumber)',
      'What is the wall height?',
      'What is the roof pitch?',
      'Any special structural requirements? (load-bearing walls, beams, etc.)'
    ],
    roofing: [
      'What roofing material? (asphalt shingles, metal, tile, etc.)',
      'What is the roof pitch?',
      'What is the roof area in square feet?',
      'Do you need new gutters and downspouts?',
      'Any special requirements? (skylights, ventilation, etc.)'
    ],
    foundation: [
      'What type of foundation? (concrete slab, crawl space, full basement)',
      'What is the foundation depth?',
      'What is the foundation size/dimensions?',
      'Any special requirements? (waterproofing, drainage, etc.)'
    ],
    drywall: [
      'What area needs drywall? (square feet)',
      'What finish level? (Level 1-5)',
      'Do you need insulation behind the drywall?',
      'Any special requirements? (soundproofing, fire-rated, etc.)'
    ],
    flooring: [
      'What type of flooring? (hardwood, laminate, tile, carpet, etc.)',
      'What is the total flooring area? (square feet)',
      'Do you need subfloor preparation?',
      'Any special requirements? (underlayment, moisture barrier, etc.)'
    ],
    painting: [
      'What area needs painting? (square feet)',
      'How many coats?',
      'Interior or exterior?',
      'Any special requirements? (primer, special finishes, etc.)'
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

