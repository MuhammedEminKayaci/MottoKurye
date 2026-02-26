"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EmailDogrulamaContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || !canResend) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      setResendMessage("Doğrulama e-postası tekrar gönderildi!");
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setResendMessage(
        err?.message?.includes("rate")
          ? "Çok fazla deneme. Lütfen biraz bekleyin."
          : "Gönderim başarısız. Lütfen tekrar deneyin."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-[#ff7a00]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/15 blur-2xl animate-float-slow" />
        <div className="absolute bottom-12 -right-8 w-56 h-56 rounded-full bg-white/10 blur-xl animate-pulse-soft" />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl fade-up text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/images/paketservisci.png"
              alt="PaketServisi Logo"
              width={160}
              height={50}
              priority
              className="drop-shadow-lg hover:opacity-90 transition-opacity mx-auto"
            />
          </Link>

          {/* Mail ikonu */}
          <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-3">
            E-postanı Doğrula
          </h1>

          <p className="text-sm text-white/90 mb-2">
            Hesabını aktifleştirmek için e-posta adresine gönderdiğimiz
            doğrulama bağlantısına tıkla.
          </p>

          {email && (
            <div className="bg-white/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-white/80">Gönderim adresi:</p>
              <p className="text-base font-bold text-white break-all">
                {email}
              </p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-left">
              <span className="flex-shrink-0 w-6 h-6 bg-white/25 rounded-full flex items-center justify-center text-xs font-bold text-white">
                1
              </span>
              <p className="text-sm text-white/90">
                E-posta kutunu kontrol et (spam klasörünü de kontrol etmeyi unutma)
              </p>
            </div>
            <div className="flex items-start gap-3 text-left">
              <span className="flex-shrink-0 w-6 h-6 bg-white/25 rounded-full flex items-center justify-center text-xs font-bold text-white">
                2
              </span>
              <p className="text-sm text-white/90">
                &quot;E-postanı Doğrula&quot; veya &quot;Confirm your email&quot; bağlantısına tıkla
              </p>
            </div>
            <div className="flex items-start gap-3 text-left">
              <span className="flex-shrink-0 w-6 h-6 bg-white/25 rounded-full flex items-center justify-center text-xs font-bold text-white">
                3
              </span>
              <p className="text-sm text-white/90">
                Doğrulamadan sonra profil bilgilerini tamamla
              </p>
            </div>
          </div>

          {/* Tekrar gönder butonu */}
          <button
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className={`w-full rounded-full py-2.5 text-sm font-semibold transition-all ${
              canResend
                ? "bg-white text-[#ff7a00] hover:translate-y-[1px] shadow-lg"
                : "bg-white/30 text-white/60 cursor-not-allowed"
            }`}
          >
            {resendLoading
              ? "Gönderiliyor..."
              : canResend
              ? "Doğrulama E-postasını Tekrar Gönder"
              : `Tekrar gönder (${countdown}s)`}
          </button>

          {resendMessage && (
            <p className="mt-3 text-xs text-white/90">{resendMessage}</p>
          )}

          <div className="mt-6 space-y-2">
            <Link
              href="/giris"
              className="block text-sm text-white/90 font-semibold underline-offset-4 hover:underline"
            >
              Giriş Yap sayfasına dön
            </Link>
            <Link
              href="/kayit-ol"
              className="block text-xs text-white/70 underline-offset-4 hover:underline"
            >
              Farklı bir e-posta ile kayıt ol
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EmailDogrulamaPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center bg-[#ff7a00]">
          <p className="text-white">Yükleniyor...</p>
        </main>
      }
    >
      <EmailDogrulamaContent />
    </Suspense>
  );
}
