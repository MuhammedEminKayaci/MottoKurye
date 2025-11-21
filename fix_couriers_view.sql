-- Fix couriers_public view and RLS issues
-- This will solve both the courier listing and cover photo upload problems

-- 1. Drop existing view if it exists
DROP VIEW IF EXISTS public.couriers_public;

-- 2. Create the couriers_public view with all necessary fields
CREATE VIEW public.couriers_public AS
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    avatar_url,
    phone,
    province,
    district,
    license_type,
    working_type,
    working_hours,
    moto_brand,
    moto_model,
    moto_cc,
    cover_photo_url,
    created_at
FROM public.couriers;

-- 3. Grant proper permissions to the view
GRANT SELECT ON public.couriers_public TO anon;
GRANT SELECT ON public.couriers_public TO authenticated;

-- 4. Views inherit RLS from underlying tables automatically
-- No need to set RLS policies on views, they use the base table's policies

-- 6. Verify the view was created successfully
SELECT 
    table_name,
    table_type 
FROM information_schema.tables 
WHERE table_name = 'couriers_public';

-- 7. Test selecting from the view
SELECT COUNT(*) as courier_count FROM public.couriers_public;

-- 8. Check if we can see specific courier fields
SELECT 
    id,
    first_name,
    last_name,
    province,
    district,
    working_type,
    moto_brand
FROM public.couriers_public 
LIMIT 3;