const https = require('https');
const { execSync } = require('child_process');

const et = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const at = Buffer.from(et.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

// Onaylanmamis kullanicilari listele
const query = `SELECT id, email, email_confirmed_at, created_at FROM auth.users WHERE email_confirmed_at IS NULL ORDER BY created_at DESC LIMIT 10;`;

const body = JSON.stringify({ query });

const opts = {
  hostname: 'api.supabase.com',
  path: '/v1/projects/mgjwlfyxfxmfappwputi/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + at,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(opts, (res) => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    const data = JSON.parse(b);
    if (Array.isArray(data) && data.length > 0) {
      console.log('=== Onaylanmamis Kullanicilar ===');
      data.forEach(u => {
        console.log(`  ${u.email} | created: ${u.created_at} | id: ${u.id}`);
      });
      console.log(`\nToplam: ${data.length} onaylanmamis kullanici`);
    } else {
      console.log('Onaylanmamis kullanici yok.');
      console.log('Raw:', JSON.stringify(data).substring(0, 200));
    }
  });
});
req.write(body);
req.end();
