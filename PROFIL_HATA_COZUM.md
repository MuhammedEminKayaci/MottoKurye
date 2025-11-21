# Profil Bulunamadı Hatası - Çözüm Adımları

## Sorun
Kurye ilanına tıklandığında "Profil Bulunamadı" hatası alınıyor.

## Muhtemel Nedenler ve Çözümler

### 1. ✅ `create_clean_tables.sql` Dosyasını Çalıştırmadınız

**Büyük ihtimalle bu sorun!** Yeni tablo yapısı henüz oluşturulmamış.

**Çözüm:**
1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `create_clean_tables.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın
5. "Run" butonuna tıklayın

**ÖNEMLİ:** Bu işlem mevcut `couriers` ve `businesses` tablolarını silip yeniden oluşturacak!

### 2. Veritabanında Kurye Kaydı Yok

Tablolar oluşturulduktan sonra, yeni kullanıcı kaydı yapmanız gerekiyor.

**Çözüm:**
1. `/kayit-ol?role=kurye` sayfasına gidin
2. Yeni bir kurye kaydı oluşturun
3. Tüm bilgileri doldurun
4. Kayıt tamamlandıktan sonra `/ilanlar` sayfasına gidin
5. Kendi kaydınızı görebilmelisiniz

### 3. RLS (Row Level Security) Politikaları Aktif Değil

Supabase'de RLS politikaları düzgün kurulmamış olabilir.

**Kontrol:**
```sql
-- Couriers tablosunda politikaları kontrol et
SELECT * FROM pg_policies WHERE tablename = 'couriers';

-- Businesses tablosunda politikaları kontrol et
SELECT * FROM pg_policies WHERE tablename = 'businesses';
```

Eğer politika yoksa, `create_clean_tables.sql` dosyasını çalıştırın.

### 4. Server Component Supabase Client Sorunu

Server Component'ler için doğru client kullanılmıyor olabilir.

**Kontrol:**
- `lib/supabaseServer.ts` dosyası oluşturuldu mu? ✅
- Profil sayfaları `supabaseServer` import ediyor mu? ✅
- `.env.local` dosyası var mı? ✅

### 5. Development Server Yeniden Başlatılmadı

Environment variables yüklenmesi için server restart gerekiyor.

**Çözüm:**
```bash
# Terminal'de:
npm run dev
```

## Debug Adımları

### 1. Terminal/Console Log Kontrolü
Server terminal'inde şu mesajları arayın:
- `Courier profile fetch error:` - Hata detaylarını gösterir
- `No courier found for user_id:` - user_id'nin doğru olup olmadığını kontrol edin

### 2. Database Kontrolü
Supabase Dashboard → Table Editor:
```sql
-- Tüm kuryeleri listele
SELECT id, user_id, first_name, last_name FROM couriers;

-- Belirli bir user_id için arama
SELECT * FROM couriers WHERE user_id = 'BURAYA_USER_ID_YAPIŞTIR';
```

### 3. Network Tab Kontrolü
Browser Developer Tools → Network:
- Profil sayfası yüklenirken hangi istekler yapılıyor?
- Supabase API çağrılarında hata var mı?

## Hızlı Test

### Yeni Kullanıcı ile Test
1. **Çıkış yapın** (eğer login'seniz)
2. **Yeni kayıt oluşturun:**
   - `/kayit-ol?role=kurye`
   - Tüm alanları doldurun
   - Avatar yükleyin
3. **Kayıt sonrası:**
   - Otomatik olarak `/ilanlar` sayfasına yönleneceksiniz
4. **Başka bir hesap aç** (Incognito/Private mode):
   - `/ilanlar` sayfasına gidin
   - Oluşturduğunuz kurye kartını görün
   - Kartına tıklayın
   - Profil sayfası açılmalı

## En Yaygın Çözüm

%90 ihtimalle sorun, `create_clean_tables.sql` dosyasının çalıştırılmamış olmasıdır.

**Şu adımları takip edin:**
1. ✅ Supabase Dashboard → SQL Editor
2. ✅ `create_clean_tables.sql` içeriğini yapıştır
3. ✅ Run
4. ✅ `npm run dev` ile server'ı restart et
5. ✅ Yeni kullanıcı kaydet
6. ✅ Test et

## Hala Çalışmıyorsa

Terminal çıktısını ve browser console'daki hata mesajlarını paylaşın.
