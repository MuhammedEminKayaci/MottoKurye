// KAPSAMLI FİNAL GÜVENLİK KONTROLÜ
// Rapordaki tüm maddeleri tek tek doğrular

const https = require('https');
const { execSync } = require('child_process');

const encodedToken = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const accessToken = Buffer.from(encodedToken.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');
const PROJECT_REF = 'mgjwlfyxfxmfappwputi';
const SUPABASE_HOST = 'mgjwlfyxfxmfappwputi.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nandsZnl4ZnhtZmFwcHdwdXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzY0ODcsImV4cCI6MjA3Nzc1MjQ4N30.O_EjyJkqpy85ibFIpB1PuEYYUpXpSCtcAAusbeTchGM';

function runSQL(query) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ query });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(body); } });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(data);
    req.end();
  });
}

function httpReq(hostname, path, method, headers) {
  return new Promise((resolve) => {
    const opts = { hostname, path, method, headers: headers || {} };
    const req = https.request(opts, (res) => {
      let body = '';
      const respHeaders = res.headers;
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, headers: respHeaders, data: JSON.parse(body) }); } catch { resolve({ status: res.statusCode, headers: respHeaders, data: body }); } });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(msg) { passed++; console.log(`  ✅ ${msg}`); }
function fail(msg) { failed++; console.log(`  ❌ ${msg}`); }
function warn(msg) { warnings++; console.log(`  ⚠️  ${msg}`); }

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   MOTTO KURYE - FİNAL GÜVENLİK DOĞRULAMA RAPORU    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // ═══════════════════════════════════════════════════════
  // ZAFIYET #1: RLS BYPASS (KRİTİK)
  // ═══════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔴 ZAFIYET #1: SUPABASE RLS BYPASS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1a. Tüm tablolarda RLS aktif mi?
  const rls = await runSQL(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`);
  if (Array.isArray(rls)) {
    const rlsOff = rls.filter(r => !r.rowsecurity);
    if (rlsOff.length === 0) pass(`Tüm ${rls.length} tabloda RLS AKTİF`);
    else fail(`RLS KAPALI tablolar: ${rlsOff.map(r => r.tablename).join(', ')}`);
  }

  // 1b. Anon key ile couriers erişim testi
  const c1 = await httpReq(SUPABASE_HOST, '/rest/v1/couriers?select=*&limit=1', 'GET', { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` });
  if (c1.status >= 400) pass(`Anon → couriers: HTTP ${c1.status} ENGELLENDİ`);
  else if (Array.isArray(c1.data) && c1.data.length === 0) pass(`Anon → couriers: Boş sonuç (RLS filtreledi)`);
  else fail(`Anon → couriers: ${c1.status} - VERİ ERİŞİLDİ!`);

  // 1c. Anon key ile businesses erişim testi
  const c2 = await httpReq(SUPABASE_HOST, '/rest/v1/businesses?select=*&limit=1', 'GET', { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` });
  if (c2.status >= 400) pass(`Anon → businesses: HTTP ${c2.status} ENGELLENDİ`);
  else if (Array.isArray(c2.data) && c2.data.length === 0) pass(`Anon → businesses: Boş sonuç (RLS filtreledi)`);
  else fail(`Anon → businesses: ${c2.status} - VERİ ERİŞİLDİ!`);

  // 1d. Anon role'ün tablo erişimleri
  const anonGrants = await runSQL(`SELECT table_name FROM information_schema.role_table_grants WHERE grantee = 'anon' AND table_schema = 'public' AND privilege_type = 'SELECT' ORDER BY table_name;`);
  if (Array.isArray(anonGrants)) {
    const allowedAnon = ['subscription_plans']; // Sadece bu izinli
    const unexpected = anonGrants.filter(r => !allowedAnon.includes(r.table_name));
    if (unexpected.length === 0) pass(`Anon SELECT sadece: ${anonGrants.map(r => r.table_name).join(', ')}`);
    else fail(`Anon'un beklenmeyen SELECT erişimi: ${unexpected.map(r => r.table_name).join(', ')}`);
  }

  console.log('');

  // ═══════════════════════════════════════════════════════
  // ZAFIYET #2: IDOR (KRİTİK)
  // ═══════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔴 ZAFIYET #2: IDOR - CROSS-ROLE ERİŞİM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // RLS politikalarında auth.uid() kontrolü var mı?
  const policies = await runSQL(`
    SELECT tablename, policyname, qual, with_check
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename IN ('couriers', 'businesses')
    ORDER BY tablename, cmd;
  `);
  if (Array.isArray(policies)) {
    const hasAuthUid = policies.every(p => 
      (p.qual && p.qual.includes('auth.uid()')) || 
      (p.with_check && p.with_check.includes('auth.uid()'))
    );
    if (hasAuthUid) pass('couriers/businesses politikalarında auth.uid() kontrolü mevcut');
    else warn('Bazı politikalarda auth.uid() kontrolü eksik olabilir');
    
    // UPDATE/DELETE sadece kendi verisine izin mi?
    const writePolicies = policies.filter(p => p.policyname.includes('update') || p.policyname.includes('delete'));
    const allOwnerOnly = writePolicies.every(p => p.qual && p.qual.includes('auth.uid()') && p.qual.includes('user_id'));
    if (allOwnerOnly) pass('UPDATE/DELETE sadece kendi verisi için (user_id = auth.uid())');
    else warn('UPDATE/DELETE politikaları kontrol edilmeli');
  }

  // Conversations - sadece katılımcılar erişebilmeli
  const convPolicies = await runSQL(`
    SELECT policyname, qual FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversations' AND cmd = 'SELECT';
  `);
  if (Array.isArray(convPolicies) && convPolicies.length > 0) {
    const hasParticipantCheck = convPolicies.some(p => p.qual && (p.qual.includes('business_id') || p.qual.includes('courier_id')));
    if (hasParticipantCheck) pass('Conversations: sadece katılımcılar erişebilir');
    else fail('Conversations: katılımcı kontrolü eksik');
  }

  console.log('');

  // ═══════════════════════════════════════════════════════
  // ZAFIYET #3: CORS YAPILANDIRMASI (YÜKSEK)
  // ═══════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🟠 ZAFIYET #3: CORS YAPILANDIRMASI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Supabase API CORS kontrolü
  const corsTest = await httpReq(SUPABASE_HOST, '/rest/v1/couriers', 'OPTIONS', {
    'Origin': 'https://evil.com',
    'Access-Control-Request-Method': 'GET',
    'apikey': ANON_KEY,
  });
  const corsOrigin = corsTest.headers?.['access-control-allow-origin'];
  if (corsOrigin === '*') {
    warn('Supabase API CORS: Access-Control-Allow-Origin: * (Supabase platform seviyesi — Dashboard\'dan değiştirilemez, ancak RLS ile korunuyor)');
  } else if (corsOrigin) {
    pass(`Supabase API CORS origin: ${corsOrigin}`);
  } else {
    pass('Supabase API CORS header yok veya kısıtlı');
  }

  // Vercel.json CORS kontrolü (app seviyesi)
  const fs = require('fs');
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf-8'));
  const apiHeaders = vercelConfig.headers?.find(h => h.source.includes('api'));
  if (apiHeaders) {
    const corsHeader = apiHeaders.headers.find(h => h.key === 'Access-Control-Allow-Origin');
    if (corsHeader && corsHeader.value !== '*') {
      pass(`Vercel API CORS: ${corsHeader.value}`);
    } else if (corsHeader && corsHeader.value === '*') {
      fail('Vercel API CORS wildcard (*) kullanıyor!');
    }
  }

  console.log('');

  // ═══════════════════════════════════════════════════════
  // ZAFIYET #4: HASSAS BELGELERE ERİŞİM (ORTA)
  // ═══════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🟡 ZAFIYET #4: STORAGE - HASSAS BELGELER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Bucket durumu
  const buckets = await runSQL(`SELECT name, public FROM storage.buckets ORDER BY name;`);
  if (Array.isArray(buckets)) {
    buckets.forEach(b => {
      if (b.name === 'documents' && !b.public) pass(`documents bucket: PRIVATE ✓`);
      else if (b.name === 'documents' && b.public) fail(`documents bucket: HALA PUBLIC!`);
      else if (b.name === 'avatars' && b.public) pass(`avatars bucket: PUBLIC (beklenen - profil fotoğrafları)`);
      else if (b.name === 'profiles' && b.public) pass(`profiles bucket: PUBLIC (beklenen - profil görselleri)`);
    });
  }

  // Sabıka kaydı dosyasına doğrudan erişim testi
  const docTest = await httpReq(SUPABASE_HOST, '/storage/v1/object/public/documents/sabka_2b386950-2672-4933-93bc-4789e657dc9f_1771845059871.png', 'HEAD', {});
  if (docTest.status === 200) fail(`Sabıka kaydı dosyası hala public erişilebilir! HTTP ${docTest.status}`);
  else pass(`Sabıka kaydı erişimi engellendi: HTTP ${docTest.status}`);

  // Storage RLS politikaları
  const storagePolicies = await runSQL(`
    SELECT policyname, cmd FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname LIKE 'documents%';
  `);
  if (Array.isArray(storagePolicies) && storagePolicies.length > 0) {
    pass(`Documents storage politikaları: ${storagePolicies.map(p => p.policyname).join(', ')}`);
  } else {
    warn('Documents bucket için storage RLS politikası bulunamadı');
  }

  // Signed URL endpoint kontrolü
  if (fs.existsSync('app/api/storage/signed-url/route.ts')) {
    pass('Signed URL API endpoint mevcut');
  } else {
    fail('Signed URL API endpoint eksik!');
  }

  console.log('');

  // ═══════════════════════════════════════════════════════
  // ZAFIYET #5: HTTP GÜVENLİK BAŞLIKLARI (ORTA)
  // ═══════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🟡 ZAFIYET #5: HTTP GÜVENLİK BAŞLIKLARI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // next.config.ts kontrolü
  const nextConfig = fs.readFileSync('next.config.ts', 'utf-8');
  const requiredHeaders = [
    { name: 'X-Frame-Options', search: 'X-Frame-Options' },
    { name: 'X-Content-Type-Options', search: 'X-Content-Type-Options' },
    { name: 'X-XSS-Protection', search: 'X-XSS-Protection' },
    { name: 'Referrer-Policy', search: 'Referrer-Policy' },
    { name: 'Content-Security-Policy', search: 'Content-Security-Policy' },
    { name: 'Strict-Transport-Security', search: 'Strict-Transport-Security' },
    { name: 'Permissions-Policy', search: 'Permissions-Policy' },
  ];

  requiredHeaders.forEach(h => {
    if (nextConfig.includes(h.search)) pass(`${h.name} başlığı next.config.ts'de mevcut`);
    else fail(`${h.name} başlığı eksik!`);
  });

  // vercel.json'da da güvenlik başlıkları var mı?
  const vercelHeaders = vercelConfig.headers?.find(h => h.source === '/(.*)');
  if (vercelHeaders) {
    const vercelHeaderNames = vercelHeaders.headers.map(h => h.key);
    if (vercelHeaderNames.includes('X-Frame-Options')) pass('vercel.json güvenlik başlıkları da mevcut (çift koruma)');
  }

  console.log('');

  // ═══════════════════════════════════════════════════════
  // ZAFIYET #6: RATE LIMITING (DÜŞÜK-ORTA)
  // ═══════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🟢 ZAFIYET #6: RATE LIMITING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const middleware = fs.readFileSync('middleware.ts', 'utf-8');
  if (middleware.includes('rateLimitMap') || middleware.includes('isRateLimited')) {
    pass('Rate limiting middleware.ts\'de mevcut');
  } else {
    fail('Rate limiting bulunamadı!');
  }

  if (middleware.includes('MAX_AUTH_REQUESTS')) pass('Auth endpoint rate limit tanımlı');
  else fail('Auth rate limit eksik');

  if (middleware.includes('MAX_API_REQUESTS')) pass('API endpoint rate limit tanımlı');
  else fail('API rate limit eksik');

  if (middleware.includes('429')) pass('429 Too Many Requests yanıtı tanımlı');
  else fail('429 yanıtı eksik');

  console.log('');

  // ═══════════════════════════════════════════════════════
  // EK KONTROLLER
  // ═══════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 EK GÜVENLİK KONTROLLERİ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Service role key client-side'da kullanılıyor mu?
  const supabaseClient = fs.readFileSync('lib/supabase.ts', 'utf-8');
  if (supabaseClient.includes('SERVICE_ROLE') || supabaseClient.includes('service_role')) {
    fail('Service role key client-side supabase.ts dosyasında kullanılıyor!');
  } else {
    pass('Service role key client-side\'da kullanılmıyor');
  }

  // supabaseAdmin sadece server-side mı?
  const adminClient = fs.readFileSync('lib/supabaseAdmin.ts', 'utf-8');
  if (!adminClient.includes('"use client"')) {
    pass('supabaseAdmin.ts "use client" değil (server-only)');
  } else {
    fail('supabaseAdmin.ts "use client" olarak işaretlenmiş!');
  }

  // .env dosyalarında service role key var mı?
  if (fs.existsSync('.env.local')) {
    warn('.env.local dosyası mevcut - service role key\'in burada olduğundan emin olun (client-side\'a sızmaz)');
  }

  // Korumalı rotalar
  if (middleware.includes('protectedRoutes')) pass('Korumalı rota kontrolü mevcut');
  else warn('Korumalı rota kontrolü bulunamadı');

  // View'larda security_invoker
  const viewCheck = await runSQL(`
    SELECT viewname, 
      (SELECT option_value FROM pg_options_to_table(reloptions) WHERE option_name = 'security_invoker') as security_invoker
    FROM pg_views 
    JOIN pg_class ON pg_class.relname = pg_views.viewname
    WHERE schemaname = 'public' AND viewname IN ('couriers_public', 'businesses_public', 'business_plan_status');
  `);
  if (Array.isArray(viewCheck)) {
    viewCheck.forEach(v => {
      if (v.security_invoker === 'true') pass(`${v.viewname} VIEW: security_invoker = true`);
      else warn(`${v.viewname} VIEW: security_invoker ayarı kontrol edilmeli`);
    });
  }

  // Anon ile view erişim testi
  const viewTests = ['couriers_public', 'businesses_public', 'business_plan_status'];
  for (const view of viewTests) {
    const r = await httpReq(SUPABASE_HOST, `/rest/v1/${view}?select=*&limit=1`, 'GET', { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` });
    if (r.status >= 400) pass(`Anon → ${view}: ENGELLENDİ (HTTP ${r.status})`);
    else if (Array.isArray(r.data) && r.data.length === 0) pass(`Anon → ${view}: Boş (RLS)`);
    else fail(`Anon → ${view}: VERİ SIZINTISI!`);
    await new Promise(r => setTimeout(r, 100));
  }

  // ═══════════════════════════════════════════════════════
  // SONUÇ
  // ═══════════════════════════════════════════════════════
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║                    SONUÇ RAPORU                     ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  ✅ GEÇEN:    ${String(passed).padStart(3)}                                    ║`);
  console.log(`║  ❌ KALAN:    ${String(failed).padStart(3)}                                    ║`);
  console.log(`║  ⚠️  BİLGİ:   ${String(warnings).padStart(3)}                                    ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  if (failed === 0) {
    console.log('');
    console.log('🎉 TÜM GÜVENLİK ZAFİYETLERİ KAPATILDI!');
  } else {
    console.log('');
    console.log(`⚠️  ${failed} adet düzeltilmesi gereken sorun var.`);
  }
}

main().catch(console.error);
