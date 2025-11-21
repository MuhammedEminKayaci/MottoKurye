-- Database Updates for KuryeApp - New Fields
-- Run these commands in Supabase SQL Editor

-- 1. ADD NEW COLUMN TO COURIERS TABLE
-- Add motorcycle brand field and cover photo
ALTER TABLE couriers ADD COLUMN IF NOT EXISTS moto_brand TEXT;
ALTER TABLE couriers ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- 2. ADD NEW COLUMNS TO BUSINESSES TABLE  
-- Add working days, service areas and cover photo
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS working_days TEXT[];
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS service_province TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS service_district TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- 3. ADD IMAGE COLUMN TO BUSINESS_ADS TABLE
-- Add image support for business ads
ALTER TABLE business_ads ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. UPDATE INDEXES FOR BETTER PERFORMANCE (OPTIONAL)
-- Create indexes for new searchable fields
CREATE INDEX IF NOT EXISTS couriers_moto_brand_idx ON couriers(moto_brand);
CREATE INDEX IF NOT EXISTS businesses_service_province_idx ON businesses(service_province);
CREATE INDEX IF NOT EXISTS businesses_service_district_idx ON businesses(service_district);
CREATE INDEX IF NOT EXISTS businesses_working_days_idx ON businesses USING GIN(working_days);
CREATE INDEX IF NOT EXISTS business_ads_image_idx ON business_ads(image_url);

-- 4. UPDATE PUBLIC VIEW FOR COURIERS (IF EXISTS)
-- Drop and recreate the view to include new fields
DROP VIEW IF EXISTS couriers_public;

CREATE VIEW couriers_public AS
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
  FROM couriers;

-- Grant permissions to the updated view
GRANT SELECT ON couriers_public TO anon, authenticated;

-- 5. UPDATE RLS POLICIES FOR NEW FIELDS
-- Ensure new fields can be updated by the owner

-- For couriers table - allow updates for cover_photo_url and moto_brand
-- First check if policies exist, if not create them
DO $$
BEGIN
    -- Check if update policy exists for couriers
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'couriers' 
        AND policyname LIKE '%update%'
    ) THEN
        CREATE POLICY "Users can update own courier profile" ON couriers
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Check if update policy exists for businesses
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'businesses' 
        AND policyname LIKE '%update%'
    ) THEN
        CREATE POLICY "Users can update own business profile" ON businesses
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. VERIFY CHANGES
-- Check if columns were added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'couriers' 
  AND column_name IN ('moto_brand', 'cover_photo_url');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND column_name IN ('working_days', 'service_province', 'service_district', 'cover_photo_url');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_ads' 
  AND column_name IN ('image_url');

-- 8. VERIFY RLS POLICIES
-- Check if update policies exist
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename IN ('couriers', 'businesses')
  AND cmd = 'UPDATE';

-- 6. SAMPLE DATA VERIFICATION (OPTIONAL)
-- Test if the new fields work correctly
-- INSERT INTO couriers (user_id, first_name, last_name, moto_brand, cover_photo_url) 
-- VALUES ('test-uuid', 'Test', 'User', 'Yamaha', 'https://example.com/cover.jpg');

-- INSERT INTO businesses (user_id, business_name, working_days, service_province, service_district, cover_photo_url) 
-- VALUES ('test-uuid-2', 'Test Business', ARRAY['Pazartesi', 'Salı'], 'İstanbul', 'Kadıköy', 'https://example.com/cover.jpg');

-- INSERT INTO business_ads (user_id, title, description, image_url) 
-- VALUES ('test-uuid-2', 'Test Ad', 'Test Description', 'https://example.com/ad.jpg');