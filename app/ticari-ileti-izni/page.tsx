"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "../_components/PublicHeader";

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
                  <strong>1.1.</strong> MottoKurye ("Şirket", "Platform"), <strong>6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun</strong> ve <strong>Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik</strong> hükümlerine uygun olarak ticari elektronik ileti göndermektedir.
                </p>
                <p>
                  <strong>1.2.</strong> Ticari elektronik ileti, telefon, çağrı merkezleri, faks, otomatik arama makineleri, akıllı ses kaydedici sistemler, elektronik posta, kısa mesaj hizmeti gibi vasıtalar kullanılarak elektronik ortamda gerçekleştirilen ve ticari amaçlarla gönderilen veri, ses ve görüntü içerikli iletilerdir.
                </p>
                <p>
                  <strong>1.3.</strong> MottoKurye, ticari elektronik ileti göndermek için alıcıların <strong>önceden onayını</strong> (açık rızasını) almaktadır.
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
                  <li><strong>İletişim:</strong> <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">İletişim sayfamızdan</Link> veya kvkk@mottokurye.com adresine yazarak</li>
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
                  <strong>4.1.</strong> MottoKurye, <strong>İleti Yönetim Sistemi (İYS)</strong>'ne kayıtlıdır ve ticari elektronik ileti izinlerinizi İYS üzerinde yönetmektedir.
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
                    <h3 className="font-bold text-black mb-2">📢 Platform Güncellemeleri</h3>
                    <p className="text-sm">Yeni özellikler, iyileştirmeler, sistem bakımları</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-black mb-2">🎁 Kampanya ve Teklifler</h3>
                    <p className="text-sm">Özel indirimler, promosyonlar, erken erişim fırsatları</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-black mb-2">📚 Eğitim İçerikleri</h3>
                    <p className="text-sm">Platform kullanım ipuçları, webinarlar, rehberler</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-black mb-2">📊 Anket ve Geri Bildirim</h3>
                    <p className="text-sm">Kullanıcı memnuniyet anketleri, ürün geri bildirimi talepleri</p>
                  </div>
                  
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-black mb-2">🎯 Kişiselleştirilmiş Öneriler</h3>
                    <p className="text-sm">Size uygun ilan önerileri, eşleşme bildirimleri</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-black mb-2">📰 Haber Bültenleri</h3>
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
                  <strong>8.1.</strong> MottoKurye, ticari elektronik ileti gönderiminde 6563 sayılı Kanun ve ilgili mevzuata uygun hareket etmeyi taahhüt eder.
                </p>
                <p>
                  <strong>8.2.</strong> Hukuka aykırı ticari elektronik ileti gönderildiğini düşünüyorsanız:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Bizimle iletişime geçebilirsiniz: kvkk@mottokurye.com</li>
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
                    <li><strong>📧 E-posta:</strong> kvkk@mottokurye.com</li>
                    <li><strong>📞 Telefon:</strong> +90 555 123 45 67</li>
                    <li><strong>🌐 İletişim Formu:</strong> <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">www.mottokurye.com/iletisim</Link></li>
                    <li><strong>⚙️ Hesap Ayarları:</strong> Profil ayarlarınızdan "Bildirim Tercihleri"</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Important Notice */}
            <section className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-300">
              <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                <span className="text-2xl">⚠️</span> Önemli Hatırlatma
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
                <Link href="/kullanim-sartlari" className="text-[#ff7a00] hover:underline font-semibold">
                  📋 Kullanım Şartları
                </Link>
                <Link href="/gizlilik-politikasi" className="text-[#ff7a00] hover:underline font-semibold">
                  🔐 Gizlilik Politikası
                </Link>
                <Link href="/kvkk-aydinlatma" className="text-[#ff7a00] hover:underline font-semibold">
                  🔒 KVKK Aydınlatma Metni
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#ff7a00] text-white p-6 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            © 2025 MottoKurye - Tüm haklar saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
