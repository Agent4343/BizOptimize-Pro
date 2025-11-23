# Vercel Deployment Guide

This guide will help you deploy BizOptimize Pro to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier is fine)
3. Supabase project set up
4. (Optional) Stripe account for payment processing

## Step 1: Push to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

## Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

### Required Variables

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)

**NextAuth:**
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

### Optional Variables (for Stripe subscriptions)

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## Step 4: Generate NextAuth Secret

Run this command locally to generate a secure secret:
```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in Vercel.

## Step 5: Update NEXTAUTH_URL

After your first deployment, Vercel will give you a URL like `https://your-app.vercel.app`. 

1. Copy this URL
2. Go to your Vercel project settings
3. Update `NEXTAUTH_URL` to your production URL
4. Redeploy

## Step 6: Configure Supabase

1. In your Supabase project, go to Settings > API
2. Copy your:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

3. In Supabase, go to Authentication > URL Configuration
4. Add your Vercel URL to "Site URL" and "Redirect URLs"

## Step 7: Set Up Database

**⚠️ IMPORTANT: This step is required! Without it, you'll get 404 errors.**

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the SQL from `SUPABASE_SETUP.md` file (or see `src/lib/supabase.ts` for the `databaseSchema` export)
4. Paste it into the SQL Editor
5. Click **"Run"** to execute
6. Verify tables were created in **Table Editor**

**See `SUPABASE_SETUP.md` for detailed step-by-step instructions and troubleshooting.**

## Step 8: Configure Stripe Webhook (if using payments)

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET` in Vercel

## Step 9: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Visit your deployed app!

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Check build logs in Vercel dashboard
- Ensure `NEXTAUTH_SECRET` is set

### Authentication Not Working
- Verify `NEXTAUTH_URL` matches your Vercel domain
- Check Supabase redirect URLs include your Vercel domain
- Ensure `NEXTAUTH_SECRET` is set

### Database Errors
- Verify Supabase credentials are correct
- Check that database schema has been run
- Verify RLS policies are set up correctly

### API Routes Not Working
- Check that server-side environment variables are set (not just `NEXT_PUBLIC_*`)
- Verify Supabase service role key is set for server-side operations

## Notes

- Vercel automatically handles Next.js builds
- Environment variables are encrypted and secure
- You can preview deployments before promoting to production
- Vercel provides free SSL certificates automatically

