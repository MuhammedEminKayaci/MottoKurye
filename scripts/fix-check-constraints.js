// Fix: earning_model CHECK constraint'lerini güncelle
// Hem eski hem yeni form değerlerini kabul edecek şekilde constraint'leri yeniden oluştur
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
  console.log('🔧 CHECK CONSTRAINT FIX\n');
  
  // Step 1: Create a temporary SQL execution function
  const createFnSQL = `
    CREATE OR REPLACE FUNCTION public.temp_fix_constraints()
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- Drop old constraints
      ALTER TABLE public.couriers DROP CONSTRAINT IF EXISTS couriers_earning_model_check;
      ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_earning_model_check;
      
      -- Recreate with expanded values (both old DB values AND new form values)
      ALTER TABLE public.couriers ADD CONSTRAINT couriers_earning_model_check 
        CHECK (earning_model IN (
          'Saat+Paket Başı', 'Aylık Sabit', 'Paket Başı',
          'Esnaf Kurye - Saatlik Ücret + Paket Başı', 'Esnaf Kurye - Aylık Sabit', 'Sigortalı - Aylık Sabit'
        ));
      
      ALTER TABLE public.businesses ADD CONSTRAINT businesses_earning_model_check 
        CHECK (earning_model IN (
          'Saat+Paket Başı', 'Aylık Sabit', 'Paket Başı',
          'Esnaf Kurye - Saatlik Ücret + Paket Başı', 'Esnaf Kurye - Aylık Sabit', 'Sigortalı - Aylık Sabit'
        ));
      
      RETURN 'OK';
    END;
    $$;
  `;
  
  // Try to create the function via RPC
  // First, try to call a hypothetical exec_sql function
  const { data: rpcResult, error: rpcError } = await supabase.rpc('temp_fix_constraints');
  
  if (rpcError) {
    console.log('RPC call failed (function may not exist yet):', rpcError.message);
    console.log('\n⚠️ CHECK constraint\'leri otomatik olarak güncelleyemedim.');
    console.log('Lütfen Supabase Dashboard → SQL Editor\'da aşağıdaki SQL\'i çalıştırın:\n');
    console.log('------- SQL BAŞLANGIÇ -------');
    console.log(`
-- Eski constraint'leri kaldır
ALTER TABLE public.couriers DROP CONSTRAINT IF EXISTS couriers_earning_model_check;
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_earning_model_check;

-- Yeni constraint'leri oluştur (hem eski hem yeni değerleri kabul eder)
ALTER TABLE public.couriers ADD CONSTRAINT couriers_earning_model_check 
  CHECK (earning_model IN (
    'Saat+Paket Başı', 'Aylık Sabit', 'Paket Başı',
    'Esnaf Kurye - Saatlik Ücret + Paket Başı', 'Esnaf Kurye - Aylık Sabit', 'Sigortalı - Aylık Sabit'
  ));

ALTER TABLE public.businesses ADD CONSTRAINT businesses_earning_model_check 
  CHECK (earning_model IN (
    'Saat+Paket Başı', 'Aylık Sabit', 'Paket Başı',
    'Esnaf Kurye - Saatlik Ücret + Paket Başı', 'Esnaf Kurye - Aylık Sabit', 'Sigortalı - Aylık Sabit'
  ));
`);
    console.log('------- SQL BİTİŞ -------');
  } else {
    console.log('✅ Constraint\'ler başarıyla güncellendi!', rpcResult);
  }
  
  // Attempt to verify by testing insert
  console.log('\n📋 Test: Yeni değerlerle insert denemesi...');
  const testValues = [
    'Esnaf Kurye - Saatlik Ücret + Paket Başı',
    'Esnaf Kurye - Aylık Sabit',
    'Sigortalı - Aylık Sabit',
  ];
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
      working_days: ['İzinsiz'],
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
        console.log(`  ❌ "${val}" → HALA REDDEDİLİYOR (constraint güncellenemedi)`);
      } else {
        console.log(`  ✅ "${val}" → Constraint geçti (diğer hata: ${msg.substring(0, 60)})`);
      }
    } else {
      console.log(`  ✅ "${val}" → Başarıyla eklendi! Temizleniyor...`);
      await supabase.from('couriers').delete().eq('user_id', '00000000-0000-0000-0000-000000000099');
    }
  }
}

main().catch(console.error);
