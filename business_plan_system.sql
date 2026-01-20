-- =====================================================
-- İŞLETME PLAN SİSTEMİ - VERİTABANI KURULUMU
-- =====================================================

-- 1. businesses tablosuna plan ve hak takibi için yeni alanlar ekle
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS messages_sent_today INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS approvals_today INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP DEFAULT NOW();

-- 2. Plan türlerini tanımlayan tablo (opsiyonel ama önerilir)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    daily_message_limit INTEGER NOT NULL DEFAULT 2,
    daily_approval_limit INTEGER NOT NULL DEFAULT 1,
    can_receive_requests BOOLEAN DEFAULT FALSE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Varsayılan planları ekle
INSERT INTO subscription_plans (name, display_name, price, daily_message_limit, daily_approval_limit, can_receive_requests, description)
VALUES 
    ('free', 'Ücretsiz', 0, 2, 1, FALSE, 'Günlük 2 adet kurye iletişim talebi gönderme, Günlük 1 adet kurye onayı alma'),
    ('standard', 'Standart', 200, 20, 10, FALSE, 'Günlük 20 adet kurye iletişim talebi gönderme, Günlük 10 adet kurye onayı alma'),
    ('premium', 'Premium', 275, 999999, 999999, TRUE, 'Sınırsız iletişim talebi, Sınırsız kurye onayı, Kurye tarafından görüntülenme ve iletişim kurma talebi alma')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    price = EXCLUDED.price,
    daily_message_limit = EXCLUDED.daily_message_limit,
    daily_approval_limit = EXCLUDED.daily_approval_limit,
    can_receive_requests = EXCLUDED.can_receive_requests,
    description = EXCLUDED.description;

-- 4. Günlük kullanım sıfırlama fonksiyonu
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
    UPDATE businesses
    SET 
        messages_sent_today = 0,
        approvals_today = 0,
        last_usage_reset = CURRENT_DATE
    WHERE last_usage_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 5. Mesaj gönderme hakkı kontrol fonksiyonu
CREATE OR REPLACE FUNCTION check_message_limit(business_id_param UUID)
RETURNS TABLE (
    can_send BOOLEAN,
    messages_left INTEGER,
    daily_limit INTEGER,
    current_plan VARCHAR
) AS $$
DECLARE
    business_record RECORD;
    plan_record RECORD;
BEGIN
    -- Önce günlük sıfırlama kontrolü
    UPDATE businesses
    SET 
        messages_sent_today = 0,
        approvals_today = 0,
        last_usage_reset = CURRENT_DATE
    WHERE id = business_id_param AND last_usage_reset < CURRENT_DATE;

    -- İşletme bilgilerini al
    SELECT b.plan, b.messages_sent_today INTO business_record
    FROM businesses b
    WHERE b.id = business_id_param;

    -- Plan limitlerini al
    SELECT sp.daily_message_limit INTO plan_record
    FROM subscription_plans sp
    WHERE sp.name = business_record.plan;

    RETURN QUERY SELECT 
        (business_record.messages_sent_today < plan_record.daily_message_limit) AS can_send,
        (plan_record.daily_message_limit - business_record.messages_sent_today)::INTEGER AS messages_left,
        plan_record.daily_message_limit AS daily_limit,
        business_record.plan AS current_plan;
END;
$$ LANGUAGE plpgsql;

-- 6. Mesaj gönderildiğinde sayacı artır
CREATE OR REPLACE FUNCTION increment_message_count(business_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    limit_check RECORD;
BEGIN
    -- Limit kontrolü
    SELECT * INTO limit_check FROM check_message_limit(business_id_param);
    
    IF limit_check.can_send THEN
        UPDATE businesses
        SET messages_sent_today = messages_sent_today + 1
        WHERE id = business_id_param;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Plan yükseltme fonksiyonu (test amaçlı - ödeme olmadan)
CREATE OR REPLACE FUNCTION upgrade_plan(business_id_param UUID, new_plan VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Plan var mı kontrol et
    IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = new_plan AND is_active = TRUE) THEN
        RETURN FALSE;
    END IF;

    -- Planı güncelle
    UPDATE businesses
    SET 
        plan = new_plan,
        plan_updated_at = NOW(),
        messages_sent_today = 0,
        approvals_today = 0
    WHERE id = business_id_param;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. İşletmenin plan bilgisini ve kalan haklarını getiren view
CREATE OR REPLACE VIEW business_plan_status AS
SELECT 
    b.id AS business_id,
    b.user_id,
    b.business_name,
    b.plan,
    sp.display_name AS plan_display_name,
    sp.price AS plan_price,
    b.messages_sent_today,
    sp.daily_message_limit,
    (sp.daily_message_limit - b.messages_sent_today) AS messages_left,
    b.approvals_today,
    sp.daily_approval_limit,
    (sp.daily_approval_limit - b.approvals_today) AS approvals_left,
    sp.can_receive_requests,
    b.last_usage_reset,
    b.plan_updated_at
FROM businesses b
LEFT JOIN subscription_plans sp ON b.plan = sp.name;

-- 9. RLS (Row Level Security) politikaları
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Herkes planları okuyabilir
CREATE POLICY "Anyone can read plans" ON subscription_plans
    FOR SELECT USING (true);

-- 10. İşletme tablosu için plan alanları RLS güncellemesi
-- (Mevcut RLS politikalarınıza ekleyin)

-- =====================================================
-- KULLANIM ÖRNEKLERİ
-- =====================================================

-- Mesaj limiti kontrolü:
-- SELECT * FROM check_message_limit('business-uuid-here');

-- Mesaj gönderildiğinde:
-- SELECT increment_message_count('business-uuid-here');

-- Plan yükseltme (test):
-- SELECT upgrade_plan('business-uuid-here', 'standard');

-- İşletme plan durumunu görme:
-- SELECT * FROM business_plan_status WHERE business_id = 'business-uuid-here';
