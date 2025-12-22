# Supabase Email Doğrulaması Kurulumu

## 1. Email Provider Ayarları (Supabase Console)

### Adım 1: Supabase Dashboard'a Git
- https://app.supabase.com adresine git
- Projenizi seçin

### Adım 2: Email Settings (Authentication > Email Templates)
1. **Authentication** → **Email Templates** bölümüne git
2. Tüm email template'lerinde gönderici adı ayarını kontrol et:
   - "MottoKurye" olarak ayarla

### Adım 3: Email Sender Configuration
1. **Project Settings** → **Email** bölümüne git
2. Gönderici adı (Sender Name): `MottoKurye` olarak ayarla
3. Gönderici email: `noreply@[supabase-project-ref].supabase.co`

### Adım 4: Email Confirmation Required
1. **Authentication** → **Providers** → **Email**
2. "Require email confirmation" seçeneğini **ON** (Aktif) yap
3. Bu ayar şu şekilde çalışır:
   - Kullanıcı kayıt olur
   - Email doğrulama linki gönderilir
   - Doğrulama yapılmadan profil sayfasına gidemez
   - `user.email_confirmed_at` null olur doğrulama yapılmadıkça

## 2. Kod Tarafında Güncellemeler

### Yapılan Değişiklikler:
- **app/kayit-ol/page.tsx**: Email doğrulama durumunu kontrol eden UI eklendi
- Doğrulama yapılmadan profil kaydına izin verilmez
- Email doğrulama bekleme ekranı gösterilir

## 3. Test
1. Yeni email ile kayıt ol
2. Email doğrulama mesajı almalısın
3. Link üzerinden doğrula
4. Profil sayfasına erişim sağlanır

## 4. Email Template Özelleştirme (Opsiyonel)

**Authentication** → **Email Templates** → **Confirmation Email** seçerek:
```
Merhaba {{ .Email }},

MottoKurye'ye hoş geldiniz! Hesabınızı doğrulamak için aşağıdaki linke tıklayın:

{{ .ConfirmationURL }}

Bu link 24 saat geçerlidir.

MottoKurye Ekibi
```

Şeklinde özelleştir.

## 5. Redirect URL'leri Ayarla
1. **Authentication** → **URL Configuration**
2. Aşağıdaki URL'leri ekle:
   - Site URL: `https://kurye-app-dusky.vercel.app` (veya local: `http://localhost:3000`)
   - Redirect URLs:
     - `https://kurye-app-dusky.vercel.app/hosgeldiniz`
     - `https://kurye-app-dusky.vercel.app/kayit-ol`
     - `http://localhost:3000/hosgeldiniz`
     - `http://localhost:3000/kayit-ol`
