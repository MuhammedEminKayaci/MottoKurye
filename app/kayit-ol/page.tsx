"use client";
import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { CourierForm } from "./_components/CourierForm";
import { BusinessForm } from "./_components/BusinessForm";
import { RoleParamHandler } from "./_components/RoleParamHandler";
import type { RoleType, CourierRegistration, BusinessRegistration } from "../../types/registration";

export default function KayitOlPage() {
  const router = useRouter();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://kurye-app-dusky.vercel.app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<RoleType>("kurye");
  const [stage, setStage] = useState<"auth" | "profile">("auth");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // On mount check if already authenticated (Google dönüşü vs.)
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const urlParams = new URLSearchParams(window.location.search);
      const roleParam = urlParams.get('role');
      const typeParam = urlParams.get('type');
      const googleParam = urlParams.get('google');
      
      // Rol parametresi varsa hemen ayarla (auth veya profile aşamasında)
      const incomingRole = roleParam || typeParam;
      if (incomingRole && (incomingRole === 'kurye' || incomingRole === 'isletme')) {
        setRole(incomingRole as RoleType);
      }
      
      if (data.session?.user) {
        setSessionUserId(data.session.user.id);
        setSessionEmail(data.session.user.email ?? null);
        setStage("profile");
        
        // Google kullanıcısını tespit et
        if (googleParam === 'true') {
          setIsGoogleUser(true);
        }
      }
    };
    
    checkAuth();
    
    const { data: sub } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (session?.user) {
        setSessionUserId(session.user.id);
        setSessionEmail(session.user.email ?? null);
        setStage("profile");
        
        // URL parametrelerini tekrar kontrol et
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('google') === 'true') {
          setIsGoogleUser(true);
        }
      }
    });
    
    return () => {
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  const toTrError = (err: any): string => {
    const msg = String(err?.message || "").toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) return "Bu e‑posta ile hesap zaten var.";
    if (msg.includes("password") && msg.includes("least")) return "Şifre en az 6 karakter olmalıdır.";
    if (msg.includes("invalid email")) return "Geçerli bir e‑posta girin.";
    if (msg.includes("rate limit")) return "Çok fazla deneme yapıldı, sonra tekrar.";
    return "Bir hata oluştu. Tekrar deneyin.";
  };

  const ensureStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string" && value.trim() !== "") return [value.trim()];
    return [];
  };

  const handleAuthSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password !== confirm) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${baseUrl}/hosgeldiniz` },
      });
      if (error) throw error;
      if (data.user) {
        setSessionUserId(data.user.id);
        setSessionEmail(data.user.email ?? null);
        setStage("profile");
        setMessage("Hesap oluşturuldu. Profil bilgilerinizi tamamlayın.");
      } else {
        setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setMessage(toTrError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${baseUrl}/rol-sec` }, // Rol seçimi sayfasına yönlendir
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      setMessage("Google ile giriş başarısız. Sağlayıcı ayarlarını kontrol edin.");
    }
  };

  const handleAccountSwitch = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await supabase.auth.signOut();
    } catch {}
    setSessionUserId(null);
    setSessionEmail(null);
    setEmail("");
    setPassword("");
    setConfirm("");
    setStage("auth");
    setMessage("Hesap değiştirildi. Yeni e‑posta ile devam edin.");
    setLoading(false);
  };

  // Upload helper (avatar optional)
  const uploadAvatar = async (fileList?: FileList): Promise<string | null> => {
    try {
      if (!fileList || fileList.length === 0) return null;
      const file = fileList[0];
      const path = `${sessionUserId}_${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
      if (error) return null;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      return data.publicUrl || null;
    } catch {
      return null;
    }
  };

  const handleCourierProfile = async (data: CourierRegistration) => {
    if (!sessionUserId) {
      setMessage("Önce kimlik doğrulama yapılmalı.");
      return;
    }
    setLoading(true); setMessage(null);
    try {
      const avatarUrl = await uploadAvatar(data.avatarFile);
      
      // Capture IP address for KVKK compliance
      let ipAddress = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.warn('IP capture failed:', e);
      }
      
      const insert = {
        user_id: sessionUserId,
        role: "kurye",
        first_name: data.firstName,
        last_name: data.lastName,
        age: data.age,
        gender: data.gender,
        nationality: data.nationality,
        phone: data.phone,
        experience: data.experience,
        province: data.province,
        district: ensureStringArray(data.district),
        working_type: data.workingType,
        earning_model: data.earningModel,
        working_days: data.workingDays,
        daily_package_estimate: data.dailyPackageEstimate,
        license_type: data.licenseType,
        has_motorcycle: data.hasMotorcycle,
        moto_brand: data.motoBrand || null,
        moto_cc: data.motoCc || null,
        has_bag: data.hasBag,
        p1_certificate: data.p1Certificate,
        criminal_record: data.criminalRecord,
        accept_terms: data.acceptTerms,
        accept_privacy: data.acceptPrivacy,
        accept_kvkk: data.acceptKVKK,
        accept_commercial: data.acceptCommercial,
        avatar_url: avatarUrl,
      };
      const { error } = await supabase.from("couriers").insert(insert);
      if (error) throw error;
      router.push("/hosgeldiniz");
    } catch (err: any) {
      setMessage("Kurye kaydı başarısız: " + (err.message || ""));
    } finally { setLoading(false); }
  };

  const handleBusinessProfile = async (data: BusinessRegistration) => {
    if (!sessionUserId) { setMessage("Önce kimlik doğrulama yapılmalı."); return; }
    setLoading(true); setMessage(null);
    try {
      const avatarUrl = await uploadAvatar(data.avatarFile);
      
      // Capture IP address for KVKK compliance
      let ipAddress = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.warn('IP capture failed:', e);
      }
      
      const insert = {
        user_id: sessionUserId,
        role: "isletme",
        business_name: data.businessName,
        business_sector: data.businessSector,
        manager_name: data.managerName,
        manager_contact: data.managerContact,
        province: data.province,
        district: ensureStringArray(data.district),
        working_type: data.workingType,
        earning_model: data.earningModel,
        working_days: ensureStringArray(data.workingDays),
        daily_package_estimate: data.dailyPackageEstimate,
        accept_terms: data.acceptTerms,
        accept_privacy: data.acceptPrivacy,
        accept_kvkk: data.acceptKVKK,
        accept_commercial: data.acceptCommercial,
        avatar_url: avatarUrl,
      };
      const { error } = await supabase.from("businesses").insert(insert);
      if (error) throw error;
      
      // İşletme için otomatik bir başlangıç ilanı oluştur
      console.log('Creating auto ad for user_id:', sessionUserId);
      const adInsert = {
        user_id: sessionUserId,
        title: `${data.businessName} - Kurye Aranıyor`,
        description: `${data.businessSector} sektöründe çalışacak kurye aranıyor. Detaylar için iletişime geçin.`,
        province: data.province,
        district: ensureStringArray(data.district),
        working_type: data.workingType,
        earning_model: data.earningModel,
        working_days: ensureStringArray(data.workingDays),
        daily_package_estimate: data.dailyPackageEstimate,
        working_hours: data.workingType === "Full Time" ? "08:00-17:00" : "Esnek",
      };
      const { data: adData, error: adError } = await supabase.from("business_ads").insert(adInsert).select();
      if (adError) {
        console.error('Otomatik ilan oluşturulamadı:', adError);
      } else {
        console.log('Otomatik ilan oluşturuldu:', adData);
      }
      
      router.push("/hosgeldiniz");
    } catch (err: any) {
      setMessage("İşletme kaydı başarısız: " + (err.message || ""));
    } finally { setLoading(false); }
  };

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-[#ff7a00]">
      <Suspense fallback={null}>
        <RoleParamHandler setRole={setRole} setIsGoogleUser={setIsGoogleUser} />
      </Suspense>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/15 blur-2xl animate-float-slow" />
        <div className="absolute bottom-12 -right-8 w-56 h-56 rounded-full bg-white/10 blur-xl animate-pulse-soft" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float-slow" />
      </div>
      <div className="relative z-10 flex min-h-dvh items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl fade-up">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Link href="/" className="cursor-pointer">
              <Image src="/images/headerlogo.png" alt="Logo" width={160} height={50} priority className="drop-shadow-lg hover:opacity-90 transition-opacity" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {isGoogleUser ? "Profil Tamamlama" : "Kayıt / Profil Tamamlama"}
            </h1>
            <p className="text-xs sm:text-sm text-white/85 text-center max-w-md">
              {stage === "auth" ? "Önce hesabını oluştur, ardından profil bilgilerini doldur." : 
               isGoogleUser ? "Google ile giriş yaptın! Şimdi profil bilgilerini tamamla." :
               "Gerekli bilgileri doldurun."}
            </p>
            {stage === "profile" && (
              <div className="mt-2 px-4 py-2 bg-white/20 rounded-full">
                <p className="text-sm font-bold text-white">
                  {role === "kurye" ? "🏍️ Kurye Kayıt" : "🏢 İşletme Kayıt"}
                </p>
              </div>
            )}
          </div>

          {/* Stage: auth (email/password) - Google kullanıcıları için gizle */}
          {stage === "auth" && !isGoogleUser && (
            <>
              {/* Role Selection - Sadece auth aşamasında göster */}
              <div className="mb-6 grid grid-cols-2 gap-2">
                {(["kurye", "isletme"] as RoleType[]).map(r => (
                  <button key={r} onClick={() => setRole(r)} className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${role===r?"bg-white text-black shadow-lg":"bg-white/20 text-white/80"}`}>{r === "kurye" ? "Kurye Kayıt" : "İşletme Kayıt"}</button>
                ))}
              </div>

              <form onSubmit={handleAuthSignup} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-white mb-1">E-posta</label>
                <input type="email" required className="input-field" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@mail.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Şifre</label>
                <input type="password" required minLength={6} className="input-field" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Şifre (Tekrar)</label>
                <input type="password" required minLength={6} className="input-field" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="••••••" />
              </div>
              <button type="submit" disabled={loading} className="primary-btn">{loading?"Oluşturuluyor...":"Devam Et"}</button>
              <div className="text-center text-white/80 text-xs">veya</div>
              <button type="button" onClick={handleGoogleSignup} className="w-full rounded-full bg-white text-black font-semibold py-2 shadow-lg hover:translate-y-[1px] transition-transform inline-flex items-center justify-center gap-2">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.275c0-.85-.075-1.7-.225-2.525H12v4.775h6.5a5.56 5.56 0 0 1-2.4 3.65v3h3.9c2.275-2.1 3.6-5.2 3.6-8.9Z"/><path fill="#34A853" d="M12 24c3.25 0 5.975-1.075 7.967-2.925l-3.9-3c-1.075.75-2.45 1.2-4.067 1.2-3.125 0-5.775-2.1-6.717-4.925H1.2v3.075A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.283 14.35a7.21 7.21 0 0 1 0-4.7V6.575H1.2a12 12 0 0 0 0 10.85l4.083-3.075Z"/><path fill="#EA4335" d="M12 4.75c1.75 0 3.325.6 4.558 1.783l3.4-3.4C17.975 1.2 15.25 0 12 0A12 12 0 0 0 1.2 6.575l4.083 3.075C6.225 6.825 8.875 4.75 12 4.75Z"/></svg>
                Google ile Giriş Yap
              </button>
            </form>
            </>
          )}

          {/* Stage: profile forms */}
          {stage === "profile" && (
            <div className="mb-4">
              {sessionEmail && !isGoogleUser && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <p className="text-xs sm:text-sm text-white/80">Hesap: <span className="font-semibold">{sessionEmail}</span></p>
                  <button type="button" onClick={handleAccountSwitch} className="rounded-full bg-white/90 text-black text-xs font-semibold px-3 py-1 shadow hover:translate-y-[1px] transition">Hesap değiştir</button>
                </div>
              )}
              {sessionEmail && isGoogleUser && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-white font-semibold mb-1">✅ Google ile Giriş Yapıldı</p>
                    <p className="text-xs text-white/80">Hesap: <span className="font-semibold">{sessionEmail}</span></p>
                    <p className="text-xs text-white/60 mt-1">Profil bilgilerini tamamla ve başla!</p>
                  </div>
                </div>
              )}
              {role === "kurye" ? (
                <CourierForm onSubmit={handleCourierProfile} disabled={loading} />
              ) : (
                <BusinessForm onSubmit={handleBusinessProfile} disabled={loading} />
              )}
            </div>
          )}

          {message && <p className="mt-2 text-xs sm:text-sm text-center text-white/95">{message}</p>}
          <p className="mt-6 text-xs sm:text-sm text-center text-white/90">Zaten hesabın var mı? <Link href="/giris" className="font-semibold underline-offset-4 hover:underline">Giriş Yap</Link></p>
          <p className="mt-4 text-[10px] leading-relaxed text-white/50 text-center">Bilgileriniz Supabase üzerinde güvenle saklanır. RLS politikaları ile sadece size ait veriler kullanıcı kimliğiniz (auth.uid()) ile ilişkilendirilerek erişilebilir olmalıdır. Tablo şemalarınızı ve politikalarınızı uygun şekilde yapılandırın.</p>
        </div>
      </div>
    </main>
  );
}
