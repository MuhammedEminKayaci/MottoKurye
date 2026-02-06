-- Sohbet ve Mesaj Silme Politikaları
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Conversations tablosu için DELETE politikası
-- Kullanıcılar kendi dahil oldukları sohbetleri silebilir
CREATE POLICY "Users can delete their conversations"
  ON conversations
  FOR DELETE
  USING (
    auth.uid() = business_id OR auth.uid() = courier_id
  );

-- 2. Messages tablosu için DELETE politikası
-- Kullanıcılar dahil oldukları sohbetlerdeki mesajları silebilir
CREATE POLICY "Users can delete messages in their conversations"
  ON messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())
    )
  );

-- Eğer politikalar zaten varsa ve hata alıyorsanız, önce mevcut olanları silin:
-- DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;
-- DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;
