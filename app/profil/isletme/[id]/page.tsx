import React from "react";
import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import { ContactButtons } from "@/app/_components/ContactButtons";
import { EditProfileButton } from "@/app/_components/EditProfileButton";
import { StartChatButton } from "@/app/mesajlar/_components/StartChatButton";
import { ProfileName } from "@/app/_components/ProfileName";

const maskBusinessName = (name?: string | null) => {
  const parts = (name || "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "İşletme";
  // Her kelime için ilk harf + 3 nokta: "Engin Has Lahmacun" → "E... H... L..."
  return parts.map(p => `${p[0]?.toUpperCase() || ''}...`).join(' ');
};

// Yetkili adını formatla: "Mehmet Kalaycı" → "Mehmet K."
const formatManagerName = (name?: string | null) => {
  if (!name) return '-';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '-';
  if (parts.length === 1) return parts[0];
  // İlk isim tam, sonraki isim(ler)in sadece ilk harfi
  const firstName = parts[0];
  const lastNameInitial = parts[parts.length - 1][0]?.toUpperCase() || '';
  return `${firstName} ${lastNameInitial}.`;
};

interface BusinessProfileProps {
  params: Promise<{ id: string }>;
}

async function getBusinessProfile(userId: string) {
  const { data, error } = await supabaseServer
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error('Business profile fetch error:', error, 'for user_id:', userId);
    return null;
  }
  if (!data) {
    return null;
  }
  return data;
}

export default async function IsletmeProfilPage({ params }: BusinessProfileProps) {
  const { id } = await params;
  const business = await getBusinessProfile(id);


  if (!business) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Profil Bulunamadı</h1>
          <p className="text-neutral-600 mb-6">Bu işletme profili bulunamadı veya silinmiş.</p>
          <Link
            href="/ilanlar"
            className="inline-block px-6 py-3 bg-gradient-to-r from-neutral-800 to-neutral-900 text-white font-semibold rounded-xl hover:from-neutral-900 hover:to-black transition-all shadow-md hover:shadow-lg"
          >
            İlanlara Dön
          </Link>
        </div>
      </main>
    );
  }

  const avatarUrl = business.avatar_url || '/images/icon-business.png';
  const maskedName = maskBusinessName(business.business_name);
  const fullBusinessName = business.business_name || 'İşletme';

  // Format district - max 2 ilçe göster, geri kalanı sayı olarak belirt
  const formatDistrict = (district: any) => {
    if (!district) return '';
    if (Array.isArray(district)) {
      if (district.length <= 2) {
        return district.join(', ');
      }
      const firstTwo = district.slice(0, 2).join(', ');
      const remaining = district.length - 2;
      return `${firstTwo} +${remaining} ilçe`;
    }
    return district;
  };

  // Format working days
  const formatWorkingDays = (days: any) => {
    if (!days) return '-';
    if (Array.isArray(days)) return days.join(' - ');
    if (typeof days === 'string') return days.split(',').map((d: string) => d.trim()).join(' - ');
    return days;
  };

  // Premium plan kontrolü - sadece "premium" plan telefonu görebilir
  const isPremiumPlan = business.plan === 'premium';

  // Info cards data structure
  const infoCards = [
    { label: 'İşletme Adı', value: maskedName, fullValue: fullBusinessName, isName: true, icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
    { label: 'Sektör', value: business.business_sector, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { label: 'Yetkili Adı', value: formatManagerName(business.manager_name), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    // Yetkili telefonu sadece premium üyelere gösterilir
    ...(isPremiumPlan ? [{ label: 'Yetkili Telefonu', value: business.manager_contact, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' }] : []),
    { label: 'Konum', value: business.province ? `${business.province} / ${formatDistrict(business.district)}` : formatDistrict(business.district) || '-', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Çalışma Tipi', value: business.working_type, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Kazanç Modeli', value: business.earning_model, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Günlük Paket Tahmini', value: business.daily_package_estimate, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Çalışma Günleri', value: formatWorkingDays(business.working_days), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ].filter(card => card.value && card.value !== '-');

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-12">
      {/* Header with back button */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href="/ilanlar"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0066ff]">İşletme Profili</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Avatar and Name Card */}
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
              <ProfileAvatar
                src={avatarUrl}
                alt={maskedName}
                size={160}
                borderColor="neutral-200"
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                <ProfileName
                  targetUserId={business.user_id}
                  maskedName={maskedName}
                  fullName={fullBusinessName}
                />
              </h2>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 text-neutral-800 text-sm font-semibold rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z"></path>
                  </svg>
                  İşletme
                </span>
                {business.service_type && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {business.service_type}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                 <StartChatButton targetId={id} targetRole="isletme" targetUserId={business.user_id} />
                 <EditProfileButton targetUserId={business.user_id} role="isletme" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {infoCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-100 transition-colors">
                  <svg className="w-5 h-5 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    {card.label}
                  </p>
                  <p className="text-base font-bold text-neutral-900 break-words">
                    {(card as any).isName ? (
                      <ProfileName
                        targetUserId={business.user_id}
                        maskedName={String(card.value)}
                        fullName={String((card as any).fullValue)}
                      />
                    ) : (
                      card.value || '-'
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium olmayan işletmelerde İletişim bölümü gösterilmez (sadece in_app tercihinde gösterilir) */}
        {(isPremiumPlan || business.contact_preference === "in_app") && (
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">İletişim</h3>
            <ContactButtons
              phone={business.manager_contact || ""}
              name={maskedName}
              role="isletme"
              contactPreference={business.contact_preference}
              businessPlan={business.plan}
            />
          </div>
        )}
      </div>
    </main>
  );
}
