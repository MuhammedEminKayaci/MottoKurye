"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "../_components/PublicHeader";
import { Footer } from "../_components/Footer";

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-[#ff7a00]/10 text-[#ff7a00] px-6 py-2 rounded-full text-sm font-semibold">
                Yasal Bilgilendirme
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black mb-4">
              Kullanım Şartları
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              MottoKurye platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
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
                1. Genel Hükümler
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>1.1.</strong> MottoKurye ("Platform", "Biz", "Hizmet"), kurye ve işletmeleri bir araya getiren çevrimiçi bir eşleştirme platformudur. Platform, MottoKurye tarafından işletilmektedir.
                </p>
                <p>
                  <strong>1.2.</strong> Platformu kullanarak bu Kullanım Şartlarını ("Şartlar") kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız platformu kullanmayınız.
                </p>
                <p>
                  <strong>1.3.</strong> Platform üzerinden sunulan hizmetler, kuryeler ile işletmeler arasında iletişim kurmayı kolaylaştırmak amacıyla sağlanmaktadır. MottoKurye, taraflar arasında yapılan sözleşmelerde taraf değildir ve bu ilişkilerden doğan sorumluluğu kabul etmez.
                </p>
                <p>
                  <strong>1.4.</strong> Bu Şartlar, önceden bildirimde bulunmaksızın güncellenebilir. Güncellemeler platform üzerinde yayınlandığı anda yürürlüğe girer. Kullanıcıların güncel Şartları düzenli olarak gözden geçirmesi önerilir.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                2. Kayıt ve Hesap Güvenliği
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>2.1.</strong> Platform kullanımı için kayıt olmanız gerekmektedir. Kayıt sırasında verdiğiniz bilgilerin doğru, güncel ve eksiksiz olması zorunludur.
                </p>
                <p>
                  <strong>2.2.</strong> Hesap güvenliği tamamen sizin sorumluluğunuzdadır. Şifrenizi kimseyle paylaşmayınız. Hesabınızda yetkisiz bir kullanım tespit ettiğinizde derhal bizimle iletişime geçiniz.
                </p>
                <p>
                  <strong>2.3.</strong> Kayıt için minimum 18 yaşında olmanız gerekmektedir. 18 yaşından küçükler platform hizmetlerini kullanamaz.
                </p>
                <p>
                  <strong>2.4.</strong> Tek bir kullanıcı birden fazla hesap oluşturamaz. Sahte veya yanıltıcı hesaplar tespit edildiğinde derhal kapatılır.
                </p>
                <p>
                  <strong>2.5.</strong> MottoKurye, uygun görmediği kullanıcıların hesaplarını gerekçe göstermeksizin askıya alma veya silme hakkına sahiptir.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                3. Platform Kullanım Kuralları
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>3.1.</strong> Platformu yasalara uygun ve etik kurallara uygun şekilde kullanmayı kabul edersiniz.
                </p>
                <p>
                  <strong>3.2. Yasak Faaliyetler:</strong> Aşağıdaki faaliyetler kesinlikle yasaktır:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Platform güvenliğini tehlikeye atacak her türlü eylem (hacking, virüs, zararlı yazılım vb.)</li>
                  <li>Başka kullanıcıların kişisel verilerini izinsiz toplama veya kullanma</li>
                  <li>Yanıltıcı, sahte veya hukuka aykırı içerik paylaşma</li>
                  <li>Spam, istenmeyen reklam veya taciz içerikli mesajlar gönderme</li>
                  <li>Platform üzerinde fikri mülkiyet haklarını ihlal edecek içerik paylaşma</li>
                  <li>Platform hizmetlerini ticari amaçla izinsiz kullanma veya alt lisanslama</li>
                </ul>
                <p>
                  <strong>3.3.</strong> Kullanıcılar, platform üzerinde paylaştıkları içeriklerden tamamen sorumludur. MottoKurye, kullanıcı içeriklerinin doğruluğunu, yasallığını veya güvenilirliğini garanti etmez.
                </p>
                <p>
                  <strong>3.4.</strong> Platform üzerinden yapılan tüm iletişim ve anlaşmalar kullanıcılar arasındadır. MottoKurye, taraflar arasında yapılan anlaşmaların ifasından sorumlu değildir.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                4. Fikri Mülkiyet Hakları
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>4.1.</strong> Platform üzerindeki tüm içerik, tasarım, logo, yazılım ve materyaller MottoKurye'nin mülkiyetindedir ve fikri mülkiyet hakları ile korunmaktadır.
                </p>
                <p>
                  <strong>4.2.</strong> Platform içeriklerini izinsiz kopyalayamaz, çoğaltamaz, dağıtamaz veya ticari amaçlarla kullanamazsınız.
                </p>
                <p>
                  <strong>4.3.</strong> Kullanıcılar, platforma yükledikleri içerikler (profil fotoğrafı, ilan açıklamaları vb.) üzerinde MottoKurye'ye sınırlı, münhasır olmayan, dünya çapında, telif ücreti ödemeksizin kullanım hakkı tanırlar.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                5. Sorumluluk Sınırlandırması
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>5.1.</strong> Platform "olduğu gibi" sunulmaktadır. MottoKurye, hizmetin kesintisiz, hatasız veya güvenli olacağına dair herhangi bir garanti vermez.
                </p>
                <p>
                  <strong>5.2.</strong> MottoKurye, kullanıcılar arasındaki anlaşmalardan, iletişimlerden veya işlemlerden kaynaklanan hiçbir zarardan sorumlu değildir.
                </p>
                <p>
                  <strong>5.3.</strong> Platform üzerinden erişilen üçüncü taraf bağlantılarından doğan sorumluluk MottoKurye'ye ait değildir.
                </p>
                <p>
                  <strong>5.4.</strong> Kullanıcılar, platform kullanımından kaynaklanan tüm riskleri kabul eder. MottoKurye, dolaylı, arızi veya cezai zararlardan sorumlu tutulamaz.
                </p>
                <p>
                  <strong>5.5.</strong> Kanunların izin verdiği ölçüde, MottoKurye'nin toplam sorumluluğu kullanıcının son 12 ayda platforma ödediği ücretle sınırlıdır.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                6. Ücretlendirme ve Ödeme
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>6.1.</strong> Platform hizmetleri, <Link href="/ucret-planlari" className="text-[#ff7a00] underline hover:text-[#ff6a00]">Ücret Planları</Link> sayfasında belirtilen koşullar çerçevesinde ücrete tabidir.
                </p>
                <p>
                  <strong>6.2.</strong> Ücretler önceden bildirimde bulunularak değiştirilebilir. Mevcut üyelikler için değişiklikler yenileme döneminde geçerli olur.
                </p>
                <p>
                  <strong>6.3.</strong> Ödemeler güvenli ödeme sistemleri aracılığıyla yapılır. MottoKurye, ödeme bilgilerinizi saklamaz.
                </p>
                <p>
                  <strong>6.4.</strong> İade politikası, Türk Tüketici Hakları mevzuatına uygun olarak belirlenir ve <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">iletişim</Link> sayfasından detaylı bilgi alınabilir.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                7. Fesih ve Hesap Kapatma
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>7.1.</strong> Hesabınızı istediğiniz zaman kapatabilirsiniz. Hesap kapatma talebi için <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">bizimle iletişime</Link> geçebilirsiniz.
                </p>
                <p>
                  <strong>7.2.</strong> MottoKurye, bu Şartları ihlal eden kullanıcıların hesaplarını önceden bildirimde bulunmaksızın askıya alma veya silme hakkını saklı tutar.
                </p>
                <p>
                  <strong>7.3.</strong> Hesap kapatıldığında, kullanıcı verileri <Link href="/gizlilik-politikasi" className="text-[#ff7a00] underline hover:text-[#ff6a00]">Gizlilik Politikası</Link> ve <Link href="/kvkk-aydinlatma" className="text-[#ff7a00] underline hover:text-[#ff6a00]">KVKK Aydınlatma Metni</Link>'nde belirtilen sürelerde ve şekillerde saklanır veya silinir.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                8. Uygulanacak Hukuk ve Uyuşmazlık Çözümü
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>8.1.</strong> Bu Şartlar, Türkiye Cumhuriyeti yasalarına tabidir ve Türkiye Cumhuriyeti yasalarına göre yorumlanır.
                </p>
                <p>
                  <strong>8.2.</strong> Bu Şartlardan doğan uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
                </p>
                <p>
                  <strong>8.3.</strong> Tüketici kullanıcılar için Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                9. İletişim
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  Bu Kullanım Şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                </p>
                <ul className="list-none ml-4 space-y-2">
                  <li><strong>E-posta:</strong> destek@mottokurye.com</li>
                  <li><strong>Telefon:</strong> +90 555 123 45 67</li>
                  <li><strong>İletişim Sayfası:</strong> <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">mottokurye.com/iletisim</Link></li>
                </ul>
              </div>
            </section>

            {/* Related Policies */}
            <section className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200">
              <h3 className="text-lg font-bold text-black mb-4">İlgili Politikalar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/gizlilik-politikasi" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Gizlilik Politikası
                </Link>
                <Link href="/kvkk-aydinlatma" className="text-[#ff7a00] hover:underline font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  KVKK Aydınlatma Metni
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
