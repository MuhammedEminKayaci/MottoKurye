"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "../_components/PublicHeader";
import { Footer } from "../_components/Footer";

export default function KVKKAydinlatmaPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      <PublicHeader />

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
              6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca kişisel verilerinizin işlenmesine ilişkin bilgilendirme metni.
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
                  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>MottoKurye</strong> tarafından aşağıda açıklanan kapsamda işlenebilecektir.
                </p>
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <p className="font-semibold text-black mb-2">Veri Sorumlusu Bilgileri:</p>
                  <ul className="list-none space-y-1 text-sm">
                    <li><strong>Ünvan:</strong> MottoKurye</li>
                    <li><strong>Adres:</strong> [Şirket Adresi - Güncellenecek]</li>
                    <li><strong>E-posta:</strong> kvkk@mottokurye.com</li>
                    <li><strong>Telefon:</strong> +90 555 123 45 67</li>
                    <li><strong>Web:</strong> www.mottokurye.com</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                2. Hangi Kişisel Verileriniz İşlenmektedir?
              </h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>Aşağıdaki kategorilerde kişisel verileriniz işlenmektedir:</p>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                      Kimlik Verileri
                    </h3>
                    <p className="text-sm">Ad, soyad, yaş, cinsiyet, uyruk bilgileri</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      İletişim Verileri
                    </h3>
                    <p className="text-sm">Telefon numarası, e-posta adresi</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Konum Verileri
                    </h3>
                    <p className="text-sm">İl, ilçe (çalışma bölgesi tercihleri)</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Mesleki Veriler
                    </h3>
                    <p className="text-sm">İş deneyimi, ehliyet türü, çalışma tercihleri, motorsiklet bilgileri</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
                      İşletme Verileri (İşletme Hesapları)
                    </h3>
                    <p className="text-sm">Firma adı, sektör bilgisi, yetkili kişi bilgileri</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Teknik Veriler
                    </h3>
                    <p className="text-sm">IP adresi, çerez bilgileri, cihaz bilgisi, tarayıcı türü, oturum kayıtları</p>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Görsel/İşitsel Veriler
                    </h3>
                    <p className="text-sm">Profil fotoğrafı (isteğe bağlı)</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                    <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Özel Nitelikli Kişisel Veriler
                    </h3>
                    <p className="text-sm mb-2">
                      <strong>Ceza Mahkûmiyeti ve Güvenlik Tedbirleri:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                      <li>P1 yetki belgesi durumu (VAR/YOK beyanı)</li>
                      <li>Sabıka kaydı durumu (VAR/YOK beyanı)</li>
                    </ul>
                    <p className="text-xs text-red-700 mt-2 font-semibold flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Bu veriler KVKK m.6/3 uyarınca <u>açık rızanıza</u> dayanarak işlenmektedir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                3. Kişisel Verilerinizin İşlenme Amaçları
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul className="list-none space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>Hesap oluşturma ve kimlik doğrulama:</strong> Platform hizmetlerine güvenli erişim sağlamak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>Eşleştirme hizmeti:</strong> Kuryeler ile işletmeleri uygun kriterler doğrultusunda eşleştirmek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>İletişim ve bilgilendirme:</strong> Platform bildirimleri, destek hizmetleri, güvenlik uyarıları</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>Hizmet kalitesinin artırılması:</strong> Platform performansını iyileştirmek, kullanıcı deneyimini geliştirmek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>Güvenlik ve dolandırıcılık önleme:</strong> Platform güvenliğini sağlamak, yetkisiz erişimleri tespit etmek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>Yasal yükümlülüklerin yerine getirilmesi:</strong> Kanuni düzenlemelere uyum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>Pazarlama faaliyetleri (izin dahilinde):</strong> Ticari elektronik ileti gönderimi (sadece açık rızanız ile)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7a00] font-bold">→</span>
                    <span><strong>İşe uygunluk değerlendirmesi:</strong> P1 belgesi ve sabıka kaydı bilgileri yalnızca kurye-işletme eşleştirmesinde işe uygunluk kriterlerinin karşılanıp karşılanmadığını belirlemek amacıyla</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                4. Kişisel Verilerinizin İşlenme Hukuki Sebepleri
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Açık rıza (m.5/1):</strong> Kayıt sırasında verdiğiniz açık rıza</li>
                  <li><strong>Sözleşmenin kurulması veya ifası (m.5/2-c):</strong> Platform kullanım sözleşmesinin yerine getirilmesi</li>
                  <li><strong>Hukuki yükümlülüğün yerine getirilmesi (m.5/2-ç):</strong> Yasal düzenlemelere uyum</li>
                  <li><strong>Meşru menfaat (m.5/2-f):</strong> Hizmet kalitesini artırmak, güvenlik sağlamak</li>
                  <li className="bg-red-50 p-2 rounded border border-red-200">
                    <strong>Özel nitelikli veriler için açık rıza (m.6/3):</strong> P1 yetki belgesi ve sabıka kaydı bilgileri yalnızca <u>açık rızanıza</u> dayanarak işlenir
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                5. Kişisel Verilerinizin Kimlere ve Hangi Amaçla Aktarılabileceği
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p><strong>5.1. Yurt İçi Aktarımlar:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Teknoloji altyapı sağlayıcıları:</strong> Supabase (veritabanı), bulut depolama hizmetleri (platform işleyişi için)</li>
                  <li><strong>Ödeme kuruluşları:</strong> Güvenli ödeme işlemleri için</li>
                  <li><strong>İYS (İleti Yönetim Sistemi):</strong> Ticari elektronik ileti izinlerinin yönetimi için (5809 sayılı Kanun gereği)</li>
                  <li><strong>Yetkili kamu kurum ve kuruluşları:</strong> Yasal yükümlülük kapsamında (mahkeme kararı, yasal talep vb.)</li>
                  <li><strong>Hukuk, denetim ve danışmanlık firmalar</strong> (gerektiğinde)</li>
                </ul>
                <p><strong>5.2. Yurt Dışı Aktarımlar:</strong></p>
                <p>
                  Verileriniz, yalnızca <strong>yeterli korumaya sahip ülkeler</strong> veya <strong>Kişisel Verileri Koruma Kurulu tarafından yeterli korumanın bulunduğu ilan edilen ülkeler</strong>e veya standart sözleşme hükümleri ile güvence altına alınmış aktarımlar kapsamında yurt dışına aktarılabilir. Supabase sunucuları AB/ABD'de bulunmakta olup GDPR uyumludur ve standart veri koruma sözleşmeleri mevcuttur.
                </p>
                <p className="bg-red-50 p-3 rounded border border-red-200 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span><strong>Özel Nitelikli Veri Aktarımı:</strong> Sabıka kaydı ve P1 belgesi bilgileri, yalnızca <u>yasal zorunluluk</u> veya <u>açık rızanız</u> dahilinde, şifreli ve güvenli yöntemlerle, erişimi kısıtlanmış şekilde aktarılır.</span>
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                6. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Platform kayıt formları (manuel giriş)</li>
                  <li>Google OAuth (üçüncü taraf kimlik doğrulama)</li>
                  <li>Platform kullanımı sırasında otomatik olarak (IP adresi, çerezler)</li>
                  <li>İletişim formları ve destek talepleri</li>
                  <li>Profil güncelleme ve ilan oluşturma</li>
                </ul>
                <p>
                  Veriler, <strong>açık rıza</strong>, <strong>sözleşmenin ifası</strong> ve <strong>meşru menfaat</strong> hukuki sebeplerine dayanarak toplanır. Özel nitelikli veriler için <u>açık rıza</u> şarttır.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                7. KVKK'nın 11. Maddesi Uyarınca Haklarınız
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>KVKK m.11 uyarınca, veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      Bilgi Talep Etme
                    </h3>
                    <p className="text-xs text-neutral-700">Kişisel verilerinizin işlenip işlenmediğini öğrenme</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      Bilgi Talep Etme
                    </h3>
                    <p className="text-xs text-neutral-700">İşlenen veriler hakkında bilgi talep etme</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      İşlenme Amacı
                    </h3>
                    <p className="text-xs text-neutral-700">İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Aktarım Bilgisi
                    </h3>
                    <p className="text-xs text-neutral-700">Yurt içi/yurt dışı aktarılan 3. kişileri öğrenme</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Düzeltme
                    </h3>
                    <p className="text-xs text-neutral-700">Eksik veya yanlış verilerin düzeltilmesini talep etme</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Silme/Yok Etme
                    </h3>
                    <p className="text-xs text-neutral-700">KVKK şartları dahilinde verilerin silinmesini isteme</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      Bildirim Talep Etme
                    </h3>
                    <p className="text-xs text-neutral-700">Düzeltme/silme işlemlerinin 3. kişilere bildirilmesini talep etme</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                      İtiraz Etme
                    </h3>
                    <p className="text-xs text-neutral-700">İşlenen verilerin analizi sonucu zarara uğrama durumunda itiraz etme</p>
                  </div>
                </div>
                <div className="bg-[#ff7a00]/10 p-4 rounded-lg border-2 border-[#ff7a00] mt-4">
                  <p className="font-semibold text-black mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Başvuru Yöntemi:
                  </p>
                  <p className="text-sm">
                    Haklarınızı kullanmak için <strong>kvkk@mottokurye.com</strong> adresine yazılı başvuru yapabilir veya <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00] font-semibold">iletişim formu</Link>ndan talepte bulunabilirsiniz.
                  </p>
                  <p className="text-xs text-neutral-600 mt-2">
                    ⏱️ Başvurularınız <strong>30 gün</strong> içinde ücretsiz olarak yanıtlanır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret talep edilebilir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                8. Veri Güvenliği
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  MottoKurye, KVKK m.12 uyarınca kişisel verilerinizin güvenliğini sağlamak için gerekli teknik ve idari tedbirleri almaktadır:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>SSL/TLS ile şifreli veri iletimi</li>
                  <li>Veritabanı şifrelemesi ve güvenli yedekleme</li>
                  <li>Erişim kontrol sistemleri (RLS - Row Level Security)</li>
                  <li>Düzenli güvenlik testleri ve denetimleri</li>
                  <li>Çalışanlara düzenli veri koruma eğitimleri</li>
                  <li className="bg-red-50 p-2 rounded">Özel nitelikli verilerin (sabıka, P1) asla public view'larda gösterilmemesi ve erişimin çok sınırlı tutulması</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-[#ff7a00] pb-2">
                9. İletişim
              </h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>KVKK kapsamındaki talepleriniz için:</p>
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <ul className="list-none space-y-2">
                    <li><strong>Veri Sorumlusu:</strong> MottoKurye</li>
                    <li><strong>KVKK İletişim E-posta:</strong> kvkk@mottokurye.com</li>
                    <li><strong>Telefon:</strong> +90 555 123 45 67</li>
                    <li><strong>Web:</strong> <Link href="/iletisim" className="text-[#ff7a00] underline hover:text-[#ff6a00]">www.mottokurye.com/iletisim</Link></li>
                  </ul>
                </div>
                <p className="text-sm text-neutral-600">
                  <strong>Not:</strong> Talebinizin niteliğine göre en geç 30 gün içinde ücretsiz olarak yanıt verilecektir. Ancak, işlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
                </p>
              </div>
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
