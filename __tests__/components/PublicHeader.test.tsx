/**
 * PublicHeader Component Unit Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicHeader } from '@/app/_components/PublicHeader';

// Mock useRouter
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
}));

describe('PublicHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Logo', () => {
    it('logo butonu render edilmeli', () => {
      render(<PublicHeader />);
      const logoButton = screen.getByLabelText('Ana Sayfa');
      expect(logoButton).toBeInTheDocument();
    });

    it('logo tıklandığında ana sayfaya yönlendirmeli', () => {
      render(<PublicHeader />);
      const logoButton = screen.getByLabelText('Ana Sayfa');
      fireEvent.click(logoButton);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Navigation Links', () => {
    it('Ana Sayfa linki görüntülenmeli', () => {
      render(<PublicHeader />);
      expect(screen.getByText('Ana Sayfa')).toBeInTheDocument();
    });

    it('İletişim linki görüntülenmeli', () => {
      render(<PublicHeader />);
      expect(screen.getByText('İletişim')).toBeInTheDocument();
    });

    it('Nasıl Çalışır linki görüntülenmeli', () => {
      render(<PublicHeader />);
      expect(screen.getByText('Nasıl Çalışır')).toBeInTheDocument();
    });

    it('İşletme Ücret Planları linki görüntülenmeli', () => {
      render(<PublicHeader />);
      expect(screen.getByText('İşletme Ücret Planları')).toBeInTheDocument();
    });
  });

  describe('Auth Buttons', () => {
    it('Giriş Yap butonu görüntülenmeli (çıkış yapılmış durumda)', () => {
      render(<PublicHeader />);
      const loginButtons = screen.getAllByText('Giriş Yap');
      expect(loginButtons.length).toBeGreaterThan(0);
    });

    it('Kayıt Ol butonu görüntülenmeli (çıkış yapılmış durumda)', () => {
      render(<PublicHeader />);
      const registerButtons = screen.getAllByText('Kayıt Ol');
      expect(registerButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Menu', () => {
    it('hamburger menü butonu görüntülenmeli', () => {
      render(<PublicHeader />);
      // Hamburger menu button should be present
      const menuButtons = screen.getAllByRole('button');
      expect(menuButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('header elementi bulunmalı', () => {
      render(<PublicHeader />);
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('Ana Sayfa butonu erişilebilir label\'a sahip olmalı', () => {
      render(<PublicHeader />);
      expect(screen.getByLabelText('Ana Sayfa')).toBeInTheDocument();
    });
  });
});
