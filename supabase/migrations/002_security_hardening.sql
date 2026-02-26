-- ============================================================
-- MOTTO KURYE - GÜVENLİK SERTLEŞTIRME MİGRASYONU
-- Penetrasyon testi bulgularına göre kapsamlı düzeltmeler
-- Tarih: 2026-02-26
-- ============================================================

-- ============================================================
-- 1. COURIERS TABLOSU - RLS POLİTİKALARI DÜZELTMESİ
-- Sorun: "Kuryeler herkese açık" politikası anon dahil herkese
--        tüm kurye verilerini açıyor
-- ============================================================

-- Mevcut tehlikeli politikaları kaldır
DROP POLICY IF EXISTS "Kuryeler herkese açık" ON public.couriers;
DROP POLICY IF EXISTS "Users can update own courier profile" ON public.couriers;

-- Sadece GİRİŞ YAPMIŞ kullanıcılar kurye listesini görebilir
-- (is_visible false ise sadece profil sahibi görebilir)
CREATE POLICY "couriers_select_authenticated"
  ON public.couriers FOR SELECT
  TO authenticated
  USING (
    is_accepting_offers = true
    OR auth.uid() = user_id
  );

-- Mevcut INSERT/UPDATE/DELETE politikalarını güçlendir (public -> authenticated)
DROP POLICY IF EXISTS "Kullanıcı kendi kurye kaydını oluşturabilir" ON public.couriers;
CREATE POLICY "couriers_insert_own"
  ON public.couriers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi kurye kaydını güncelleyebilir" ON public.couriers;
CREATE POLICY "couriers_update_own"
  ON public.couriers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi kurye kaydını silebilir" ON public.couriers;
CREATE POLICY "couriers_delete_own"
  ON public.couriers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- 2. BUSINESSES TABLOSU - RLS POLİTİKALARI DÜZELTMESİ
-- Sorun: "İşletmeler herkese açık" politikası aynı sorun
-- ============================================================

DROP POLICY IF EXISTS "İşletmeler herkese açık" ON public.businesses;
DROP POLICY IF EXISTS "Users can update own business profile" ON public.businesses;

-- Sadece GİRİŞ YAPMIŞ kullanıcılar işletmeleri görebilir
CREATE POLICY "businesses_select_authenticated"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (
    is_visible = true
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Kullanıcı kendi işletme kaydını oluşturabilir" ON public.businesses;
CREATE POLICY "businesses_insert_own"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi işletme kaydını güncelleyebilir" ON public.businesses;
CREATE POLICY "businesses_update_own"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi işletme kaydını silebilir" ON public.businesses;
CREATE POLICY "businesses_delete_own"
  ON public.businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- 3. BUSINESS_ADS TABLOSU - REDUNDANT POLİTİKALAR TEMİZLİĞİ
-- Sorun: Public role'e gereksiz erişim verilmiş
-- ============================================================

-- Tehlikeli public role politikalarını kaldır
DROP POLICY IF EXISTS "business_ads_select_all" ON public.business_ads;
DROP POLICY IF EXISTS "business_ads_insert_owner" ON public.business_ads;
DROP POLICY IF EXISTS "business_ads_update_owner" ON public.business_ads;
DROP POLICY IF EXISTS "business_ads_delete_owner" ON public.business_ads;

-- Sadece authenticated kullanıcılar ilanları görebilir
CREATE POLICY "business_ads_select_authenticated"
  ON public.business_ads FOR SELECT
  TO authenticated
  USING (true);


-- ============================================================
-- 4. CONVERSATIONS TABLOSU - Public -> Authenticated
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "conversations_select_own"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = business_id OR auth.uid() = courier_id);

DROP POLICY IF EXISTS "Users can create conversations they are part of" ON public.conversations;
CREATE POLICY "conversations_insert_own"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = business_id OR auth.uid() = courier_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "conversations_update_own"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = business_id OR auth.uid() = courier_id);

DROP POLICY IF EXISTS "Users can delete their conversations" ON public.conversations;
CREATE POLICY "conversations_delete_own"
  ON public.conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = business_id OR auth.uid() = courier_id);


