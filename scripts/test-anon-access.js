// Anon Key ile gerçek API erişim testi (curl simülasyonu)
// Rapordaki PoC'leri tekrar test eder

const https = require('https');

const SUPABASE_URL = 'mgjwlfyxfxmfappwputi.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nandsZnl4ZnhtZmFwcHdwdXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzY0ODcsImV4cCI6MjA3Nzc1MjQ4N30.O_EjyJkqpy85ibFIpB1PuEYYUpXpSCtcAAusbeTchGM';

function testEndpoint(path, label) {
  return new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/${path}`,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(body); } catch { parsed = body; }
        const count = Array.isArray(parsed) ? parsed.length : 'N/A';
        resolve({ label, status: res.statusCode, count, data: parsed });
      });
    });
    req.on('error', (err) => resolve({ label, error: err.message }));
    req.end();
  });
}

async function main() {
  console.log('🔐 ANON KEY İLE GERÇEKCİ API ERİŞİM TESTİ');
  console.log('(Rapordaki PoC\'leri tekrar deniyor)');
  console.log('='.repeat(55));
  console.log('');

  const tests = [
    // Rapordaki PoC #1 - Couriers tablosu
    { path: 'couriers?select=*', label: 'PoC #1: couriers (anon key)' },
    // Rapordaki PoC #2 - Businesses tablosu
    { path: 'businesses?select=*', label: 'PoC #2: businesses (anon key)' },
    // View bypass denemeleri
    { path: 'couriers_public?select=*', label: 'VIEW: couriers_public (anon)' },
    { path: 'businesses_public?select=*', label: 'VIEW: businesses_public (anon)' },
    { path: 'business_plan_status?select=*', label: 'VIEW: business_plan_status (anon)' },
    // Eski tablolar
    { path: 'isletme?select=*', label: 'ESKİ: isletme tablosu (anon)' },
    { path: 'kurye?select=*', label: 'ESKİ: kurye tablosu (anon)' },
    // Mesajlaşma
    { path: 'conversations?select=*', label: 'conversations (anon)' },
    { path: 'messages?select=*', label: 'messages (anon)' },
    { path: 'message_requests?select=*', label: 'message_requests (anon)' },
    // Plan bilgileri
    { path: 'subscription_plans?select=*', label: 'subscription_plans (anon - sadece SELECT olmalı)' },
    // Deleted users
    { path: 'deleted_users?select=*', label: 'deleted_users (anon)' },
    // Business ads
    { path: 'business_ads?select=*', label: 'business_ads (anon)' },
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.path, test.label);

    if (result.error) {
      console.log(`  ❓ ${result.label}: Bağlantı hatası`);
      continue;
    }

    const isError = result.status >= 400;
    const isEmpty = Array.isArray(result.data) && result.data.length === 0;
    const hasData = Array.isArray(result.data) && result.data.length > 0;

    if (isError) {
      console.log(`  ✅ ${result.label}`);
      console.log(`     → HTTP ${result.status}: ERİŞİM ENGELLENDİ ✓`);
      if (result.data?.message) console.log(`     → ${result.data.message}`);
    } else if (isEmpty) {
      console.log(`  ✅ ${result.label}`);
      console.log(`     → HTTP ${result.status}: Boş sonuç (RLS filtreledi veya tablo boş) ✓`);
    } else if (hasData) {
      // subscription_plans için SELECT izinli
      if (test.path.includes('subscription_plans')) {
        console.log(`  ℹ️  ${result.label}`);
        console.log(`     → HTTP ${result.status}: ${result.count} kayıt (BEKLENEN - plan bilgisi public)`);
      } else {
        console.log(`  ❌ ${result.label}`);
        console.log(`     → HTTP ${result.status}: ${result.count} KAYIT ERİŞİLDİ! GÜVENLİK AÇIĞI!`);
        // İlk kaydın key'lerini göster (veri değil)
        if (result.data[0]) {
          console.log(`     → Erişilen alanlar: ${Object.keys(result.data[0]).join(', ')}`);
        }
      }
    } else {
      console.log(`  ❓ ${result.label}: HTTP ${result.status} - Beklenmeyen yanıt`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  // Storage testi - documents bucket'ındaki dosyaya erişim
  console.log('\n📦 STORAGE ERİŞİM TESTİ:');
  console.log('-'.repeat(40));

  const storageTest = await new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_URL,
      path: '/storage/v1/object/public/documents/sabka_2b386950-2672-4933-93bc-4789e657dc9f_1771845059871.png',
      method: 'HEAD',
    };
    const req = https.request(options, (res) => {
      resolve({ status: res.statusCode });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.end();
  });

  if (storageTest.status === 200) {
    console.log(`  ❌ documents bucket hala PUBLIC! HTTP ${storageTest.status}`);
  } else if (storageTest.status === 400 || storageTest.status === 403 || storageTest.status === 404) {
    console.log(`  ✅ documents bucket ERİŞİM ENGELLENDİ: HTTP ${storageTest.status}`);
  } else {
    console.log(`  ❓ documents bucket: HTTP ${storageTest.status}`);
  }

  console.log('');
  console.log('='.repeat(55));
  console.log('🔐 API ERİŞİM TESTİ TAMAMLANDI');
  console.log('='.repeat(55));
}

main().catch(console.error);
