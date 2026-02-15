/**
 * Footer Component Unit Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/app/_components/Footer';

describe('Footer Component', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  describe('Logo', () => {
    it('logo görüntüsü render edilmeli', () => {
      const logo = screen.getByAltText('PaketServisi Logo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Hızlı Linkler', () => {
    it('Hızlı Linkler başlığı görüntülenmeli', () => {
      expect(screen.getByText('Hızlı Linkler')).toBeInTheDocument();
    });

    it('Nasıl Çalışır linki görüntülenmeli', () => {
      const link = screen.getByRole('link', { name: 'Nasıl Çalışır' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/#nasil-calisir');
    });

    it('Ücret Planları linki görüntülenmeli', () => {
      const link = screen.getByRole('link', { name: 'Ücret Planları' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/ucret-planlari');
    });

    it('İletişim linki görüntülenmeli', () => {
      const link = screen.getByRole('link', { name: 'İletişim' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/iletisim');
    });
  });

  describe('Yasal Linkler', () => {
    it('Yasal başlığı görüntülenmeli', () => {
      expect(screen.getByText('Yasal')).toBeInTheDocument();
    });

    it('Kullanım Şartları linki görüntülenmeli', () => {
      const link = screen.getByRole('link', { name: 'Kullanım Şartları' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/kullanim-sartlari');
    });

    it('Gizlilik Politikası linki görüntülenmeli', () => {
      const link = screen.getByRole('link', { name: 'Gizlilik Politikası' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/gizlilik-politikasi');
    });

    it('KVKK Aydınlatma linki görüntülenmeli', () => {
      const link = screen.getByRole('link', { name: 'KVKK Aydınlatma' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/kvkk-aydinlatma');
    });

    it('Ticari İleti İzni linki görüntülenmeli', () => {
      const link = screen.getByRole('link', { name: 'Ticari İleti İzni' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/ticari-ileti-izni');
    });
  });

  describe('Copyright', () => {
    it('copyright yazısı görüntülenmeli', () => {
      expect(screen.getByText(/© 2026 PaketServisçi/i)).toBeInTheDocument();
    });

    it('Tüm haklar saklıdır ifadesi bulunmalı', () => {
      expect(screen.getByText(/Tüm haklar saklıdır/i)).toBeInTheDocument();
    });
  });

  describe('Description', () => {
    it('açıklama metni görüntülenmeli', () => {
      expect(
        screen.getByText(/PaketServisçi olarak çıktığımız bu yolda/i)
      ).toBeInTheDocument();
    });
  });
});
