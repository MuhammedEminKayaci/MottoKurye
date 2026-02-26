const https = require('https');
const { execSync } = require('child_process');

const et = execSync('security find-generic-password -s "Supabase CLI" -w', { encoding: 'utf-8' }).trim();
const at = Buffer.from(et.replace('go-keyring-base64:', ''), 'base64').toString('utf-8');

const confirmationTemplate = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #ff7a00; font-size: 24px; margin: 0;">Paket Servisci</h1>
  </div>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 30px; text-align: center;">
    <h2 style="color: #333; font-size: 20px; margin-bottom: 16px;">E-posta Doğrulama Kodun</h2>
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      Paket Servisci'ye hoş geldin! Hesabını aktifleştirmek için aşağıdaki doğrulama kodunu kullan.
    </p>
    <div style="background: #fff3e0; border: 2px dashed #ff7a00; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="color: #999; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Doğrulama Kodu</p>
      <p style="color: #ff7a00; font-size: 32px; font-weight: 800; letter-spacing: 8px; margin: 0;">{{ .Token }}</p>
    </div>
    <p style="color: #999; font-size: 12px; margin-top: 16px;">
      Bu kod 1 saat geçerlidir. Eğer bu hesabı sen oluşturmadıysan bu e-postayı görmezden gelebilirsin.
    </p>
  </div>
  <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">
    © Paket Servisci - Tüm hakları saklıdır.
  </p>
</div>`;

const recoveryTemplate = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #ff7a00; font-size: 24px; margin: 0;">Paket Servisci</h1>
  </div>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 30px; text-align: center;">
    <h2 style="color: #333; font-size: 20px; margin-bottom: 16px;">Şifre Sıfırlama</h2>
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      Şifreni sıfırlamak için aşağıdaki butona tıkla.
    </p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #ff7a00; color: white; text-decoration: none; padding: 12px 32px; border-radius: 25px; font-weight: 600; font-size: 14px;">
      Şifremi Sıfırla
    </a>
    <p style="color: #999; font-size: 12px; margin-top: 24px;">
      Bu bağlantı 1 saat geçerlidir. Eğer bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.
    </p>
  </div>
  <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">
    © Paket Servisci - Tüm hakları saklıdır.
  </p>
</div>`;

const body = JSON.stringify({
  mailer_subjects_confirmation: "Paket Servisci - Doğrulama Kodunuz",
  mailer_subjects_recovery: "Paket Servisci - Şifre Sıfırlama",
  mailer_subjects_email_change: "Paket Servisci - E-posta Değişikliği Onayı",
  mailer_subjects_magic_link: "Paket Servisci - Giriş Bağlantısı",
  mailer_templates_confirmation_content: confirmationTemplate,
  mailer_templates_recovery_content: recoveryTemplate,
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
      console.log('✅ Email şablonları Türkçe olarak güncellendi!');
      console.log('  - Doğrulama konusu: Paket Servisci - E-postanı Doğrula');
      console.log('  - Şifre sıfırlama konusu: Paket Servisci - Şifre Sıfırlama');
    } else {
      console.log('❌ Güncelleme başarısız:', res.statusCode, b);
    }
  });
});
req.write(body);
req.end();
