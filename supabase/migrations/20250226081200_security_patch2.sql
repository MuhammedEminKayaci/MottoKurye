-- ============================================================
-- MOTTO KURYE - GÜVENLİK PATCH #2
-- İlk migration sonrası tespit edilen ek açıkların kapatılması
-- Tarih: 2026-02-26
-- ============================================================

-- ============================================================
-- 1. VIEW'LARDAN ANON ERİŞİMİNİ KALDIR
-- Sorun: couriers_public, businesses_public, business_plan_status
-- view'ları anon role'e açıktı → RLS bypass riski
-- ============================================================

REVOKE ALL ON public.couriers_public FROM anon;
REVOKE ALL ON public.businesses_public FROM anon;
REVOKE ALL ON public.business_plan_status FROM anon;

-- Sadece authenticated kullanıcılar view'lara erişebilsin
GRANT SELECT ON public.couriers_public TO authenticated;
GRANT SELECT ON public.businesses_public TO authenticated;
GRANT SELECT ON public.business_plan_status TO authenticated;


-- ============================================================
-- 2. VIEW'LARI SECURITY INVOKER OLARAK AYARLA
-- Bu, view'ların çağıran kullanıcının yetkileri ile çalışmasını
-- sağlar (RLS bypass'ını engeller)
-- ============================================================

ALTER VIEW public.couriers_public SET (security_invoker = true);
ALTER VIEW public.businesses_public SET (security_invoker = true);
ALTER VIEW public.business_plan_status SET (security_invoker = true);


-- ============================================================
-- 3. ESKİ isletme/kurye TABLOLARI - Public → Authenticated
-- Sorun: Eski tablolarda {public} role ile politikalar vardı
-- ============================================================

REVOKE ALL ON public.isletme FROM anon;
REVOKE ALL ON public.kurye FROM anon;

-- Eski public role politikalarını kaldır
DROP POLICY IF EXISTS "Users can insert their own isletme data" ON public.isletme;
DROP POLICY IF EXISTS "Users can update their own isletme data" ON public.isletme;
DROP POLICY IF EXISTS "Users can view their own isletme data" ON public.isletme;
DROP POLICY IF EXISTS "Users can insert their own kurye data" ON public.kurye;
DROP POLICY IF EXISTS "Users can update their own kurye data" ON public.kurye;
DROP POLICY IF EXISTS "Users can view their own kurye data" ON public.kurye;

-- Yeni authenticated-only politikalar
CREATE POLICY "isletme_select_authenticated"
  ON public.isletme FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "isletme_insert_authenticated"
  ON public.isletme FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "isletme_update_authenticated"
  ON public.isletme FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "kurye_select_authenticated"
  ON public.kurye FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "kurye_insert_authenticated"
  ON public.kurye FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "kurye_update_authenticated"
  ON public.kurye FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.isletme TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.kurye TO authenticated;


-- ============================================================
-- 4. subscription_plans - ANON SADECE SELECT
-- Sorun: Anon'a SELECT yanı sıra DELETE, INSERT, UPDATE vb.
-- yetkiler de verilmişti
-- ============================================================

REVOKE ALL ON public.subscription_plans FROM anon;
GRANT SELECT ON public.subscription_plans TO anon;


-- ============================================================
-- 5. BACKUP/SİSTEM TABLOLARINDAN GEREKSİZ ERİŞİMİ KALDIR
-- ============================================================

REVOKE ALL ON public.conversations_v1_backup FROM authenticated;
REVOKE ALL ON public.messages_v1_backup FROM authenticated;
REVOKE ALL ON public.deleted_users FROM authenticated;


-- ============================================================
-- PATCH #2 TAMAMLANDI
-- ============================================================
