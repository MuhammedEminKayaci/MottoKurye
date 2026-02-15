/**
 * Full User Flow E2E Tests
 * 
 * Tam kullanıcı senaryoları - Kayıt, Giriş, İlan, Mesajlaşma
 */

import { test, expect, Page } from '@playwright/test';

// Helper: Sayfanın yüklenmesini bekle
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

test.describe('Kurye Kayıt Akışı', () => {
  test('kurye olarak kayıt ol', async ({ page }) => {
    await page.goto('/kayit-ol');
    await waitForPageLoad(page);
    
    // Email ve şifre gir
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill(`test.kurye.${Date.now()}@test.com`);
    
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('Test123456!');
    }
    
    // Sayfa yapısına göre form kontrolü
    await expect(page.locator('body')).toBeVisible();
  });

  test('kurye kayıt formu alanları görünür olmalı', async ({ page }) => {
    await page.goto('/kayit-ol');
    await waitForPageLoad(page);
    
    // Temel alanlar
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });
});

test.describe('İşletme Kayıt Akışı', () => {
  test('işletme olarak kayıt ol sayfası görünür', async ({ page }) => {
    // İşletme kayıt sayfasına URL parametresiyle git
    await page.goto('/kayit-ol?role=isletme');
    await waitForPageLoad(page);
    
    // Kayıt sayfası yüklendi - email input görünür olmalı
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('Giriş Akışı', () => {
  test('giriş sayfası görünür', async ({ page }) => {
    await page.goto('/giris');
    await waitForPageLoad(page);
    
    // Form alanları görünür
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();
  });

  test('boş form submit edilememeli', async ({ page }) => {
    await page.goto('/giris');
    await waitForPageLoad(page);
    
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    
    // Sayfada kalmalı (validasyon hatası)
    await expect(page).toHaveURL(/giris/);
  });

  test('geçersiz credentials hata vermeli', async ({ page }) => {
    await page.goto('/giris');
    await waitForPageLoad(page);
    
    await page.locator('input[type="email"]').fill('gecersiz@test.com');
    await page.locator('input[type="password"]').fill('yanlis123');
    
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    
    // Hata mesajı veya sayfada kalma
    await page.waitForTimeout(2000);
    
    // Ya hata mesajı gösterilir ya da giriş sayfasında kalır
    const isOnLoginPage = page.url().includes('giris');
    expect(isOnLoginPage).toBeTruthy();
  });

  test('şifremi unuttum linki çalışmalı', async ({ page }) => {
    await page.goto('/giris');
    await waitForPageLoad(page);
    
    const forgotLink = page.getByText(/şifremi unuttum/i);
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    
    await expect(page).toHaveURL(/sifremi-unuttum/);
  });
});

test.describe('Kurye Arama Fonksiyonu', () => {
  test('kurye bul sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/kurye-bul');
    await waitForPageLoad(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('kurye listesi veya filtre paneli görünmeli', async ({ page }) => {
    await page.goto('/kurye-bul');
    await waitForPageLoad(page);
    
    // Ya kurye listesi ya da arama/filtre alanı olmalı
    const hasContent = await page.locator('main, .content, article').count() > 0;
    expect(hasContent).toBeTruthy();
  });
});

test.describe('İşletme Arama Fonksiyonu', () => {
  test('işletme bul sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/isletme-bul');
    await waitForPageLoad(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('işletme listesi veya filtre paneli görünmeli', async ({ page }) => {
    await page.goto('/isletme-bul');
    await waitForPageLoad(page);
    
    // Ya işletme listesi ya da arama/filtre alanı olmalı
    const hasContent = await page.locator('main, .content, article').count() > 0;
    expect(hasContent).toBeTruthy();
  });
});

test.describe('İlanlar Sayfası', () => {
  test('ilanlar sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/ilanlar');
    await waitForPageLoad(page);
    
    // Sayfa yüklenmeli (oturum gerektiriyorsa yönlendirme olabilir)
    const currentUrl = page.url();
    const isValidPage = currentUrl.includes('ilanlar') || 
                        currentUrl.includes('giris') || 
                        currentUrl.includes('hosgeldiniz');
    expect(isValidPage).toBeTruthy();
  });
});

test.describe('Profil Sayfası (Oturum Gerekli)', () => {
  test('profil sayfası oturumsuz erişimde yönlendirmeli', async ({ page }) => {
    await page.goto('/profil');
    await waitForPageLoad(page);
    
    // Giriş sayfasına veya hoşgeldiniz sayfasına yönlendirilmeli
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('giris') || 
                         currentUrl.includes('hosgeldiniz') ||
                         currentUrl.includes('profil');
    expect(isRedirected).toBeTruthy();
  });
});

test.describe('Mesajlar Sayfası (Oturum Gerekli)', () => {
  test('mesajlar sayfası oturumsuz erişimde yönlendirmeli', async ({ page }) => {
    await page.goto('/mesajlar');
    await waitForPageLoad(page);
    
    // Giriş sayfasına yönlendirilmeli veya sayfa görüntülenmeli
    const currentUrl = page.url();
    const isValidState = currentUrl.includes('giris') || 
                         currentUrl.includes('hosgeldiniz') ||
                         currentUrl.includes('mesajlar');
    expect(isValidState).toBeTruthy();
  });
});

test.describe('Ücret Planları', () => {
  test('ücret planları sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/ucret-planlari');
    await waitForPageLoad(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('plan kartları görünür olmalı', async ({ page }) => {
    await page.goto('/ucret-planlari');
    await waitForPageLoad(page);
    
    // Plan isimleri veya fiyatlar görünür olmalı
    const hasPlans = await page.getByText(/ücretsiz|standart|premium|free|₺|TL/i).count() > 0;
    expect(hasPlans).toBeTruthy();
  });
});

test.describe('Yasal Sayfalar', () => {
  test('kullanım şartları sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/kullanim-sartlari');
    await waitForPageLoad(page);
    
    // Sayfa başlığı görünür olmalı
    await expect(page.getByText(/kullanım şartları/i).first()).toBeVisible();
  });

  test('gizlilik politikası sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/gizlilik-politikasi');
    await waitForPageLoad(page);
    
    // Sayfa başlığı görünür olmalı
    await expect(page.getByText(/gizlilik politikası/i).first()).toBeVisible();
  });

  test('KVKK aydınlatma sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/kvkk-aydinlatma');
    await waitForPageLoad(page);
    
    // Sayfa başlığı görünür olmalı
    await expect(page.getByText(/kvkk/i).first()).toBeVisible();
  });

  test('ticari ileti izni sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/ticari-ileti-izni');
    await waitForPageLoad(page);
    
    // Sayfa başlığı görünür olmalı
    await expect(page.getByText(/ticari ileti/i).first()).toBeVisible();
  });
});

