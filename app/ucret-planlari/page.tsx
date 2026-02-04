"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { PublicHeader } from "../_components/PublicHeader";
import { Footer } from "../_components/Footer";
import { supabase } from "@/lib/supabase";
import { PlanType, PLAN_LIMITS, isUnlimited } from "@/lib/planLimits";

export default function UcretPlanlariPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth.session?.user?.id;
      if (!uid) return;

      setIsLoggedIn(true);
      
      const { data: business } = await supabase
        .from("businesses")
        .select("id, plan")
        .eq("user_id", uid)
        .single();

      if (business) {
        setCurrentPlan((business.plan || 'free') as PlanType);
        setBusinessId(business.id);
      }
    };

    checkUser();
  }, []);

  const handleUpgrade = async (newPlan: PlanType) => {
    if (!businessId || newPlan === currentPlan) return;

    setUpgrading(true);
    try {
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

      setCurrentPlan(newPlan);
      alert(`Planınız ${PLAN_LIMITS[newPlan].displayName} olarak güncellendi!`);
    } catch (error) {
      console.error('Plan upgrade error:', error);
      alert('Plan güncellenirken bir hata oluştu.');
    } finally {
      setUpgrading(false);
    }
  };
  const plans = [
    {
      id: 1,
      name: "1. PAKET",
      planKey: "free" as PlanType,
      price: "Ücretsiz",
      priceColor: "text-[#ff7a00]",
      features: [
        "Sınırsız ilan verme",
        "Sınırsız kurye profil görüntüleme",
        "Günlük 2 adet kurye iletişim talebi gönderme",
        "Günlük 1 adet kurye onayı alma"
      ],
      popular: false,
      buttonText: "Başla",
      buttonStyle: "bg-white text-[#ff7a00] border-2 border-[#ff7a00] hover:bg-[#ff7a00] hover:text-white"
    },
    {
      id: 2,
      name: "2. PAKET",
      planKey: "standard" as PlanType,
      price: "200 TL",
      priceColor: "text-[#ff7a00]",
      features: [
        "Sınırsız ilan verme",
        "Sınırsız kurye profil görüntüleme",
        "Günlük 20 adet kurye iletişim talebi gönderme",
        "Günlük 10 adet kurye onayı alma"
      ],
      popular: true,
      buttonText: "Satın Al",
      buttonStyle: "bg-[#ff7a00] text-white hover:bg-[#ff6a00] border-2 border-[#ff7a00]"
    },
    {
      id: 3,
      name: "3. PAKET",
      planKey: "premium" as PlanType,
      price: "275 TL",
      priceColor: "text-[#ff7a00]",
      features: [
        "Sınırsız ilan verme",
        "Sınırsız kurye profil görüntüleme",
        "Günlük sınırsız adet kurye iletişim talebi gönderme",
        "Günlük sınırsız kurye onayı alma",
        "Kurye tarafından görüntülenme ve iletişim kurma talebi alma"
      ],
      popular: false,
      buttonText: "Satın Al",
      buttonStyle: "bg-white text-black border-2 border-black hover:bg-black hover:text-white"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-neutral-50 to-white flex flex-col font-sans">
      <PublicHeader />

      {/* Pricing Cards */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-4">
              Ücret Planları
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              İşletmeniz için en uygun paketi seçin ve kurye bulmayı kolaylaştırın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${
                  currentPlan === plan.planKey
                    ? 'border-green-400 ring-4 ring-green-100'
                    : plan.popular
                      ? 'border-[#ff7a00] ring-4 ring-[#ff7a00]/20'
                      : 'border-neutral-200 hover:border-[#ff7a00]'
                }`}
              >
                {/* Popular Badge or Current Plan Badge */}
                {plan.popular && currentPlan !== plan.planKey && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#ff7a00] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      En Popüler
                    </span>
                  </div>
                )}
                {currentPlan === plan.planKey && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Mevcut Planınız
                    </span>
                  </div>
                )}

                <div className="p-6 md:p-8 flex flex-col flex-1">
                  {/* Plan Name */}
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2 text-center">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="text-center mb-6 md:mb-8">
                    <div className={`text-4xl md:text-5xl lg:text-6xl font-extrabold ${plan.priceColor} mb-2`}>
                      {plan.price}
                    </div>
                    {plan.price !== "Ücretsiz" && (
                      <p className="text-neutral-500 text-sm">/ Aylık</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-[#ff7a00] flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-neutral-700 text-sm md:text-base leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isLoggedIn && businessId ? (
                    <button
                      onClick={() => handleUpgrade(plan.planKey)}
                      disabled={currentPlan === plan.planKey || upgrading}
                      className={`block w-full py-3 md:py-4 px-6 rounded-full font-bold text-center transition-all duration-300 text-sm md:text-base ${
                        currentPlan === plan.planKey
                          ? 'bg-green-100 text-green-700 border-2 border-green-300 cursor-default'
                          : plan.buttonStyle
                      }`}
                    >
                      {upgrading ? 'Güncelleniyor...' : currentPlan === plan.planKey ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                          Mevcut Planınız
                        </span>
                      ) : plan.buttonText}
                    </button>
                  ) : (
                    <Link
                      href="/kayit-ol"
                      className={`block w-full py-3 md:py-4 px-6 rounded-full font-bold text-center transition-all duration-300 text-sm md:text-base ${plan.buttonStyle}`}
                    >
                      {plan.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4">
              <span className="bg-[#ff7a00]/10 text-[#ff7a00] px-6 py-2 rounded-full text-sm font-semibold">
                SSS
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-black mb-4">
              Sık Sorulan Sorular
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-sm md:text-base">
              Ücret planlarımız hakkında merak ettiğiniz her şey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#ff7a00]/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 md:mb-3">
                    Paketler nasıl çalışır?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Tüm paketler aylık abonelik şeklindedir. Seçtiğiniz pakete göre günlük kurye iletişim ve onay limitleriniz belirlenir.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#ff7a00]/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 md:mb-3">
                    Ücretsiz paket yeterli mi?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Ücretsiz paket, günde 1-2 kurye ile iletişim kurmak isteyen küçük işletmeler için idealdir. Daha fazla kurye ihtiyacınız varsa ücretli paketleri tercih edebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#ff7a00]/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 md:mb-3">
                    Paket değişikliği yapabilir miyim?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Evet, istediğiniz zaman paketinizi yükseltebilir veya düşürebilirsiniz. Değişiklikler bir sonraki faturalandırma döneminde geçerli olur.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#ff7a00]/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 md:mb-3">
                    Ödeme yöntemleri nelerdir?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz. Tüm ödemeler güvenli şekilde işlenir.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#ff7a00]/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 md:mb-3">
                    İşletmeler için nasıl çalışıyor?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Platform, işletmelerin doğru kuryelere ulaşması için tasarlanmıştır. İşletmeler, kurye profillerini görüntüleyebilir ve iletişim talebi gönderebilir. Seçtiğiniz pakete göre günlük iletişim ve onay limitleriniz belirlenir. Ücretsiz paket ile başlayıp, ihtiyacınıza göre ücretli paketlere geçiş yapabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 md:mb-3">
                    Kuryeler için ücretsiz mi?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Evet! Kuryeler için platform tamamen ücretsizdir. Kuryeler ücretsiz kayıt olabilir, profillerini oluşturabilir, ilan verebilir ve işletmelerden gelen iletişim taleplerini yanıtlayabilir. Hiçbir ücret veya gizli masraf bulunmamaktadır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern & Professional */}
      <section className="py-12 md:py-16 lg:py-20 bg-white border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            İşletmeniz için doğru kuryeyi bulun
          </h2>
          <p className="text-base md:text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Ücretsiz paket ile hemen kurye aramaya başlayabilir, ihtiyacınıza göre dilediğiniz zaman paket değişikliği yapabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/kayit-ol"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#ff7a00] text-white px-8 py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-[#ff6a00] transition-colors shadow-lg hover:shadow-xl"
            >
              Ücretsiz Başla
            </Link>
            <Link
              href="/kurye-bul"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-neutral-900 border-2 border-neutral-300 px-8 py-4 rounded-lg text-base md:text-lg font-semibold hover:border-neutral-400 transition-colors"
            >
              İlanları İncele
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
