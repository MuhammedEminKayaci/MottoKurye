"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "../_components/PublicHeader";

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
                    <h3 className="font-bold text-black mb-2">📋 Kimlik Verileri</h3>
                    <p className="text-sm">Ad, soyad, yaş, cinsiyet, uyruk bilgileri</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-black mb-2">📞 İletişim Verileri</h3>
                    <p className="text-sm">Telefon numarası, e-posta adresi</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-black mb-2">📍 Konum Verileri</h3>
                    <p className="text-sm">İl, ilçe (çalışma bölgesi tercihleri)</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-black mb-2">💼 Mesleki Veriler</h3>
                    <p className="text-sm">İş deneyimi, ehliyet türü, çalışma tercihleri, motorsiklet bilgileri</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-black mb-2">🏢 İşletme Verileri (İşletme Hesapları)</h3>
                    <p className="text-sm">Firma adı, sektör bilgisi, yetkili kişi bilgileri</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-black mb-2">💻 Teknik Veriler</h3>
                    <p className="text-sm">IP adresi, çerez bilgileri, cihaz bilgisi, tarayıcı türü, oturum kayıtları</p>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-black mb-2">🖼️ Görsel/İşitsel Veriler</h3>
                    <p className="text-sm">Profil fotoğrafı (isteğe bağlı)</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                    <h3 className="font-bold text-black mb-2">🔒 Özel Nitelikli Kişisel Veriler</h3>
                    <p className="text-sm mb-2">
                      <strong>Ceza Mahkûmiyeti ve Güvenlik Tedbirleri:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                      <li>P1 yetki belgesi durumu (VAR/YOK beyanı)</li>
                      <li>Sabıka kaydı durumu (VAR/YOK beyanı)</li>
                    </ul>
                    <p className="text-xs text-red-700 mt-2 font-semibold">
                      ⚠️ Bu veriler KVKK m.6/3 uyarınca <u>açık rızanıza</u> dayanarak işlenmektedir.
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
                <p className="bg-red-50 p-3 rounded border border-red-200 text-sm">
                  <strong>⚠️ Özel Nitelikli Veri Aktarımı:</strong> Sabıka kaydı ve P1 belgesi bilgileri, yalnızca <u>yasal zorunluluk</u> veya <u>açık rızanız</u> dahilinde, şifreli ve güvenli yöntemlerle, erişimi kısıtlanmış şekilde aktarılır.
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
                    <h3 className="font-bold text-black text-sm mb-1">📌 Bilgi Talep Etme</h3>
                    <p className="text-xs text-neutral-700">Kişisel verilerinizin işlenip işlenmediğini öğrenme</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-black text-sm mb-1">🔍 Bilgi Talep Etme</h3>
                    <p className="text-xs text-neutral-700">İşlenen veriler hakkında bilgi talep etme</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-black text-sm mb-1">🎯 İşlenme Amacı</h3>
                    <p className="text-xs text-neutral-700">İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-black text-sm mb-1">🌍 Aktarım Bilgisi</h3>
                    <p className="text-xs text-neutral-700">Yurt içi/yurt dışı aktarılan 3. kişileri öğrenme</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-black text-sm mb-1">✏️ Düzeltme</h3>
                    <p className="text-xs text-neutral-700">Eksik veya yanlış verilerin düzeltilmesini talep etme</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-bold text-black text-sm mb-1">🗑️ Silme/Yok Etme</h3>
                    <p className="text-xs text-neutral-700">KVKK şartları dahilinde verilerin silinmesini isteme</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-black text-sm mb-1">📢 Bildirim Talep Etme</h3>
                    <p className="text-xs text-neutral-700">Düzeltme/silme işlemlerinin 3. kişilere bildirilmesini talep etme</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-black text-sm mb-1">⚖️ İtiraz Etme</h3>
                    <p className="text-xs text-neutral-700">İşlenen verilerin analizi sonucu zarara uğrama durumunda itiraz etme</p>
                  </div>
                </div>
                <div className="bg-[#ff7a00]/10 p-4 rounded-lg border-2 border-[#ff7a00] mt-4">
                  <p className="font-semibold text-black mb-2">📬 Başvuru Yöntemi:</p>
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
                <Link href="/kullanim-sartlari" className="text-[#ff7a00] hover:underline font-semibold">
                  📋 Kullanım Şartları
                </Link>
                <Link href="/gizlilik-politikasi" className="text-[#ff7a00] hover:underline font-semibold">
                  🔐 Gizlilik Politikası
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
