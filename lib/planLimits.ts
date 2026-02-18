// Plan limitleri ve tipleri
export type PlanType = 'free' | 'standard' | 'premium';

export interface PlanLimits {
  name: PlanType;
  displayName: string;
  price: number;
  totalMessageLimit: number; // Toplam mesaj hakkı (free: 2, standard: 30/ay, premium: sınırsız)
  dailyApprovalLimit: number;
  canReceiveRequests: boolean;
  canDirectContact: boolean; // Kuryeler bu işletme ile doğrudan iletişim kurabilir mi (sadece premium)
  description: string;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    name: 'free',
    displayName: 'Ücretsiz',
    price: 0,
    totalMessageLimit: 2, // Toplam 2 mesaj hakkı (tüm süre boyunca)
    dailyApprovalLimit: 1,
    canReceiveRequests: false,
    canDirectContact: false,
    description: 'Toplam 2 adet kurye iletişim talebi gönderme'
  },
  standard: {
    name: 'standard',
    displayName: 'Standart',
    price: 200,
    totalMessageLimit: 30, // Aylık toplam 30 mesaj hakkı
    dailyApprovalLimit: 10,
    canReceiveRequests: false,
    canDirectContact: false,
    description: 'Aylık toplam 30 adet kurye iletişim talebi gönderme'
  },
  premium: {
    name: 'premium',
    displayName: 'Premium',
    price: 275,
    totalMessageLimit: 999999, // Sınırsız
    dailyApprovalLimit: 999999,
    canReceiveRequests: true,
    canDirectContact: true, // Kuryeler bu işletme ile doğrudan iletişim kurabilir
    description: 'Sınırsız iletişim talebi, Sınırsız kurye onayı, Kurye tarafından görüntülenme ve iletişim kurma talebi alma, Kuryelerle telefon ve WhatsApp ile iletişim'
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
  messages_sent_total: number; // Toplam gönderilen mesaj sayısı
  total_message_limit: number; // Toplam mesaj limiti
  messages_left: number;
  approvals_today: number;
  daily_approval_limit: number;
  approvals_left: number;
  can_receive_requests: boolean;
  can_direct_contact: boolean;
  last_usage_reset: string;
  plan_updated_at: string;
}

// Mesaj limiti kontrolü sonucu
export interface MessageLimitCheck {
  canSend: boolean;
  messagesLeft: number;
  totalLimit: number;
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
