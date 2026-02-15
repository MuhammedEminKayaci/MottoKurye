/**
 * Form Validation Integration Tests
 * 
 * Kayıt formlarının validasyon entegrasyon testleri
 */

import { z } from 'zod';

// CourierForm validasyon şeması (gerçek uygulamadan türetilmiş)
const courierSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  age: z.number().min(18, 'En az 18 yaşında olmalısınız').max(65, 'En fazla 65 yaşında olabilirsiniz'),
  gender: z.enum(['Erkek', 'Kadın', 'Belirtmek İstemiyorum']),
  nationality: z.string().min(1, 'Uyruk seçimi zorunludur'),
  phone: z.string().regex(/^0[5][0-9]{9}$/, 'Geçerli bir telefon numarası giriniz (05xxxxxxxxx)'),
  contactPreference: z.enum(['phone', 'in_app', 'both']),
  experience: z.enum(['0-1', '1-3', '3-5', '5-10', '10+']),
  province: z.string().min(1, 'İl seçimi zorunludur'),
  district: z.array(z.string()).min(1, 'En az bir ilçe seçmelisiniz'),
  workingType: z.enum(['Full Time', 'Part Time']),
  earningModel: z.enum(['Saat+Paket', 'Paket', 'Aylık Sabit']),
  workingDays: z.array(z.string()).min(1, 'En az bir gün seçmelisiniz'),
  dailyPackageEstimate: z.enum(['0-15', '15-25', '25-40', '40+']),
  licenseType: z.enum(['A1', 'A', 'A2']),
  hasMotorcycle: z.enum(['Var', 'Yok']),
  hasBag: z.enum(['Var', 'Yok']),
  p1Certificate: z.enum(['VAR', 'YOK']),
  criminalRecord: z.enum(['VAR', 'YOK']),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Kullanım şartlarını kabul etmelisiniz' }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: 'Gizlilik politikasını kabul etmelisiniz' }) }),
  acceptKVKK: z.literal(true, { errorMap: () => ({ message: 'KVKK aydınlatma metnini kabul etmelisiniz' }) }),
  acceptCommercial: z.boolean(),
});

// BusinessForm validasyon şeması
const businessSchema = z.object({
  businessName: z.string().min(2, 'İşletme adı en az 2 karakter olmalıdır'),
  businessSector: z.string().min(1, 'Sektör seçimi zorunludur'),
  managerName: z.string().min(2, 'Yetkili adı en az 2 karakter olmalıdır'),
  managerContact: z.string().regex(/^0[5][0-9]{9}$/, 'Geçerli bir telefon numarası giriniz').optional().or(z.literal('')),
  contactPreference: z.enum(['phone', 'in_app', 'both']),
  province: z.string().min(1, 'İl seçimi zorunludur'),
  district: z.array(z.string()).min(1, 'En az bir ilçe seçmelisiniz'),
  workingType: z.enum(['Full Time', 'Part Time']),
  earningModel: z.enum(['Saat+Paket', 'Paket', 'Aylık Sabit']),
  workingDays: z.array(z.string()).min(1, 'En az bir gün seçmelisiniz'),
  dailyPackageEstimate: z.enum(['0-15', '15-25', '25-40', '40+']),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  acceptKVKK: z.literal(true),
  acceptCommercial: z.boolean(),
});

