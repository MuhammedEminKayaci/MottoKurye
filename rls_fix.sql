-- Emergency RLS Policy Fix for Cover Photo Upload
-- Run this FIRST if you're getting "violates row-level security policy" error

-- 1. Check current policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('couriers', 'businesses');

-- 2. Add missing UPDATE policies if they don't exist
-- For couriers table
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'couriers' AND cmd = 'UPDATE') THEN
        CREATE POLICY "couriers_update_policy" ON public.couriers
            FOR UPDATE 
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created UPDATE policy for couriers table';
    ELSE
        RAISE NOTICE 'UPDATE policy already exists for couriers table';
    END IF;
END $$;

-- For businesses table  
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'businesses' AND cmd = 'UPDATE') THEN
        CREATE POLICY "businesses_update_policy" ON public.businesses
            FOR UPDATE 
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created UPDATE policy for businesses table';
    ELSE
        RAISE NOTICE 'UPDATE policy already exists for businesses table';
    END IF;
END $$;

-- 3. Add the new columns if they don't exist
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- 4. Verify the policies were created
SELECT 'couriers' as table_name, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'couriers'
UNION ALL
SELECT 'businesses' as table_name, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'businesses'
ORDER BY table_name, cmd;

-- 5. Test if you can now update (replace 'your-user-id' with actual auth.uid())
-- SELECT auth.uid(); -- Run this first to get your user ID
-- UPDATE couriers SET cover_photo_url = 'test' WHERE user_id = auth.uid();