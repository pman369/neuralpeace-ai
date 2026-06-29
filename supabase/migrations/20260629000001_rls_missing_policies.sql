-- 20260629000001_rls_missing_policies.sql
-- Fixes Supabase linter RLS_ENABLED_NO_POLICY warnings (INFO level)

-- 1. categories policies
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
CREATE POLICY "Allow public read access to categories" ON public.categories
  FOR SELECT USING (true);

-- 2. onboarding_questions policies
DROP POLICY IF EXISTS "Allow public read access to onboarding_questions" ON public.onboarding_questions;
CREATE POLICY "Allow public read access to onboarding_questions" ON public.onboarding_questions
  FOR SELECT USING (true);

-- 3. user_profiles policies
DROP POLICY IF EXISTS "Allow users to read public or own profile" ON public.user_profiles;
CREATE POLICY "Allow users to read public or own profile" ON public.user_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON public.user_profiles;
CREATE POLICY "Allow authenticated users to insert own profile" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON public.user_profiles;
CREATE POLICY "Allow authenticated users to update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 4. users policies
DROP POLICY IF EXISTS "Allow authenticated users to view users list" ON public.users;
CREATE POLICY "Allow authenticated users to view users list" ON public.users
  FOR SELECT TO authenticated USING (true);

-- 5. vault_access_requests policies
DROP POLICY IF EXISTS "Allow users to view own vault access requests" ON public.vault_access_requests;
CREATE POLICY "Allow users to view own vault access requests" ON public.vault_access_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to create own vault access requests" ON public.vault_access_requests;
CREATE POLICY "Allow users to create own vault access requests" ON public.vault_access_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update own vault access requests" ON public.vault_access_requests;
CREATE POLICY "Allow users to update own vault access requests" ON public.vault_access_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
