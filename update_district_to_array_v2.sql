-- Change district column to array type for couriers, businesses and business_ads
-- First, drop existing indexes on district columns as they might be btree
DROP INDEX IF EXISTS idx_couriers_district;
DROP INDEX IF EXISTS idx_businesses_district;
DROP INDEX IF EXISTS idx_business_ads_district;

-- Alter couriers table
ALTER TABLE couriers 
  ALTER COLUMN district TYPE TEXT[] USING CASE 
    WHEN district IS NULL THEN ARRAY[]::TEXT[]
    WHEN district = '' THEN ARRAY[]::TEXT[]
    ELSE string_to_array(district, ',') -- In case some data is already comma separated string
  END;

-- Alter businesses table
ALTER TABLE businesses 
  ALTER COLUMN district TYPE TEXT[] USING CASE 
    WHEN district IS NULL THEN ARRAY[]::TEXT[]
    WHEN district = '' THEN ARRAY[]::TEXT[]
    ELSE string_to_array(district, ',')
  END;

-- Alter business_ads table
ALTER TABLE business_ads 
  ALTER COLUMN district TYPE TEXT[] USING CASE 
    WHEN district IS NULL THEN ARRAY[]::TEXT[]
    WHEN district = '' THEN ARRAY[]::TEXT[]
    ELSE string_to_array(district, ',')
  END;

-- Re-create indexes using GIN for array support
CREATE INDEX idx_couriers_district ON couriers USING GIN (district);
CREATE INDEX idx_businesses_district ON businesses USING GIN (district);
CREATE INDEX idx_business_ads_district ON business_ads USING GIN (district);
