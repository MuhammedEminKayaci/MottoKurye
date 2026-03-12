-- Sistem ayarları tablosu
-- Admin panelinden yönetilebilen uygulama ayarları
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- E-posta doğrulama varsayılan olarak açık
INSERT INTO system_settings (key, value, description)
VALUES ('email_verification_enabled', 'true', 'Kayıt sırasında e-posta doğrulama zorunluluğu')
ON CONFLICT (key) DO NOTHING;

-- RLS: Sadece authenticated kullanıcılar okuyabilir, yazma yok (admin service role ile yazar)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes ayarları okuyabilir" ON system_settings
  FOR SELECT USING (true);
