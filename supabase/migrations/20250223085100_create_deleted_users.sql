-- ============================================================
-- deleted_users tablosu
-- Hesabını silen kullanıcıların verilerini arşivlemek için
-- Supabase Dashboard → SQL Editor'da çalıştırılmalıdır
-- ============================================================

CREATE TABLE IF NOT EXISTS deleted_users (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Auth bilgileri
  user_id         UUID NOT NULL,                          -- Orijinal auth user id
  email           TEXT,                                    -- Auth email
  role            TEXT NOT NULL CHECK (role IN ('kurye', 'isletme')),

  -- Ortak alanlar
  phone           TEXT,
  contact_preference TEXT,
  province        TEXT,
  district        JSONB,
  working_type    TEXT,
  earning_model   TEXT,
  working_days    JSONB,
  daily_package_estimate TEXT,
  avatar_url      TEXT,

  -- Kurye-spesifik alanlar
  first_name      TEXT,
  last_name       TEXT,
  age             INTEGER,
  gender          TEXT,
  nationality     TEXT,
  experience      TEXT,
  license_type    TEXT,
  has_motorcycle  TEXT,
  moto_brand      TEXT,
  moto_cc         TEXT,
  has_bag         TEXT,
  p1_certificate  TEXT,
  src_certificate TEXT,
  criminal_record TEXT,
  p1_certificate_file_url  TEXT,
  src_certificate_file_url TEXT,
  criminal_record_file_url TEXT,

  -- İşletme-spesifik alanlar
  business_name   TEXT,
  business_sector TEXT,
  manager_name    TEXT,
  manager_contact TEXT,

  -- Onay bilgileri
  accept_terms      BOOLEAN,
  accept_privacy    BOOLEAN,
  accept_kvkk       BOOLEAN,
  accept_commercial BOOLEAN,

  -- Plan bilgileri (işletme)
  plan              TEXT,
  plan_expires_at   TIMESTAMPTZ,

  -- Profil görünürlük durumu
  is_visible        BOOLEAN,

  -- Orijinal kayıt tarihi
  original_created_at TIMESTAMPTZ,

  -- Silme meta verileri
  deleted_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deletion_reason  TEXT,                                   -- Gelecekte kullanıcıdan neden sorulabilir
  deleted_by_ip    TEXT                                    -- KVKK uyumu için
);

-- Performans için indexler
CREATE INDEX idx_deleted_users_user_id    ON deleted_users (user_id);
CREATE INDEX idx_deleted_users_email      ON deleted_users (email);
CREATE INDEX idx_deleted_users_role       ON deleted_users (role);
CREATE INDEX idx_deleted_users_deleted_at ON deleted_users (deleted_at);

-- RLS (Row Level Security) — Sadece service_role erişebilir
ALTER TABLE deleted_users ENABLE ROW LEVEL SECURITY;

-- Hiçbir normal kullanıcı bu tabloya erişemesin
-- Sadece service_role key ile erişilebilir
CREATE POLICY "Service role only - select" ON deleted_users
  FOR SELECT USING (false);

CREATE POLICY "Service role only - insert" ON deleted_users
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Service role only - update" ON deleted_users
  FOR UPDATE USING (false);

CREATE POLICY "Service role only - delete" ON deleted_users
  FOR DELETE USING (false);

-- Tablo açıklaması
COMMENT ON TABLE deleted_users IS 'Hesabını silen kullanıcıların arşiv tablosu. KVKK uyumu için saklanır.';
COMMENT ON COLUMN deleted_users.user_id IS 'Orijinal auth.users tablosundaki UUID';
COMMENT ON COLUMN deleted_users.deleted_at IS 'Hesabın silinme tarihi';
COMMENT ON COLUMN deleted_users.original_created_at IS 'Kullanıcının ilk kayıt tarihi';
