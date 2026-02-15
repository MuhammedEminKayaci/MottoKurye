import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // E2E test klasörü
  testDir: './e2e',
  
  // Her test için maksimum süre
  timeout: 30 * 1000,
  
  // Tüm testler için maksimum süre
  globalTimeout: 5 * 60 * 1000,
  
  // Test sonuçları
  expect: {
    timeout: 5000,
  },
  
  // Paralel çalıştırma
  fullyParallel: true,
  
  // CI ortamında tekrar deneme
  retries: process.env.CI ? 2 : 0,
  
  // CI ortamında paralel worker sayısı
  workers: process.env.CI ? 1 : undefined,
  
  // Raporlama
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  
  // Tüm testlerde paylaşılan ayarlar
  use: {
    // Base URL
    baseURL: 'http://localhost:3000',
    
    // Trace dosyaları
    trace: 'on-first-retry',
    
    // Ekran görüntüleri
    screenshot: 'only-on-failure',
    
    // Video kayıt
    video: 'retain-on-failure',
  },

  // Projeler (tarayıcılar)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobil testleri
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Testlerden önce sunucuyu başlat
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
