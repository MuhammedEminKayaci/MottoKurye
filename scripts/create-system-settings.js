// system_settings tablosu oluşturma script'i
// .env.local'dan service role key ile çalışır
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// .env.local dosyasını manuel oku
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('⚙️  system_settings tablosu oluşturuluyor...\n');

  // Tablo oluştur (rpc ile SQL çalıştır)
  const { error: rpcError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Herkes ayarları okuyabilir" ON public.system_settings;
      CREATE POLICY "Herkes ayarları okuyabilir" ON public.system_settings
        FOR SELECT USING (true);
      
      INSERT INTO public.system_settings (key, value, description)
      VALUES ('email_verification_enabled', 'true', 'Kayıt sırasında e-posta doğrulama zorunluluğu')
      ON CONFLICT (key) DO NOTHING;
    `
  });

  if (rpcError) {
    // rpc yoksa doğrudan tablo insert dene (tablo zaten varsa)
    console.log('ℹ️  RPC mevcut değil, doğrudan insert deneniyor...');
    
    const { error: insertError } = await supabase
      .from('system_settings')
      .upsert({ 
        key: 'email_verification_enabled', 
        value: 'true', 
        description: 'Kayıt sırasında e-posta doğrulama zorunluluğu' 
      }, { onConflict: 'key' });

    if (insertError) {
      if (insertError.message?.includes('relation') || insertError.code === '42P01') {
        console.error('❌ Tablo bulunamadı. Lütfen aşağıdaki SQL\'i Supabase Dashboard > SQL Editor\'de çalıştırın:\n');
        console.log(`
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.system_settings (key, value, description)
VALUES ('email_verification_enabled', 'true', 'Kayıt sırasında e-posta doğrulama zorunluluğu')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes ayarları okuyabilir" ON public.system_settings;
CREATE POLICY "Herkes ayarları okuyabilir" ON public.system_settings
  FOR SELECT USING (true);
        `);
        process.exit(1);
      }
      console.error('❌ Hata:', insertError.message);
      process.exit(1);
    }
    console.log('✅ Ayar başarıyla eklendi!');
  } else {
    console.log('✅ Tablo ve ayarlar başarıyla oluşturuldu!');
  }

  // Doğrulama
  const { data, error } = await supabase.from('system_settings').select('*');
  if (error) {
    console.error('❌ Doğrulama hatası:', error.message);
  } else {
    console.log('\n📋 Mevcut ayarlar:');
    data.forEach(s => console.log(`   ${s.key} = ${s.value} (${s.description})`));
  }

  console.log('\n✅ Tamamlandı!');
}

main();

