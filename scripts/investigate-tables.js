// Eksik tabloları ve view'ları araştır
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
        try { resolve({ label, data: JSON.parse(body), status: res.statusCode }); }
        catch { resolve({ label, data: body, status: res.statusCode }); }
      });
    });
    req.on('error', (err) => resolve({ label, data: err.message, error: true }));
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔍 EKSİK TABLO/VIEW ARAŞTIRMASI\n');

  // 1. Tüm tabloların ve view'ların listesi
  const r1 = await runSQL(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `, 'Tüm Tablolar/Views');
  console.log('📋 TÜM TABLOLAR VE VİEW\'LAR:');
  if (Array.isArray(r1.data)) {
    r1.data.forEach(r => console.log(`  ${r.table_type === 'VIEW' ? '👁️ VIEW' : '📄 TABLE'}  ${r.table_name}`));
  } else {
    console.log(JSON.stringify(r1.data, null, 2));
  }

  console.log('\n');

  // 2. isletme tablosu yapısı
  const r2 = await runSQL(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'isletme'
    ORDER BY ordinal_position;
  `, 'isletme Tablosu');
  console.log('📋 İSLETME TABLOSU YAPISI:');
  if (Array.isArray(r2.data)) {
    r2.data.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
  } else { console.log(JSON.stringify(r2.data, null, 2)); }

  console.log('\n');

  // 3. kurye tablosu yapısı
  const r3 = await runSQL(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'kurye'
    ORDER BY ordinal_position;
  `, 'kurye Tablosu');
  console.log('📋 KURYE TABLOSU YAPISI:');
  if (Array.isArray(r3.data)) {
    r3.data.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
  } else { console.log(JSON.stringify(r3.data, null, 2)); }

  console.log('\n');

  // 4. businesses_public ve couriers_public - view mı tablo mu?
  const r4 = await runSQL(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('businesses_public', 'couriers_public', 'business_plan_status')
    ORDER BY table_name;
  `, 'Public Views');
  console.log('📋 businesses_public / couriers_public / business_plan_status:');
  if (Array.isArray(r4.data)) {
    r4.data.forEach(r => console.log(`  ${r.table_type}: ${r.table_name}`));
  } else { console.log(JSON.stringify(r4.data, null, 2)); }

  console.log('\n');

  // 5. View tanımlarını getir
  const r5 = await runSQL(`
    SELECT viewname, definition 
    FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname IN ('businesses_public', 'couriers_public', 'business_plan_status')
    ORDER BY viewname;
  `, 'View Tanımları');
  console.log('📋 VIEW TANIMLARI:');
  if (Array.isArray(r5.data)) {
    r5.data.forEach(r => {
      console.log(`\n  📁 ${r.viewname}:`);
      console.log(`  ${r.definition}`);
    });
  } else { console.log(JSON.stringify(r5.data, null, 2)); }

  console.log('\n');

  // 6. isletme ve kurye tablolarında kaç kayıt var?
  const r6 = await runSQL(`
    SELECT 
      (SELECT count(*) FROM isletme) as isletme_count,
      (SELECT count(*) FROM kurye) as kurye_count,
      (SELECT count(*) FROM couriers) as couriers_count,
      (SELECT count(*) FROM businesses) as businesses_count;
  `, 'Kayıt Sayıları');
  console.log('📋 KAYIT SAYILARI:');
  if (Array.isArray(r6.data)) {
    r6.data.forEach(r => {
      console.log(`  isletme: ${r.isletme_count} | kurye: ${r.kurye_count}`);
      console.log(`  couriers: ${r.couriers_count} | businesses: ${r.businesses_count}`);
    });
  } else { console.log(JSON.stringify(r6.data, null, 2)); }

  // 7. isletme ve kurye RLS politikaları detay
  console.log('\n📋 İSLETME/KURYE RLS POLİTİKA DETAYLARI:');
  const r7 = await runSQL(`
    SELECT tablename, policyname, roles, cmd, qual, with_check
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename IN ('isletme', 'kurye')
    ORDER BY tablename, policyname;
  `, 'isletme/kurye Politikaları');
  if (Array.isArray(r7.data)) {
    r7.data.forEach(r => {
      console.log(`  ${r.tablename}: ${r.policyname}`);
      console.log(`    Roller: ${r.roles} | Cmd: ${r.cmd}`);
      console.log(`    USING: ${r.qual}`);
      console.log(`    WITH CHECK: ${r.with_check}`);
    });
  } else { console.log(JSON.stringify(r7.data, null, 2)); }

  // 8. subscription_plans grant detayları
  console.log('\n📋 SUBSCRIPTION_PLANS ANON ERİŞİM DETAYI:');
  const r8 = await runSQL(`
    SELECT grantee, privilege_type, is_grantable
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' AND table_name = 'subscription_plans'
    ORDER BY grantee, privilege_type;
  `, 'subscription_plans Grants');
  if (Array.isArray(r8.data)) {
    r8.data.forEach(r => {
      const icon = (r.grantee === 'anon' && r.privilege_type !== 'SELECT') ? '⚠️' : '✅';
      console.log(`  ${icon} ${r.grantee}: ${r.privilege_type}`);
    });
  } else { console.log(JSON.stringify(r8.data, null, 2)); }
}

main().catch(console.error);
