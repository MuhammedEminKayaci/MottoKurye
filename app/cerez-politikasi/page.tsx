"use client";

import React from "react";
import Link from "next/link";
import { UnifiedHeader } from "../_components/UnifiedHeader";
import { Footer } from "../_components/Footer";

export default function CerezPolitikasiPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      <UnifiedHeader />

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-[#ff7a00]/10 text-[#ff7a00] px-6 py-2 rounded-full text-sm font-semibold">
                Çerez Bilgilendirmesi
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black mb-4">
              Çerez Politikası
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Paketservisci.com kullanıcı deneyimini geliştirmek amacıyla çerezler kullanır.
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Son Güncellenme: 27 Mart 2026 | Versiyon: 1.0
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-neutral-200 p-8 md:p-12 space-y-8">
            {/* Kullanılan Çerezler */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                Kullanılan Çerezler
              </h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 p-5 rounded-lg border border-orange-200 text-center">
                    <svg className="w-10 h-10 text-orange-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <h3 className="font-bold text-black mb-1">Oturum Çerezleri</h3>
                    <p className="text-sm text-neutral-600">Kullanıcı oturumunu yönetmek ve güvenli erişim sağlamak için</p>
                  </div>
                  <div className="bg-green-50 p-5 rounded-lg border border-green-200 text-center">
                    <svg className="w-10 h-10 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <h3 className="font-bold text-black mb-1">Analiz Çerezleri</h3>
                    <p className="text-sm text-neutral-600">Kullanım istatistiklerini toplamak ve analiz etmek için</p>
                  </div>
                  <div className="bg-purple-50 p-5 rounded-lg border border-purple-200 text-center">
                    <svg className="w-10 h-10 text-purple-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <h3 className="font-bold text-black mb-1">Performans Çerezleri</h3>
                    <p className="text-sm text-neutral-600">Site performansını ölçmek ve iyileştirmek için</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Çerez Kullanım Amaçları */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                Çerez Kullanım Amaçları
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Çerezler:</p>
                <ul className="list-none space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>Site performansını ölçmek:</strong> Sayfa yükleme süreleri ve kullanım kalıplarını analiz etmek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>Kullanıcı deneyimini geliştirmek:</strong> Tercihlerinizi hatırlayarak kişiselleştirilmiş deneyim sunmak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>İstatistiksel analiz yapmak:</strong> Platform kullanım verilerini anonim olarak değerlendirmek</span>
                  </li>
                </ul>
                <p>amacıyla kullanılmaktadır.</p>
              </div>
            </section>

            {/* Çerez Yönetimi */}
            <section>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Çerez Yönetimi
                </h3>
                <p className="text-sm text-neutral-700">
                  Tarayıcı ayarlarınızdan çerezleri yönetebilir veya reddedebilirsiniz. Zorunlu çerezlerin reddedilmesi durumunda platform işlevselliği etkilenebilir.
                </p>
              </div>
            </section>

            {/* Related Policies */}
            <section className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200">
              <h3 className="text-lg font-bold text-black mb-4">İlgili Politikalar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/kullanim-sartlari" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Kullanıcı Sözleşmesi
                </Link>
                <Link href="/gizlilik-politikasi" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Gizlilik Politikası
                </Link>
                <Link href="/kvkk-aydinlatma" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  KVKK Aydınlatma Metni
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
