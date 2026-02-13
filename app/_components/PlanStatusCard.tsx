"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PlanType, PLAN_LIMITS, PLAN_COLORS, isUnlimited, formatRemainingLimit } from "@/lib/planLimits";

interface PlanStatusCardProps {
  plan: PlanType;
  messagesLeft: number;
  dailyMessageLimit: number;
  approvalsLeft: number;
  dailyApprovalLimit: number;
  businessId: string;
  onPlanUpdated?: () => void;
}

export function PlanStatusCard({
  plan,
  messagesLeft,
  dailyMessageLimit,
  approvalsLeft,
  dailyApprovalLimit,
  businessId,
  onPlanUpdated
}: PlanStatusCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const planInfo = PLAN_LIMITS[plan];
  const colors = PLAN_COLORS[plan];

  // Uyarı seviyeleri
  const messageWarning = !isUnlimited(dailyMessageLimit) && messagesLeft <= 1;
  const showWarning = messageWarning;

  const handleUpgrade = async (newPlan: PlanType) => {
    if (newPlan === plan) return;
    
    setUpgrading(true);
    try {
      // Test amaçlı - ödeme olmadan plan yükseltme
      const { error } = await supabase
        .from('businesses')
        .update({
          plan: newPlan,
          plan_updated_at: new Date().toISOString(),
          messages_sent_today: 0,
          approvals_today: 0
        })
        .eq('id', businessId);

      if (error) throw error;

      alert(`Planınız ${PLAN_LIMITS[newPlan].displayName} olarak güncellendi!`);
      setShowUpgradeModal(false);
      onPlanUpdated?.();
    } catch (error) {
      console.error('Plan upgrade error:', error);
      alert('Plan güncellenirken bir hata oluştu.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <>
      <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-4 md:p-6`}>
        {/* Plan Başlığı */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
              {plan === 'free' && (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {plan === 'standard' && (
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {plan === 'premium' && (
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className={`font-bold ${colors.text}`}>{planInfo.displayName} Plan</h3>
              <p className="text-sm text-gray-500">
                {planInfo.price === 0 ? 'Ücretsiz' : `${planInfo.price} TL / Aylık`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="text-sm px-4 py-2 bg-[#ff7a00] text-white rounded-full hover:bg-[#e66a00] transition-colors font-medium"
          >
            Planı Yükselt
          </button>
        </div>

        {/* Uyarı Banner */}
        {showWarning && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                {messagesLeft === 0 
                  ? 'Günlük mesaj hakkınız doldu!' 
                  : 'Sadece 1 mesaj hakkınız kaldı!'}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Daha fazla hak için planınızı yükseltin.
              </p>
            </div>
          </div>
        )}

        {/* Haklar */}
        <div className="grid grid-cols-1 gap-4">
          {/* Mesaj Hakkı */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs text-gray-500 font-medium">Mesaj Hakkı</span>
            </div>
            <p className={`text-lg font-bold ${messagesLeft === 0 ? 'text-red-500' : 'text-gray-800'}`}>
              {formatRemainingLimit(messagesLeft, dailyMessageLimit)}
            </p>
            {!isUnlimited(dailyMessageLimit) && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${messagesLeft === 0 ? 'bg-red-500' : 'bg-[#ff7a00]'}`}
                  style={{ width: `${(messagesLeft / dailyMessageLimit) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Plan Detayları Link */}
        <div className="mt-4 text-center">
          <Link href="/ucret-planlari" className="text-sm text-[#ff7a00] hover:underline">
            Tüm plan detaylarını görüntüle →
          </Link>
        </div>
      </div>

      {/* Plan Yükseltme Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Planınızı Yükseltin</h2>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Test amaçlı - Ödeme entegrasyonu henüz aktif değil
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                {
                  planKey: 'free' as PlanType,
                  name: '1. PAKET',
                  price: 'Ücretsiz',
                  priceSuffix: '',
                  features: [
                    'Sınırsız ilan verme',
                    'Sınırsız kurye profil görüntüleme',
                    'Günlük 2 adet kurye iletişim talebi gönderme',
                    'Sadece uygulama içi mesajlaşma',
                  ],
                  notIncluded: [
                    'Kuryelerle telefon ile iletişim kurma',
                    'Kuryelerle WhatsApp ile iletişim kurma',
                    'Kurye tarafından görüntülenme ve iletişim kurma talebi alma',
                  ],
                },
                {
                  planKey: 'standard' as PlanType,
                  name: '2. PAKET',
                  price: '200 TL',
                  priceSuffix: '/ Aylık',
                  features: [
                    'Sınırsız ilan verme',
                    'Sınırsız kurye profil görüntüleme',
                    'Günlük 20 adet kurye iletişim talebi gönderme',
                    'Kuryelerle telefon ve WhatsApp ile iletişim kurma',
                    'Uygulama içi mesajlaşma',
                  ],
                  notIncluded: [
                    'Kurye tarafından görüntülenme ve iletişim kurma talebi alma',
                  ],
                },
                {
                  planKey: 'premium' as PlanType,
                  name: '3. PAKET',
                  price: '275 TL',
                  priceSuffix: '/ Aylık',
                  features: [
                    'Sınırsız ilan verme',
                    'Sınırsız kurye profil görüntüleme',
                    'Günlük sınırsız adet kurye iletişim talebi gönderme',
                    'Kuryelerle telefon ve WhatsApp ile iletişim kurma',
                    'Kurye tarafından görüntülenme ve iletişim kurma talebi alma',
                  ],
                  notIncluded: [],
                },
              ]).map((p) => {
                const isCurrentPlan = p.planKey === plan;
                const planColor = PLAN_COLORS[p.planKey];

                return (
                  <div
                    key={p.planKey}
                    className={`rounded-xl border-2 p-5 flex flex-col ${
                      isCurrentPlan 
                        ? `${planColor.border} ${planColor.bg}` 
                        : 'border-gray-200 hover:border-[#ff7a00]'
                    } transition-colors`}
                  >
                    {/* Paket İsmi */}
                    <h3 className="font-bold text-lg text-gray-900 mb-1 text-center">
                      {p.name}
                    </h3>

                    {/* Fiyat */}
                    <div className="text-center mb-4">
                      <span className="text-3xl font-extrabold text-[#ff7a00]">{p.price}</span>
                      {p.priceSuffix && (
                        <span className="text-sm text-gray-500 ml-1">{p.priceSuffix}</span>
                      )}
                    </div>

                    {/* Dahil Özellikler */}
                    <ul className="text-sm text-gray-700 space-y-2.5 mb-3 flex-1">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Dahil Olmayan Özellikler */}
                    {p.notIncluded.length > 0 && (
                      <ul className="text-sm text-gray-400 space-y-2 mb-4 border-t border-gray-100 pt-3">
                        {p.notIncluded.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="line-through">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Mevcut Plan Badge */}
                    {isCurrentPlan && (
                      <div className="mb-3 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                          Mevcut Planınız
                        </span>
                      </div>
                    )}

                    {/* Buton */}
                    <button
                      onClick={() => handleUpgrade(p.planKey)}
                      disabled={isCurrentPlan || upgrading}
                      className={`w-full py-2.5 rounded-full font-semibold transition-colors mt-auto ${
                        isCurrentPlan
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#ff7a00] text-white hover:bg-[#e66a00]'
                      }`}
                    >
                      {upgrading ? 'Güncelleniyor...' : isCurrentPlan ? 'Mevcut Plan' : 'Bu Paketi Seç'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
