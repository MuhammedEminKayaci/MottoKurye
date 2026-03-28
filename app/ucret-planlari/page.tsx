"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { UnifiedHeader } from "../_components/UnifiedHeader";
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
      originalPrice: null,
      priceColor: "text-[#ff7a00]",
      features: [
        "Sınırsız ilan verme",
        "Sınırsız kurye profil görüntüleme",
        "Toplam 2 adet kurye iletişim talebi gönderme",
        "Sadece uygulama içi mesajlaşma"
      ],
      popular: false,
      buttonText: "Başla",
      buttonStyle: "bg-white text-[#ff7a00] border-2 border-[#ff7a00] hover:bg-[#ff7a00] hover:text-white"
    },
    {
      id: 2,
      name: "2. PAKET",
      planKey: "standard" as PlanType,
      price: "Ücretsiz",
      originalPrice: "200 TL",
      priceColor: "text-[#ff7a00]",
      features: [
        "Sınırsız ilan verme",
        "Sınırsız kurye profil görüntüleme",
        "Aylık toplam 30 adet kurye iletişim talebi gönderme",
        "Sadece uygulama içi mesajlaşma"
      ],
      popular: true,
      buttonText: "Ücretsiz Başla",
      buttonStyle: "bg-[#ff7a00] text-white hover:bg-[#ff6a00] border-2 border-[#ff7a00]"
    },
    {
      id: 3,
      name: "3. PAKET",
      planKey: "premium" as PlanType,
      price: "Ücretsiz",
      originalPrice: "275 TL",
      priceColor: "text-[#ff7a00]",
      features: [
        "Sınırsız ilan verme",
        "Sınırsız kurye profil görüntüleme",
        "Sınırsız adet kurye iletişim talebi gönderme",
        "Kuryelerle telefon ve WhatsApp ile iletişim kurma",
        "Kurye tarafından görüntülenme ve iletişim kurma talebi alma"
      ],
      popular: false,
      buttonText: "Ücretsiz Başla",
      buttonStyle: "bg-white text-black border-2 border-black hover:bg-black hover:text-white"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-neutral-50 to-white flex flex-col font-sans">
      <UnifiedHeader />

      {/* Pricing Cards */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-4">
              İşletme Ücret Planları
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-6">
              İşletmeniz için en uygun paketi seçin ve kurye bulmayı kolaylaştırın.
            </p>
            {/* Test Dönemi Banner */}
            <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-300 text-green-700 px-6 py-3 rounded-full text-sm md:text-base font-bold shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              🎉 Kısa süreliğine tüm planlar ücretsiz!
            </div>
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
                    {plan.originalPrice && (
                      <div className="text-xl md:text-2xl font-bold text-neutral-400 line-through mb-1">
                        {plan.originalPrice}
                      </div>
                    )}
                    <div className={`text-4xl md:text-5xl lg:text-6xl font-extrabold ${plan.priceColor} mb-2`}>
                      {plan.price}
                    </div>
                    {plan.originalPrice && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        Test Dönemi
                      </span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 md:mb-3">
                    Paketservisçi.com üzerinden anlık kurye çağırabilir miyim?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Hayır. Paketservisçi.com, anlık veya tek seferlik kurye çağırma hizmeti sunmaz. Platformumuz, işletmelerin uzun süreli çalışabilecek motokuryeler bulmasını sağlamak amacıyla kurulmuştur. İşletmeler, ihtiyaç duydukları kuryeleri ilan oluşturarak veya kurye profillerini inceleyerek bulabilir ve uzun vadeli çalışma için iletişime geçebilir.
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
                    Paketservisçi.com kuryeler için ücretli mi?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Hayır, Paketservisçi.com kuryeler için tamamen ücretsizdir.
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
                    Paketservisçi.com işletmeler için üyelik paketleri ücretli mi?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Paketservisçi.com&apos;da 3 farklı üyelik paketi bulunmaktadır. Bunlardan 1. Paket sınırlı kullanım imkanları ile tamamen ücretsizdir. 2. ve 3. Paket üyelikleri ücretlidir.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#ff7a00]/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 md:mb-3">
                    Paketservisçi.com&apos;u kimler kullanabilir?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                    Uzun süreli motorsikletli kurye istihdamı yapmak isteyen her firma ile tüm motorsikletli kuryeler Paketservisçi.com&apos;u kullanabilir.
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
