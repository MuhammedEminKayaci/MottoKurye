-- ============================================================
-- Performance Indexes Migration
-- Tüm sık sorgulanan sütunlara index ekler
-- ============================================================

-- COURIERS
CREATE INDEX IF NOT EXISTS idx_couriers_user_id ON public.couriers(user_id);
CREATE INDEX IF NOT EXISTS idx_couriers_phone ON public.couriers(phone);
CREATE INDEX IF NOT EXISTS idx_couriers_province ON public.couriers(province);
CREATE INDEX IF NOT EXISTS idx_couriers_accepting_created ON public.couriers(is_accepting_offers, created_at DESC);

-- BUSINESSES
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_manager_contact ON public.businesses(manager_contact);
CREATE INDEX IF NOT EXISTS idx_businesses_province ON public.businesses(province);
CREATE INDEX IF NOT EXISTS idx_businesses_plan ON public.businesses(plan);

-- CONVERSATIONS
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON public.conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_courier_id ON public.conversations(courier_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- MESSAGES (composite indexes for chat queries)
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conv_unread ON public.messages(conversation_id, is_read, sender_id);

-- BUSINESS_ADS
CREATE INDEX IF NOT EXISTS idx_business_ads_user_id ON public.business_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_business_ads_created_at ON public.business_ads(created_at DESC);

-- BUG_REPORTS
CREATE INDEX IF NOT EXISTS idx_bug_reports_status_created ON public.bug_reports(status, created_at DESC);
