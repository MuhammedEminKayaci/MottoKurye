-- Change district column to array type for couriers and businesses
-- First, drop existing indexes on district columns as they might be btree
DROP INDEX IF EXISTS idx_couriers_district;
DROP INDEX IF EXISTS idx_businesses_district;

-- Alter couriers table
ALTER TABLE couriers 
  ALTER COLUMN district TYPE TEXT[] USING CASE 
    WHEN district IS NULL THEN ARRAY[]::TEXT[]
    WHEN district = '' THEN ARRAY[]::TEXT[]
    ELSE ARRAY[district]
  END;

-- Alter businesses table
ALTER TABLE businesses 
  ALTER COLUMN district TYPE TEXT[] USING CASE 
    WHEN district IS NULL THEN ARRAY[]::TEXT[]
    WHEN district = '' THEN ARRAY[]::TEXT[]
    ELSE ARRAY[district]
  END;

-- Re-create indexes using GIN for array support
CREATE INDEX idx_couriers_district ON couriers USING GIN (district);
CREATE INDEX idx_businesses_district ON businesses USING GIN (district);
