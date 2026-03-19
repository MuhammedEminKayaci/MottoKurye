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
jest.mock('@/lib/supabase', () => {
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  };
  return {
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
      channel: jest.fn(() => mockChannel),
      removeChannel: jest.fn(),
    },
  };
});

describe('Home Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Render', () => {
    it('ana sayfa başarıyla render edilmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Kurye Bul' })).toBeInTheDocument();
      });
    });

    it('hero section görüntülenmeli', async () => {
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'İşletme Bul' })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Buttons', () => {
    it('Kurye Bul butonu tıklanabilir olmalı', async () => {
      const user = userEvent.setup();
      render(<Page />);
      
      const kuryeBulBtn = await screen.findByRole('button', { name: 'Kurye Bul' });
      await user.click(kuryeBulBtn);
      
      expect(mockPush).toHaveBeenCalledWith('/kurye-bul');
    });

    it('İşletme Bul butonu tıklanabilir olmalı', async () => {
      const user = userEvent.setup();
      render(<Page />);
      
      const isletmeBulBtn = await screen.findByRole('button', { name: 'İşletme Bul' });
      await user.click(isletmeBulBtn);
      
      expect(mockPush).toHaveBeenCalledWith('/isletme-bul');
    });
  });

  describe('How It Works Section', () => {
    it('NASIL ÇALIŞIR başlığı görüntülenmeli', async () => {
      render(<Page />);
      expect(await screen.findByText('NASIL ÇALIŞIR ?')).toBeInTheDocument();
    });

    it('4 adım kartı görüntülenmeli', async () => {
      render(<Page />);
      expect(await screen.findByText('Profilini Oluştur')).toBeInTheDocument();
      expect(screen.getByText('Filtrele')).toBeInTheDocument();
      expect(screen.getByText('Doğru Eşleşmeyi Bul')).toBeInTheDocument();
      expect(screen.getByText('İletişime Geç')).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('Kayıt Ol CTA görüntülenmeli', async () => {
      render(<Page />);
      expect(await screen.findByText('Hemen Kayıt Ol')).toBeInTheDocument();
    });

    it('Kayıt Ol linki doğru href\'e sahip olmalı', async () => {
      render(<Page />);
      const link = await screen.findByText('Hemen Kayıt Ol');
      expect(link.closest('a')).toHaveAttribute('href', '/kayit-ol');
    });
  });

  describe('Images', () => {
    it('kurye resmi yüklenmeli', async () => {
      render(<Page />);
      expect(await screen.findByAltText('kurye')).toBeInTheDocument();
    });

    it('işletme resmi yüklenmeli', async () => {
      render(<Page />);
      expect(await screen.findByAltText('işletme bina')).toBeInTheDocument();
    });

    it('telefon mockup resmi yüklenmeli', async () => {
      render(<Page />);
      expect(await screen.findByAltText('phone')).toBeInTheDocument();
    });
  });

  describe('Stats Section', () => {
    it('stat ikonları render edilmeli', async () => {
      render(<Page />);
      const allImages = await screen.findAllByRole('img');
      expect(allImages.length).toBeGreaterThan(0);
    });
  });

  describe('Footer Integration', () => {
    it('footer render edilmeli', async () => {
      render(<Page />);
      expect(await screen.findByText(/© 2026 PaketServisçi/i)).toBeInTheDocument();
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

  it('kurye kullanıcısı için Kuryelere Göz At butonu görünmeli', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('Kuryelere Göz At')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
