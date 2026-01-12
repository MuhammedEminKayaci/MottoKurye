-- Add contact_preference column to couriers table
ALTER TABLE couriers 
ADD COLUMN contact_preference TEXT DEFAULT 'phone' CHECK (contact_preference IN ('phone', 'in_app'));

-- Add contact_preference column to businesses table  
ALTER TABLE businesses
ADD COLUMN contact_preference TEXT DEFAULT 'phone' CHECK (contact_preference IN ('phone', 'in_app'));

-- Add index for faster queries
CREATE INDEX idx_couriers_contact_preference ON couriers(contact_preference);
CREATE INDEX idx_businesses_contact_preference ON businesses(contact_preference);
