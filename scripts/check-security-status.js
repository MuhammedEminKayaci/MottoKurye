// Supabase Güvenlik Durumu Kontrolü
// Bu script, veritabanındaki güvenlik yapılandırmasını kontrol eder

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
          try {
            const parsed = JSON.parse(body);
            resolve({ label, data: parsed, status: res.statusCode });
          } catch {
            resolve({ label, data: body, status: res.statusCode });
          }
        } else {
          resolve({ label, data: body, status: res.statusCode, error: true });
        }
      });
    });
    req.on('error', (err) => resolve({ label, data: err.message, error: true }));
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔍 MOTTO KURYE - GÜVENLİK DURUM KONTROLÜ');
  console.log('='.repeat(60));
  console.log('');

  // ============ CHECK 1: RLS Durumu ============
  console.log('📋 1. TÜM TABLOLARDA RLS DURUMU');
  console.log('-'.repeat(40));
  const rlsResult = await runSQL(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `, 'RLS Durumu');

  if (!rlsResult.error && Array.isArray(rlsResult.data)) {
    rlsResult.data.forEach(row => {
      const status = row.rowsecurity ? '✅ AKTİF' : '❌ KAPALI';
      console.log(`  ${status}  ${row.tablename}`);
    });
  } else {
    console.log('  Sonuç:', JSON.stringify(rlsResult.data, null, 2));
  }
  console.log('');

  // ============ CHECK 2: RLS Politikaları ============
  console.log('📋 2. MEVCUT RLS POLİTİKALARI');
  console.log('-'.repeat(40));
  const policiesResult = await runSQL(`
    SELECT 
      schemaname,
      tablename, 
      policyname, 
      permissive,
      roles,
      cmd,
      qual
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `, 'RLS Politikaları');

  if (!policiesResult.error && Array.isArray(policiesResult.data)) {
    let currentTable = '';
    policiesResult.data.forEach(row => {
      if (row.tablename !== currentTable) {
        currentTable = row.tablename;
        console.log(`\n  📁 ${currentTable.toUpperCase()}`);
      }
      const roles = Array.isArray(row.roles) ? row.roles.join(',') : row.roles;
      console.log(`    ✅ ${row.policyname}`);
      console.log(`       Roller: ${roles} | İşlem: ${row.cmd} | Tip: ${row.permissive}`);
    });
  } else {
    console.log('  Sonuç:', JSON.stringify(policiesResult.data, null, 2));
  }
  console.log('');

  // ============ CHECK 3: Anon Role Erişimleri ============
  console.log('📋 3. ANON ROLE TABLO ERİŞİMLERİ');
  console.log('-'.repeat(40));
  const anonResult = await runSQL(`
    SELECT 
      table_name,
      privilege_type
    FROM information_schema.role_table_grants 
    WHERE grantee = 'anon' 
    AND table_schema = 'public'
    ORDER BY table_name, privilege_type;
  `, 'Anon Erişimleri');

  if (!anonResult.error && Array.isArray(anonResult.data)) {
    if (anonResult.data.length === 0) {
      console.log('  ✅ Anon rolünün hiçbir tabloya erişimi yok!');
    } else {
      anonResult.data.forEach(row => {
        console.log(`  ⚠️  ${row.table_name}: ${row.privilege_type}`);
      });
    }
  } else {
    console.log('  Sonuç:', JSON.stringify(anonResult.data, null, 2));
  }
  console.log('');

  // ============ CHECK 4: Authenticated Role Erişimleri ============
  console.log('📋 4. AUTHENTICATED ROLE TABLO ERİŞİMLERİ');
  console.log('-'.repeat(40));
  const authResult = await runSQL(`
    SELECT 
      table_name,
      string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
    FROM information_schema.role_table_grants 
    WHERE grantee = 'authenticated' 
    AND table_schema = 'public'
    GROUP BY table_name
    ORDER BY table_name;
  `, 'Authenticated Erişimleri');

  if (!authResult.error && Array.isArray(authResult.data)) {
    authResult.data.forEach(row => {
      console.log(`  ✅ ${row.table_name}: ${row.privileges}`);
    });
  } else {
    console.log('  Sonuç:', JSON.stringify(authResult.data, null, 2));
  }
  console.log('');

  // ============ CHECK 5: Storage Politikaları ============
  console.log('📋 5. STORAGE POLİTİKALARI (documents bucket)');
  console.log('-'.repeat(40));
  const storageResult = await runSQL(`
    SELECT 
      policyname,
      permissive,
      roles,
      cmd,
      qual
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
    ORDER BY policyname;
  `, 'Storage Politikaları');

  if (!storageResult.error && Array.isArray(storageResult.data)) {
    if (storageResult.data.length === 0) {
      console.log('  ❌ Storage üzerinde hiç RLS politikası yok!');
    } else {
      storageResult.data.forEach(row => {
        const roles = Array.isArray(row.roles) ? row.roles.join(',') : row.roles;
        console.log(`  ✅ ${row.policyname}`);
        console.log(`     Roller: ${roles} | İşlem: ${row.cmd}`);
      });
    }
  } else {
    console.log('  Sonuç:', JSON.stringify(storageResult.data, null, 2));
  }
  console.log('');

  // ============ CHECK 6: Storage Bucket Durumu ============
  console.log('📋 6. STORAGE BUCKET DURUMU');
  console.log('-'.repeat(40));
  const bucketResult = await runSQL(`
    SELECT id, name, public, file_size_limit, allowed_mime_types
    FROM storage.buckets
    ORDER BY name;
  `, 'Bucket Durumu');

  if (!bucketResult.error && Array.isArray(bucketResult.data)) {
    bucketResult.data.forEach(row => {
      const status = row.public ? '⚠️  PUBLIC' : '✅ PRIVATE';
      console.log(`  ${status}  ${row.name} (id: ${row.id})`);
    });
  } else {
    console.log('  Sonuç:', JSON.stringify(bucketResult.data, null, 2));
  }
  console.log('');

  // ============ CHECK 7: Tehlikeli Eski Politikalar ============
  console.log('📋 7. TEHLİKELİ ESKİ POLİTİKA KONTROLÜ');
  console.log('-'.repeat(40));
  const dangerResult = await runSQL(`
    SELECT tablename, policyname, roles, cmd
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND (
      policyname LIKE '%herkese açık%'
      OR policyname LIKE '%anyone%'
      OR policyname LIKE '%public%'
      OR roles::text LIKE '%anon%'
    )
    ORDER BY tablename;
  `, 'Tehlikeli Politikalar');

  if (!dangerResult.error && Array.isArray(dangerResult.data)) {
    if (dangerResult.data.length === 0) {
      console.log('  ✅ Tehlikeli eski politika bulunamadı!');
    } else {
      dangerResult.data.forEach(row => {
        const roles = Array.isArray(row.roles) ? row.roles.join(',') : row.roles;
        console.log(`  ❌ ${row.tablename}: ${row.policyname} (roller: ${roles})`);
      });
    }
  } else {
    console.log('  Sonuç:', JSON.stringify(dangerResult.data, null, 2));
  }
  console.log('');

  // ============ CHECK 8: Anon ile veri erişim testi ============
  console.log('📋 8. ANON KEY İLE VERİ ERİŞİM TESTİ (simülasyon)');
  console.log('-'.repeat(40));
  const anonTestResult = await runSQL(`
    SET ROLE anon;
    SELECT count(*) as count FROM public.couriers;
  `, 'Anon Courier Erişim Testi');

  if (!anonTestResult.error) {
    console.log('  Anon → couriers:', JSON.stringify(anonTestResult.data));
  } else {
    console.log('  ✅ Anon couriers erişimi engellendi:', anonTestResult.data);
  }

  // Test 2 - businesses
  const anonTestResult2 = await runSQL(`
    SET ROLE anon;
    SELECT count(*) as count FROM public.businesses;
  `, 'Anon Business Erişim Testi');

  if (!anonTestResult2.error) {
    console.log('  Anon → businesses:', JSON.stringify(anonTestResult2.data));
  } else {
    console.log('  ✅ Anon businesses erişimi engellendi:', anonTestResult2.data);
  }

  // Reset role
  await runSQL(`RESET ROLE;`, 'Role Reset');

  console.log('');
  console.log('='.repeat(60));
  console.log('🔍 GÜVENLİK KONTROLÜ TAMAMLANDI');
  console.log('='.repeat(60));
}

main().catch(console.error);
