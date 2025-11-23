# Supabase Database Setup Guide

## Error: Table 'user_profiles' not found

If you're seeing this error, you need to create the database tables in Supabase.

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project
3. In the left sidebar, click **"SQL Editor"**
4. Click **"New query"**

### 2. Run the Database Schema

Copy and paste the entire SQL below into the SQL Editor, then click **"Run"**:

```sql
-- Users table (handled by Supabase Auth, but we can extend it)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL, -- active, canceled, past_due, trialing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys table (for admin)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service TEXT NOT NULL, -- openai, anthropic, openrouter, custom
  key_encrypted TEXT NOT NULL, -- encrypted API key
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  route TEXT,
  category TEXT,
  status TEXT DEFAULT 'active', -- active, development, disabled
  features JSONB,
  base_price DECIMAL(10, 2),
  color TEXT,
  bg_color TEXT,
  border_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demos table
CREATE TABLE IF NOT EXISTS public.demos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage analytics table
CREATE TABLE IF NOT EXISTS public.usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT,
  action TEXT, -- estimate_generated, feature_used, etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_demos_user_id ON public.demos(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON public.usage_analytics(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own demos" ON public.demos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON public.usage_analytics
  FOR SELECT USING (auth.uid() = user_id);
```

### 3. Verify Tables Were Created

1. In Supabase, go to **"Table Editor"** in the left sidebar
2. You should see these tables:
   - `user_profiles`
   - `subscriptions`
   - `api_keys`
   - `modules`
   - `demos`
   - `usage_analytics`

### 4. Test the Application

After running the SQL:
1. Try signing up a new user
2. The `user_profiles` table should be created automatically
3. Check the Table Editor to see if the profile was created

## Troubleshooting

### Error: "relation already exists"
- This means the tables already exist. You can either:
  - Skip creating those tables, or
  - Drop and recreate them (be careful - this will delete data!)

### Error: "permission denied"
- Make sure you're running the SQL as a database administrator
- Check that you have the correct permissions in Supabase

### Error: "function gen_random_uuid() does not exist"
- This is rare, but if it happens, you may need to enable the `pgcrypto` extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  ```

### Still Getting 404 Errors?
1. Make sure you ran ALL the SQL (not just part of it)
2. Check that RLS policies were created
3. Verify your Supabase credentials in Vercel are correct
4. Try refreshing your browser and signing up again

## Next Steps

After setting up the database:
1. ✅ Tables created
2. ✅ RLS policies enabled
3. ✅ Test signup functionality
4. ✅ Verify profile creation works

Your app should now work correctly!

