// Supabase Email Doğrulama Ayarını Kontrol Et ve Aç
const https = require('https');
const { execSync } = require('child_process');

const encodedToken = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const accessToken = Buffer.from(encodedToken.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');
const PROJECT_REF = 'mgjwlfyxfxmfappwputi';

function apiRequest(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.supabase.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let respBody = '';
      res.on('data', c => respBody += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(respBody) }); }
        catch { resolve({ status: res.statusCode, data: respBody }); }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔍 Supabase Auth Ayarlarını Kontrol Ediyorum...\n');

  // Mevcut auth config'i getir
  const config = await apiRequest('GET', `/v1/projects/${PROJECT_REF}/config/auth`);
  
  if (config.error || config.status >= 400) {
    console.log('❌ Auth config alınamadı:', config);
    return;
  }

  const authConfig = config.data;
  console.log('📋 Mevcut Email Doğrulama Ayarları:');
  console.log(`  MAILER_AUTOCONFIRM: ${authConfig.MAILER_AUTOCONFIRM}`);
  console.log(`  MAILER_OTP_EXP: ${authConfig.MAILER_OTP_EXP}`);
  console.log(`  EXTERNAL_EMAIL_ENABLED: ${authConfig.EXTERNAL_EMAIL_ENABLED}`);
  console.log(`  SMTP_ADMIN_EMAIL: ${authConfig.SMTP_ADMIN_EMAIL || 'Yok'}`);
  console.log(`  SMTP_HOST: ${authConfig.SMTP_HOST || 'Yok'}`);
  console.log(`  SMTP_PORT: ${authConfig.SMTP_PORT || 'Yok'}`);
  console.log(`  SMTP_SENDER_NAME: ${authConfig.SMTP_SENDER_NAME || 'Yok'}`);
  console.log(`  DOUBLE_CONFIRM_CHANGES: ${authConfig.DOUBLE_CONFIRM_CHANGES}`);
  console.log(`  MAILER_SECURE_EMAIL_CHANGE_ENABLED: ${authConfig.MAILER_SECURE_EMAIL_CHANGE_ENABLED}`);

  if (authConfig.MAILER_AUTOCONFIRM === false) {
    console.log('\n✅ Email doğrulama zaten AKTİF! (MAILER_AUTOCONFIRM = false)');
  } else {
    console.log('\n⚠️ Email doğrulama KAPALI (MAILER_AUTOCONFIRM = true)');
    console.log('📧 Email doğrulamayı açıyorum...\n');

    const updateResult = await apiRequest('PATCH', `/v1/projects/${PROJECT_REF}/config/auth`, {
      MAILER_AUTOCONFIRM: false,
      DOUBLE_CONFIRM_CHANGES: true,
      MAILER_SECURE_EMAIL_CHANGE_ENABLED: true,
    });

    if (updateResult.status >= 200 && updateResult.status < 300) {
      console.log('✅ Email doğrulama başarıyla AKTİF edildi!');
      console.log('  - MAILER_AUTOCONFIRM: false');
      console.log('  - DOUBLE_CONFIRM_CHANGES: true');
      console.log('  - MAILER_SECURE_EMAIL_CHANGE_ENABLED: true');
    } else {
      console.log('❌ Güncelleme başarısız:', updateResult);
    }
  }
}

main().catch(console.error);
