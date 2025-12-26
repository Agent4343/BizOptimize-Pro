import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { sanitizeForPrompt, sanitizeProvince, sanitizeTrade } from '@/lib/sanitize';
import { getValidationPrompt, generateValidationUserPrompt, SAFE_CODE_LANGUAGE } from '@/lib/validation-prompts';

interface ValidationResponse {
  success: boolean;
  validated: boolean;
  correctedEstimate?: string;
  scopeAssumptions?: string[];
  issuesFound?: string[];
  originalTotal?: number;
  correctedTotal?: number;
  savings?: number;
  codeComplianceNote?: string;
  error?: string;
}

// Helper function to call OpenAI API
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
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
      temperature: 0.3, // Lower temperature for more consistent validation
      max_tokens: 3000,
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
async function callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
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
      'X-Title': 'BizOptimize Pro - Estimate Validator',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Parse the AI response to extract structured data
function parseValidationResponse(response: string): {
  correctedEstimate: string;
  scopeAssumptions: string[];
  issuesFound: string[];
  correctedTotal: number;
} {
  // Extract sections from the response
  const correctedEstimateMatch = response.match(/## Corrected Estimate[\s\S]*?(?=## Scope Assumptions|## Issues Found|## Final Total|$)/i);
  const scopeAssumptionsMatch = response.match(/## Scope Assumptions[\s\S]*?(?=## Issues Found|## Final Total|$)/i);
  const issuesFoundMatch = response.match(/## Issues Found[\s\S]*?(?=## Final Total|$)/i);
  const finalTotalMatch = response.match(/## Final Total[\s\S]*$/i);

  // Extract the corrected total
  const totalMatch = response.match(/\*\*(?:Final Total|Corrected Total|Total)\*\*[:\s]*\$?([\d,]+)/i) ||
                     response.match(/Final Total[:\s]*\$?([\d,]+)/i) ||
                     response.match(/\$([\d,]+)\s*(?:CAD)?/);

  const correctedTotal = totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : 0;

  // Parse scope assumptions as bullet points
  const scopeAssumptions: string[] = [];
  if (scopeAssumptionsMatch) {
    const lines = scopeAssumptionsMatch[0].split('\n');
    for (const line of lines) {
      const bulletMatch = line.match(/^[\s]*[-*•]\s*(.+)/);
      if (bulletMatch) {
        scopeAssumptions.push(bulletMatch[1].trim());
      }
    }
  }

  // Parse issues found as bullet points
  const issuesFound: string[] = [];
  if (issuesFoundMatch) {
    const lines = issuesFoundMatch[0].split('\n');
    for (const line of lines) {
      const bulletMatch = line.match(/^[\s]*[-*•]\s*(.+)/);
      if (bulletMatch) {
        issuesFound.push(bulletMatch[1].trim());
      }
    }
  }

  return {
    correctedEstimate: correctedEstimateMatch ? correctedEstimateMatch[0].trim() : response,
    scopeAssumptions,
    issuesFound,
    correctedTotal,
  };
}

// Extract original total from estimate
function extractOriginalTotal(estimate: string): number {
  const totalMatch = estimate.match(/\*\*Total.*?Cost\*\*[:\s]*\$?([\d,]+)/i) ||
                     estimate.match(/Total.*Cost[:\s]*\$?([\d,]+)/i);
  return totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : 0;
}

export async function POST(request: NextRequest): Promise<NextResponse<ValidationResponse>> {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(`ai-validate:${clientId}`, RATE_LIMITS.ai);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          validated: false,
          error: 'Rate limit exceeded. Please try again later.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Sanitize inputs
    const estimate = sanitizeForPrompt(body.estimate || '');
    const trade = sanitizeTrade(body.trade || 'electrical');
    const province = sanitizeProvince(body.province || '');
    const location = sanitizeForPrompt(body.location || '');
    const projectType = sanitizeForPrompt(body.projectType || '');
    const squareFootage = sanitizeForPrompt(body.squareFootage || '');

    if (!estimate) {
      return NextResponse.json(
        {
          success: false,
          validated: false,
          error: 'No estimate provided for validation',
        },
        { status: 400 }
      );
    }

    // Check if AI is available
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;

    if (!hasOpenAI && !hasOpenRouter) {
      // No AI available - return original estimate with basic validation
      const originalTotal = extractOriginalTotal(estimate);

      return NextResponse.json({
        success: true,
        validated: false,
        correctedEstimate: estimate,
        scopeAssumptions: ['AI validation not available - using original estimate'],
        issuesFound: [],
        originalTotal,
        correctedTotal: originalTotal,
        savings: 0,
        codeComplianceNote: SAFE_CODE_LANGUAGE.allowed[0],
      });
    }

    // Get the trade-specific validation prompt
    const systemPrompt = getValidationPrompt(trade);

    // Generate the user prompt
    const userPrompt = generateValidationUserPrompt(estimate, {
      projectType,
      location,
      province,
      squareFootage,
    });

    // Call AI for validation
    let aiResponse: string;
    try {
      if (hasOpenRouter) {
        aiResponse = await callOpenRouter(userPrompt, systemPrompt);
      } else {
        aiResponse = await callOpenAI(userPrompt, systemPrompt);
      }
    } catch (aiError) {
      console.error('AI validation error:', aiError);
      const originalTotal = extractOriginalTotal(estimate);

      return NextResponse.json({
        success: true,
        validated: false,
        correctedEstimate: estimate,
        scopeAssumptions: ['AI validation failed - using original estimate'],
        issuesFound: [],
        originalTotal,
        correctedTotal: originalTotal,
        savings: 0,
        codeComplianceNote: SAFE_CODE_LANGUAGE.allowed[0],
      });
    }

    // Parse the AI response
    const parsed = parseValidationResponse(aiResponse);
    const originalTotal = extractOriginalTotal(estimate);

    return NextResponse.json({
      success: true,
      validated: true,
      correctedEstimate: parsed.correctedEstimate,
      scopeAssumptions: parsed.scopeAssumptions,
      issuesFound: parsed.issuesFound,
      originalTotal,
      correctedTotal: parsed.correctedTotal,
      savings: originalTotal - parsed.correctedTotal,
      codeComplianceNote: SAFE_CODE_LANGUAGE.allowed[0],
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      {
        success: false,
        validated: false,
        error: 'Failed to validate estimate',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/validate',
    description: 'Validate and correct construction estimates using AI',
    method: 'POST',
    requiredFields: ['estimate', 'trade'],
    optionalFields: ['province', 'location', 'projectType', 'squareFootage'],
    supportedTrades: [
      'electrical',
      'plumbing',
      'hvac',
      'foundation',
      'framing',
      'roofing',
      'drywall',
      'flooring',
      'painting',
    ],
  });
}
