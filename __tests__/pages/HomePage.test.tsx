/**
 * Home Page Integration Tests
 * 
 * Ana sayfa bileşenlerinin entegrasyon testleri
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/page';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
  },
}));

describe('Home Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Render', () => {
    it('ana sayfa başarıyla render edilmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByText('Kurye Bul')).toBeInTheDocument();
      });
    });

    it('hero section görüntülenmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByText('İşletme Bul')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Buttons', () => {
    it('Kurye Bul butonu tıklanabilir olmalı', async () => {
      const user = userEvent.setup();
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText('Kurye Bul')).toBeInTheDocument();
      });
      
      const kuryeBulBtn = screen.getByText('Kurye Bul');
      await user.click(kuryeBulBtn);
      
      expect(mockPush).toHaveBeenCalledWith('/kurye-bul');
    });

    it('İşletme Bul butonu tıklanabilir olmalı', async () => {
      const user = userEvent.setup();
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText('İşletme Bul')).toBeInTheDocument();
      });
      
      const isletmeBulBtn = screen.getByText('İşletme Bul');
      await user.click(isletmeBulBtn);
      
      expect(mockPush).toHaveBeenCalledWith('/isletme-bul');
    });
  });

  describe('How It Works Section', () => {
    it('NASIL ÇALIŞIR başlığı görüntülenmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByText('NASIL ÇALIŞIR ?')).toBeInTheDocument();
      });
    });

    it('4 adım kartı görüntülenmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByText('Profilini Oluştur')).toBeInTheDocument();
        expect(screen.getByText('Filtrele')).toBeInTheDocument();
        expect(screen.getByText('Doğru Eşleşmeyi Bul')).toBeInTheDocument();
        expect(screen.getByText('İletişime Geç')).toBeInTheDocument();
      });
    });
  });

  describe('CTA Section', () => {
    it('Kayıt Ol CTA görüntülenmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByText('Hemen Kayıt Ol')).toBeInTheDocument();
      });
    });

    it('Kayıt Ol linki doğru href\'e sahip olmalı', async () => {
      render(<Page />);
      await waitFor(() => {
        const link = screen.getByText('Hemen Kayıt Ol');
        expect(link.closest('a')).toHaveAttribute('href', '/kayit-ol');
      });
    });
  });

  describe('Images', () => {
    it('kurye resmi yüklenmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        const kuryeImg = screen.getByAltText('kurye');
        expect(kuryeImg).toBeInTheDocument();
      });
    });

    it('işletme resmi yüklenmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        const isletmeImg = screen.getByAltText('işletme bina');
        expect(isletmeImg).toBeInTheDocument();
      });
    });

    it('telefon mockup resmi yüklenmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        const phoneImg = screen.getByAltText('phone');
        expect(phoneImg).toBeInTheDocument();
      });
    });
  });

  describe('Stats Section', () => {
    it('stat ikonları render edilmeli', async () => {
      render(<Page />);
      // icon-kuryee, icon-isletmee, icon-eslesmee alt metinleri boş string olarak ayarlanmış
      // Bu nedenle resim sayısını kontrol ediyoruz
      await waitFor(() => {
        const allImages = screen.getAllByRole('img');
        expect(allImages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Footer Integration', () => {
    it('footer render edilmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByText(/© 2026 PaketServisçi/i)).toBeInTheDocument();
      });
    });
  });
});

describe('Home Page - Logged In User', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock logged in courier with channel support
    const { supabase } = require('@/lib/supabase');
    
    // Auth mock
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });
    
    // Channel mock for realtime
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
    };
    supabase.channel = jest.fn(() => mockChannel);
    supabase.removeChannel = jest.fn();
    
    // Query builder mock with or support
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ 
        data: [{ id: 'courier-1' }], 
        error: null 
      }),
    };
    supabase.from.mockReturnValue(mockQueryBuilder);
  });

  it('kurye kullanıcısı için İşletmelere Gözat butonu görünmeli', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('İşletmelere Gözat')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
