"use client";
import React from "react";
import Image from "next/image";

interface ListingCardProps {
  title: string;
  subtitle?: string;
  meta?: string;
  metaParts?: string[];
  time?: string;
  imageUrl?: string | null;
  fallbackImageUrl?: string | null;
  phone?: string | null;
  contactPreference?: "phone" | "in_app" | "both";
  showActions?: boolean;
  isGuest?: boolean;
  onGuestClick?: () => void;
  userId?: string;
  userRole?: 'kurye' | 'isletme';
}

export function ListingCard({ title, subtitle, meta, metaParts, time, imageUrl, fallbackImageUrl, phone, contactPreference = "phone", showActions, isGuest, onGuestClick, userId, userRole }: ListingCardProps) {
  const chips = (metaParts && metaParts.length ? metaParts : (meta ? meta.split(" • ") : [])).filter(Boolean);
  const finalImageUrl = imageUrl || fallbackImageUrl;
  const showImage = !!finalImageUrl;

  // Determine if this card is for a business or courier profile
  const isBusiness = userRole === 'isletme';

  const isWithinContactHours = () => {
    const hour = new Date().getHours();
    return hour >= 8 && hour < 20;
  };

  const canContact = isWithinContactHours();

  const handleInAppChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest && onGuestClick) { onGuestClick(); return; }
    if (!canContact) { alert("İletişim 08:00-20:00 arasında mümkündür."); return; }
    alert("Uygulama içi sohbet yakında eklenecek.");
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest && onGuestClick) { onGuestClick(); return; }
    if (!canContact) { alert("İletişim 08:00-20:00 arasında mümkündür."); return; }
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Merhaba ${title}, kurye ilanınız hakkında bilgi almak istiyorum.`);
    window.open(`https://wa.me/${cleaned}?text=${msg}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest && onGuestClick) { onGuestClick(); return; }
    if (!canContact) { alert("İletişim 08:00-20:00 arasında mümkündür."); return; }
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const handleCardClick = () => {
    if (isGuest && onGuestClick) { onGuestClick(); return; }
    if (userId && userRole) {
      window.location.href = `/profil/${userRole}/${userId}`;
    }
  };

  // Role-based accent colors
  const accent = isBusiness
    ? { gradient: 'from-blue-500 to-indigo-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', hoverBorder: 'hover:border-blue-400', chipBg: 'bg-blue-50', chipText: 'text-blue-700', chipBorder: 'border-blue-200', hoverChipBg: 'group-hover:bg-blue-100', badge: 'bg-blue-100 text-blue-700', accentBar: 'from-blue-400 via-blue-500 to-indigo-600', ring: 'border-blue-300' }
    : { gradient: 'from-orange-400 to-orange-600', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', hoverBorder: 'hover:border-orange-400', chipBg: 'bg-orange-50', chipText: 'text-orange-700', chipBorder: 'border-orange-200', hoverChipBg: 'group-hover:bg-orange-100', badge: 'bg-orange-100 text-orange-700', accentBar: 'from-orange-400 via-orange-500 to-orange-600', ring: 'border-orange-300' };

  /* ────────── Mobil aksiyon butonları ────────── */
  const MobileActions = () => {
    if (!showActions) return null;
    return (
      <div className="flex md:hidden border-t border-neutral-100 bg-neutral-50/50 px-3 py-2 gap-2">
        {isGuest ? (
          <div className="flex-1 text-center py-1.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded-lg border border-orange-200">
            İletişim için kayıt olun
          </div>
        ) : contactPreference === "in_app" ? (
          <button onClick={handleInAppChat} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Mesaj
          </button>
        ) : phone ? (
          <>
            <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WA
            </button>
            <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Ara
            </button>
          </>
        ) : (
          <button onClick={handleInAppChat} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Mesaj
          </button>
        )}
      </div>
    );
  };

  /* ────────── Desktop aksiyon butonları ────────── */
  const DesktopActions = () => {
    if (!showActions) return null;
    return (
      <div className="hidden md:flex border-t border-neutral-200 bg-neutral-50/50 p-3 gap-2">
        {isGuest ? (
          <div className="flex-1 text-center py-2.5 px-4 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 text-sm font-semibold rounded-xl border border-orange-200">
            İletişim için kayıt olun
          </div>
        ) : contactPreference === "in_app" ? (
          <button onClick={handleInAppChat} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Mesaj Gönder
          </button>
        ) : contactPreference === "both" ? (
          phone ? (
            <>
              <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
              </button>
              <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Ara
              </button>
            </>
          ) : (
            <button onClick={handleInAppChat} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Mesaj Gönder
            </button>
          )
        ) : phone ? (
          <>
            <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Mesaj
            </button>
            <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Ara
            </button>
          </>
        ) : null}
      </div>
    );
  };

  return (
    <div 
      className={`group relative flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-xl ${accent.hoverBorder} transition-all duration-300 overflow-hidden cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* ═══════ MOBİL: Yatay Kompakt Kart ═══════ */}
      <div className="flex md:hidden p-3 gap-3 items-center">
        {/* Avatar - Yuvarlak */}
        <div className={`relative flex-shrink-0 w-18 h-18 rounded-full overflow-hidden bg-gradient-to-br ${isBusiness ? 'from-blue-100 to-indigo-50 border-blue-300' : 'from-orange-100 to-orange-50 border-orange-300'} border-2 shadow-sm`}>
          {showImage ? (
            <Image src={finalImageUrl!} alt={title} width={72} height={72} className="w-full h-full object-cover" onError={(e: any) => { e.currentTarget.src = '/images/icon-profile.png'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className={`w-8 h-8 ${isBusiness ? 'text-blue-400' : 'text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isBusiness ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                )}
              </svg>
            </div>
          )}
        </div>

        {/* İçerik */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className={`text-sm font-bold text-neutral-900 truncate ${isBusiness ? 'group-hover:text-blue-600' : 'group-hover:text-orange-600'} transition`}>
                {title}
              </h4>
            </div>
            {time && (
              <span className="flex-shrink-0 text-[10px] font-medium text-neutral-400">
                {time}
              </span>
            )}
          </div>
          {/* Rol Badge + Subtitle */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${accent.badge}`}>
              {isBusiness ? (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
              ) : (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )}
              {isBusiness ? 'İşletme' : 'Kurye'}
            </span>
            {subtitle && <p className="text-[10px] text-neutral-500 truncate">{subtitle}</p>}
          </div>
          {/* Chip'ler */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {chips.slice(0, 3).map((c, i) => (
                <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${accent.chipBg} ${accent.chipText} border ${accent.chipBorder}`}>
                  {c}
                </span>
              ))}
              {chips.length > 3 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">+{chips.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Sağ ok */}
        <div className={`flex-shrink-0 ${isBusiness ? 'text-neutral-300 group-hover:text-blue-400' : 'text-neutral-300 group-hover:text-orange-400'} transition`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>

      {/* Mobil aksiyon butonları */}
      <MobileActions />

      {/* ═══════ DESKTOP: Modern Yatay Kart ═══════ */}
      <div className="hidden md:flex p-4 gap-4 items-center">
        {/* Avatar - Yuvarlak (Sol) */}
        <div className={`relative flex-shrink-0 w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br ${isBusiness ? 'from-blue-100 to-indigo-50' : 'from-orange-100 to-orange-50'} border-2 ${accent.ring} shadow-md group-hover:shadow-lg transition-shadow`}>
          {showImage ? (
            <Image src={finalImageUrl!} alt={title} width={80} height={80} className="w-full h-full object-cover" onError={(e: any) => { e.currentTarget.src = '/images/icon-profile.png'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className={`w-9 h-9 ${isBusiness ? 'text-blue-400' : 'text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isBusiness ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                )}
              </svg>
            </div>
          )}
        </div>

        {/* İçerik (Sağ) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className={`text-base font-bold text-neutral-900 truncate ${isBusiness ? 'group-hover:text-blue-600' : 'group-hover:text-orange-600'} transition`}>{title}</h4>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${accent.badge}`}>
                {isBusiness ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
                {isBusiness ? 'İşletme' : 'Kurye'}
              </span>
            </div>
            {time && (
              <span className="flex-shrink-0 text-[11px] font-medium text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                {time}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-neutral-500 line-clamp-1 mb-1.5">{subtitle}</p>}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${accent.chipBg} ${accent.chipText} ${accent.chipBorder} ${accent.hoverChipBg}`}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Profil Detay butonu + Ok ikonu */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className={`hidden lg:inline-flex text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${isBusiness ? 'bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-100' : 'bg-orange-50 text-orange-600 border-orange-200 group-hover:bg-orange-100'}`}>
            Profili Gör
          </span>
          <div className={`flex-shrink-0 ${isBusiness ? 'text-neutral-300 group-hover:text-blue-400' : 'text-neutral-300 group-hover:text-orange-400'} transition`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>

      {/* Desktop aksiyon butonları */}
      <DesktopActions />

      {/* Accent bar - role-based color */}
      <div className={`absolute bottom-0 left-0 h-0.5 md:h-1 w-full bg-gradient-to-r ${accent.accentBar} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
}
