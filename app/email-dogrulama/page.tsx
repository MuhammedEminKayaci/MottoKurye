"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EmailDogrulamaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "kurye";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const lastFilledIndex = Math.min(pastedData.length, 6) - 1;
    inputRefs.current[lastFilledIndex]?.focus();

    if (newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = async (token?: string) => {
    const code = token || otp.join("");
    if (code.length !== 6) {
      setMessage("Lütfen 6 haneli kodu eksiksiz girin.");
      setMessageType("error");
      return;
    }

    setVerifyLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });

      if (error) throw error;

      if (data.session) {
        setMessage("E-posta doğrulandı! Yönlendiriliyorsunuz...");
        setMessageType("success");
        setTimeout(() => {
          router.push(`/kayit-ol?role=${role}`);
        }, 1000);
      } else {
        setMessage("Doğrulama başarısız. Lütfen tekrar deneyin.");
        setMessageType("error");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err: unknown) {
      console.error("OTP verify error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      const msg = errMsg.toLowerCase();
      if (msg.includes("expired") || msg.includes("token has expired")) {
        setMessage("Doğrulama kodunun süresi dolmuş. Lütfen yeni kod isteyin.");
      } else if (msg.includes("invalid") || msg.includes("otp") || msg.includes("token")) {
        setMessage("Girdiğiniz kod hatalı. Lütfen tekrar deneyin.");
      } else if (msg.includes("rate") || msg.includes("limit")) {
        setMessage("Çok fazla deneme. Lütfen biraz bekleyin.");
      } else {
        setMessage("Doğrulama başarısız: " + errMsg);
      }
      setMessageType("error");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;
    setResendLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      setMessage("Yeni doğrulama kodu gönderildi!");
      setMessageType("success");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessage(
        errMsg.includes("rate")
          ? "Çok fazla deneme. Lütfen biraz bekleyin."
          : "Gönderim başarısız. Lütfen tekrar deneyin."
      );
      setMessageType("error");
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
            Doğrulama Kodunu Gir
          </h1>

          <p className="text-sm text-white/90 mb-2">
            E-posta adresine gönderdiğimiz 6 haneli doğrulama kodunu gir.
          </p>

          {email && (
            <div className="bg-white/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-white/80">Gönderim adresi:</p>
              <p className="text-base font-bold text-white break-all">
                {email}
              </p>
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={verifyLoading}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
                  digit
                    ? "border-white bg-white text-[#ff7a00]"
                    : "border-white/40 bg-white/10 text-white placeholder-white/40"
                } focus:border-white focus:bg-white focus:text-[#ff7a00] focus:scale-105 disabled:opacity-50`}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={verifyLoading || otp.some((d) => d === "")}
            className={`w-full rounded-full py-3 text-sm font-bold transition-all ${
              otp.every((d) => d !== "") && !verifyLoading
                ? "bg-white text-[#ff7a00] hover:translate-y-[1px] shadow-lg"
                : "bg-white/30 text-white/60 cursor-not-allowed"
            }`}
          >
            {verifyLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Doğrulanıyor...
              </span>
            ) : (
              "Doğrula ve Devam Et"
            )}
          </button>

          {message && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
                messageType === "success"
                  ? "bg-green-500/20 text-green-100"
                  : "bg-red-500/20 text-red-100"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className={`text-sm font-semibold transition-all ${
                canResend
                  ? "text-white underline underline-offset-4 hover:text-white/80"
                  : "text-white/50 cursor-not-allowed"
              }`}
            >
              {resendLoading
                ? "Gönderiliyor..."
                : canResend
                ? "Kodu tekrar gönder"
                : `Tekrar gönder (${countdown}s)`}
            </button>
          </div>

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
