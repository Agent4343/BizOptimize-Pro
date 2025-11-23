# Fixing Supabase RLS Error

## The Problem
You're getting a 401 Unauthorized error when trying to create a user profile:
```
new row violates row-level security policy for table "user_profiles"
```

## Root Cause
Even though we removed Supabase code, the error suggests:
1. **Cached JavaScript** - Your browser may have cached old code
2. **Browser Extension** - An extension might be injecting Supabase code
3. **Service Worker** - A cached service worker might be making requests

## Solutions

### Solution 1: Fix RLS Policies in Supabase (If You Still Use It)

If you want to keep using Supabase, you need to add RLS policies:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Enable RLS if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Solution 2: Remove Supabase Completely (If Not Using It)

If you don't need Supabase:

1. **Clear Browser Cache:**
   - Chrome: `Ctrl+Shift+Delete` → Clear cached images and files
   - Or use Incognito mode

2. **Remove Supabase Packages:**
   ```bash
   npm uninstall @supabase/supabase-js @auth/supabase-adapter
   ```

3. **Clear Service Workers:**
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear storage" → "Clear site data"

4. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

### Solution 3: Check for Browser Extensions

Some browser extensions inject code. Try:
1. Open in Incognito/Private mode
2. Disable extensions one by one
3. Check if error still occurs

## Quick Fix

The fastest solution is to **clear your browser cache and restart the dev server**. The error is likely from cached JavaScript that's trying to use Supabase.

