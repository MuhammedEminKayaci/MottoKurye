const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgjwlfyxfxmfappwputi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const OLD_TO_NEW = {
  'Saat+Paket Başı': 'Esnaf Kurye - Saatlik Ücret + Paket Başı',
  'Aylık Sabit': 'Esnaf Kurye - Aylık Sabit',
  'Paket Başı': 'Sigortalı - Aylık Sabit',
};

async function main() {
  // 1. Check current values
  console.log('=== MEVCUT DEĞERLER ===');
  const { data: c } = await supabase.from('couriers').select('id, earning_model').not('earning_model', 'is', null);
  const { data: b } = await supabase.from('businesses').select('id, earning_model').not('earning_model', 'is', null);
  const { data: a } = await supabase.from('business_ads').select('id, earning_model').not('earning_model', 'is', null);
  
  console.log('Couriers:', [...new Set(c?.map(r => r.earning_model))]);
  console.log('Businesses:', [...new Set(b?.map(r => r.earning_model))]);
  console.log('Business_ads:', [...new Set(a?.map(r => r.earning_model))]);

  // 2. Try to update constraint via SQL (rpc)
  console.log('\n=== CONSTRAINT GÜNCELLEME ===');
  
  const sql = `
    DO $$
    BEGIN
      ALTER TABLE public.couriers DROP CONSTRAINT IF EXISTS couriers_earning_model_check;
      ALTER TABLE public.couriers ADD CONSTRAINT couriers_earning_model_check 
        CHECK (earning_model IN (
          'Esnaf Kurye - Saatlik Ücret + Paket Başı', 
          'Esnaf Kurye - Aylık Sabit', 
          'Sigortalı - Aylık Sabit',
          'Saat+Paket Başı', 
          'Aylık Sabit', 
          'Paket Başı'
        ));
      
      ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_earning_model_check;
      ALTER TABLE public.businesses ADD CONSTRAINT businesses_earning_model_check 
        CHECK (earning_model IN (
          'Esnaf Kurye - Saatlik Ücret + Paket Başı', 
          'Esnaf Kurye - Aylık Sabit', 
          'Sigortalı - Aylık Sabit',
          'Saat+Paket Başı', 
          'Aylık Sabit', 
          'Paket Başı'
        ));
    END $$;
  `;

  // Try via rpc
  const { error: rpcErr } = await supabase.rpc('exec_sql', { query: sql });
  if (rpcErr) {
    console.log('RPC exec_sql mevcut değil, alternatif deneniyor...');
    
    // Try creating the function first
    const createFnSql = `
      CREATE OR REPLACE FUNCTION public.exec_sql(query text) RETURNS void AS $$
      BEGIN EXECUTE query; END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    const { error: fnErr } = await supabase.rpc('exec_sql', { query: createFnSql });
    if (fnErr) {
      console.log('RPC erişimi yok. Doğrudan veri güncelleme denenecek...');
      console.log('');
      console.log('⚠️  CHECK constraint güncellemek için Supabase Dashboard > SQL Editor kullanın:');
      console.log('');
      console.log(sql);
    }
  } else {
    console.log('✅ Constraint güncellendi!');
  }

  // 3. Update existing data from old short values to new long values
  console.log('\n=== VERİ GÜNCELLEME ===');
  
  for (const [oldVal, newVal] of Object.entries(OLD_TO_NEW)) {
    // Try updating couriers
    const { data: cUpd, error: cErr } = await supabase
      .from('couriers')
      .update({ earning_model: newVal })
      .eq('earning_model', oldVal)
      .select('id');
    
    if (cErr) {
      console.log(`  ❌ Couriers "${oldVal}" → "${newVal}": ${cErr.message}`);
    } else {
      console.log(`  ✅ Couriers "${oldVal}" → "${newVal}": ${cUpd?.length || 0} kayıt güncellendi`);
    }

    // Try updating businesses
    const { data: bUpd, error: bErr } = await supabase
      .from('businesses')
      .update({ earning_model: newVal })
      .eq('earning_model', oldVal)
      .select('id');
    
    if (bErr) {
      console.log(`  ❌ Businesses "${oldVal}" → "${newVal}": ${bErr.message}`);
    } else {
      console.log(`  ✅ Businesses "${oldVal}" → "${newVal}": ${bUpd?.length || 0} kayıt güncellendi`);
    }

    // Try updating business_ads
    const { data: aUpd, error: aErr } = await supabase
      .from('business_ads')
      .update({ earning_model: newVal })
      .eq('earning_model', oldVal)
      .select('id');
    
    if (aErr) {
      console.log(`  ❌ Business_ads "${oldVal}" → "${newVal}": ${aErr.message}`);
    } else {
      console.log(`  ✅ Business_ads "${oldVal}" → "${newVal}": ${aUpd?.length || 0} kayıt güncellendi`);
    }
  }

  // 4. Verify final state
  console.log('\n=== DOĞRULAMA ===');
  const { data: c2 } = await supabase.from('couriers').select('earning_model').not('earning_model', 'is', null);
  const { data: b2 } = await supabase.from('businesses').select('earning_model').not('earning_model', 'is', null);
  const { data: a2 } = await supabase.from('business_ads').select('earning_model').not('earning_model', 'is', null);
  
  console.log('Couriers:', [...new Set(c2?.map(r => r.earning_model))]);
  console.log('Businesses:', [...new Set(b2?.map(r => r.earning_model))]);
  console.log('Business_ads:', [...new Set(a2?.map(r => r.earning_model))]);

  // 5. Test insert with new long values 
  console.log('\n=== INSERT TESTİ ===');
  const testValues = [
    'Esnaf Kurye - Saatlik Ücret + Paket Başı',
    'Esnaf Kurye - Aylık Sabit',
    'Sigortalı - Aylık Sabit'
  ];
  
  for (const val of testValues) {
    const { error } = await supabase.from('couriers').insert({
      user_id: '00000000-0000-0000-0000-000000000099',
      first_name: 'TEST',
      last_name: 'TEST',
      age: 25,
      gender: 'Erkek',
      nationality: 'Türk',
      phone: '05001234567',
      province: 'İstanbul',
      district: ['Kadıköy'],
      working_type: 'Full Time',
      earning_model: val,
      working_days: ['İzinsiz'],
      daily_package_estimate: '15-25 PAKET',
      license_type: 'A',
      has_motorcycle: 'VAR',
      has_bag: 'VAR',
      experience: '0-1',
    });
    
    if (error) {
      if (error.message.includes('earning_model_check')) {
        console.log(`  ❌ "${val}" → Constraint REDDETTİ`);
      } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log(`  ✅ "${val}" → Constraint GEÇTİ (duplicate key - normal)`);
      } else {
        console.log(`  ⚠️  "${val}" → ${error.message}`);
      }
    } else {
      console.log(`  ✅ "${val}" → Constraint GEÇTİ`);
      // Cleanup test data
      await supabase.from('couriers').delete().eq('user_id', '00000000-0000-0000-0000-000000000099');
    }
  }
  
  // Final cleanup
  await supabase.from('couriers').delete().eq('user_id', '00000000-0000-0000-0000-000000000099');
}

main().catch(console.error);
