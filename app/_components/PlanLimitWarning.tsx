"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlanType, PLAN_LIMITS, isUnlimited } from "@/lib/planLimits";

interface PlanLimitWarningProps {
  messagesLeft: number;
  dailyMessageLimit: number;
  currentPlan: PlanType;
  onUpgradeClick?: () => void;
}

export function PlanLimitWarning({
  messagesLeft,
  dailyMessageLimit,
  currentPlan,
  onUpgradeClick
}: PlanLimitWarningProps) {
  const [dismissed, setDismissed] = useState(false);

  // Sınırsız planlarda gösterme
  if (isUnlimited(dailyMessageLimit)) return null;
  
  // Dismissed ise gösterme
  if (dismissed) return null;

  // Hak varsa ve 2'den fazlaysa gösterme
  if (messagesLeft > 2) return null;

  const isOutOfMessages = messagesLeft === 0;
  const isLowOnMessages = messagesLeft > 0 && messagesLeft <= 2;

  if (!isOutOfMessages && !isLowOnMessages) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 rounded-xl shadow-2xl border-2 p-4 ${
        isOutOfMessages 
          ? 'bg-red-50 border-red-300' 
          : 'bg-amber-50 border-amber-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isOutOfMessages ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          {isOutOfMessages ? (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <h4 className={`font-bold ${isOutOfMessages ? 'text-red-800' : 'text-amber-800'}`}>
            {isOutOfMessages 
              ? 'Günlük Mesaj Hakkınız Doldu!' 
              : `Sadece ${messagesLeft} Mesaj Hakkınız Kaldı!`}
          </h4>
          <p className={`text-sm mt-1 ${isOutOfMessages ? 'text-red-600' : 'text-amber-600'}`}>
            {isOutOfMessages 
              ? 'Bugün için daha fazla kurye ile iletişime geçemezsiniz.'
              : 'Mesaj haklarınız azalıyor.'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Mevcut plan: {PLAN_LIMITS[currentPlan].displayName}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Link
              href="/ucret-planlari"
              className="flex-1 py-2 px-4 bg-[#ff7a00] text-white text-center text-sm font-medium rounded-full hover:bg-[#e66a00] transition-colors"
            >
              Planı Yükselt
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="py-2 px-3 text-gray-500 hover:text-gray-700 text-sm"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mesaj gönderme öncesi modal uyarısı
interface MessageBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  messagesLeft: number;
  currentPlan: PlanType;
}

export function MessageBlockedModal({
  isOpen,
  onClose,
  messagesLeft,
  currentPlan
}: MessageBlockedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Mesaj Gönderemezsiniz
        </h2>
        <p className="text-gray-600 mb-4">
          {messagesLeft === 0 
            ? 'Günlük mesaj hakkınız doldu. Yarın tekrar deneyebilir veya planınızı yükseltebilirsiniz.'
            : `Sadece ${messagesLeft} mesaj hakkınız kaldı.`}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          Mevcut planınız: <span className="font-medium">{PLAN_LIMITS[currentPlan].displayName}</span>
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/ucret-planlari"
            className="w-full py-3 px-6 bg-[#ff7a00] text-white font-bold rounded-full hover:bg-[#e66a00] transition-colors"
          >
            Planı Yükselt
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
