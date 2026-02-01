"use client";

import React, { useState, useEffect } from "react";

interface ContactButtonsProps {
  phone: string;
  name: string;
  role: "kurye" | "isletme";
  contactPreference?: "phone" | "in_app" | "both" | null;
  businessPlan?: "free" | "standard" | "premium" | null; // İşletme paket bilgisi
}

export function ContactButtons({ phone, name, role, contactPreference, businessPlan }: ContactButtonsProps) {
  const [canContact, setCanContact] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setCanContact(hour >= 8 && hour < 20);
      setLoading(false);
    };
    
    checkTime();
    // Re-check every minute just in case
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    if (loading) return;
    
    if (canContact) {
      action();
    } else {
      alert("İletişim 08:00-20:00 arasında mümkündür. 20:00 sonrası arama ve mesaj gönderimi kapalıdır.");
    }
  };

  const callColorClass = role === "kurye" 
    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" 
    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700";

  // İşletme rolünde ve premium olmayan paketlerde telefon bilgisi gösterilmez
  const shouldShowPhone = role === "kurye" || (role === "isletme" && businessPlan === "premium");

  // If contactPreference is "in_app" only, don't show phone contact buttons
  if (contactPreference === "in_app") {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-neutral-100 rounded-xl border border-neutral-200">
        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm text-center text-neutral-600">
          Bu kullanıcı yalnızca <strong>uygulama içi mesajlaşma</strong> ile iletişim kurmayı tercih etmektedir.
        </p>
        <p className="text-xs text-neutral-500">Mesaj göndermek için yukarıdaki &quot;Mesaj Gönder&quot; butonunu kullanın.</p>
      </div>
    );
  }

  // "phone" seçeneği - Sadece telefon ve WhatsApp göster (uygulama içi mesaj gösterilmez)
  if (contactPreference === "phone") {
    // İşletme için premium değilse telefon gösterme
    if (role === "isletme" && !shouldShowPhone) {
      return (
        <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm text-center text-amber-700">
            İletişim bilgileri yalnızca <strong>Premium</strong> üyelere gösterilmektedir.
          </p>
          <p className="text-xs text-amber-600">Bu işletme telefon ile iletişimi tercih etmektedir.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="#"
          onClick={(e) => handleAction(e, () => {
               const cleaned = phone.replace(/\D/g, '');
               const msg = encodeURIComponent(`Merhaba ${name}, ${role === 'kurye' ? 'ilanınız' : 'işletmeniz'} hakkında bilgi almak istiyorum.`);
               window.open(`https://wa.me/${cleaned}?text=${msg}`, '_blank');
          })}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          WhatsApp
        </a>
        <a
          href="#"
          onClick={(e) => handleAction(e, () => {
               window.location.href = `tel:${phone}`;
          })}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all ${callColorClass}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Telefon
        </a>
      </div>
    );
  }

  // "both" seçeneği - Hem telefon hem uygulama içi mesaj butonları gösterilir
  if (contactPreference === "both") {
    // İşletme için premium değilse sadece uygulama içi mesaj göster
    if (role === "isletme" && !shouldShowPhone) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 p-4 bg-neutral-100 rounded-xl border border-neutral-200">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-center text-neutral-600">
              Uygulama içi mesajlaşma ile iletişime geçin.
            </p>
            <p className="text-xs text-neutral-500">Mesaj göndermek için yukarıdaki &quot;Mesaj Gönder&quot; butonunu kullanın.</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-center text-amber-700">
              <strong>Not:</strong> Telefon bilgileri yalnızca <strong>Premium</strong> üyelere gösterilmektedir.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Uygulama içi mesajlaşma bilgisi */}
        <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-center text-blue-700">
            <strong>Uygulama içi mesajlaşma:</strong> Yukarıdaki &quot;Mesaj Gönder&quot; butonunu kullanabilirsiniz.
          </p>
        </div>
        
        {/* Telefon ve WhatsApp butonları */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="#"
            onClick={(e) => handleAction(e, () => {
                 const cleaned = phone.replace(/\D/g, '');
                 const msg = encodeURIComponent(`Merhaba ${name}, ${role === 'kurye' ? 'ilanınız' : 'işletmeniz'} hakkında bilgi almak istiyorum.`);
                 window.open(`https://wa.me/${cleaned}?text=${msg}`, '_blank');
            })}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
          <a
            href="#"
            onClick={(e) => handleAction(e, () => {
                 window.location.href = `tel:${phone}`;
            })}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all ${callColorClass}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Telefon
          </a>
        </div>
      </div>
    );
  }

  // Default: null veya bilinmeyen değer - eski davranış (phone gibi)
  if (role === "isletme" && !shouldShowPhone) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-sm text-center text-amber-700">
          İletişim bilgileri yalnızca <strong>Premium</strong> üyelere gösterilmektedir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href="#"
        onClick={(e) => handleAction(e, () => {
             const cleaned = phone.replace(/\D/g, '');
             const msg = encodeURIComponent(`Merhaba ${name}, ${role === 'kurye' ? 'ilanınız' : 'işletmeniz'} hakkında bilgi almak istiyorum.`);
             window.open(`https://wa.me/${cleaned}?text=${msg}`, '_blank');
        })}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        WhatsApp
      </a>
      <a
        href="#"
        onClick={(e) => handleAction(e, () => {
             window.location.href = `tel:${phone}`;
        })}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all ${callColorClass}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Telefon
      </a>
    </div>
  );
}
