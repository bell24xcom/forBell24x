-- ===============================================
-- USER PROFILES TABLE SCHEMA FOR BELL24H
-- ===============================================

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  company_type VARCHAR(100),
  business_category VARCHAR(100),
  role VARCHAR(100),
  phone VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(100),
  profile_completed BOOLEAN DEFAULT false,
  is_first_login BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===============================================
-- CLEAN DEMO DATA (RUN IN PRODUCTION)
-- ===============================================

-- Remove demo/test accounts
DELETE FROM auth.users WHERE email LIKE '%demo%';
DELETE FROM auth.users WHERE email LIKE '%test%';

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
);

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- ===============================================
-- USAGE INSTRUCTIONS
-- ===============================================

/*
1. Run this SQL in your Supabase SQL Editor
2. The table will be created with proper RLS policies
3. Users can only access their own profile data
4. The onboarding flow will automatically create profiles
5. Demo accounts will be cleaned for production
*/ 