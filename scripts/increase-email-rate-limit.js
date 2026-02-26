const https = require('https');
const { execSync } = require('child_process');

const et = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const at = Buffer.from(et.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

const body = JSON.stringify({
  rate_limit_email_sent: 30,
  smtp_max_frequency: 10,
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
    console.log('Status:', res.statusCode);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const config = JSON.parse(b);
      console.log('rate_limit_email_sent:', config.rate_limit_email_sent);
      console.log('smtp_max_frequency:', config.smtp_max_frequency);
      console.log('Basarili!');
    } else {
      console.log('Hata:', b.substring(0, 500));
    }
  });
});
req.write(body);
req.end();
