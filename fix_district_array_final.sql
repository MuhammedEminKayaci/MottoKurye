-- Robust script to update district column to array type
-- Run this in Supabase SQL Editor

-- 0. Drop dependent views first (they depend on district columns)
DROP VIEW IF EXISTS public.couriers_public CASCADE;
DROP VIEW IF EXISTS public.businesses_public CASCADE;

DO $$
BEGIN
    -- 1. Drop indexes if they exist (using pg_class to be safe)
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_couriers_district' AND n.nspname = 'public') THEN
        DROP INDEX idx_couriers_district;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_businesses_district' AND n.nspname = 'public') THEN
        DROP INDEX idx_businesses_district;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_business_ads_district' AND n.nspname = 'public') THEN
        DROP INDEX idx_business_ads_district;
    END IF;

    -- 2. Update couriers table if district is not already an array
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'couriers' AND column_name = 'district' AND data_type = 'text') THEN
        ALTER TABLE couriers ALTER COLUMN district TYPE TEXT[] USING string_to_array(district, ',');
    END IF;

    -- 3. Update businesses table if district is not already an array
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'district' AND data_type = 'text') THEN
        ALTER TABLE businesses ALTER COLUMN district TYPE TEXT[] USING string_to_array(district, ',');
    END IF;

    -- 4. Update business_ads table if district is not already an array
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_ads' AND column_name = 'district' AND data_type = 'text') THEN
        ALTER TABLE business_ads ALTER COLUMN district TYPE TEXT[] USING string_to_array(district, ',');
    END IF;
END $$;

-- 5. Re-create indexes
CREATE INDEX IF NOT EXISTS idx_couriers_district ON couriers USING GIN (district);
CREATE INDEX IF NOT EXISTS idx_businesses_district ON businesses USING GIN (district);
CREATE INDEX IF NOT EXISTS idx_business_ads_district ON business_ads USING GIN (district);

-- 6. Re-create views (only existing columns)
CREATE VIEW public.couriers_public AS
SELECT 
    id,
    user_id,
    role,
    first_name,
    last_name,
    age,
    gender,
    nationality,
    phone,
    experience,
    province,
    district,
    working_type,
    earning_model,
    working_days,
    daily_package_estimate,
    license_type,
    has_motorcycle,
    moto_brand,
    moto_cc,
    has_bag,
    avatar_url,
    created_at
FROM public.couriers;

CREATE VIEW public.businesses_public AS
SELECT
    id,
    user_id,
    role,
    business_name,
    business_sector,
    manager_name,
    manager_contact,
    province,
    district,
    working_type,
    earning_model,
    working_days,
    daily_package_estimate,
    avatar_url,
    created_at
FROM public.businesses;

-- 7. Grant permissions
GRANT SELECT ON public.couriers_public TO anon;
GRANT SELECT ON public.couriers_public TO authenticated;
GRANT SELECT ON public.businesses_public TO anon;
GRANT SELECT ON public.businesses_public TO authenticated;
