-- =====================================================
-- contact_preference kolonunu tablolara ekleme veya güncelleme
-- =====================================================

-- Eğer kolon YOKSA ekle (ilk kurulum için):
-- ALTER TABLE couriers 
-- ADD COLUMN contact_preference TEXT DEFAULT 'phone' CHECK (contact_preference IN ('phone', 'in_app', 'both'));

-- ALTER TABLE businesses
-- ADD COLUMN contact_preference TEXT DEFAULT 'phone' CHECK (contact_preference IN ('phone', 'in_app', 'both'));

-- =====================================================
-- Eğer kolon VARSA ve sadece constraint güncellenmesi gerekiyorsa:
-- (mevcut 'phone' | 'in_app' → 'phone' | 'in_app' | 'both')
-- =====================================================

-- Couriers tablosu için constraint güncelleme
ALTER TABLE couriers DROP CONSTRAINT IF EXISTS couriers_contact_preference_check;
ALTER TABLE couriers ADD CONSTRAINT couriers_contact_preference_check CHECK (contact_preference IN ('phone', 'in_app', 'both'));

-- Businesses tablosu için constraint güncelleme
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_contact_preference_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_contact_preference_check CHECK (contact_preference IN ('phone', 'in_app', 'both'));

-- Index'ler (zaten varsa hata vermez)
CREATE INDEX IF NOT EXISTS idx_couriers_contact_preference ON couriers(contact_preference);
CREATE INDEX IF NOT EXISTS idx_businesses_contact_preference ON businesses(contact_preference);