describe('Courier Form Validation', () => {
  const validCourierData = {
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    age: 25,
    gender: 'Erkek' as const,
    nationality: 'Türkiye',
    phone: '05551234567',
    contactPreference: 'both' as const,
    experience: '1-3' as const,
    province: 'İstanbul',
    district: ['Kadıköy', 'Ataşehir'],
    workingType: 'Full Time' as const,
    earningModel: 'Saat+Paket' as const,
    workingDays: ['Pazartesi', 'Salı', 'Çarşamba'],
    dailyPackageEstimate: '15-25' as const,
    licenseType: 'A2' as const,
    hasMotorcycle: 'Var' as const,
    hasBag: 'Var' as const,
    p1Certificate: 'VAR' as const,
    criminalRecord: 'YOK' as const,
    acceptTerms: true as const,
    acceptPrivacy: true as const,
    acceptKVKK: true as const,
    acceptCommercial: true,
  };

  describe('Başarılı Validasyon', () => {
    it('geçerli veri ile validasyon başarılı olmalı', () => {
      const result = courierSchema.safeParse(validCourierData);
      expect(result.success).toBe(true);
    });
  });

  describe('İsim Validasyonu', () => {
    it('boş isim reddedilmeli', () => {
      const data = { ...validCourierData, firstName: '' };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('tek karakterli isim reddedilmeli', () => {
      const data = { ...validCourierData, firstName: 'A' };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('2 karakterli isim kabul edilmeli', () => {
      const data = { ...validCourierData, firstName: 'Al' };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Yaş Validasyonu', () => {
    it('17 yaş reddedilmeli', () => {
      const data = { ...validCourierData, age: 17 };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('18 yaş kabul edilmeli', () => {
      const data = { ...validCourierData, age: 18 };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('65 yaş kabul edilmeli', () => {
      const data = { ...validCourierData, age: 65 };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('66 yaş reddedilmeli', () => {
      const data = { ...validCourierData, age: 66 };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Telefon Validasyonu', () => {
    it('geçerli telefon numarası kabul edilmeli', () => {
      const validPhones = ['05551234567', '05001234567', '05991234567'];
      validPhones.forEach((phone) => {
        const data = { ...validCourierData, phone };
        const result = courierSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('0 ile başlamayan numara reddedilmeli', () => {
      const data = { ...validCourierData, phone: '5551234567' };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('05 ile başlamayan numara reddedilmeli', () => {
      const data = { ...validCourierData, phone: '02121234567' };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('eksik haneli numara reddedilmeli', () => {
      const data = { ...validCourierData, phone: '0555123456' };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('fazla haneli numara reddedilmeli', () => {
      const data = { ...validCourierData, phone: '055512345678' };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('İlçe Seçimi Validasyonu', () => {
    it('boş ilçe listesi reddedilmeli', () => {
      const data = { ...validCourierData, district: [] };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('tek ilçe seçimi kabul edilmeli', () => {
      const data = { ...validCourierData, district: ['Kadıköy'] };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('çoklu ilçe seçimi kabul edilmeli', () => {
      const data = { ...validCourierData, district: ['Kadıköy', 'Ataşehir', 'Maltepe'] };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Onay Kutuları Validasyonu', () => {
    it('kullanım şartları kabul edilmezse reddedilmeli', () => {
      const data = { ...validCourierData, acceptTerms: false as unknown as true };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('gizlilik politikası kabul edilmezse reddedilmeli', () => {
      const data = { ...validCourierData, acceptPrivacy: false as unknown as true };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('KVKK kabul edilmezse reddedilmeli', () => {
      const data = { ...validCourierData, acceptKVKK: false as unknown as true };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('ticari ileti izni opsiyonel olmalı', () => {
      const data = { ...validCourierData, acceptCommercial: false };
      const result = courierSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Business Form Validation', () => {
  const validBusinessData = {
    businessName: 'ABC Kargo',
    businessSector: 'Kargo',
    managerName: 'Mehmet Demir',
    managerContact: '05551234567',
    contactPreference: 'both' as const,
    province: 'İstanbul',
    district: ['Kadıköy'],
    workingType: 'Full Time' as const,
    earningModel: 'Saat+Paket' as const,
    workingDays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],
    dailyPackageEstimate: '25-40' as const,
    acceptTerms: true as const,
    acceptPrivacy: true as const,
    acceptKVKK: true as const,
    acceptCommercial: true,
  };

  describe('Başarılı Validasyon', () => {
    it('geçerli veri ile validasyon başarılı olmalı', () => {
      const result = businessSchema.safeParse(validBusinessData);
      expect(result.success).toBe(true);
    });
  });

  describe('İşletme Adı Validasyonu', () => {
    it('boş işletme adı reddedilmeli', () => {
      const data = { ...validBusinessData, businessName: '' };
      const result = businessSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('tek karakterli işletme adı reddedilmeli', () => {
      const data = { ...validBusinessData, businessName: 'A' };
      const result = businessSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Yetkili İletişim Bilgisi', () => {
    it('telefon numarası opsiyonel olmalı', () => {
      const data = { ...validBusinessData, managerContact: '' };
      const result = businessSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('geçersiz telefon formatı reddedilmeli', () => {
      const data = { ...validBusinessData, managerContact: '12345' };
      const result = businessSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Çalışma Günleri Validasyonu', () => {
    it('boş çalışma günleri reddedilmeli', () => {
      const data = { ...validBusinessData, workingDays: [] };
      const result = businessSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('hafta sonu dahil tüm günler kabul edilmeli', () => {
      const data = {
        ...validBusinessData,
        workingDays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
      };
      const result = businessSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Phone Number Format', () => {
  // Telefon numarası formatlama fonksiyonu simulasyonu
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '0';
    if (!digits.startsWith('0')) return '0' + digits.slice(0, 10);
    return digits.slice(0, 11);
  };

  it('boş input için 0 döndürmeli', () => {
    expect(formatPhoneNumber('')).toBe('0');
  });

  it('0 ile başlamayan numarayı düzeltmeli', () => {
    expect(formatPhoneNumber('5551234567')).toBe('05551234567');
  });

  it('0 ile başlayan numarayı korumali', () => {
    expect(formatPhoneNumber('05551234567')).toBe('05551234567');
  });

  it('11 haneden fazlasını kırpmalı', () => {
    expect(formatPhoneNumber('055512345678')).toBe('05551234567');
  });

  it('rakam olmayan karakterleri temizlemeli', () => {
    expect(formatPhoneNumber('0555-123-45-67')).toBe('05551234567');
    expect(formatPhoneNumber('0 555 123 45 67')).toBe('05551234567');
    expect(formatPhoneNumber('(0555) 123 45 67')).toBe('05551234567');
  });
});
