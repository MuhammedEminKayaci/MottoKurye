-- Simple test for business_ads access
-- Run this to check if business_ads table is accessible

-- 1. Check if business_ads table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'business_ads'
) as table_exists;

-- 2. Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_ads' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
    schemaname,
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'business_ads';

-- 4. Check existing policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'business_ads';

-- 5. Try to select from business_ads (simple test)
SELECT COUNT(*) as total_ads FROM public.business_ads;

-- 6. Try to select specific columns
SELECT 
    id, 
    title, 
    description,
    province,
    district,
    working_type,
    working_hours,
    created_at,
    image_url,
    user_id
FROM public.business_ads 
ORDER BY created_at DESC 
LIMIT 3;