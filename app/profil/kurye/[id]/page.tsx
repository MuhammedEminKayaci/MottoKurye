import React from "react";
import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import { ContactButtons } from "@/app/_components/ContactButtons";
import { EditProfileButton } from "@/app/_components/EditProfileButton";
import { StartChatButton } from "@/app/mesajlar/_components/StartChatButton";

const maskCourierName = (first?: string | null, last?: string | null) => {
  const f = (first || "").trim();
  const l = (last || "").trim();
  const initial = l ? `${l[0].toUpperCase()}.` : "";
  return [f, initial].filter(Boolean).join(" ") || "Kurye";
};

interface CourierProfileProps {
  params: Promise<{ id: string }>;
}

async function getCourierProfile(userId: string) {
  console.log('Fetching courier profile for user_id:', userId);
  const { data, error } = await supabaseServer
    .from("couriers")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error('Courier profile fetch error:', error, 'for user_id:', userId);
    return null;
  }
  if (!data) {
    console.warn('No courier found for user_id:', userId);
    return null;
  }
  return data;
}

export default async function KuryeProfilPage({ params }: CourierProfileProps) {
  const { id } = await params;
  console.log('Courier profile page - received id:', id);
  const courier = await getCourierProfile(id);


  if (!courier) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Profil Bulunamadı</h1>
          <p className="text-neutral-600 mb-6">Bu kurye profili bulunamadı veya silinmiş.</p>
          <Link
            href="/ilanlar"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
          >
            İlanlara Dön
          </Link>
        </div>
      </main>
    );
  }

  const avatarUrl = courier.avatar_url || '/images/icon-profile.png';
  const maskedName = maskCourierName(courier.first_name, courier.last_name);
  const fullName = maskedName;

  // Format working days
  const formatWorkingDays = (days: any) => {
    if (!days) return '-';
    if (Array.isArray(days)) return days.join(' - ');
    if (typeof days === 'string') return days.split(',').map(d => d.trim()).join(' - ');
    return days;
  };

  const formatDistrict = (district: any) => {
    if (!district) return '';
    if (Array.isArray(district)) return district.join(', ');
    return district;
  };

  // Info cards data structure
  const infoCards = [
    { label: 'İsim', value: maskedName, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Yaş', value: courier.age, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Cinsiyet', value: courier.gender === 'ERKEK' ? 'Erkek' : courier.gender === 'KADIN' ? 'Kadın' : courier.gender, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Uyruk', value: courier.nationality, icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' },
    { label: 'Telefon', value: courier.phone, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { label: 'İş Tecrübesi', value: courier.experience, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Konum', value: courier.province ? `${courier.province} / ${formatDistrict(courier.district)}` : formatDistrict(courier.district) || '-', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Çalışma Tipi', value: courier.working_type, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Kazanç Modeli', value: courier.earning_model, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Günlük Paket Tahmini', value: courier.daily_package_estimate, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Çalışma Günleri', value: formatWorkingDays(courier.working_days), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Ehliyet Türü', value: courier.license_type, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { label: 'Motorsiklet', value: courier.has_motorcycle === 'VAR' ? 'Var' : courier.has_motorcycle === 'YOK' ? 'Yok' : '-', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    ...(courier.has_motorcycle === 'VAR' ? [
      { label: 'Marka', value: courier.moto_brand, icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
      { label: 'Motor CC', value: courier.moto_cc, icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    ] : []),
    { label: 'Taşıma Çantası', value: courier.has_bag === 'VAR' ? 'Var' : courier.has_bag === 'YOK' ? 'Yok' : '-', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { label: 'P1 Yetki Belgesi', value: courier.p1_certificate === 'VAR' ? 'Var' : courier.p1_certificate === 'YOK' ? 'Yok' : '-', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Sabıka Kaydı', value: courier.criminal_record === 'VAR' ? 'Var' : courier.criminal_record === 'YOK' ? 'Yok' : '-', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ].filter(card => card.value);

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
          <h1 className="text-xl sm:text-2xl font-bold text-[#ff7a00]">Kurye Profili</h1>
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
                alt={fullName}
                size={160}
                borderColor="orange-100"
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">{fullName}</h2>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Kurye
                </span>
                {courier.experience && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {courier.experience}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                 <StartChatButton targetId={id} targetRole="kurye" targetUserId={courier.user_id} />
                 <EditProfileButton targetUserId={courier.user_id} role="kurye" />
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
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    {card.label}
                  </p>
                  <p className="text-base font-bold text-neutral-900 break-words">
                    {card.value || '-'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section - show based on contact preference */}
        {(courier.contact_preference === "in_app" || courier.contact_preference === "both" || courier.phone) && (
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">İletişim</h3>
            <ContactButtons
              phone={courier.phone || ""}
              name={fullName}
              role="kurye"
              contactPreference={courier.contact_preference}
            />
          </div>
        )}
      </div>
    </main>
  );
}
