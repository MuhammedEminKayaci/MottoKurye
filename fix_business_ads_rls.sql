-- Fix business_ads RLS policies for courier access
-- This will allow couriers to see business ads

-- 1. Check if business_ads table exists and has RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'business_ads';

-- 2. Check current policies on business_ads
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'business_ads'
ORDER BY cmd;

-- 3. Enable RLS on business_ads if not already enabled
ALTER TABLE public.business_ads ENABLE ROW LEVEL SECURITY;

-- 4. Add SELECT policy for business_ads so couriers can see ads
-- Check if policy exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_ads' 
        AND policyname = 'business_ads_select_all'
    ) THEN
        CREATE POLICY "business_ads_select_all" ON public.business_ads
            FOR SELECT 
            TO anon, authenticated
            USING (true);
        RAISE NOTICE 'Created SELECT policy for business_ads';
    ELSE
        RAISE NOTICE 'SELECT policy already exists for business_ads';
    END IF;
END $$;

-- 5. Add INSERT policy so businesses can create their own ads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_ads' 
        AND policyname = 'business_ads_insert_own'
    ) THEN
        CREATE POLICY "business_ads_insert_own" ON public.business_ads
            FOR INSERT 
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created INSERT policy for business_ads';
    ELSE
        RAISE NOTICE 'INSERT policy already exists for business_ads';
    END IF;
END $$;

-- 6. Add UPDATE policy so businesses can update their own ads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_ads' 
        AND policyname = 'business_ads_update_own'
    ) THEN
        CREATE POLICY "business_ads_update_own" ON public.business_ads
            FOR UPDATE 
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created UPDATE policy for business_ads';
    ELSE
        RAISE NOTICE 'UPDATE policy already exists for business_ads';
    END IF;
END $$;

-- 7. Add DELETE policy so businesses can delete their own ads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_ads' 
        AND policyname = 'business_ads_delete_own'
    ) THEN
        CREATE POLICY "business_ads_delete_own" ON public.business_ads
            FOR DELETE 
            TO authenticated
            USING (auth.uid() = user_id);
        RAISE NOTICE 'Created DELETE policy for business_ads';
    ELSE
        RAISE NOTICE 'DELETE policy already exists for business_ads';
    END IF;
END $$;

-- 8. Test if we can select from business_ads
SELECT 
    id,
    title,
    description,
    province,
    district,
    working_type,
    created_at,
    image_url
FROM public.business_ads 
ORDER BY created_at DESC
LIMIT 5;

-- 9. Verify all policies were created
SELECT 
    'business_ads' as table_name,
    policyname, 
    cmd
FROM pg_policies 
WHERE tablename = 'business_ads'
ORDER BY cmd, policyname;