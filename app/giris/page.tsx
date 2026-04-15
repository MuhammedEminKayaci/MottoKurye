"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function GirisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "https://motto-kurye-beta.vercel.app");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPreLaunchModal, setShowPreLaunchModal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Zaten giriş yapılmışsa /profil'e yönlendir
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          router.replace("/profil");
          return;
        }
      } catch {}
      setCheckingAuth(false);
    };
    checkExistingSession();
  }, [router]);

  // URL'deki hata parametresini kontrol et
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "email-dogrulama-basarisiz") {
      setMessage("E-posta doğrulama başarısız oldu. Lütfen tekrar deneyin.");
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Email doğrulanmamış kullanıcı için özel işlem
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          // Doğrulama ayarını kontrol et — kapalıysa otomatik onayla
          try {
            const settingsRes = await fetch("/api/settings?key=email_verification_enabled");
            if (settingsRes.ok) {
              const settingsData = await settingsRes.json();
              if (settingsData.value === "false") {
                // Doğrulama kapalı — kullanıcıyı otomatik onayla ve tekrar giriş yap
                // Önce user ID'yi bulmak için signup bilgisiyle auto-confirm çağır
                const { data: signUpData } = await supabase.auth.signUp({ email, password });
                if (signUpData?.user?.id) {
                  await fetch("/api/auth/auto-confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: signUpData.user.id }),
                  });
                  // Tekrar giriş yap
                  const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
                  if (!retryError) {
                    const { data: sessionData } = await supabase.auth.getSession();
                    const user = sessionData.session?.user;
                    const uid = user?.id;
                    setShowPreLaunchModal(true);
                    return;
                  }
                }
              }
            }
          } catch {}
          setMessage("E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin.");
          setLoading(false);
          return;
        }
        throw error;
      }
      setShowPreLaunchModal(true);
    } catch (err: any) {
      setMessage(err?.message ?? "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage(null);
    try {
      const redirectTo = `${baseUrl}/profil`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setMessage(
        err?.message?.includes("provider is not enabled")
          ? "Google sağlayıcısı Supabase üzerinde etkin değil. Lütfen Dashboard > Authentication > Providers > Google kısmından etkinleştirin."
          : err?.message ?? "Bir hata oluştu."
      );
    }
  };
  if (checkingAuth) {
    return (
      <main className="relative min-h-dvh flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/kayit-bg.jpeg')" }} />
        <div className="fixed inset-0 bg-[#ff7a00]/60 backdrop-blur-[2px]" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/80 text-sm">Kontrol ediliyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden">
      {/* Background Image + Overlay */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/kayit-bg.jpeg')" }} />
      <div className="fixed inset-0 bg-[#ff7a00]/60 backdrop-blur-[2px]" />

      {/* Animated decorative shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/15 blur-2xl animate-float-slow" />
        <div className="absolute bottom-12 -right-8 w-56 h-56 rounded-full bg-white/10 blur-xl animate-pulse-soft" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float-slow" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-12">
        <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl fade-up">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Link href="/" className="cursor-pointer">
              <Image
                src="/images/paketservisci.png"
                alt="PaketServisci Logo"
                width={200}
                height={60}
                priority
                className="drop-shadow-lg hover:opacity-90 transition-opacity"
              />
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Giriş Yap</h1>
            <p className="text-sm text-white/85 text-center">Hesabınla devam et.</p>
          </div>

          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div>
              <label className="block text-sm font-medium text-white mb-1">E-posta</label>
              <input className="input-field" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="ornek@mail.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Şifre</label>
              <input className="input-field" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>{loading ? "Giriş yapılıyor..." : "Giriş Yap"}</button>
          </form>

          <div className="mt-3 text-center">
            <Link href="/sifremi-unuttum" className="text-white/90 underline-offset-4 hover:underline text-sm">Şifremi unuttum?</Link>
          </div>

          <div className="mt-4 text-center text-white/80">veya</div>
          <button onClick={handleGoogleLogin} className="mt-3 w-full rounded-full bg-white text-black font-semibold py-2 shadow-lg hover:translate-y-[1px] transition-transform inline-flex items-center justify-center gap-2">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.275c0-.85-.075-1.7-.225-2.525H12v4.775h6.5a5.56 5.56 0 0 1-2.4 3.65v3h3.9c2.275-2.1 3.6-5.2 3.6-8.9Z"/><path fill="#34A853" d="M12 24c3.25 0 5.975-1.075 7.967-2.925l-3.9-3c-1.075.75-2.45 1.2-4.067 1.2-3.125 0-5.775-2.1-6.717-4.925H1.2v3.075A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.283 14.35a7.21 7.21 0 0 1 0-4.7V6.575H1.2a12 12 0 0 0 0 10.85l4.083-3.075Z"/><path fill="#EA4335" d="M12 4.75c1.75 0 3.325.6 4.558 1.783l3.4-3.4C17.975 1.2 15.25 0 12 0A12 12 0 0 0 1.2 6.575l4.083 3.075C6.225 6.825 8.875 4.75 12 4.75Z"/></svg>
            Google ile Giriş Yap
          </button>

          {message && (
            <p className="mt-4 text-sm text-center text-white/95">{message}</p>
          )}

          <p className="mt-6 text-sm text-center text-white/90">
            Henüz hesabın yok mu?{" "}
            <Link href="/kayit-ol" className="font-semibold underline-offset-4 hover:underline">Kayıt Ol</Link>
          </p>
        </div>
      </div>

      {/* Pre-launch Modal */}
      {showPreLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hoş Geldiniz!</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Giriş başarılı! Profiliniz hazır.<br/>
              <span className="text-[#ff7a00] font-semibold">Uygulamamız en kısa sürede hizmete açılacaktır.</span><br/>
              Şu an profilinizi görüntüleyebilirsiniz.
            </p>
            <button
              onClick={() => router.push("/profil")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff7a00] to-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:from-[#e86e00] hover:to-orange-600 transition-all"
            >
              Profilime Git
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-dvh flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/kayit-bg.jpeg')" }} />
        <div className="fixed inset-0 bg-[#ff7a00]/60 backdrop-blur-[2px]" />
        <p className="relative z-10 text-white">Yükleniyor...</p>
      </main>
    }>
      <GirisContent />
    </Suspense>
  );
}
