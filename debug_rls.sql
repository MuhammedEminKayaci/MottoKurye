-- Debug RLS Policy Issues for Cover Photo Upload
-- Let's find exactly where the problem is

-- 1. Check current user authentication
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 2. Check if user exists in couriers table
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    avatar_url,
    cover_photo_url
FROM public.couriers 
WHERE user_id = auth.uid()
LIMIT 1;

-- 3. Check if user exists in businesses table  
SELECT 
    id,
    user_id,
    business_name,
    avatar_url,
    cover_photo_url
FROM public.businesses 
WHERE user_id = auth.uid()
LIMIT 1;

-- 4. Test UPDATE permission for couriers
DO $$
DECLARE 
    user_uuid UUID := auth.uid();
    courier_record RECORD;
BEGIN
    -- Check if user has courier profile
    SELECT * INTO courier_record FROM public.couriers WHERE user_id = user_uuid;
    
    IF FOUND THEN
        RAISE NOTICE 'User has courier profile with ID: %', courier_record.id;
        
        -- Try to update cover_photo_url
        UPDATE public.couriers 
        SET cover_photo_url = 'test-cover-url' 
        WHERE user_id = user_uuid;
        
        RAISE NOTICE 'Courier cover photo update successful';
    ELSE
        RAISE NOTICE 'User does not have courier profile';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR updating courier: %', SQLERRM;
END $$;

-- 5. Test UPDATE permission for businesses
DO $$
DECLARE 
    user_uuid UUID := auth.uid();
    business_record RECORD;
BEGIN
    -- Check if user has business profile
    SELECT * INTO business_record FROM public.businesses WHERE user_id = user_uuid;
    
    IF FOUND THEN
        RAISE NOTICE 'User has business profile with ID: %', business_record.id;
        
        -- Try to update cover_photo_url
        UPDATE public.businesses 
        SET cover_photo_url = 'test-cover-url' 
        WHERE user_id = user_uuid;
        
        RAISE NOTICE 'Business cover photo update successful';
    ELSE
        RAISE NOTICE 'User does not have business profile';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR updating business: %', SQLERRM;
END $$;

-- 6. Check exact RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('couriers', 'businesses')
ORDER BY tablename, cmd;

-- 7. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('couriers', 'businesses');