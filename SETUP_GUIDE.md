# Complete Setup Guide - Stripe + NextAuth + Supabase

## 🚀 **Quick Start (5 Steps)**

### **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → "New Project"
3. Fill in:
   - **Project Name**: BizOptimize Pro
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Wait for project to be created (~2 minutes)

### **Step 2: Get Supabase Credentials**

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - **KEEP SECRET!**

### **Step 3: Set Up Database Schema**

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the SQL from `src/lib/supabase.ts` (the `databaseSchema` export)
4. Paste and click **Run**
5. Verify tables were created in **Table Editor**

### **Step 4: Create Stripe Account**

1. Go to [stripe.com](https://stripe.com)
2. Sign up for account
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)
5. Go to **Developers** → **Webhooks**
6. Click **Add endpoint**
7. Set URL to: `https://yourdomain.com/api/stripe/webhook`
8. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
9. Copy **Signing secret** (starts with `whsec_...`)

### **Step 5: Configure Environment Variables**

Create `.env.local` file in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL (for production, use your domain)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

---

## 📋 **Database Schema Setup**

The database schema is in `src/lib/supabase.ts`. Run it in Supabase SQL Editor:

1. Copy the `databaseSchema` SQL
2. Paste in Supabase SQL Editor
3. Click **Run**
4. Verify tables created:
   - `user_profiles`
   - `subscriptions`
   - `api_keys`
   - `modules`
   - `demos`
   - `usage_analytics`

---

## 🔧 **Testing the Setup**

### **1. Test Authentication**

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signup`
3. Create an account
4. Check Supabase **Authentication** → **Users** - you should see your user

### **2. Test Stripe (Test Mode)**

1. Go to `http://localhost:3000/pricing`
2. Sign in
3. Click "Subscribe Now" on any module
4. Use Stripe test card: `4242 4242 4242 4242`
5. Expiry: Any future date
6. CVC: Any 3 digits
7. Complete checkout
8. Check Stripe Dashboard → **Payments** - should see test payment

### **3. Test Webhooks (Local Development)**

For local webhook testing, use Stripe CLI:

```bash
# Install Stripe CLI
# Windows: Download from https://stripe.com/docs/stripe-cli
# Mac: brew install stripe/stripe-cli/stripe
# Linux: See Stripe docs

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret it gives you
# Update STRIPE_WEBHOOK_SECRET in .env.local
```

---

## 🎯 **Production Deployment**

### **Vercel Deployment**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard:
   - All variables from `.env.local`
5. Deploy!

### **Update Webhook URL**

1. In Stripe Dashboard → **Webhooks**
2. Update endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
3. Update `NEXT_PUBLIC_APP_URL` in Vercel to your domain

---

## ✅ **Verification Checklist**

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Supabase credentials in `.env.local`
- [ ] Stripe account created
- [ ] Stripe API keys in `.env.local`
- [ ] Stripe webhook configured
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Can create Stripe checkout session
- [ ] Webhook receives events (check Stripe Dashboard)

---

## 🐛 **Troubleshooting**

### **"Supabase credentials not found"**
- Check `.env.local` exists
- Verify variable names match exactly
- Restart dev server after adding env vars

### **"Unauthorized" errors**
- Check `NEXTAUTH_SECRET` is set
- Verify Supabase service role key is correct
- Check database schema was executed

### **Stripe checkout not working**
- Verify Stripe keys are test keys (start with `pk_test_` and `sk_test_`)
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Look at browser console for errors

### **Webhooks not working**
- Verify webhook URL is correct
- Check webhook signing secret matches
- Use Stripe CLI for local testing
- Check Stripe Dashboard → **Webhooks** → **Events** for errors

---

## 📚 **Next Steps**

1. **Test everything** in development
2. **Deploy to Vercel** (free tier available)
3. **Switch to Stripe Live keys** when ready
4. **Update webhook URL** to production domain
5. **Start accepting real payments!** 💰

---

## 🎉 **You're Ready!**

Once all steps are complete, your app can:
- ✅ Accept user signups
- ✅ Handle authentication
- ✅ Process payments via Stripe
- ✅ Store data in Supabase
- ✅ Manage subscriptions

**Time to make money!** 🚀

