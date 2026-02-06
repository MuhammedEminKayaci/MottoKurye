"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "../_components/PublicHeader";
import { Footer } from "../_components/Footer";

export default function TicariIletiIzniPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-[#ff7a00]/10 text-[#ff7a00] px-6 py-2 rounded-full text-sm font-semibold">
                Ticari İletişim
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black mb-4">
              Ticari İleti İzni
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Ticari elektronik ileti gönderimi ve İleti Yönetim Sistemi (İYS) kapsamında bilgilendirme metni.
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Son Güncellenme: 17 Aralık 2025 | Versiyon: 1.0
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-neutral-200 p-8 md:p-12 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                1. Genel Bilgiler
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>1.1.</strong> PaketServisçi ("Şirket", "Platform"), <strong>6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun</strong> ve <strong>Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik</strong> hükümlerine uygun olarak ticari elektronik ileti göndermektedir.
                </p>
                <p>
                  <strong>1.2.</strong> Ticari elektronik ileti, telefon, çağrı merkezleri, faks, otomatik arama makineleri, akıllı ses kaydedici sistemler, elektronik posta, kısa mesaj hizmeti gibi vasıtalar kullanılarak elektronik ortamda gerçekleştirilen ve ticari amaçlarla gönderilen veri, ses ve görüntü içerikli iletilerdir.
                </p>
                <p>
                  <strong>1.3.</strong> PaketServisçi, ticari elektronik ileti göndermek için alıcıların <strong>önceden onayını</strong> (açık rızasını) almaktadır.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                2. Ticari İleti İzni Kapsamı
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>2.1.</strong> Bu izin ile aşağıdaki türde ticari elektronik iletiler gönderilebilir:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>E-posta:</strong> Platform yenilikleri, kampanyalar, özel teklifler, eğitim içerikleri</li>
                  <li><strong>SMS/MMS:</strong> Kısa mesaj yoluyla bildirimler, kampanya bildirimleri</li>
                  <li><strong>Telefon Araması:</strong> Ürün/hizmet tanıtımı, anket ve memnuniyet çağrıları</li>
                  <li><strong>Push Bildirimleri:</strong> Mobil uygulama üzerinden anlık bildirimler (ileride)</li>
                </ul>
                <p>
                  <strong>2.2.</strong> İşlem bildirimleri (hesap doğrulama, şifre sıfırlama, güvenlik uyarıları vb.) ticari ileti kapsamında değildir ve iznizden bağımsız olarak gönderilir.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                3. İzin Verme ve Geri Alma
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>3.1. İzin Verme:</strong> Kayıt sırasında "Ticari İleti İzni" kutucuğunu işaretleyerek ticari elektronik ileti almayı kabul etmiş olursunuz.
                </p>
                <p>
                  <strong>3.2. İzin Geri Alma (Ret):</strong> İzninizi istediğiniz zaman geri alabilirsiniz. Geri alma yöntemleri:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>E-posta Linki:</strong> Gönderilen e-postaların altındaki "Abonelikten Çık" bağlantısını kullanma</li>
                  <li><strong>SMS RED:</strong> Aldığınız SMS'e "RED [Marka Kodu]" yazarak kısa mesaj gönderme</li>
                  <li><strong>Profil Ayarları:</strong> Hesap ayarlarınızdan ticari ileti tercihlerini güncelleme</li>
                  <li><strong>İletişim:</strong> <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">İletişim sayfamızdan</Link> veya kvkk@paketservisci.com adresine yazarak</li>
                </ul>
                <p>
                  <strong>3.3.</strong> İzin geri alındığında, en geç <strong>3 iş günü</strong> içinde ticari ileti gönderimi durdurulur ve İYS sistemine bildirilir.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                4. İYS (İleti Yönetim Sistemi) Uyumu
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>4.1.</strong> PaketServisçi, <strong>İleti Yönetim Sistemi (İYS)</strong>'ne kayıtlıdır ve ticari elektronik ileti izinlerinizi İYS üzerinde yönetmektedir.
                </p>
                <p>
                  <strong>4.2.</strong> İYS, alıcıların ticari elektronik ileti tercihlerini merkezi olarak yönetebilmelerine olanak tanıyan resmi bir sistemdir.
                </p>
                <p>
                  <strong>4.3.</strong> Verdiğiniz izinler İYS'ye <strong>kaydedilir</strong> ve geri alma talepleriniz de aynı sistem üzerinden <strong>yasal sürelerde işleme alınır</strong>.
                </p>
                <p>
                  <strong>4.4.</strong> İYS hakkında detaylı bilgi için: <a href="https://www.iys.org.tr" target="_blank" rel="noopener noreferrer" className="text-[#ff7a00] underline hover:text-[#ff6a00]">www.iys.org.tr</a>
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                5. Gönderilebilecek İçerik Türleri
              </h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>İzniniz dahilinde aşağıdaki türde içerikler gönderilebilir:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      Platform Güncellemeleri
                    </h3>
                    <p className="text-sm">Yeni özellikler, iyileştirmeler, sistem bakımları</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                      Kampanya ve Teklifler
                    </h3>
                    <p className="text-sm">Özel indirimler, promosyonlar, erken erişim fırsatları</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      Eğitim İçerikleri
                    </h3>
                    <p className="text-sm">Platform kullanım ipuçları, webinarlar, rehberler</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      Anket ve Geri Bildirim
                    </h3>
                    <p className="text-sm">Kullanıcı memnuniyet anketleri, ürün geri bildirimi talepleri</p>
                  </div>
                  
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      Kişiselleştirilmiş Öneriler
                    </h3>
                    <p className="text-sm">Size uygun ilan önerileri, eşleşme bildirimleri</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                      Haber Bültenleri
                    </h3>
                    <p className="text-sm">Sektör haberleri, platform blog yazıları</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                6. Gönderim Sıklığı ve Zamanlaması
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>6.1.</strong> Ticari elektronik iletiler, makul sıklıkta ve spam olarak nitelendirilemeyecek şekilde gönderilir.
                </p>
                <p>
                  <strong>6.2. Tahmini Gönderim Sıklığı:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>E-posta:</strong> Haftalık bülten ve ihtiyaç dahilinde kampanya e-postaları (aylık ortalama 2-4 e-posta)</li>
                  <li><strong>SMS:</strong> Özel kampanyalar ve acil bildirimler (ayda en fazla 2-3 mesaj)</li>
                  <li><strong>Push Bildirimi:</strong> Anlık fırsatlar ve önemli güncellemeler</li>
                </ul>
                <p>
                  <strong>6.3.</strong> Gönderimler, <strong>09:00 - 20:00</strong> saatleri arasında yapılır (Resmi tatiller hariç).
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                7. Kişisel Verilerin Korunması
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>7.1.</strong> Ticari ileti gönderimi kapsamında toplanan kişisel verileriniz (e-posta, telefon numarası), <Link href="/kvkk-aydinlatma" className="text-[#ff7a00] underline hover:text-[#ff6a00]">KVKK Aydınlatma Metni</Link> ve <Link href="/gizlilik-politikasi" className="text-[#ff7a00] underline hover:text-[#ff6a00]">Gizlilik Politikası</Link>'nda belirtilen şekilde işlenir ve korunur.
                </p>
                <p>
                  <strong>7.2.</strong> İletişim bilgileriniz, yalnızca ticari ileti gönderimi amacıyla kullanılır ve üçüncü taraflarla (pazarlama ortakları dahil) paylaşılmaz.
                </p>
                <p>
                  <strong>7.3.</strong> Verileriniz güvenli sunucularda şifreli olarak saklanır ve yetkisiz erişime karşı korunur.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                8. Sorumluluk ve Şikayet Hakkı
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>8.1.</strong> PaketServisçi, ticari elektronik ileti gönderiminde 6563 sayılı Kanun ve ilgili mevzuata uygun hareket etmeyi taahhüt eder.
                </p>
                <p>
                  <strong>8.2.</strong> Hukuka aykırı ticari elektronik ileti gönderildiğini düşünüyorsanız:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Bizimle iletişime geçebilirsiniz: kvkk@paketservisci.com</li>
                  <li><strong>Ticaret Bakanlığı Tüketici Hakem Heyetleri</strong>'ne başvurabilirsiniz</li>
                  <li><strong>İYS</strong> üzerinden şikayet oluşturabilirsiniz</li>
                </ul>
                <p>
                  <strong>8.3.</strong> Hukuka aykırı gönderimler için 6563 sayılı Kanun'da öngörülen idari para cezaları uygulanabilir.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                9. İletişim ve İzin Yönetimi
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Ticari ileti izninizi yönetmek veya sorularınız için:</p>
                <div className="bg-[#ff7a00]/10 p-6 rounded-lg border-2 border-[#ff7a00]">
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#ff7a00] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><strong>E-posta:</strong> kvkk@paketservisci.com</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#ff7a00] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><strong>Telefon:</strong> +90 555 123 45 67</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#ff7a00] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg><strong>İletişim Formu:</strong> <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">www.paketservisci.com/iletisim</Link></li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#ff7a00] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg><strong>Hesap Ayarları:</strong> Profil ayarlarınızdan "Bildirim Tercihleri"</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Important Notice */}
            <section className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-300">
              <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Önemli Hatırlatma
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700">
                <li>Ticari ileti izni <strong>tamamen isteğe bağlıdır</strong>. İzin vermemeniz platform hizmetlerinden faydalanmanızı engellemez.</li>
                <li>İzninizi <strong>istediğiniz zaman</strong> geri alabilirsiniz.</li>
                <li>Geri alma talebiniz <strong>en geç 3 iş günü</strong> içinde yerine getirilir.</li>
                <li>İşlem bildirimleri (güvenlik, hesap doğrulama vb.) ticari ileti kapsamında değildir ve izninizden bağımsız olarak gönderilmeye devam eder.</li>
              </ul>
            </section>

            {/* Related Policies */}
            <section className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200">
              <h3 className="text-lg font-bold text-black mb-4">İlgili Politikalar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/kullanim-sartlari" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Kullanım Şartları
                </Link>
                <Link href="/gizlilik-politikasi" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Gizlilik Politikası
                </Link>
                <Link href="/kvkk-aydinlatma" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
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
