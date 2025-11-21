-- Eski tabloları ve bağımlılıklarını tamamen kaldır
DROP VIEW IF EXISTS couriers_public CASCADE;
DROP VIEW IF EXISTS businesses_public CASCADE;
DROP TABLE IF EXISTS couriers CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;

-- KURYE TABLOSU - Temiz başlangıç
CREATE TABLE couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'kurye',
  
  -- Kişisel Bilgiler
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 80),
  gender TEXT NOT NULL CHECK (gender IN ('Erkek', 'Kadın')),
  nationality TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- İş Tecrübesi
  experience TEXT NOT NULL CHECK (experience IN ('0-1', '1-3', '3-5', '5-10', '10+')),
  
  -- Çalışma Koşulları
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  working_type TEXT NOT NULL CHECK (working_type IN ('Full Time', 'Part Time')),
  earning_model TEXT NOT NULL CHECK (earning_model IN ('Saat+Paket Başı', 'Paket Başı', 'Aylık Sabit')),
  working_days TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  daily_package_estimate TEXT NOT NULL CHECK (daily_package_estimate IN ('0-15 PAKET', '15-25 PAKET', '25-40 PAKET', '40 VE ÜZERİ')),
  
  -- Motorsiklet Bilgileri
  license_type TEXT NOT NULL CHECK (license_type IN ('A1', 'A', 'A2')),
  has_motorcycle TEXT NOT NULL CHECK (has_motorcycle IN ('VAR', 'YOK')),
  moto_brand TEXT,
  moto_cc TEXT,
  has_bag TEXT NOT NULL CHECK (has_bag IN ('VAR', 'YOK')),
  
  -- Diğer
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Her kullanıcı sadece bir kurye kaydı yapabilir
  UNIQUE(user_id)
);

-- İŞLETME TABLOSU - Temiz başlangıç
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'isletme',
  
  -- Firma Bilgileri
  business_name TEXT NOT NULL,
  business_sector TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  manager_contact TEXT NOT NULL,
  
  -- Çalışma Koşulları
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  working_type TEXT NOT NULL CHECK (working_type IN ('Full Time', 'Part Time')),
  earning_model TEXT NOT NULL CHECK (earning_model IN ('Saat+Paket Başı', 'Paket Başı', 'Aylık Sabit')),
  working_days TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  daily_package_estimate TEXT NOT NULL CHECK (daily_package_estimate IN ('0-15 PAKET', '15-25 PAKET', '25-40 PAKET', '40 VE ÜZERİ')),
  
  -- Diğer
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Her kullanıcı sadece bir işletme kaydı yapabilir
  UNIQUE(user_id)
);

-- İndeksler (performans için)
CREATE INDEX idx_couriers_user_id ON couriers(user_id);
CREATE INDEX idx_couriers_province ON couriers(province);
CREATE INDEX idx_couriers_district ON couriers(district);
CREATE INDEX idx_couriers_working_type ON couriers(working_type);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_province ON businesses(province);
CREATE INDEX idx_businesses_district ON businesses(district);
CREATE INDEX idx_businesses_sector ON businesses(business_sector);

-- RLS (Row Level Security) Politikaları
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- KURYE RLS POLİTİKALARI

-- Herkes okuyabilir (iş ilanları için)
CREATE POLICY "Kuryeler herkese açık"
  ON couriers
  FOR SELECT
  USING (true);

-- Sadece kendi kaydını oluşturabilir
CREATE POLICY "Kullanıcı kendi kurye kaydını oluşturabilir"
  ON couriers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sadece kendi kaydını güncelleyebilir
CREATE POLICY "Kullanıcı kendi kurye kaydını güncelleyebilir"
  ON couriers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sadece kendi kaydını silebilir
CREATE POLICY "Kullanıcı kendi kurye kaydını silebilir"
  ON couriers
  FOR DELETE
  USING (auth.uid() = user_id);

-- İŞLETME RLS POLİTİKALARI

-- Herkes okuyabilir (iş arayanlar için)
CREATE POLICY "İşletmeler herkese açık"
  ON businesses
  FOR SELECT
  USING (true);

-- Sadece kendi kaydını oluşturabilir
CREATE POLICY "Kullanıcı kendi işletme kaydını oluşturabilir"
  ON businesses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sadece kendi kaydını güncelleyebilir
CREATE POLICY "Kullanıcı kendi işletme kaydını güncelleyebilir"
  ON businesses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sadece kendi kaydını silebilir
CREATE POLICY "Kullanıcı kendi işletme kaydını silebilir"
  ON businesses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public View'ler (opsiyonel - ihtiyaç varsa)
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

-- View'ler için de RLS aktif et
ALTER VIEW couriers_public SET (security_invoker = true);
ALTER VIEW businesses_public SET (security_invoker = true);

-- Yorumlar
COMMENT ON TABLE couriers IS 'Kurye kayıtları';
COMMENT ON TABLE businesses IS 'İşletme kayıtları';

COMMENT ON COLUMN couriers.age IS 'Kuryenin yaşı (18-80 arası)';
COMMENT ON COLUMN couriers.experience IS 'İş tecrübesi süresi';
COMMENT ON COLUMN couriers.earning_model IS 'Tercih edilen kazanç modeli';
COMMENT ON COLUMN couriers.daily_package_estimate IS 'Günlük tahmini paket sayısı';
COMMENT ON COLUMN couriers.has_motorcycle IS 'Motorsiklet sahipliği durumu';
COMMENT ON COLUMN couriers.has_bag IS 'Taşıma çantası sahipliği durumu';

COMMENT ON COLUMN businesses.business_sector IS 'Firmanın faaliyet gösterdiği sektör';
COMMENT ON COLUMN businesses.manager_name IS 'Yetkili kişinin adı soyadı';
COMMENT ON COLUMN businesses.manager_contact IS 'Yetkili kişinin iletişim bilgisi';
COMMENT ON COLUMN businesses.earning_model IS 'Tercih edilen kazanç modeli';
COMMENT ON COLUMN businesses.daily_package_estimate IS 'Günlük tahmini paket sayısı';
