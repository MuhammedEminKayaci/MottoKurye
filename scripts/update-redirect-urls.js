const https = require('https');
const { execSync } = require('child_process');

const et = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const at = Buffer.from(et.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

// Redirect URL'leri güncelle
const body = JSON.stringify({
  uri_allow_list: 'https://motto-kurye-beta.vercel.app/**,http://localhost:3000/**',
  site_url: 'https://motto-kurye-beta.vercel.app',
});

const opts = {
  hostname: 'api.supabase.com',
  path: '/v1/projects/mgjwlfyxfxmfappwputi/config/auth',
  method: 'PATCH',
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
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const d = JSON.parse(b);
      console.log('✅ Redirect URL ayarları güncellendi!');
      console.log('  site_url:', d.site_url);
      console.log('  uri_allow_list:', d.uri_allow_list);
    } else {
      console.log('❌ Güncelleme başarısız:', res.statusCode, b);
    }
  });
});
req.write(body);
req.end();
