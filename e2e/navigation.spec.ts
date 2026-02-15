/**
 * Navigation E2E Tests
 * 
 * Sayfa navigasyonu ve routing testleri
 */

import { test, expect } from '@playwright/test';

test.describe('Ana Sayfa Navigasyon', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ana sayfa yüklenmeli', async ({ page }) => {
    await expect(page).toHaveTitle(/PaketServisçi|Kurye|Next/i);
  });

  test('logo görünür olmalı', async ({ page }) => {
    const logo = page.locator('img[alt="PaketServisi Logo"], img[alt*="kurye"]').first();
    await expect(logo).toBeVisible();
  });

  test('Kurye Bul butonu çalışmalı', async ({ page, isMobile }) => {
    // Mobile'da bu butonlar farklı bir layout'ta olabilir
    test.skip(isMobile, 'Bu test desktop için');
    const kuryeBulBtn = page.getByRole('button', { name: /Kurye Bul/i });
    await expect(kuryeBulBtn).toBeVisible();
    await kuryeBulBtn.click();
    await expect(page).toHaveURL('/kurye-bul');
  });

  test('İşletme Bul butonu çalışmalı', async ({ page, isMobile }) => {
    // Mobile'da bu butonlar farklı bir layout'ta olabilir
    test.skip(isMobile, 'Bu test desktop için');
    const isletmeBulBtn = page.getByRole('button', { name: /İşletme Bul/i });
    await expect(isletmeBulBtn).toBeVisible();
    await isletmeBulBtn.click();
    await expect(page).toHaveURL('/isletme-bul');
  });

  test('Hemen Kayıt Ol linki çalışmalı', async ({ page }) => {
    const kayitOlLink = page.getByRole('link', { name: /Hemen Kayıt Ol/i });
    await expect(kayitOlLink).toBeVisible();
    await kayitOlLink.click();
    await expect(page).toHaveURL('/kayit-ol');
  });
});

test.describe('Header Navigasyon', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('header görünür olmalı', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('Giriş Yap butonu görünür olmalı', async ({ page, isMobile }) => {
    // Mobile'da header butonları hamburger menüde olabilir
    test.skip(isMobile, 'Bu test desktop için');
    const girisYapBtn = page.getByRole('link', { name: /Giriş Yap/i }).first();
    await expect(girisYapBtn).toBeVisible();
  });

  test('Kayıt Ol butonu görünür olmalı', async ({ page, isMobile }) => {
    // Mobile'da header butonları hamburger menüde olabilir
    test.skip(isMobile, 'Bu test desktop için');
    const kayitOlBtn = page.getByRole('link', { name: /Kayıt Ol/i }).first();
    await expect(kayitOlBtn).toBeVisible();
  });

  test('İletişim linki çalışmalı', async ({ page }) => {
    const iletisimLink = page.getByRole('link', { name: /İletişim/i }).first();
    await iletisimLink.click();
    await expect(page).toHaveURL('/iletisim');
  });
});

test.describe('Footer Navigasyon', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('footer görünür olmalı', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('Kullanım Şartları linki çalışmalı', async ({ page }) => {
    const link = page.getByRole('link', { name: /Kullanım Şartları/i });
    await link.click();
    await expect(page).toHaveURL('/kullanim-sartlari');
  });

  test('Gizlilik Politikası linki çalışmalı', async ({ page }) => {
    const link = page.getByRole('link', { name: /Gizlilik Politikası/i });
    await link.click();
    await expect(page).toHaveURL('/gizlilik-politikasi');
  });

  test('KVKK Aydınlatma linki çalışmalı', async ({ page }) => {
    const link = page.getByRole('link', { name: /KVKK Aydınlatma/i });
    await link.click();
    await expect(page).toHaveURL('/kvkk-aydinlatma');
  });
});

test.describe('Sayfa Yükleme Testleri', () => {
  const pages = [
    { path: '/', name: 'Ana Sayfa' },
    { path: '/giris', name: 'Giriş Sayfası' },
    { path: '/kayit-ol', name: 'Kayıt Ol Sayfası' },
    { path: '/iletisim', name: 'İletişim Sayfası' },
    { path: '/ucret-planlari', name: 'Ücret Planları' },
    { path: '/kullanim-sartlari', name: 'Kullanım Şartları' },
    { path: '/gizlilik-politikasi', name: 'Gizlilik Politikası' },
    { path: '/kvkk-aydinlatma', name: 'KVKK Aydınlatma' },
    { path: '/kurye-bul', name: 'Kurye Bul' },
    { path: '/isletme-bul', name: 'İşletme Bul' },
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.name} sayfası yüklenmeli`, async ({ page }) => {
      const response = await page.goto(pageInfo.path);
      expect(response?.status()).toBeLessThan(400);
    });
  }
});
