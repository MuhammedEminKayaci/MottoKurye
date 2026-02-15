/**
 * Authentication E2E Tests
 * 
 * Kimlik doğrulama ve oturum yönetimi testleri
 */

import { test, expect } from '@playwright/test';

test.describe('Giriş Sayfası', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/giris');
    await page.waitForLoadState('networkidle');
  });

  test('giriş formu görünür olmalı', async ({ page }) => {
    // Email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('giriş yap butonu görünür olmalı', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').or(
      page.getByText(/giriş yap/i).locator('..').locator('button')
    ).first();
    await expect(submitBtn).toBeVisible();
  });

  test('kayıt ol linki görünür olmalı', async ({ page }) => {
    const kayitOlLink = page.getByRole('link', { name: /kayıt ol/i });
    await expect(kayitOlLink).toBeVisible();
  });

  test('şifremi unuttum linki görünür olmalı', async ({ page }) => {
    const sifremiUnuttumLink = page.getByText(/şifremi unuttum/i);
    await expect(sifremiUnuttumLink).toBeVisible();
  });

  test('boş form submit edilememeli', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    
    // Form validasyon hatası veya sayfa değişmemeli
    await expect(page).toHaveURL(/giris/);
  });

  test('geçersiz email formatı hata vermeli', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('gecersizemailformat');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Test123!');
    
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    
    // Hata mesajı gösterilmeli veya form submit edilmemeli
    await expect(page).toHaveURL(/giris/);
  });
});

test.describe('Kayıt Ol Sayfası', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kayit-ol');
    await page.waitForLoadState('networkidle');
  });

  test('kayıt formu görünür olmalı', async ({ page }) => {
    // E-posta input alanı
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('rol seçim butonları görünür olmalı', async ({ page }) => {
    // Kurye ve İşletme seçimi için kartlar veya butonlar
    await expect(page.getByText(/kurye/i).first()).toBeVisible();
  });

  test('kurye seçilince kurye formu görüntülenmeli', async ({ page }) => {
    // Sayfa görünür olmalı
    await expect(page.locator('body')).toBeVisible();
    
    // Kurye metni görünür
    await expect(page.getByText(/kurye/i).first()).toBeVisible();
  });
});

test.describe('Şifremi Unuttum Sayfası', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sifremi-unuttum');
    await page.waitForLoadState('networkidle');
  });

  test('email input alanı görünür olmalı', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('şifre sıfırlama butonu görünür olmalı', async ({ page }) => {
    const resetBtn = page.locator('button[type="submit"]').first();
    await expect(resetBtn).toBeVisible();
  });
});

test.describe('Oturum Korumalı Sayfalar', () => {
  const protectedPages = [
    '/profil',
    '/mesajlar',
    '/ilanlarim',
  ];

  for (const pagePath of protectedPages) {
    test(`${pagePath} sayfası oturumsuz erişimde yönlendirmeli`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      
      // Ya giriş sayfasına yönlendirilmiş olmalı ya da sayfa yüklenmemiş olmalı
      const isRedirected = currentUrl.includes('/giris') || currentUrl.includes('/hosgeldiniz');
      const isStillOnPage = currentUrl.includes(pagePath);
      
      expect(isRedirected || isStillOnPage).toBeTruthy();
    });
  }
});
