const https = require('https');
const { execSync } = require('child_process');

const et = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const at = Buffer.from(et.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

// Onaylanmamis kullanicilari sil
const query = `DELETE FROM auth.users WHERE email_confirmed_at IS NULL; SELECT 'Silindi' as result;`;

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
    console.log('Status:', res.statusCode);
    console.log('Response:', b.substring(0, 300));
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Onaylanmamis kullanicilar silindi.');
    }
  });
});
req.write(body);
req.end();
