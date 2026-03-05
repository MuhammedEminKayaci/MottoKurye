const fs = require('fs');
const path = require('path');

// .env.local dosyasını manuel oku
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
});

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

(async () => {
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error('Hata:', listErr.message); process.exit(1); }

  const admin = users.find(u => u.email === 'eminkayaci07@gmail.com');
  if (!admin) {
    console.log('eminkayaci07@gmail.com bulunamadi. Mevcut kullanicilar:');
    users.forEach(u => console.log(' -', u.email));
    console.log('\nKullanici olusturuluyor...');
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: 'eminkayaci07@gmail.com',
      password: '123456',
      email_confirm: true,
    });
    if (createErr) { console.error('Olusturulamadi:', createErr.message); process.exit(1); }
    console.log('Admin kullanici olusturuldu ve sifre 123456 olarak ayarlandi ✓');
    process.exit(0);
    return;
  }

  const { error } = await supabase.auth.admin.updateUserById(admin.id, { password: '123456' });
  if (error) { console.error('Sifre guncellenemedi:', error.message); process.exit(1); }
  console.log('Sifre basariyla 123456 olarak guncellendi ✓');
  process.exit(0);
})();