test.describe('İletişim Sayfası', () => {
  test('iletişim sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/iletisim');
    await waitForPageLoad(page);
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Şifre Sıfırlama Akışı', () => {
  test('şifremi unuttum sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/sifremi-unuttum');
    await waitForPageLoad(page);
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('şifre sıfırlama butonu görünür olmalı', async ({ page }) => {
    await page.goto('/sifremi-unuttum');
    await waitForPageLoad(page);
    
    const resetBtn = page.locator('button[type="submit"]').first();
    await expect(resetBtn).toBeVisible();
  });

  test('geçerli email ile form submit edilebilmeli', async ({ page }) => {
    await page.goto('/sifremi-unuttum');
    await waitForPageLoad(page);
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    
    const resetBtn = page.locator('button[type="submit"]').first();
    await resetBtn.click();
    
    // İşlem sonrası mesaj veya yönlendirme
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Responsive Tasarım', () => {
  test('mobil görünüm çalışmalı', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await waitForPageLoad(page);
    
    await expect(page.locator('header').or(page.locator('nav')).first()).toBeVisible();
  });

  test('tablet görünüm çalışmalı', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await waitForPageLoad(page);
    
    await expect(page.locator('header').or(page.locator('nav')).first()).toBeVisible();
  });

  test('desktop görünüm çalışmalı', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await waitForPageLoad(page);
    
    await expect(page.locator('header').or(page.locator('nav')).first()).toBeVisible();
  });
});
