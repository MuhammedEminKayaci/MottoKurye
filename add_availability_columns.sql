-- Kuryeler tablosuna is_accepting_offers kolonu ekle
ALTER TABLE couriers 
ADD COLUMN IF NOT EXISTS is_accepting_offers boolean DEFAULT true;

-- İşletmeler tablosuna seeking_couriers kolonu ekle
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS seeking_couriers boolean DEFAULT true;

-- Comment'ler ekle
COMMENT ON COLUMN couriers.is_accepting_offers IS 'Kurye işletmelerden iş teklifi almak istiyor mu';
COMMENT ON COLUMN businesses.seeking_couriers IS 'İşletme kurye arıyor mu';
