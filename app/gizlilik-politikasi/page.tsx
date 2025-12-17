"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "../_components/PublicHeader";

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-[#ff7a00]/10 text-[#ff7a00] px-6 py-2 rounded-full text-sm font-semibold">
                Gizlilik ve Güvenlik
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black mb-4">
              Gizlilik Politikası
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Kişisel verilerinizin korunması bizim için önceliklidir. Bu politika, verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.
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
                1. Veri Sorumlusu
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>1.1.</strong> 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerinizin veri sorumlusu <strong>MottoKurye</strong>'dir.
                </p>
                <p>
                  <strong>Adres:</strong> [Şirket Adresi - Güncellenecek]<br />
                  <strong>E-posta:</strong> kvkk@mottokurye.com<br />
                  <strong>Telefon:</strong> +90 555 123 45 67
                </p>
                <p>
                  <strong>1.2.</strong> Kişisel verileriniz, KVKK ve ilgili mevzuat kapsamında işlenmekte ve korunmaktadır.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                2. Toplanan Kişisel Veriler
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>2.1. Kimlik Bilgileri:</strong> Ad, soyad, yaş, cinsiyet, uyruk
                </p>
                <p>
                  <strong>2.2. İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi
                </p>
                <p>
                  <strong>2.3. Konum Bilgileri:</strong> İl, ilçe (çalışma bölgesi)
                </p>
                <p>
                  <strong>2.4. Mesleki Bilgiler:</strong> İş deneyimi, ehliyet türü, çalışma tercihleri
                </p>
                <p>
                  <strong>2.5. Teknik Veriler:</strong> IP adresi, çerez bilgileri, cihaz bilgisi, oturum kayıtları
                </p>
                <p>
                  <strong>2.6. Görsel/İşitsel Veriler:</strong> Profil fotoğrafı (isteğe bağlı)
                </p>
                <p>
                  <strong>2.7. İşletme Bilgileri (İşletme Hesapları İçin):</strong> Firma adı, sektör, yetkili kişi bilgileri
                </p>
                <p>
                  <strong>2.8. Özel Nitelikli Kişisel Veriler:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Ceza Mahkûmiyeti ve Güvenlik Tedbirleri:</strong> P1 yetki belgesi durumu, sabıka kaydı (yalnızca VAR/YOK beyanı olarak, resmi belge saklanmadan)</li>
                  <li>Bu veriler, KVKK m.6/3 uyarınca, açık rızanıza dayanarak ve işe uygunluk değerlendirmesi amacıyla işlenmektedir.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                3. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Kişisel verileriniz aşağıdaki amaçlarla işlenir:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Hesap Oluşturma ve Kimlik Doğrulama:</strong> Platform hizmetlerine erişim sağlamak</li>
                  <li><strong>Eşleştirme Hizmeti:</strong> Kurye ve işletmeleri uygun kriterler doğrultusunda eşleştirmek</li>
                  <li><strong>İletişim:</strong> Platform bildirimleri, destek hizmetleri, güvenlik uyarıları göndermek</li>
                  <li><strong>Hizmet İyileştirme:</strong> Platform performansını artırmak ve kullanıcı deneyimini geliştirmek</li>
                  <li><strong>Yasal Yükümlülükler:</strong> Kanuni düzenlemelere uyum sağlamak</li>
                  <li><strong>Güvenlik:</strong> Platform güvenliğini sağlamak, dolandırıcılığı önlemek</li>
                  <li><strong>Pazarlama (İzin Dahilinde):</strong> Ticari elektronik ileti göndermek (sadece açık rızanız dahilinde)</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                4. Kişisel Verilerin İşlenme Hukuki Sebepleri
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Verileriniz aşağıdaki hukuki sebeplere dayanılarak işlenir:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Açık Rıza (KVKK m.5/1):</strong> Kayıt sırasında verdiğiniz açık rıza</li>
                  <li><strong>Sözleşmenin İfası (KVKK m.5/2-c):</strong> Platform hizmet sözleşmesinin yerine getirilmesi</li>
                  <li><strong>Hukuki Yükümlülük (KVKK m.5/2-ç):</strong> Yasal düzenlemelere uyum</li>
                  <li><strong>Meşru Menfaat (KVKK m.5/2-f):</strong> Hizmet kalitesini artırmak, güvenlik sağlamak</li>
                  <li><strong>Özel Nitelikli Veriler:</strong> Sabıka kaydı ve P1 belgesi bilgileri yalnızca <strong>açık rızanıza</strong> dayanarak işlenir (KVKK m.6/3)</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                5. Kişisel Verilerin Aktarılması
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>5.1. Yurt İçi Aktarım:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Teknoloji Hizmet Sağlayıcıları:</strong> Supabase (veritabanı hosting), bulut depolama sağlayıcıları</li>
                  <li><strong>Ödeme Kuruluşları:</strong> Ücretli hizmetler için güvenli ödeme işlemcileri</li>
                  <li><strong>İYS (İleti Yönetim Sistemi):</strong> Ticari ileti izinlerinin yönetimi için</li>
                  <li><strong>Yasal Merciler:</strong> Mahkeme kararı, yasal yükümlülük durumunda</li>
                </ul>
                <p>
                  <strong>5.2. Yurt Dışı Aktarım:</strong> Verileriniz, yalnızca yeterli koruma sağlayan veya standart sözleşme hükümleri bulunan ülkelere aktarılır. Supabase sunucuları AB/ABD'de bulunmakta olup GDPR uyumludur.
                </p>
                <p>
                  <strong>5.3.</strong> Özel nitelikli verileriniz (sabıka kaydı, P1 belgesi), yalnızca yasal zorunluluk veya açık rızanız dahilinde, şifreli ve güvenli yöntemlerle aktarılır.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                6. Kişisel Verilerin Saklanma Süresi
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>6.1.</strong> Kişisel verileriniz, işlenme amacının gerekli kıldığı süre boyunca ve ilgili mevzuatın öngördüğü süreler dahilinde saklanır.
                </p>
                <p>
                  <strong>6.2. Saklama Süreleri:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Aktif Hesaplar:</strong> Hesap aktif olduğu sürece</li>
                  <li><strong>Kapatılan Hesaplar:</strong> Hesap kapatma talebinden itibaren 6 ay (yasal yükümlülükler hariç)</li>
                  <li><strong>İşlem Kayıtları:</strong> 10 yıl (Vergi Usul Kanunu, Ticaret Kanunu)</li>
                  <li><strong>Özel Nitelikli Veriler:</strong> Amacın sona ermesiyle birlikte derhal silinir veya anonimleştirilir (en fazla hesap kapatmadan 30 gün sonra)</li>
                  <li><strong>Çerezler:</strong> 2 yıla kadar (türüne göre değişir)</li>
                </ul>
                <p>
                  <strong>6.3.</strong> Süre sona erdiğinde verileriniz silinir, yok edilir veya anonimleştirilir.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                7. Veri Güvenliği
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>7.1.</strong> MottoKurye, kişisel verilerinizin güvenliğini sağlamak için teknik ve idari tedbirler alır:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Şifreleme:</strong> SSL/TLS ile veri iletimi, veritabanı şifrelemesi</li>
                  <li><strong>Erişim Kontrolü:</strong> Yalnızca yetkili personel erişebilir (RLS - Row Level Security)</li>
                  <li><strong>Düzenli Yedekleme:</strong> Veri kaybına karşı günlük yedekleme</li>
                  <li><strong>Güvenlik Testleri:</strong> Periyodik güvenlik denetimleri</li>
                  <li><strong>Eğitim:</strong> Çalışanlara düzenli veri koruma eğitimi</li>
                </ul>
                <p>
                  <strong>7.2.</strong> Özel nitelikli veriler (sabıka, P1 belgesi) asla public view'larda gösterilmez; sadece veri sahibi ve yetkilendirilmiş personel erişebilir.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                8. Çerezler (Cookies)
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>8.1.</strong> Platformumuz, kullanıcı deneyimini iyileştirmek ve hizmetleri kişiselleştirmek için çerezler kullanır.
                </p>
                <p>
                  <strong>8.2. Çerez Türleri:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Zorunlu Çerezler:</strong> Platform işlevselliği için gerekli (oturum yönetimi, güvenlik)</li>
                  <li><strong>Analitik Çerezler:</strong> Kullanım istatistikleri (Google Analytics vb.)</li>
                  <li><strong>İşlevsel Çerezler:</strong> Tercih kaydetme, dil seçimi</li>
                  <li><strong>Pazarlama Çerezleri:</strong> Hedefli reklamlar (sadece izninizle)</li>
                </ul>
                <p>
                  <strong>8.3.</strong> Tarayıcı ayarlarınızdan çerezleri yönetebilir veya reddedebilirsiniz. Zorunlu çerezlerin reddedilmesi durumunda platform işlevselliği etkilenebilir.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                9. KVKK Kapsamında Haklarınız
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>KVKK m.11 uyarınca aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Bilgi Talep Hakkı:</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li><strong>Erişim Hakkı:</strong> İşlenmiş kişisel verilerinize erişme ve kopyasını alma</li>
                  <li><strong>Düzeltme Hakkı:</strong> Hatalı veya eksik verilerin düzeltilmesini talep etme</li>
                  <li><strong>Silme/Unutulma Hakkı:</strong> İşlenme şartlarının ortadan kalkması durumunda verilerin silinmesini talep etme</li>
                  <li><strong>İtiraz Hakkı:</strong> Meşru menfaate dayalı işlemelere itiraz etme</li>
                  <li><strong>Aktarım Hakkı:</strong> Verilerin 3. kişilere aktarıldıysa bilgilendirilme talep etme</li>
                  <li><strong>Veri Taşınabilirliği:</strong> Verilerinizi yapılandırılmış ve yaygın formatta alma</li>
                  <li><strong>Otomatik Karar Alma İtiraz:</strong> Tamamen otomatik sistemlerle verilen kararlara itiraz etme</li>
                </ul>
                <p>
                  <strong>Başvuru Yöntemi:</strong> Haklarınızı kullanmak için kvkk@mottokurye.com adresine yazılı veya <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">iletişim formu</Link> ile başvurabilirsiniz. Başvurularınız 30 gün içinde ücretsiz olarak yanıtlanır.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                10. Çocukların Gizliliği
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>10.1.</strong> Platformumuz 18 yaş altı bireylere yönelik değildir. 18 yaş altı bireylerin kişisel verilerini bilerek toplamayız.
                </p>
                <p>
                  <strong>10.2.</strong> 18 yaş altı bir bireyin verilerinin yanlışlıkla işlendiğini tespit ederseniz derhal bizimle iletişime geçiniz.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                11. Politika Güncellemeleri
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>11.1.</strong> Bu Gizlilik Politikası, yasal düzenlemeler ve hizmet değişiklikleri doğrultusunda güncellenebilir.
                </p>
                <p>
                  <strong>11.2.</strong> Önemli değişiklikler durumunda kullanıcılara e-posta veya platform bildirimi ile bildirim yapılır.
                </p>
                <p>
                  <strong>11.3.</strong> Güncellemeler platform üzerinde yayınlandığı tarihte yürürlüğe girer.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                12. İletişim
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  Gizlilik politikası ve kişisel verileriniz hakkında sorularınız için:
                </p>
                <ul className="list-none ml-4 space-y-2">
                  <li><strong>Veri Sorumlusu:</strong> MottoKurye</li>
                  <li><strong>KVKK İletişim:</strong> kvkk@mottokurye.com</li>
                  <li><strong>Genel Destek:</strong> destek@mottokurye.com</li>
                  <li><strong>Telefon:</strong> +90 555 123 45 67</li>
                  <li><strong>İletişim:</strong> <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">mottokurye.com/iletisim</Link></li>
                </ul>
              </div>
            </section>

            {/* Related Policies */}
            <section className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200">
              <h3 className="text-lg font-bold text-black mb-4">İlgili Politikalar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/kullanim-sartlari" className="text-[#ff7a00] hover:underline font-semibold">
                  📋 Kullanım Şartları
                </Link>
                <Link href="/kvkk-aydinlatma" className="text-[#ff7a00] hover:underline font-semibold">
                  🔒 KVKK Aydınlatma Metni
                </Link>
                <Link href="/ticari-ileti-izni" className="text-[#ff7a00] hover:underline font-semibold">
                  📧 Ticari İleti İzni
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
