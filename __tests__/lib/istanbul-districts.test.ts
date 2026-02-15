/**
 * Istanbul Districts Unit Tests
 * 
 * Bu testler istanbul-districts.ts dosyasını test eder.
 */

import { ISTANBUL_DISTRICTS } from '@/lib/istanbul-districts';

describe('Istanbul Districts', () => {
  describe('Data Integrity', () => {
    it('ilçe listesi boş olmamalı', () => {
      expect(ISTANBUL_DISTRICTS.length).toBeGreaterThan(0);
    });

    it('39 ilçe bulunmalı', () => {
      expect(ISTANBUL_DISTRICTS.length).toBe(39);
    });

    it('tüm ilçeler string olmalı', () => {
      ISTANBUL_DISTRICTS.forEach((district) => {
        expect(typeof district).toBe('string');
      });
    });

    it('boş string içermemeli', () => {
      ISTANBUL_DISTRICTS.forEach((district) => {
        expect(district.trim().length).toBeGreaterThan(0);
      });
    });

    it('tekrar eden ilçe olmamalı', () => {
      const uniqueDistricts = new Set(ISTANBUL_DISTRICTS);
      expect(uniqueDistricts.size).toBe(ISTANBUL_DISTRICTS.length);
    });
  });

  describe('Known Districts', () => {
    const knownDistricts = [
      'Kadıköy',
      'Beşiktaş',
      'Şişli',
      'Beyoğlu',
      'Fatih',
      'Üsküdar',
      'Bakırköy',
      'Maltepe',
      'Kartal',
      'Pendik',
      'Ataşehir',
      'Sarıyer',
      'Beykoz',
      'Esenyurt',
      'Beylikdüzü',
    ];

    it.each(knownDistricts)('%s ilçesi listede bulunmalı', (district) => {
      expect(ISTANBUL_DISTRICTS).toContain(district);
    });
  });

  describe('Avrupa Yakası İlçeleri', () => {
    const avrupaYakasi = [
      'Arnavutköy',
      'Avcılar',
      'Bağcılar',
      'Bahçelievler',
      'Bakırköy',
      'Başakşehir',
      'Bayrampaşa',
      'Beşiktaş',
      'Beylikdüzü',
      'Beyoğlu',
      'Büyükçekmece',
      'Çatalca',
      'Esenler',
      'Esenyurt',
      'Eyüpsultan',
      'Fatih',
      'Gaziosmanpaşa',
      'Güngören',
      'Kağıthane',
      'Küçükçekmece',
      'Sarıyer',
      'Silivri',
      'Sultangazi',
      'Şişli',
      'Zeytinburnu',
    ];

    it.each(avrupaYakasi)('Avrupa yakası ilçesi %s listede bulunmalı', (district) => {
      expect(ISTANBUL_DISTRICTS).toContain(district);
    });
  });

  describe('Anadolu Yakası İlçeleri', () => {
    const anadoluYakasi = [
      'Adalar',
      'Ataşehir',
      'Beykoz',
      'Çekmeköy',
      'Kadıköy',
      'Kartal',
      'Maltepe',
      'Pendik',
      'Sancaktepe',
      'Sultanbeyli',
      'Şile',
      'Tuzla',
      'Ümraniye',
      'Üsküdar',
    ];

    it.each(anadoluYakasi)('Anadolu yakası ilçesi %s listede bulunmalı', (district) => {
      expect(ISTANBUL_DISTRICTS).toContain(district);
    });
  });

  describe('Sorting', () => {
    it('alfabetik olarak sıralı olmalı (Türkçe karakterler dahil)', () => {
      const sortedDistricts = [...ISTANBUL_DISTRICTS].sort((a, b) =>
        a.localeCompare(b, 'tr-TR')
      );
      expect(ISTANBUL_DISTRICTS).toEqual(sortedDistricts);
    });
  });

  describe('Special Characters', () => {
    it('Türkçe karakterli ilçeler doğru yazılmış olmalı', () => {
      const turkishCharDistricts = [
        'Ataşehir', // ş
        'Bağcılar', // ğ, ı
        'Büyükçekmece', // ü, ç
        'Çatalca', // Ç
        'Çekmeköy', // Ç, ö
        'Gaziosmanpaşa', // ş
        'Kağıthane', // ğ, ı
        'Küçükçekmece', // ü, ç
        'Sarıyer', // ı
        'Şile', // Ş
        'Şişli', // Ş, ş
        'Ümraniye', // Ü
        'Üsküdar', // Ü
      ];

      turkishCharDistricts.forEach((district) => {
        expect(ISTANBUL_DISTRICTS).toContain(district);
      });
    });
  });
});