-- ============================================================
-- 5. MESSAGES TABLOSU - Public -> Authenticated
-- ============================================================

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;
CREATE POLICY "messages_delete_own"
  ON public.messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())
    )
  );


-- ============================================================
-- 6. MESSAGE_REQUESTS TABLOSU - RLS AKTİF ET
-- ============================================================

ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_requests_select_own"
  ON public.message_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "message_requests_insert_own"
  ON public.message_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "message_requests_update_own"
  ON public.message_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "message_requests_delete_own"
  ON public.message_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);


-- ============================================================
-- 7. BACKUP TABLOLARI - RLS AKTİF ET (erişim tamamen kapalı)
-- ============================================================

ALTER TABLE public.conversations_v1_backup ENABLE ROW LEVEL SECURITY;
-- Hiçbir policy eklenmez = hiç kimse erişemez (sadece service_role)

ALTER TABLE public.messages_v1_backup ENABLE ROW LEVEL SECURITY;
-- Hiçbir policy eklenmez = hiç kimse erişemez (sadece service_role)


-- ============================================================
-- 8. DELETED_USERS TABLOSU - Public -> Service Role Only (güçlendir)
-- ============================================================

-- Mevcut politikaları kaldır ve daha güvenli olanlarla değiştir
DROP POLICY IF EXISTS "Service role only - select" ON public.deleted_users;
DROP POLICY IF EXISTS "Service role only - insert" ON public.deleted_users;
DROP POLICY IF EXISTS "Service role only - update" ON public.deleted_users;
DROP POLICY IF EXISTS "Service role only - delete" ON public.deleted_users;

-- Kimse erişemesin (sadece service_role RLS'yi bypass eder)
-- Hiçbir policy = anon ve authenticated erişemez


-- ============================================================
-- 9. SUBSCRIPTION_PLANS - Sadece authenticated okuyabilsin
-- ============================================================

DROP POLICY IF EXISTS "Anyone can read plans" ON public.subscription_plans;
CREATE POLICY "plans_select_authenticated"
  ON public.subscription_plans FOR SELECT
  TO authenticated
  USING (true);


-- ============================================================
-- 10. ANON ROLE İÇİN TABLO ERİŞİMLERİNİ KISITLA
-- Bu, RLS'yi destekleyici ek bir güvenlik katmanı
-- ============================================================

REVOKE ALL ON public.couriers FROM anon;
REVOKE ALL ON public.businesses FROM anon;
REVOKE ALL ON public.business_ads FROM anon;
REVOKE ALL ON public.conversations FROM anon;
REVOKE ALL ON public.messages FROM anon;
REVOKE ALL ON public.message_requests FROM anon;
REVOKE ALL ON public.deleted_users FROM anon;
REVOKE ALL ON public.conversations_v1_backup FROM anon;
REVOKE ALL ON public.messages_v1_backup FROM anon;

-- Anon sadece subscription_plans'ı okuyabilsin (fiyatlandırma sayfası için)
-- Aslında bu da authenticated olmalı, ama login öncesi fiyat göstermek istiyorsanız:
GRANT SELECT ON public.subscription_plans TO anon;

-- Authenticated kullanıcılara gerekli erişimleri ver
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couriers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_ads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_requests TO authenticated;
GRANT SELECT ON public.subscription_plans TO authenticated;


-- ============================================================
-- 11. STORAGE: DOCUMENTS BUCKET'I PRİVATE YAP
-- (Bu SQL ile yapılamaz, API ile yapılacak)
-- ============================================================

-- Storage RLS politikası - sadece belge sahibi erişebilsin
-- Bu, storage.objects tablosuna uygulanır

-- Mevcut storage politikalarını kontrol et ve güncelle
DO $$
BEGIN
  -- documents bucket için storage policy - sadece sahip okuyabilir
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'documents_select_owner'
  ) THEN
    CREATE POLICY "documents_select_owner"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- documents bucket - sahip yükleyebilir
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'documents_insert_owner'
  ) THEN
    CREATE POLICY "documents_insert_owner"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'documents'
        AND auth.uid()::text = split_part(name, '_', 2)
      );
  END IF;
END
$$;


-- ============================================================
-- MİGRASYON TAMAMLANDI
-- ============================================================
