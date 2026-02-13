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
  viewerPlan?: 'free' | 'standard' | 'premium' | null;
}

export function ListingCard({ title, subtitle, meta, metaParts, time, imageUrl, fallbackImageUrl, phone, contactPreference = "phone", showActions, isGuest, onGuestClick, userId, userRole, viewerPlan }: ListingCardProps) {
  const chips = (metaParts && metaParts.length ? metaParts : (meta ? meta.split(" • ") : [])).filter(Boolean);
  const finalImageUrl = imageUrl || fallbackImageUrl;
  const showImage = !!finalImageUrl;

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
    let cleaned = phone.replace(/\D/g, '');
    // 0 ile başlıyorsa Türkiye kodu ekle: 05XX -> 905XX
    if (cleaned.startsWith('0')) {
      cleaned = '90' + cleaned.slice(1);
    } else if (!cleaned.startsWith('90')) {
      cleaned = '90' + cleaned;
    }
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

  // Role-based accent
  // Renk düzeni: Kurye = turuncu, İşletme = siyah/koyu tonlar (mavi YOK)
  const accent = isBusiness
    ? {
        avatarBorder: 'border-neutral-300',
        avatarBg: 'from-neutral-100 to-neutral-50',
        avatarIcon: 'text-neutral-500',
        badgeBg: 'bg-neutral-100',
        badgeText: 'text-neutral-700',
        badgeBorder: 'border-neutral-200',
        chipBg: 'bg-neutral-100/80',
        chipText: 'text-neutral-700',
        chipBorder: 'border-neutral-200',
        hoverTitle: 'group-hover:text-[#ff7a00]',
        accentBar: 'from-neutral-700 to-neutral-900',
        arrowHover: 'group-hover:text-[#ff7a00]',
        arrowBg: 'group-hover:bg-orange-50',
        hoverBorder: 'hover:border-neutral-400',
        shadowHover: 'hover:shadow-neutral-200/50',
      }
    : {
        avatarBorder: 'border-orange-200',
        avatarBg: 'from-orange-50 to-amber-50',
        avatarIcon: 'text-orange-400',
        badgeBg: 'bg-orange-50',
        badgeText: 'text-orange-600',
        badgeBorder: 'border-orange-100',
        chipBg: 'bg-orange-50/80',
        chipText: 'text-orange-700',
        chipBorder: 'border-orange-100',
        hoverTitle: 'group-hover:text-orange-600',
        accentBar: 'from-orange-400 to-orange-500',
        arrowHover: 'group-hover:text-orange-500',
        arrowBg: 'group-hover:bg-orange-50',
        hoverBorder: 'hover:border-orange-300',
        shadowHover: 'hover:shadow-orange-100/50',
      };

  /* ────────── Unified Action Buttons ────────── */
  const ActionButtons = () => {
    if (!showActions) return null;

    if (isGuest) {
      return (
        <div className="px-3 sm:px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/60">
          <div className={`text-center py-2 text-xs sm:text-sm font-semibold rounded-xl ${accent.badgeBg} ${accent.badgeText} border ${accent.badgeBorder}`}>
            İletişim için kayıt olun
          </div>
        </div>
      );
    }

    const btnBase = "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all active:scale-[0.97]";

    const renderButtons = () => {
      // Ücretsiz plan olan işletme → sadece mesaj gönder
      if (viewerPlan === 'free') {
        return (
          <button onClick={handleInAppChat} className={`${btnBase} bg-[#ff7a00] hover:bg-[#e66e00] text-white shadow-sm hover:shadow-md`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Mesaj Gönder
          </button>
        );
      }

      if (contactPreference === "in_app") {
        return (
          <button onClick={handleInAppChat} className={`${btnBase} bg-[#ff7a00] hover:bg-[#e66e00] text-white shadow-sm hover:shadow-md`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Mesaj Gönder
          </button>
        );
      }

      if (phone) {
        return (
          <>
            <button onClick={handleWhatsApp} className={`${btnBase} bg-[#25D366] hover:bg-[#1ebe5b] text-white shadow-sm hover:shadow-md`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp
            </button>
            <button onClick={handleCall} className={`${btnBase} bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Ara
            </button>
          </>
        );
      }

      return (
        <button onClick={handleInAppChat} className={`${btnBase} bg-[#ff7a00] hover:bg-[#e66e00] text-white shadow-sm hover:shadow-md`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Mesaj Gönder
        </button>
      );
    };

    return (
      <div className="flex px-3 sm:px-4 py-2.5 gap-2 border-t border-neutral-100 bg-neutral-50/60">
        {renderButtons()}
      </div>
    );
  };

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div
      className={`group relative flex flex-col h-full rounded-2xl border border-neutral-200/80 bg-white shadow-sm hover:shadow-lg ${accent.hoverBorder} transition-all duration-300 overflow-hidden cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Top accent bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${accent.accentBar} opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0`} />

      {/* ═══════ CARD BODY — unified for mobile & desktop ═══════ */}
      <div className="flex items-start gap-3 p-3 sm:p-4 flex-1 min-h-[120px]">
        {/* Avatar — rounded square */}
        <div className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br ${accent.avatarBg} border-2 ${accent.avatarBorder} shadow-sm group-hover:shadow-md transition-shadow`}>
          {showImage ? (
            <Image
              src={finalImageUrl!}
              alt={title}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              onError={(e: any) => { e.currentTarget.src = '/images/icon-profile.png'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className={`w-7 h-7 sm:w-8 sm:h-8 ${accent.avatarIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isBusiness ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Badge + Date */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm sm:text-base font-bold text-neutral-900 truncate ${accent.hoverTitle} transition-colors`}>
              {title}
            </h4>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${accent.badgeBg} ${accent.badgeText} border ${accent.badgeBorder}`}>
              {isBusiness ? (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
              ) : (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )}
              {isBusiness ? 'İşletme' : 'Kurye'}
            </span>
            {time && (
              <span className="ml-auto flex-shrink-0 text-[10px] sm:text-[11px] font-medium text-neutral-400">
                {time}
              </span>
            )}
          </div>

          {/* Row 2: Subtitle */}
          {subtitle && (
            <p className="text-xs text-neutral-500 line-clamp-1 mb-1.5">{subtitle}</p>
          )}

          {/* Row 3: Chips — max 2 lines */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 max-h-[72px] overflow-hidden">
              {chips.slice(0, 7).map((c, i) => (
                <span
                  key={i}
                  className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 sm:py-1 rounded-lg ${accent.chipBg} ${accent.chipText} border ${accent.chipBorder} truncate max-w-[120px]`}
                >
                  {c}
                </span>
              ))}
              {chips.length > 7 && (
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 sm:py-1 rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-200">
                  +{chips.length - 7}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow icon */}
        <div className={`flex-shrink-0 self-center w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 ${accent.arrowHover} ${accent.arrowBg} transition-all`}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>

      {/* ═══════ ACTION BUTTONS ═══════ */}
      <div className="mt-auto">
        <ActionButtons />
      </div>
    </div>
  );
}
