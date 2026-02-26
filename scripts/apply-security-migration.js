// Supabase Güvenlik Sertleştirme - SQL Runner
// Bu script, Management API aracılığıyla SQL migration'ı uygular

const https = require('https');
const { execSync } = require('child_process');

// Token'ı keychain'den al
const encodedToken = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const accessToken = Buffer.from(encodedToken.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

const PROJECT_REF = 'mgjwlfyxfxmfappwputi';

function runSQL(query, label) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${label}`);
          resolve(body);
        } else {
          console.error(`❌ ${label}: ${res.statusCode} - ${body}`);
          reject(new Error(body));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔒 Motto Kurye - Güvenlik Sertleştirme Başlıyor...\n');

  const steps = [
    // ============ STEP 1: COURIERS ============
    {
      label: '[1/15] Couriers - Eski politikaları kaldır',
      sql: `
        DROP POLICY IF EXISTS "Kuryeler herkese açık" ON public.couriers;
        DROP POLICY IF EXISTS "Users can update own courier profile" ON public.couriers;
        DROP POLICY IF EXISTS "Kullanıcı kendi kurye kaydını oluşturabilir" ON public.couriers;
        DROP POLICY IF EXISTS "Kullanıcı kendi kurye kaydını güncelleyebilir" ON public.couriers;
        DROP POLICY IF EXISTS "Kullanıcı kendi kurye kaydını silebilir" ON public.couriers;
      `
    },
    {
      label: '[2/15] Couriers - Yeni güvenli politikaları oluştur',
      sql: `
        CREATE POLICY "couriers_select_authenticated"
          ON public.couriers FOR SELECT TO authenticated
          USING (is_accepting_offers = true OR auth.uid() = user_id);

        CREATE POLICY "couriers_insert_own"
          ON public.couriers FOR INSERT TO authenticated
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "couriers_update_own"
          ON public.couriers FOR UPDATE TO authenticated
          USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "couriers_delete_own"
          ON public.couriers FOR DELETE TO authenticated
          USING (auth.uid() = user_id);
      `
    },

    // ============ STEP 2: BUSINESSES ============
    {
      label: '[3/15] Businesses - Eski politikaları kaldır',
      sql: `
        DROP POLICY IF EXISTS "İşletmeler herkese açık" ON public.businesses;
        DROP POLICY IF EXISTS "Users can update own business profile" ON public.businesses;
        DROP POLICY IF EXISTS "Kullanıcı kendi işletme kaydını oluşturabilir" ON public.businesses;
        DROP POLICY IF EXISTS "Kullanıcı kendi işletme kaydını güncelleyebilir" ON public.businesses;
        DROP POLICY IF EXISTS "Kullanıcı kendi işletme kaydını silebilir" ON public.businesses;
      `
    },
    {
      label: '[4/15] Businesses - Yeni güvenli politikaları oluştur',
      sql: `
        CREATE POLICY "businesses_select_authenticated"
          ON public.businesses FOR SELECT TO authenticated
          USING (is_visible = true OR auth.uid() = user_id);

        CREATE POLICY "businesses_insert_own"
          ON public.businesses FOR INSERT TO authenticated
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "businesses_update_own"
          ON public.businesses FOR UPDATE TO authenticated
          USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "businesses_delete_own"
          ON public.businesses FOR DELETE TO authenticated
          USING (auth.uid() = user_id);
      `
    },

    // ============ STEP 3: BUSINESS_ADS ============
    {
      label: '[5/15] Business Ads - Tehlikeli politikaları kaldır ve güvenli olanı ekle',
      sql: `
        DROP POLICY IF EXISTS "business_ads_select_all" ON public.business_ads;
        DROP POLICY IF EXISTS "business_ads_insert_owner" ON public.business_ads;
        DROP POLICY IF EXISTS "business_ads_update_owner" ON public.business_ads;
        DROP POLICY IF EXISTS "business_ads_delete_owner" ON public.business_ads;

        CREATE POLICY "business_ads_select_authenticated"
          ON public.business_ads FOR SELECT TO authenticated
          USING (true);
      `
    },

    // ============ STEP 4: CONVERSATIONS ============
    {
      label: '[6/15] Conversations - Public politikaları kaldır',
      sql: `
        DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
        DROP POLICY IF EXISTS "Users can create conversations they are part of" ON public.conversations;
        DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
        DROP POLICY IF EXISTS "Users can delete their conversations" ON public.conversations;
      `
    },
    {
      label: '[7/15] Conversations - Authenticated politikaları oluştur',
      sql: `
        CREATE POLICY "conversations_select_own"
          ON public.conversations FOR SELECT TO authenticated
          USING (auth.uid() = business_id OR auth.uid() = courier_id);

        CREATE POLICY "conversations_insert_own"
          ON public.conversations FOR INSERT TO authenticated
          WITH CHECK (auth.uid() = business_id OR auth.uid() = courier_id);

        CREATE POLICY "conversations_update_own"
          ON public.conversations FOR UPDATE TO authenticated
          USING (auth.uid() = business_id OR auth.uid() = courier_id);

        CREATE POLICY "conversations_delete_own"
          ON public.conversations FOR DELETE TO authenticated
          USING (auth.uid() = business_id OR auth.uid() = courier_id);
      `
    },

    // ============ STEP 5: MESSAGES ============
    {
      label: '[8/15] Messages - Public politikaları kaldır',
      sql: `
        DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
        DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
        DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
        DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;
      `
    },
    {
      label: '[9/15] Messages - Authenticated politikaları oluştur',
      sql: `
        CREATE POLICY "messages_select_own"
          ON public.messages FOR SELECT TO authenticated
          USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())));

        CREATE POLICY "messages_insert_own"
          ON public.messages FOR INSERT TO authenticated
          WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())));

        CREATE POLICY "messages_update_own"
          ON public.messages FOR UPDATE TO authenticated
          USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())));

        CREATE POLICY "messages_delete_own"
          ON public.messages FOR DELETE TO authenticated
          USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())));
      `
    },

    // ============ STEP 6: MESSAGE_REQUESTS ============
    {
      label: '[10/15] Message Requests - RLS aktif et ve politikalar ekle',
      sql: `
        ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "message_requests_select_own"
          ON public.message_requests FOR SELECT TO authenticated
          USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

        CREATE POLICY "message_requests_insert_own"
          ON public.message_requests FOR INSERT TO authenticated
          WITH CHECK (auth.uid() = sender_id);

        CREATE POLICY "message_requests_update_own"
          ON public.message_requests FOR UPDATE TO authenticated
          USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

        CREATE POLICY "message_requests_delete_own"
          ON public.message_requests FOR DELETE TO authenticated
          USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
      `
    },

    // ============ STEP 7: BACKUP TABLOLARI ============
    {
      label: '[11/15] Backup tabloları - RLS aktif et (erişim tamamen kapalı)',
      sql: `
        ALTER TABLE public.conversations_v1_backup ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.messages_v1_backup ENABLE ROW LEVEL SECURITY;
      `
    },

    // ============ STEP 8: DELETED_USERS ============
    {
      label: '[12/15] Deleted Users - Politikaları temizle (sadece service_role)',
      sql: `
        DROP POLICY IF EXISTS "Service role only - select" ON public.deleted_users;
        DROP POLICY IF EXISTS "Service role only - insert" ON public.deleted_users;
        DROP POLICY IF EXISTS "Service role only - update" ON public.deleted_users;
        DROP POLICY IF EXISTS "Service role only - delete" ON public.deleted_users;
      `
    },

    // ============ STEP 9: SUBSCRIPTION_PLANS ============
    {
      label: '[13/15] Subscription Plans - Authenticated only',
      sql: `
        DROP POLICY IF EXISTS "Anyone can read plans" ON public.subscription_plans;
        CREATE POLICY "plans_select_authenticated"
          ON public.subscription_plans FOR SELECT TO authenticated
          USING (true);
      `
    },

    // ============ STEP 10: ANON ROLE REVOKE ============
    {
      label: '[14/15] Anon role - Tüm tablo erişimlerini kaldır',
      sql: `
        REVOKE ALL ON public.couriers FROM anon;
        REVOKE ALL ON public.businesses FROM anon;
        REVOKE ALL ON public.business_ads FROM anon;
        REVOKE ALL ON public.conversations FROM anon;
        REVOKE ALL ON public.messages FROM anon;
        REVOKE ALL ON public.message_requests FROM anon;
        REVOKE ALL ON public.deleted_users FROM anon;
        REVOKE ALL ON public.conversations_v1_backup FROM anon;
        REVOKE ALL ON public.messages_v1_backup FROM anon;
      `
    },
    {
      label: '[15/15] Authenticated role - Gerekli erişimleri ver',
      sql: `
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.couriers TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_ads TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_requests TO authenticated;
        GRANT SELECT ON public.subscription_plans TO authenticated;
        GRANT SELECT ON public.subscription_plans TO anon;
      `
    },
  ];

  let success = 0;
  let failed = 0;

  for (const step of steps) {
    try {
      await runSQL(step.sql, step.label);
      success++;
    } catch (err) {
      failed++;
      console.error(`   Hata detayı: ${err.message.substring(0, 200)}`);
    }
    // Rate limit'e takılmamak için kısa bekle
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 Sonuç: ${success} başarılı, ${failed} başarısız (toplam ${steps.length})`);
}

main().catch(console.error);
