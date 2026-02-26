const https = require('https');
const { execSync } = require('child_process');

const et = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const at = Buffer.from(et.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

const body = JSON.stringify({
  mailer_autoconfirm: false,
  double_confirm_changes: true,
  mailer_secure_email_change_enabled: true,
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
    const d = JSON.parse(b);
    console.log('mailer_autoconfirm:', d.mailer_autoconfirm);
    console.log('double_confirm_changes:', d.double_confirm_changes);
    console.log('mailer_secure_email_change_enabled:', d.mailer_secure_email_change_enabled);
  });
});
req.write(body);
req.end();
