const https = require('https');
const { execSync } = require('child_process');

const et = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const at = Buffer.from(et.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

const getOpts = {
  hostname: 'api.supabase.com',
  path: '/v1/projects/mgjwlfyxfxmfappwputi/config/auth',
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + at, 'Content-Type': 'application/json' },
};

const getReq = https.request(getOpts, (res) => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    const config = JSON.parse(b);
    // rate_limit veya smtp ile ilgili tum keyleri goster
    const keys = Object.keys(config).filter(k => 
      k.toLowerCase().includes('rate') || 
      k.toLowerCase().includes('smtp') || 
      k.toLowerCase().includes('email') ||
      k.toLowerCase().includes('mailer') ||
      k.toLowerCase().includes('frequency')
    );
    console.log('Rate limit / email ilgili ayarlar:');
    keys.forEach(k => console.log('  ' + k + ':', config[k]));
    console.log('\n--- TUM KEYLER ---');
    Object.keys(config).forEach(k => console.log('  ' + k + ':', typeof config[k] === 'object' ? JSON.stringify(config[k]) : config[k]));
  });
});
getReq.end();
