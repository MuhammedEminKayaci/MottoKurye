// ============================================================
// MOTTO KURYE - GÜVENLİK PATCH #2
// Kontrol sırasında tespit edilen kalan açıkları kapatır
// ============================================================
//
// TESPİT EDİLEN SORUNLAR:
// 1. couriers_public VIEW - anon erişimi var → RLS bypass riski
// 2. businesses_public VIEW - anon erişimi var → RLS bypass riski
// 3. business_plan_status VIEW - anon erişimi var
// 4. isletme (eski tablo) - anon erişimi + public role politikaları
// 5. kurye (eski tablo) - anon erişimi + public role politikaları
// 6. subscription_plans - anon'a sadece SELECT yerine tüm yetkiler verilmiş
// ============================================================

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
          console.log(`  ✅ ${label}`);
          resolve(body);
        } else {
          console.error(`  ❌ ${label}: ${res.statusCode} - ${body}`);
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
  console.log('🔒 MOTTO KURYE - GÜVENLİK PATCH #2');
  console.log('='.repeat(50));
  console.log('');

  const steps = [
    // ============ FIX 1: VIEW'LARDAN ANON ERİŞİMİNİ KALDIR ============
    {
      label: '[1/10] couriers_public VIEW - anon erişimini kaldır',
      sql: `REVOKE ALL ON public.couriers_public FROM anon;`
    },
    {
      label: '[2/10] businesses_public VIEW - anon erişimini kaldır',
      sql: `REVOKE ALL ON public.businesses_public FROM anon;`
    },
    {
      label: '[3/10] business_plan_status VIEW - anon erişimini kaldır',
      sql: `REVOKE ALL ON public.business_plan_status FROM anon;`
    },

    // ============ FIX 2: VIEW'LARA SADECE AUTHENTICATED ERİŞİM VER ============
    {
      label: '[4/10] couriers_public VIEW - authenticated erişim ver',
      sql: `GRANT SELECT ON public.couriers_public TO authenticated;`
    },
    {
      label: '[5/10] businesses_public VIEW - authenticated erişim ver',
      sql: `GRANT SELECT ON public.businesses_public TO authenticated;`
    },
    {
      label: '[6/10] business_plan_status VIEW - authenticated erişim ver',
      sql: `GRANT SELECT ON public.business_plan_status TO authenticated;`
    },

    // ============ FIX 3: ESKİ isletme/kurye TABLOLARI GÜVENLİ HALE GETİR ============
    {
      label: '[7/10] isletme & kurye - anon erişimini kaldır + politikaları güçlendir',
      sql: `
        -- Anon erişimini kaldır
        REVOKE ALL ON public.isletme FROM anon;
        REVOKE ALL ON public.kurye FROM anon;

        -- Eski public role politikalarını kaldır
        DROP POLICY IF EXISTS "Users can insert their own isletme data" ON public.isletme;
        DROP POLICY IF EXISTS "Users can update their own isletme data" ON public.isletme;
        DROP POLICY IF EXISTS "Users can view their own isletme data" ON public.isletme;
        DROP POLICY IF EXISTS "Users can insert their own kurye data" ON public.kurye;
        DROP POLICY IF EXISTS "Users can update their own kurye data" ON public.kurye;
        DROP POLICY IF EXISTS "Users can view their own kurye data" ON public.kurye;

        -- Yeni authenticated-only politikalar oluştur
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

        -- Authenticated kullanıcılara erişim ver
        GRANT SELECT, INSERT, UPDATE ON public.isletme TO authenticated;
        GRANT SELECT, INSERT, UPDATE ON public.kurye TO authenticated;
      `
    },

    // ============ FIX 4: subscription_plans - ANON SADECE SELECT ============
    {
      label: '[8/10] subscription_plans - anon erişimini düzelt (sadece SELECT)',
      sql: `
        REVOKE ALL ON public.subscription_plans FROM anon;
        GRANT SELECT ON public.subscription_plans TO anon;
      `
    },

    // ============ FIX 5: VIEW'LAR İÇİN SECURITY_INVOKER AYARLA ============
    // PostgreSQL 15+ : security_invoker = true ayarı ile view'lar
    // çağıran kullanıcının yetkileri ile çalışır (RLS uygular)
    {
      label: '[9/10] VIEW\'ları SECURITY INVOKER olarak ayarla (RLS bypass\'ı engelle)',
      sql: `
        ALTER VIEW public.couriers_public SET (security_invoker = true);
        ALTER VIEW public.businesses_public SET (security_invoker = true);
        ALTER VIEW public.business_plan_status SET (security_invoker = true);
      `
    },

    // ============ FIX 6: BACKUP TABLOLASINDAN AUTHENTICATED ERİŞİMİ DE KALDIR ============
    {
      label: '[10/10] Backup tablolarından gereksiz authenticated erişimini kaldır',
      sql: `
        REVOKE ALL ON public.conversations_v1_backup FROM authenticated;
        REVOKE ALL ON public.messages_v1_backup FROM authenticated;
        REVOKE ALL ON public.deleted_users FROM authenticated;
      `
    },
  ];

  for (const step of steps) {
    try {
      await runSQL(step.sql, step.label);
    } catch (err) {
      console.error(`  ⚠️  Hata devam ediyor: ${step.label}`);
    }
    // API rate limit'e takılmamak için bekleme
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('✅ GÜVENLİK PATCH #2 TAMAMLANDI');
  console.log('='.repeat(50));
}

main().catch(console.error);
