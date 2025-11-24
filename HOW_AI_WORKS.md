# How AI Works in BizOptimize Pro Construction Estimator

## Overview

The construction estimator works in **two modes**:

### 1. **Calculation Mode (Always Active)**
- Uses **formulas and calculations** to generate estimates
- **No API keys required** - works completely offline
- Generates accurate cost breakdowns based on:
  - Square footage
  - Project type (garage, house, etc.)
  - Trade-specific calculations
  - Province-specific cost multipliers
  - Building code references

### 2. **AI Enhancement Mode (Optional)**
- **Only activates if API keys are configured**
- Enhances the base estimate with:
  - Code compliance verification
  - Pricing validation against market rates
  - Trade-specific code references
  - Compliance recommendations

## How to Check if AI is Being Used

### Option 1: Check the Response
Look at the estimate response. If you see a section like:
```
---
## Compliance & Pricing Validation (Province Name)

### Code Compliance Agent Findings
...
### Pricing Validation Agent Findings
...
```
Then AI is being used.

### Option 2: Check Environment Variables
The estimator checks for these environment variables:
- `OPENAI_API_KEY` - For OpenAI GPT-4
- `OPENROUTER_API_KEY` - For OpenRouter (supports multiple models)

If neither is set, the estimator works in calculation-only mode.

### Option 3: Check the API Response
The API returns `aiGenerated: true/false` in the response.

## Current Status

**Your estimator works WITHOUT AI** - it uses calculation formulas.

**To enable AI enhancement:**
1. Get an API key from OpenAI or OpenRouter
2. Add it to your Vercel environment variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `OPENAI_API_KEY` or `OPENROUTER_API_KEY`
   - Redeploy

## What You Get With/Without AI

### Without AI (Current):
✅ Accurate cost calculations
✅ Province-specific pricing
✅ Building code references
✅ Complete line-item breakdowns
✅ Savings calculations

### With AI (Optional Enhancement):
✅ Everything above, PLUS:
✅ AI-validated code compliance
✅ Market rate pricing validation
✅ Detailed compliance recommendations
✅ Province-specific code authority verification

## Cost Considerations

- **Without AI**: Free (no API costs)
- **With AI**: ~$0.01-0.05 per estimate (depending on model and length)

The base calculations are always accurate - AI just adds an extra layer of validation and compliance checking.

