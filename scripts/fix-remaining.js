// Fix: Businesses ve Message Requests politikalarını düzelt
const https = require('https');
const { execSync } = require('child_process');

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
  console.log('🔧 Hata düzeltmeleri uygulanıyor...\n');

  // Fix 1: Businesses - seeking_couriers kullan (is_visible yok)
  await runSQL(`
    CREATE POLICY "businesses_select_authenticated"
      ON public.businesses FOR SELECT TO authenticated
      USING (seeking_couriers = true OR auth.uid() = user_id);

    CREATE POLICY "businesses_insert_own"
      ON public.businesses FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "businesses_update_own"
      ON public.businesses FOR UPDATE TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "businesses_delete_own"
      ON public.businesses FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  `, '[FIX 1] Businesses - Yeni politikaları oluştur');

  await new Promise(r => setTimeout(r, 500));

  // Fix 2: Message Requests - recipient_id kullan (receiver_id yok)
  await runSQL(`
    ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "message_requests_select_own"
      ON public.message_requests FOR SELECT TO authenticated
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

    CREATE POLICY "message_requests_insert_own"
      ON public.message_requests FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = sender_id);

    CREATE POLICY "message_requests_update_own"
      ON public.message_requests FOR UPDATE TO authenticated
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

    CREATE POLICY "message_requests_delete_own"
      ON public.message_requests FOR DELETE TO authenticated
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  `, '[FIX 2] Message Requests - RLS aktif et ve politikalar ekle');

  console.log('\n✅ Düzeltmeler tamamlandı!');
}

main().catch(console.error);
