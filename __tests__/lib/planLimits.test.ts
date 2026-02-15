/**
 * Plan Limits Unit Tests
 * 
 * Bu testler planLimits.ts dosyasındaki fonksiyonları ve sabitleri test eder.
 */

import {
  PLAN_LIMITS,
  PLAN_COLORS,
  isUnlimited,
  formatRemainingLimit,
  PlanType,
} from '@/lib/planLimits';

describe('Plan Limits', () => {
  describe('PLAN_LIMITS', () => {
    it('ücretsiz plan doğru değerlere sahip olmalı', () => {
      expect(PLAN_LIMITS.free).toMatchObject({
        name: 'free',
        displayName: 'Ücretsiz',
        price: 0,
        dailyMessageLimit: 2,
        dailyApprovalLimit: 1,
        canReceiveRequests: false,
      });
    });

    it('standart plan doğru değerlere sahip olmalı', () => {
      expect(PLAN_LIMITS.standard).toMatchObject({
        name: 'standard',
        displayName: 'Standart',
        price: 200,
        dailyMessageLimit: 20,
        dailyApprovalLimit: 10,
        canReceiveRequests: false,
      });
    });

    it('premium plan doğru değerlere sahip olmalı', () => {
      expect(PLAN_LIMITS.premium).toMatchObject({
        name: 'premium',
        displayName: 'Premium',
        price: 275,
        dailyMessageLimit: 999999,
        dailyApprovalLimit: 999999,
        canReceiveRequests: true,
      });
    });

    it('tüm plan tipleri tanımlı olmalı', () => {
      const planTypes: PlanType[] = ['free', 'standard', 'premium'];
      planTypes.forEach((planType) => {
        expect(PLAN_LIMITS[planType]).toBeDefined();
      });
    });

    it('her planın zorunlu alanları olmalı', () => {
      Object.values(PLAN_LIMITS).forEach((plan) => {
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('displayName');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('dailyMessageLimit');
        expect(plan).toHaveProperty('dailyApprovalLimit');
        expect(plan).toHaveProperty('canReceiveRequests');
        expect(plan).toHaveProperty('description');
      });
    });

    it('plan fiyatları mantıklı sırada olmalı', () => {
      expect(PLAN_LIMITS.free.price).toBeLessThan(PLAN_LIMITS.standard.price);
      expect(PLAN_LIMITS.standard.price).toBeLessThan(PLAN_LIMITS.premium.price);
    });

    it('plan limitleri artan sırada olmalı', () => {
      expect(PLAN_LIMITS.free.dailyMessageLimit).toBeLessThan(PLAN_LIMITS.standard.dailyMessageLimit);
      expect(PLAN_LIMITS.standard.dailyMessageLimit).toBeLessThan(PLAN_LIMITS.premium.dailyMessageLimit);
    });
  });

  describe('PLAN_COLORS', () => {
    it('her plan için renk tanımlı olmalı', () => {
      const planTypes: PlanType[] = ['free', 'standard', 'premium'];
      planTypes.forEach((planType) => {
        expect(PLAN_COLORS[planType]).toBeDefined();
        expect(PLAN_COLORS[planType]).toHaveProperty('bg');
        expect(PLAN_COLORS[planType]).toHaveProperty('text');
        expect(PLAN_COLORS[planType]).toHaveProperty('border');
      });
    });

    it('renk değerleri Tailwind class formatında olmalı', () => {
      Object.values(PLAN_COLORS).forEach((colors) => {
        expect(colors.bg).toMatch(/^bg-/);
        expect(colors.text).toMatch(/^text-/);
        expect(colors.border).toMatch(/^border-/);
      });
    });
  });

  describe('isUnlimited', () => {
    it('999999 ve üzeri değerler için true döndürmeli', () => {
      expect(isUnlimited(999999)).toBe(true);
      expect(isUnlimited(1000000)).toBe(true);
      expect(isUnlimited(5000000)).toBe(true);
    });

    it('999999\'dan düşük değerler için false döndürmeli', () => {
      expect(isUnlimited(0)).toBe(false);
      expect(isUnlimited(1)).toBe(false);
      expect(isUnlimited(100)).toBe(false);
      expect(isUnlimited(999998)).toBe(false);
    });

    it('negatif değerler için false döndürmeli', () => {
      expect(isUnlimited(-1)).toBe(false);
      expect(isUnlimited(-999999)).toBe(false);
    });
  });

  describe('formatRemainingLimit', () => {
    it('sınırsız limit için "Sınırsız" döndürmeli', () => {
      expect(formatRemainingLimit(100, 999999)).toBe('Sınırsız');
      expect(formatRemainingLimit(0, 1000000)).toBe('Sınırsız');
    });

    it('sınırlı limit için format "kalan / toplam" şeklinde olmalı', () => {
      expect(formatRemainingLimit(5, 10)).toBe('5 / 10');
      expect(formatRemainingLimit(0, 20)).toBe('0 / 20');
      expect(formatRemainingLimit(15, 15)).toBe('15 / 15');
    });

    it('edge case değerleri doğru işlemeli', () => {
      expect(formatRemainingLimit(0, 0)).toBe('0 / 0');
      expect(formatRemainingLimit(1, 1)).toBe('1 / 1');
    });
  });
});

describe('Plan Types', () => {
  it('PlanType sadece belirli değerleri kabul etmeli', () => {
    const validPlanTypes = ['free', 'standard', 'premium'];
    const allPlanKeys = Object.keys(PLAN_LIMITS);
    
    expect(allPlanKeys).toEqual(validPlanTypes);
  });
});

describe('Business Logic', () => {
  it('ücretsiz kullanıcılar kurye talebini alamaz', () => {
    expect(PLAN_LIMITS.free.canReceiveRequests).toBe(false);
  });

  it('standart kullanıcılar kurye talebini alamaz', () => {
    expect(PLAN_LIMITS.standard.canReceiveRequests).toBe(false);
  });

  it('premium kullanıcılar kurye talebini alabilir', () => {
    expect(PLAN_LIMITS.premium.canReceiveRequests).toBe(true);
  });

  it('plan fiyatları TL cinsinden pozitif veya sıfır olmalı', () => {
    Object.values(PLAN_LIMITS).forEach((plan) => {
      expect(plan.price).toBeGreaterThanOrEqual(0);
    });
  });
});
