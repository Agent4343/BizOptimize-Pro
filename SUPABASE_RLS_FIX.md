# Fixing Supabase RLS Policy Error for user_profiles

## Error
```
new row violates row-level security policy for table "user_profiles"
```

## Solution

If you're still using Supabase, you need to create RLS policies that allow users to insert into the `user_profiles` table.

### Option 1: Allow Authenticated Users to Insert Their Own Profile

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Policies**
3. Select the `user_profiles` table
4. Click **New Policy**
5. Create an **INSERT** policy with:
   - Policy name: `Users can insert their own profile`
   - Allowed operation: `INSERT`
   - Policy definition:
   ```sql
   (auth.uid() = user_id)
   ```
   - With check:
   ```sql
   (auth.uid() = user_id)
   ```

### Option 2: Temporarily Disable RLS (Not Recommended for Production)

1. Go to Supabase Dashboard
2. Navigate to **Table Editor** > `user_profiles`
3. Click **Settings** > **Disable RLS** (only for development)

### Option 3: Remove Supabase Code (If Not Using It)

If you're not using Supabase anymore, you should:
1. Remove Supabase environment variables
2. Clear browser cache
3. Check for any browser extensions that might be injecting Supabase code
4. Remove `@supabase/supabase-js` from package.json if not needed

## Recommended Policy for user_profiles

```sql
-- Allow users to insert their own profile
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

## Note

If you've removed all Supabase code from your application but are still seeing this error:
- Clear your browser cache
- Check for browser extensions that might be injecting code
- Check if there are any cached service workers
- Restart your development server

