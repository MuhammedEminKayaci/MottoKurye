"use client";

import React from "react";
import Link from "next/link";
import { UnifiedHeader } from "../_components/UnifiedHeader";
import { Footer } from "../_components/Footer";

export default function KVKKAydinlatmaPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      <UnifiedHeader />

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-[#ff7a00]/10 text-[#ff7a00] px-6 py-2 rounded-full text-sm font-semibold">
                KVKK Uyumu
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black mb-4">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin nasıl toplandığını, işlendiğini ve korunduğunu açıklıyoruz.
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Son Güncellenme: 27 Mart 2026 | Versiyon: 2.0
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-neutral-200 p-8 md:p-12 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                1. Veri Sorumlusu
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verilerinizin veri sorumlusu <strong>PaketServisci</strong>&apos;dir.
                </p>
                <p>
                  <strong>E-posta:</strong> info@paketservisci.com
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                2. Toplanan Kişisel Veriler
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Platformumuz üzerinden aşağıdaki kişisel veriler toplanmaktadır:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
                  <li><strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi</li>
                  <li><strong>Konum Bilgileri:</strong> İl, ilçe (çalışma bölgesi)</li>
                  <li><strong>Mesleki Bilgiler:</strong> İş deneyimi, ehliyet türü, çalışma tercihleri</li>
                  <li><strong>Teknik Veriler:</strong> IP adresi, çerez bilgileri, cihaz bilgisi</li>
                  <li><strong>Görsel Veriler:</strong> Profil fotoğrafı (isteğe bağlı)</li>
                  <li><strong>İşletme Bilgileri:</strong> Firma adı, sektör, yetkili kişi bilgileri</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                3. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Hesap oluşturma ve kimlik doğrulama</li>
                  <li>Kurye ile işletme arasında eşleştirme hizmeti sunma</li>
                  <li>İlan oluşturma ve yönetme</li>
                  <li>Uygulama içi mesajlaşma hizmeti sağlama</li>
                  <li>Platform güvenliğini ve bütünlüğünü koruma</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                4. Kişisel Verilerin Aktarılması
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  Kişisel verileriniz üçüncü kişilere satılmaz veya ticari amaçla paylaşılmaz. Ancak aşağıdaki durumlarda verileriniz aktarılabilir:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına</li>
                  <li>Platformun teknik altyapısını sağlayan hizmet sağlayıcılarına (Supabase, Vercel)</li>
                  <li>Hukuki uyuşmazlıklarda yetkili mahkeme ve icra dairelerine</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                5. Veri Saklama Süresi
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca saklanır. Hesabınızı sildiğinizde, yasal saklama yükümlülükleri saklı kalmak kaydıyla verileriniz silinir veya anonim hale getirilir.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                6. Veri Güvenliği
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  Kişisel verilerinizin güvenliği için gerekli teknik ve idari tedbirler alınmaktadır. Verileriniz SSL/TLS şifreleme ile korunmakta, erişim yetkilendirme mekanizmaları uygulanmaktadır.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                7. KVKK Kapsamındaki Haklarınız
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                  <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                  <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                  <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                  <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                8. Başvuru Yöntemi
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki kanallardan bize başvurabilirsiniz:
                </p>
                <ul className="list-none ml-4 space-y-2">
                  <li><strong>E-posta:</strong> info@paketservisci.com</li>
                  <li><strong>İletişim Formu:</strong> <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">paketservisci.com/iletisim</Link></li>
                </ul>
                <p>
                  Başvurunuz en geç 30 gün içinde sonuçlandırılacaktır.
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
                <Link href="/ticari-ileti-izni" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Ticari İleti İzni
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
