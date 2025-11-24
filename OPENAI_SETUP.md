# OpenAI/OpenRouter API Setup Guide

## Option 1: Using OpenAI API (Direct)

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy your API key (starts with `sk-...`)

### Step 2: Add Environment Variable

**For Local Development:**
1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add your API key:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

**For Vercel Deployment:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
   - **Environment**: Production, Preview, Development (select all)
4. Click **Save**

### Step 3: Update API Route

The API route has been updated to use OpenAI. It will automatically use your API key from the environment variable.

---

## Option 2: Using OpenRouter API (Access to Multiple Models)

### Step 1: Get Your OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to **Keys** section
4. Click **Create Key**
5. Copy your API key

### Step 2: Add Environment Variables

**For Local Development:**
```bash
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_CUSTOMER_ID=your-customer-id-here  # Optional
```

**For Vercel Deployment:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_CUSTOMER_ID` (optional)
4. Click **Save**

---

## Cost Considerations

### OpenAI Pricing (as of 2024)
- **GPT-4 Turbo**: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- **GPT-3.5 Turbo**: ~$0.0005 per 1K input tokens, ~$0.0015 per 1K output tokens

### OpenRouter Pricing
- Varies by model (access to GPT-4, Claude, Gemini, etc.)
- Often cheaper than direct API access
- Check [OpenRouter Pricing](https://openrouter.ai/models) for current rates

---

## Testing

After adding your API key:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test the construction estimate:
   - Go to `/dashboard/modules/construction`
   - Enter project details
   - Generate an estimate
   - You should see AI-generated responses instead of mock data

---

## Troubleshooting

### Error: "API key not found"
- Make sure `.env.local` exists in the root directory
- Verify the variable name is exactly `OPENAI_API_KEY` or `OPENROUTER_API_KEY`
- Restart your dev server after adding the key

### Error: "Insufficient quota"
- Check your OpenAI/OpenRouter account balance
- Verify your API key is active
- Check usage limits in your account dashboard

### Error: "Rate limit exceeded"
- You've hit the API rate limit
- Wait a few minutes and try again
- Consider upgrading your API plan

---

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Never share your API keys publicly
- Use different keys for development and production
- Monitor your API usage to avoid unexpected charges

