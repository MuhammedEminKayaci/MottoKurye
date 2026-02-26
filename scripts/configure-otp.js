const https = require('https');
const { execSync } = require('child_process');

const et = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const at = Buffer.from(et.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

const getOpts = {
  hostname: 'api.supabase.com',
  path: '/v1/projects/mgjwlfyxfxmfappwputi/config/auth',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + at,
    'Content-Type': 'application/json',
  },
};

const getReq = https.request(getOpts, (res) => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    const config = JSON.parse(b);
    console.log('=== Mevcut Email/OTP Ayarlari ===');
    console.log('mailer_autoconfirm:', config.mailer_autoconfirm);
    console.log('mailer_otp_exp:', config.mailer_otp_exp);
    console.log('mailer_otp_length:', config.mailer_otp_length);

    const body = JSON.stringify({
      mailer_autoconfirm: false,
      mailer_otp_exp: 3600,
      mailer_otp_length: 6,
    });

    const patchOpts = {
      hostname: 'api.supabase.com',
      path: '/v1/projects/mgjwlfyxfxmfappwputi/config/auth',
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + at,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const patchReq = https.request(patchOpts, (pRes) => {
      let pb = '';
      pRes.on('data', c => pb += c);
      pRes.on('end', () => {
        if (pRes.statusCode >= 200 && pRes.statusCode < 300) {
          const updated = JSON.parse(pb);
          console.log('=== Guncellenmis Ayarlar ===');
          console.log('mailer_autoconfirm:', updated.mailer_autoconfirm);
          console.log('mailer_otp_exp:', updated.mailer_otp_exp);
          console.log('mailer_otp_length:', updated.mailer_otp_length);
          console.log('TAMAM');
        } else {
          console.log('HATA:', pRes.statusCode, pb);
        }
      });
    });
    patchReq.write(body);
    patchReq.end();
  });
});
getReq.end();
