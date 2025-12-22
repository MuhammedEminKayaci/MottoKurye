-- Add missing columns for cover photo and other new fields
-- Since RLS policies already exist, we just need to add the columns

-- 1. Add cover_photo_url columns
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS moto_brand TEXT;
-- Align business_ads with registration filters
ALTER TABLE public.business_ads ADD COLUMN IF NOT EXISTS earning_model TEXT CHECK (earning_model IN ('Saat+Paket Başı','Paket Başı','Aylık Sabit'));
ALTER TABLE public.business_ads ADD COLUMN IF NOT EXISTS working_days TEXT[];
ALTER TABLE public.business_ads ADD COLUMN IF NOT EXISTS daily_package_estimate TEXT CHECK (daily_package_estimate IN ('0-15 PAKET','15-25 PAKET','25-40 PAKET','40 VE ÜZERİ'));
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS service_province TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS service_district TEXT;
ALTER TABLE public.business_ads ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'couriers' 
  AND column_name IN ('cover_photo_url', 'moto_brand')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND column_name IN ('cover_photo_url', 'working_days', 'service_province', 'service_district')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'business_ads' 
  AND column_name = 'image_url';

-- 4. Test your user ID and table access
SELECT auth.uid() as current_user_id;

-- 5. Check if your user exists in the tables
SELECT 'couriers' as table_name, COUNT(*) as user_count 
FROM public.couriers 
WHERE user_id = auth.uid()
UNION ALL
SELECT 'businesses' as table_name, COUNT(*) as user_count 
FROM public.businesses 
WHERE user_id = auth.uid();