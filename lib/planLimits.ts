// Plan limitleri ve tipleri
export type PlanType = 'free' | 'standard' | 'premium';

export interface PlanLimits {
  name: PlanType;
  displayName: string;
  price: number;
  dailyMessageLimit: number;
  dailyApprovalLimit: number;
  canReceiveRequests: boolean;
  description: string;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    name: 'free',
    displayName: 'Ücretsiz',
    price: 0,
    dailyMessageLimit: 2,
    dailyApprovalLimit: 1,
    canReceiveRequests: false,
    description: 'Günlük 2 adet kurye iletişim talebi gönderme, Günlük 1 adet kurye onayı alma'
  },
  standard: {
    name: 'standard',
    displayName: 'Standart',
    price: 200,
    dailyMessageLimit: 20,
    dailyApprovalLimit: 10,
    canReceiveRequests: false,
    description: 'Günlük 20 adet kurye iletişim talebi gönderme, Günlük 10 adet kurye onayı alma'
  },
  premium: {
    name: 'premium',
    displayName: 'Premium',
    price: 275,
    dailyMessageLimit: 999999,
    dailyApprovalLimit: 999999,
    canReceiveRequests: true,
    description: 'Sınırsız iletişim talebi, Sınırsız kurye onayı, Kurye tarafından görüntülenme ve iletişim kurma talebi alma'
  }
};

// Plan durumu tipi
export interface BusinessPlanStatus {
  business_id: string;
  user_id: string;
  business_name: string;
  plan: PlanType;
  plan_display_name: string;
  plan_price: number;
  messages_sent_today: number;
  daily_message_limit: number;
  messages_left: number;
  approvals_today: number;
  daily_approval_limit: number;
  approvals_left: number;
  can_receive_requests: boolean;
  last_usage_reset: string;
  plan_updated_at: string;
}

// Mesaj limiti kontrolü sonucu
export interface MessageLimitCheck {
  canSend: boolean;
  messagesLeft: number;
  dailyLimit: number;
  currentPlan: PlanType;
}

// Plan badge renkleri
export const PLAN_COLORS: Record<PlanType, { bg: string; text: string; border: string }> = {
  free: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300'
  },
  standard: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300'
  },
  premium: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300'
  }
};

// Sınırsız limit kontrolü
export const isUnlimited = (limit: number): boolean => {
  return limit >= 999999;
};

// Kalan hak formatı
export const formatRemainingLimit = (remaining: number, total: number): string => {
  if (isUnlimited(total)) {
    return 'Sınırsız';
  }
  return `${remaining} / ${total}`;
};
