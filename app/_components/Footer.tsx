import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#ff7a00] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Image
              src="/images/headerlogo.png"
              alt="Motto Kurye Logo"
              width={300}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">Hızlı Linkler</h3>
              <div className="flex flex-col gap-2">
                <Link href="/#nasil-calisir" className="text-white/90 hover:text-white">
                  Nasıl Çalışır
                </Link>
                <Link href="/ucret-planlari" className="text-white/90 hover:text-white">
                  Ücret Planları
                </Link>
                <Link href="/iletisim" className="text-white/90 hover:text-white">
                  İletişim
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Yasal</h3>
              <div className="flex flex-col gap-2">
                <Link href="/kullanim-sartlari" className="text-white/90 hover:text-white">
                  Kullanım Şartları
                </Link>
                <Link href="/gizlilik-politikasi" className="text-white/90 hover:text-white">
                  Gizlilik Politikası
                </Link>
                <Link href="/kvkk-aydinlatma" className="text-white/90 hover:text-white">
                  KVKK Aydınlatma
                </Link>
                <Link href="/ticari-ileti-izni" className="text-white/90 hover:text-white">
                  Ticari İleti İzni
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs opacity-80 text-center md:text-left max-w-3xl">
          MottoKurye olarak çıktığımız bu yolda kuryelerin yaşadığı teslimat sorununu çözmek
          ve işletmelerin güvenilir kurye bulma gibi problemlerine çözüm düşünerek geliştirdiğimiz bu
          yenilikçi bakış uygulamalarla artık çok daha kolay.
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 text-xs text-center">
          © 2025 MottoKurye - Tüm haklar saklıdır.
        </div>
      </div>
    </footer>
  );
}
