// Check constraints araştırma
const fs = require('fs');
const path = require('path');

// .env.local dosyasını manuel oku
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
});

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  console.log('🔍 CHECK CONSTRAINTS ARAŞTIRMASI\n');

  // Test: earning_model CHECK constraint values keşfet - form'un gönderdiği değerler
  // Drop and recreate check constraints using RPC
  console.log('\n🔧 CHECK CONSTRAINT GÜNCELLEMESİ');
  
  // Try to call Supabase SQL endpoint directly with service_role
  const https = require('https');
  const parsedUrl = new URL(SUPABASE_URL);
  
  function execSQL(sql) {
    return new Promise((resolve, reject) => {
      // Use the Supabase pg-rest endpoint for SQL execution
      const data = JSON.stringify({ query: sql });
      const options = {
        hostname: parsedUrl.hostname,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      };
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // Try to drop and recreate constraints
  const alterSQL = `
    ALTER TABLE public.couriers DROP CONSTRAINT IF EXISTS couriers_earning_model_check;
    ALTER TABLE public.couriers ADD CONSTRAINT couriers_earning_model_check 
      CHECK (earning_model IN ('Saat+Paket Başı', 'Aylık Sabit', 'Paket Başı', 'Esnaf Kurye - Saatlik Ücret + Paket Başı', 'Esnaf Kurye - Aylık Sabit', 'Sigortalı - Aylık Sabit'));
    
    ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_earning_model_check;
    ALTER TABLE public.businesses ADD CONSTRAINT businesses_earning_model_check 
      CHECK (earning_model IN ('Saat+Paket Başı', 'Aylık Sabit', 'Paket Başı', 'Esnaf Kurye - Saatlik Ücret + Paket Başı', 'Esnaf Kurye - Aylık Sabit', 'Sigortalı - Aylık Sabit'));
  `;
  
  const result = await execSQL(alterSQL);
  console.log('SQL exec result:', result.status, result.body.substring(0, 200));
}
  console.log('\n📋 earning_model CHECK constraint test:');
  for (const val of testValues) {
    const { error } = await supabase.from('couriers').insert({
      user_id: '00000000-0000-0000-0000-000000000099',
      earning_model: val,
      role: 'kurye',
      first_name: 'TEST',
      last_name: 'TEST',
      age: 25,
      gender: 'Erkek',
      phone: '05999999999',
      nationality: 'Türk',
      experience: '0-1',
      province: 'İstanbul',
      district: ['Kadıköy'],
      working_type: 'Full Time',
      working_days: ['Pazartesi','Salı'],
      daily_package_estimate: '0-15 PAKET',
      license_type: 'A',
      has_motorcycle: 'VAR',
      has_bag: 'VAR',
      p1_certificate: 'YOK',
      src_certificate: 'YOK',
      criminal_record: 'YOK',
      contact_preference: 'in_app',
      accept_terms: true,
      accept_privacy: true,
      accept_kvkk: true,
      accept_commercial: true,
    });
    if (error) {
      const msg = error.message || '';
      if (msg.includes('earning_model_check')) {
        console.log(`  ❌ "${val}" → REJECTED BY earning_model_check`);
      } else if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('phone')) {
        console.log(`  ✅ "${val}" → PASSED constraint (other: ${msg.substring(0, 80)})`);
      } else {
        console.log(`  ⚠️ "${val}" → OTHER ERROR: ${msg.substring(0, 100)}`);
      }
    } else {
      console.log(`  ✅ "${val}" → INSERTED! Cleaning up...`);
      await supabase.from('couriers').delete().eq('user_id', '00000000-0000-0000-0000-000000000099');
    }
  }

  // Also test for businesses table
  console.log('\n📋 businesses earning_model CHECK constraint test:');
  for (const val of testValues) {
    const { error } = await supabase.from('businesses').insert({
      user_id: '00000000-0000-0000-0000-000000000099',
      earning_model: val,
      role: 'isletme',
      business_name: 'TEST',
      business_sector: 'TEST',
      manager_name: 'TEST',
      manager_contact: '05999999999',
      province: 'İstanbul',
      district: ['Kadıköy'],
      working_type: 'Full Time',
      working_days: ['Pazartesi','Salı'],
      daily_package_estimate: '0-15 PAKET',
      contact_preference: 'in_app',
      accept_terms: true,
      accept_privacy: true,
      accept_kvkk: true,
      accept_commercial: true,
    });
    if (error) {
      const msg = error.message || '';
      if (msg.includes('earning_model_check') || msg.includes('check constraint')) {
        console.log(`  ❌ "${val}" → REJECTED: ${msg.substring(0, 80)}`);
      } else if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('phone')) {
        console.log(`  ✅ "${val}" → PASSED constraint (other: ${msg.substring(0, 80)})`);
      } else {
        console.log(`  ⚠️ "${val}" → OTHER ERROR: ${msg.substring(0, 100)}`);
      }
    } else {
      console.log(`  ✅ "${val}" → INSERTED! Cleaning up...`);
      await supabase.from('businesses').delete().eq('user_id', '00000000-0000-0000-0000-000000000099');
    }
  }
}

main().catch(console.error);
