-- Kurye tablosunu güncelle
-- Önce view'leri kaldır (bağımlılıkları çözmek için)
DROP VIEW IF EXISTS couriers_public CASCADE;

-- Mevcut sütunları kaldır (eğer varsa)
ALTER TABLE couriers 
DROP COLUMN IF EXISTS birth_year CASCADE,
DROP COLUMN IF EXISTS working_hours CASCADE,
DROP COLUMN IF EXISTS moto_model CASCADE;

-- Yeni sütunları ekle
ALTER TABLE couriers
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS experience TEXT CHECK (experience IN ('0-1', '1-3', '3-5', '5-10', '10+')),
ADD COLUMN IF NOT EXISTS earning_model TEXT CHECK (earning_model IN ('Saat+Paket Başı', 'Paket Başı', 'Aylık Sabit')),
ADD COLUMN IF NOT EXISTS daily_package_estimate TEXT CHECK (daily_package_estimate IN ('0-15 PAKET', '15-25 PAKET', '25-40 PAKET', '40 VE ÜZERİ')),
ADD COLUMN IF NOT EXISTS has_motorcycle TEXT CHECK (has_motorcycle IN ('VAR', 'YOK')),
ADD COLUMN IF NOT EXISTS has_bag TEXT CHECK (has_bag IN ('VAR', 'YOK'));

-- Mevcut sütunları güncelle
-- moto_brand nullable yap
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'couriers' 
    AND column_name = 'moto_brand'
  ) THEN
    EXECUTE 'ALTER TABLE couriers ALTER COLUMN moto_brand DROP NOT NULL';
  END IF;
END $$;

-- moto_cc sütununu direkt olarak sil ve yeniden oluştur (en güvenli yöntem)
ALTER TABLE couriers DROP COLUMN IF EXISTS moto_cc CASCADE;
ALTER TABLE couriers ADD COLUMN IF NOT EXISTS moto_cc TEXT;

-- Gender değerlerini güncelle
-- Önce mevcut veriyi kontrol edip güncelle
UPDATE couriers SET gender = 'Erkek' WHERE gender IN ('erkek', 'male', 'ERKEK');
UPDATE couriers SET gender = 'Kadın' WHERE gender IN ('kadin', 'kadın', 'female', 'KADIN');

-- Eski constraint'i sil
ALTER TABLE couriers
DROP CONSTRAINT IF EXISTS couriers_gender_check;

-- Yeni constraint ekle
ALTER TABLE couriers
ADD CONSTRAINT couriers_gender_check CHECK (gender IN ('Erkek', 'Kadın'));

-- Working type güncellemesi
-- Önce mevcut veriyi kontrol edip güncelle
UPDATE couriers SET working_type = 'Full Time' WHERE working_type IN ('tam', 'full', 'fulltime', 'TAM');
UPDATE couriers SET working_type = 'Part Time' WHERE working_type IN ('yari', 'yarı', 'part', 'parttime', 'YARI', 'serbest');

-- Eski constraint'i sil
ALTER TABLE couriers
DROP CONSTRAINT IF EXISTS couriers_working_type_check;

-- Yeni constraint ekle
ALTER TABLE couriers
ADD CONSTRAINT couriers_working_type_check CHECK (working_type IN ('Full Time', 'Part Time'));

-- İşletme tablosunu güncelle
-- Önce view'leri kaldır (bağımlılıkları çözmek için)
DROP VIEW IF EXISTS businesses_public CASCADE;

-- Mevcut sütunları kaldır
ALTER TABLE businesses
DROP COLUMN IF EXISTS manager_first_name CASCADE,
DROP COLUMN IF EXISTS manager_last_name CASCADE,
DROP COLUMN IF EXISTS phone CASCADE,
DROP COLUMN IF EXISTS address CASCADE,
DROP COLUMN IF EXISTS working_hours CASCADE,
DROP COLUMN IF EXISTS service_province CASCADE,
DROP COLUMN IF EXISTS service_district CASCADE;

-- Yeni sütunları ekle
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS business_sector TEXT,
ADD COLUMN IF NOT EXISTS manager_name TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS manager_contact TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS province TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS district TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS earning_model TEXT CHECK (earning_model IN ('Saat+Paket Başı', 'Paket Başı', 'Aylık Sabit')),
ADD COLUMN IF NOT EXISTS daily_package_estimate TEXT CHECK (daily_package_estimate IN ('0-15 PAKET', '15-25 PAKET', '25-40 PAKET', '40 VE ÜZERİ'));

-- Working type güncellemesi
-- Önce mevcut veriyi kontrol edip güncelle
UPDATE businesses SET working_type = 'Full Time' WHERE working_type IN ('tam', 'full', 'fulltime', 'TAM');
UPDATE businesses SET working_type = 'Part Time' WHERE working_type IN ('yari', 'yarı', 'part', 'parttime', 'YARI', 'serbest');

-- Eski constraint'i sil
ALTER TABLE businesses
DROP CONSTRAINT IF EXISTS businesses_working_type_check;

-- Yeni constraint ekle
ALTER TABLE businesses
ADD CONSTRAINT businesses_working_type_check CHECK (working_type IN ('Full Time', 'Part Time'));

-- Yorumlar
COMMENT ON COLUMN couriers.age IS 'Kuryenin yaşı';
COMMENT ON COLUMN couriers.experience IS 'İş tecrübesi süresi';
COMMENT ON COLUMN couriers.earning_model IS 'Tercih edilen kazanç modeli';
COMMENT ON COLUMN couriers.daily_package_estimate IS 'Günlük tahmini paket sayısı';
COMMENT ON COLUMN couriers.has_motorcycle IS 'Motorsiklet sahipliği';
COMMENT ON COLUMN couriers.has_bag IS 'Taşıma çantası sahipliği';

COMMENT ON COLUMN businesses.business_sector IS 'Firmanın faaliyet gösterdiği sektör';
COMMENT ON COLUMN businesses.manager_name IS 'Yetkili adı soyadı';
COMMENT ON COLUMN businesses.manager_contact IS 'Yetkili iletişim bilgisi';
COMMENT ON COLUMN businesses.province IS 'Çalışılacak il';
COMMENT ON COLUMN businesses.district IS 'Çalışılacak ilçe';
COMMENT ON COLUMN businesses.earning_model IS 'Tercih edilen kazanç modeli';
COMMENT ON COLUMN businesses.daily_package_estimate IS 'Günlük tahmini paket sayısı';

-- View'leri yeniden oluştur (eğer gerekiyorsa)
-- Not: View'lerinizi kendinize göre özelleştirin
CREATE OR REPLACE VIEW couriers_public AS
SELECT 
  id, user_id, role, first_name, last_name, age, gender, 
  nationality, phone, experience, province, district, 
  working_type, earning_model, working_days, daily_package_estimate,
  license_type, has_motorcycle, moto_brand, moto_cc, has_bag,
  avatar_url, created_at
FROM couriers;

CREATE OR REPLACE VIEW businesses_public AS
SELECT 
  id, user_id, role, business_name, business_sector, 
  manager_name, manager_contact, province, district, 
  working_type, earning_model, working_days, daily_package_estimate,
  avatar_url, created_at
FROM businesses;
