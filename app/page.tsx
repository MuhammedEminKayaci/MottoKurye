"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { UnifiedHeader } from "./_components/UnifiedHeader";
import { Footer } from "./_components/Footer";

type UserRole = "kurye" | "isletme" | null;

export default function Page() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data?.session?.user?.id;
        
        if (!userId) {
          setUserRole(null);
          setIsLoggedIn(false);
          setIsLoading(false);
          return;
        }

        setIsLoggedIn(true);

        // Paralel sorgu — iki tabloyu aynı anda kontrol et
        const [courierResult, businessResult] = await Promise.all([
          supabase.from("couriers").select("id").eq("user_id", userId).limit(1),
          supabase.from("businesses").select("id").eq("user_id", userId).limit(1),
        ]);

        if (courierResult.data && courierResult.data.length > 0) {
          setUserRole("kurye");
        } else if (businessResult.data && businessResult.data.length > 0) {
          setUserRole("isletme");
        } else {
          setUserRole(null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      <UnifiedHeader />

      {/* Hero — Full-width background with glassmorphism cards */}
      <section className="relative w-full min-h-[85vh] md:min-h-[90vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/kayit-bg.jpeg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center min-h-[85vh] md:min-h-[90vh]">
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              
              {/* Left — Hero Text */}
              <div className="fade-up text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-tight text-white">
                  Doğru İş Ortağını
                  <br />
                  <span className="text-[#ff7a00]">PaketServisci</span> ile
                  <br />
                  Bul
                </h1>
                <p className="mt-5 text-base sm:text-lg text-white/80 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Kurye ve işletmeleri buluşturan profesyonel platform.
                  Mesaj gruplarının trafiğinde kaybolmayın, doğru eşleşmeyi doğrudan yapın.
                </p>
                {!isLoggedIn && !isLoading && (
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Link
                      href="/kayit-ol"
                      className="inline-flex items-center justify-center px-7 py-3 bg-[#ff7a00] text-white font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:bg-[#e86e00] hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5"
                    >
                      Hemen Kayıt Ol
                    </Link>
                    <Link
                      href="/giris"
                      className="inline-flex items-center justify-center px-7 py-3 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/60 transition-all"
                    >
                      Giriş Yap
                    </Link>
                  </div>
                )}
              </div>

              {/* Right — Glassmorphism Cards (yan yana) */}
              <div className="fade-up grid grid-cols-2 gap-4 sm:gap-5" style={{ animationDelay: '.15s' }}>
                {/* Kurye Card */}
                <button
                  onClick={() => {
                    if (userRole === "isletme") {
                      router.push("/ilanlar?view=isletme");
                    } else {
                      router.push("/kurye-bul");
                    }
                  }}
                  disabled={isLoading}
                  className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-7 text-center transition-all duration-300 hover:bg-white/[0.18] hover:border-white/40 hover:shadow-[0_8px_40px_rgba(255,122,0,0.15)] hover:-translate-y-1 disabled:opacity-50 cursor-pointer"
                >
                  {/* İkon — Motorlu kurye (Google Material delivery_dining) */}
                  <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#ff7a00]/15 border border-[#ff7a00]/25 flex items-center justify-center mb-4 group-hover:bg-[#ff7a00]/25 transition-colors">
                    <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#ff7a00]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,7c0-1.1-0.9-2-2-2h-3v2h3v2.65L13.52,14H10V9H6c-2.21,0-4,1.79-4,4v3h2c0,1.66,1.34,3,3,3s3-1.34,3-3h4.48L19,10.35V7z M4,14v-1c0-1.1,0.9-2,2-2h2v3H4z M7,17c-0.55,0-1-0.45-1-1h2C8,16.55,7.55,17,7,17z"/>
                      <rect height="2" width="5" x="5" y="6"/>
                      <path d="M19,13c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S20.66,13,19,13z M19,17c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1C20,16.55,19.55,17,19,17z"/>
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                    {userRole === "kurye" ? "Kuryelere Göz At" : "Kurye Bul"}
                  </h3>

                  <div className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg border border-white/25 text-white text-sm font-semibold group-hover:bg-white/10 group-hover:border-white/40 transition-all">
                    {userRole === "kurye" ? "Kuryeleri Gör" : "Hemen Başla"}
                  </div>
                </button>

                {/* İşletme Card */}
                <button
                  onClick={() => {
                    if (userRole === "kurye") {
                      router.push("/ilanlar?view=kurye");
                    } else {
                      router.push("/isletme-bul");
                    }
                  }}
                  disabled={isLoading}
                  className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-7 text-center transition-all duration-300 hover:bg-white/[0.18] hover:border-white/40 hover:shadow-[0_8px_40px_rgba(255,122,0,0.15)] hover:-translate-y-1 disabled:opacity-50 cursor-pointer"
                >
                  {/* İkon — Bina/grid */}
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                    {userRole === "isletme" ? "İşletmelere Göz At" : "İşletme Bul"}
                  </h3>

                  <div className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-[#ff7a00] text-white text-sm font-semibold group-hover:bg-[#e86e00] transition-all">
                    {userRole === "kurye" ? "İşletmeleri Gör" : "İş Ortağı Ol"}
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Full-width black strip with gradient */}
        <div className="w-full bg-gradient-to-b from-black to-[#2c2c2c] text-white">
          <div className="max-w-4xl mx-auto px-6 py-12 text-center">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
              Mesaj gruplarının trafiğinde kaybolmayın, doğru iş ortağı ile doğrudan eşleşin.
            </h3>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold">
              Anlık değil, kalıcı çözüm
            </p>
          </div>
        </div>

        {/* Stats (ikonlu turuncu kareler — yazı ikonun içinde, beyaz renkli) */}
        <div className="max-w-6xl mx-auto px-6 mt-8">
          <div className="flex items-center justify-center gap-6">
            {[
              { icon: "/images/icon-kuryee.png", label: "Nitelikli\nKuryeler" },
              { icon: "/images/icon-isletmee.png", label: "Saygın\nİşletmeler" },
              { icon: "/images/icon-eslesmee.png", label: "Doğru\nEşleşmeler" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#ff7a00] rounded-2xl w-36 h-36 md:w-50 md:h-50 flex flex-col items-center justify-center shadow-lg"
              >
                <Image
                  src={item.icon}
                  alt={item.label.replace("\n", " ")}
                  width={64}
                  height={64}
                  className="object-contain mb-1"
                  priority
                />
                <div className="text-white text-sm md:text-base font-bold text-center whitespace-pre-line">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto"> {/* yeniden içeriği devam ettirmek için container açılıyor */}

          {/* NASIL ÇALIŞIR */}
          <h2 id="nasil-calisir" className="mt-12 text-center text-3xl font-extrabold text-black">NASIL ÇALIŞIR ?</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Profilini Oluştur",
                desc: "İşletme veya Kurye olarak profilini oluştur ve çalışma kriterlerini belirle.",
                icon: "/images/icon-profile.png",
              },
              {
                title: "Filtrele",
                desc: "Çalışmak istediğin kurye veya işletmeyi filtrele.",
                icon: "/images/icon-filter.png",
              },
              {
                title: "Doğru Eşleşmeyi Bul",
                desc: "Sana uygun olan işletme veya kuryeyi listele.",
                icon: "/images/icon-match.png",
              },
              {
                title: "İletişime Geç",
                desc: "Talep kabul edilirse hızlıca iletişime geç ve işlemi kolaylaştır.",
                icon: "/images/icon-contact.png",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-[#2c2c2c] rounded-lg shadow-lg border border-gray-800">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#ffffff] flex items-center justify-center">
                    <Image src={item.icon} alt={item.title} width={48} height={48} />
                  </div>
                  <h4 className="font-bold text-[#ff7a00]">{item.title}</h4>
                  <p className="text-sm text-white">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA + Telefon Mockup */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight text-black">
                Hemen <span className="text-[#ff7a00]">Kayıt Ol</span> !
                <br className="hidden md:block" />
                Ve Kolayca <span className="text-[#ff7a00]">Servise Başla</span> !!!
              </h3>
              <p className="mt-6 text-base text-black">
                Kolayca kayıt ol, profilini doğruyla hemen başla. Kurye isen işletmeleri ara ve bul; işletme isen kuryelerini rahatlıkla seç.
              </p>

              <div className="mt-8">
                <Link
                  href="/kayit-ol"
                  className="inline-block px-8 py-4 border-2 border-black rounded-full text-base font-semibold text-black hover:bg-black hover:text-white transition-colors"
                >
                  Hemen Kayıt Ol
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="w-56 md:w-72">
                <Image src="/images/PHONE.png" alt="phone" width={420} height={840} className="rounded-3xl shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
// ...existing code...