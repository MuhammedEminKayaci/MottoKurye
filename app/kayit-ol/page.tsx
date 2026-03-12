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
  const baseUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "https://motto-kurye-beta.vercel.app");
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
    let isMounted = true;

    // Profil var mı kontrol et — ortak yardımcı
    const checkProfileExists = async (userId: string): Promise<boolean> => {
      try {
        const [courierResult, businessResult] = await Promise.all([
          supabase.from("couriers").select("id").eq("user_id", userId).limit(1),
          supabase.from("businesses").select("id").eq("user_id", userId).limit(1),
        ]);
        return !!(
          (courierResult.data && courierResult.data.length > 0) ||
          (businessResult.data && businessResult.data.length > 0)
        );
      } catch (err) {
        console.error("Profil kontrolü başarısız:", err);
      }
      return false;
    };

    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !isMounted) return;

        const urlParams = new URLSearchParams(window.location.search);
        const roleParam = urlParams.get('role');
        const typeParam = urlParams.get('type');
        const googleParam = urlParams.get('google');

        // Rol parametresi varsa hemen ayarla
        const incomingRole = roleParam || typeParam;
        if (incomingRole && (incomingRole === 'kurye' || incomingRole === 'isletme')) {
          setRole(incomingRole as RoleType);
        }

        if (data.session?.user) {
          const userId = data.session.user.id;

          const hasProfile = await checkProfileExists(userId);
          if (!isMounted) return;

          if (hasProfile) {
            router.push("/profil");
            return;
          }

          // Profil yok — profil tamamlama aşamasına geç
          setSessionUserId(userId);
          setSessionEmail(data.session.user.email ?? null);
          setStage("profile");

          if (googleParam === 'true') {
            setIsGoogleUser(true);
          }
        }
      } catch (err) {
        console.error("Auth kontrolü başarısız:", err);
      }
    };

    checkAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      // INITIAL_SESSION zaten checkAuth tarafından işleniyor — tekrar çalıştırma
      if (event === "INITIAL_SESSION" || !isMounted) return;

      if (session?.user) {
        try {
          const userId = session.user.id;

          const hasProfile = await checkProfileExists(userId);
          if (!isMounted) return;

          if (hasProfile) {
            router.push("/profil");
            return;
          }

          setSessionUserId(userId);
          setSessionEmail(session.user.email ?? null);
          setStage("profile");

          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('google') === 'true') {
            setIsGoogleUser(true);
          }
        } catch (err) {
          console.error("Auth state change hatası:", err);
        }
      }
    });

    return () => {
      isMounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [router]);

  const toTrError = (err: any): string => {
    const msg = String(err?.message || "").toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) return "Bu e‑posta ile hesap zaten var.";
    if (msg.includes("password") && msg.includes("least")) return "Şifre en az 6 karakter olmalıdır.";
    if (msg.includes("invalid email")) return "Geçerli bir e‑posta girin.";
    if (msg.includes("rate limit") || msg.includes("email rate limit")) return "E-posta gönderim limiti aşıldı. Lütfen 1 saat sonra tekrar deneyin veya daha önce gelen doğrulama kodunu kullanın.";
    if (msg.includes("over_email_send_rate_limit")) return "E-posta gönderim limiti aşıldı. Lütfen 1 saat bekleyin.";
    return "Bir hata oluştu. Tekrar deneyin.";
  };

  const ensureStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string" && value.trim() !== "") return [value.trim()];
    return [];
  };

  // İsim formatlama: Her kelimenin ilk harfi büyük, diğerleri küçük
  const formatName = (name: string): string => {
    return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // Motorsiklet markası formatlama: İlk harf büyük
  const formatBrand = (brand: string): string => {
    return brand.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const normalizePhone = (p?: string | null) => p ? p.replace(/\D/g, "") : null;

  const assertPhoneUnique = async (phone: string) => {
    const cleaned = normalizePhone(phone);
    const candidates = Array.from(new Set([phone, cleaned].filter(Boolean))) as string[];
    if (candidates.length === 0) return;

    const { data: courierHit, error: courierErr } = await supabase
      .from("couriers")
      .select("id")
      .in("phone", candidates)
      .limit(1);
    if (courierErr) throw courierErr;
    if (courierHit && courierHit.length > 0) {
      throw new Error("Bu telefon numarasıyla kayıt zaten var.");
    }

    const { data: businessHit, error: businessErr } = await supabase
      .from("businesses")
      .select("id")
      .in("manager_contact", candidates)
      .limit(1);
    if (businessErr) throw businessErr;
    if (businessHit && businessHit.length > 0) {
      throw new Error("Bu telefon numarasıyla kayıt zaten var.");
    }
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

      // E-posta doğrulama ayarını kontrol et
      let emailVerificationEnabled = true;
      try {
        const settingsRes = await fetch("/api/settings?key=email_verification_enabled");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          emailVerificationEnabled = settingsData.value === "true";
        }
      } catch {}

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });

      // Rate limit hatası — kullanıcı daha önce kayıt olduysa doğrulama sayfasına yönlendir
      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("rate limit") || msg.includes("email rate limit") || msg.includes("over_email_send_rate_limit")) {
          if (emailVerificationEnabled) {
            setMessage("Doğrulama kodu zaten gönderildi. E-posta kutunuzu kontrol edin.");
            setTimeout(() => {
              router.push(`/email-dogrulama?email=${encodeURIComponent(email)}&role=${role}`);
            }, 1500);
          } else {
            setMessage("Bu e-posta ile kayıt zaten yapılmış. Giriş yapmayı deneyin.");
          }
          return;
        }
        throw error;
      }

      // Supabase zaten kayıtlı (onaylanmış) e-posta için identities boş döner
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setMessage("Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.");
        return;
      }

      if (data.user) {
        if (emailVerificationEnabled) {
          // Email doğrulama kodu gönderildi — kullanıcıyı doğrulama sayfasına yönlendir
          router.push(`/email-dogrulama?email=${encodeURIComponent(email)}&role=${role}`);
        } else {
          // Doğrulama kapalı — kullanıcıyı otomatik onayla
          try {
            await fetch("/api/auth/auto-confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: data.user.id }),
            });
          } catch {}

          // Oturum yenile ve profil oluşturma aşamasına geç
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            setMessage("Kayıt başarılı! Lütfen giriş yapın.");
            setTimeout(() => router.push("/giris"), 1500);
            return;
          }

          setSessionUserId(data.user.id);
          setSessionEmail(email);
          setStage("profile");
        }
        return;
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

  const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const DOCUMENT_MIME = ["image/jpeg", "image/png", "application/pdf"];

  // Upload helper (avatar optional) with temel doğrulama
  const uploadAvatar = async (fileList?: FileList): Promise<string | null> => {
    try {
      if (!fileList || fileList.length === 0) return null;
      const file = fileList[0];

      if (!ALLOWED_MIME.includes(file.type)) {
        setMessage("Sadece PNG, JPG veya WEBP yükleyin.");
        return null;
      }
      if (file.size > MAX_AVATAR_SIZE) {
        setMessage("Dosya boyutu 5MB'ı geçmemeli.");
        return null;
      }

      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const path = `${sessionUserId}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
      if (error) return null;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      return data.publicUrl || null;
    } catch {
      return null;
    }
  };

  const uploadDocument = async (fileList?: FileList, prefix: string = "doc"): Promise<string | null> => {
    try {
      if (!fileList || fileList.length === 0) return null;
      const file = fileList[0];
      if (!DOCUMENT_MIME.includes(file.type)) {
        setMessage("Belge için sadece JPEG, PNG veya PDF yükleyin.");
        return null;
      }
      if (file.size > MAX_AVATAR_SIZE) {
        setMessage("Belge boyutu 5MB'ı geçmemeli.");
        return null;
      }
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const path = `${prefix}_${sessionUserId}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: false });
      if (error) return null;
      const { data } = supabase.storage.from("documents").getPublicUrl(path);
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
      if (data.phone) {
        await assertPhoneUnique(data.phone);
      }
      
      let finalAvatarUrl = await uploadAvatar(data.avatarFile);
      if (!finalAvatarUrl) {
        if (data.selectedAvatar) {
          finalAvatarUrl = data.selectedAvatar;
        } else {
          // Default assigned avatar based on gender
          const randomNum = Math.floor(Math.random() * 2) + 1;
          if (data.gender === "Erkek") {
            finalAvatarUrl = `/images/avatars/kurye/erkek${randomNum}.jpeg`;
          } else {
            finalAvatarUrl = `/images/avatars/kurye/kadin${randomNum}.jpeg`;
          }
        }
      }

      const p1Url = await uploadDocument(data.p1CertificateFile, "p1");
      const srcUrl = await uploadDocument(data.srcCertificateFile, "src");
      const criminalUrl = await uploadDocument(data.criminalRecordFile, "sabka");
      
      // Capture IP address for KVKK compliance
      let ipAddress = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (e) {
        // IP capture failed silently
      }
      
      const insert = {
        user_id: sessionUserId,
        role: "kurye",
        first_name: formatName(data.firstName),
        last_name: formatName(data.lastName),
        age: data.age,
        gender: data.gender,
        nationality: data.nationality,
        phone: data.phone || "",
        contact_preference: data.contactPreference,
        experience: data.experience,
        province: data.province,
        district: ensureStringArray(data.district),
        working_type: data.workingType,
        earning_model: data.earningModel,
        working_days: data.workingDays,
        daily_package_estimate: data.dailyPackageEstimate,
        license_type: data.licenseType,
        has_motorcycle: data.hasMotorcycle,
        moto_brand: data.motoBrand ? formatBrand(data.motoBrand) : null,
        moto_cc: data.motoCc || null,
        has_bag: data.hasBag,
        p1_certificate: data.p1Certificate,
        src_certificate: data.srcCertificate,
        criminal_record: data.criminalRecord,
        p1_certificate_file_url: p1Url,
        src_certificate_file_url: srcUrl,
        criminal_record_file_url: criminalUrl,
        accept_terms: data.acceptTerms,
        accept_privacy: data.acceptPrivacy,
        accept_kvkk: data.acceptKVKK,
        accept_commercial: data.acceptCommercial,
        avatar_url: finalAvatarUrl,
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
      if (data.managerContact) {
        await assertPhoneUnique(data.managerContact);
      }
      let finalAvatarUrl = await uploadAvatar(data.avatarFile);
      if (!finalAvatarUrl) {
          if (data.selectedAvatar) {
            finalAvatarUrl = data.selectedAvatar;
          } else {
            // Sektöre göre avatar ata
            const sectorAvatarMap: Record<string, string> = {
              "E-Ticaret ve Online Satış Firmaları": "/images/avatars/isletme/kargo.png",
              "Moda, Tekstil ve Aksesuar": "/images/avatars/isletme/butik.png",
              "Kurumsal ve Ofis Hizmetleri": "/images/avatars/isletme/kurumsal.png",
              "Finans - Bankacılık - Sigorta": "/images/avatars/isletme/kurumsal.png",
              "Yeme-İçme": "/images/avatars/isletme/yeme-icme.png",
              "Sağlık ve Medikal": "/images/avatars/isletme/eczane-medikal.png",
              "Teknoloji ve Elektronik": "/images/avatars/isletme/teknoloji.png",
              "Lojistik ve Depolama": "/images/avatars/isletme/kargo.png",
              "Çiçek & Hediyeli Eşya": "/images/avatars/isletme/cicekci.png",
              "Otomotiv ve Yedek Parça": "/images/avatars/isletme/kargo.png",
            };
            finalAvatarUrl = sectorAvatarMap[data.businessSector] || "/images/avatars/isletme/kurumsal.png";
          }
      }
      
      // Capture IP address for KVKK compliance
      let ipAddress = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (e) {
        // IP capture failed silently
      }
      
      const insert = {
        user_id: sessionUserId,
        role: "isletme",
        plan: "premium",
        business_name: formatName(data.businessName),
        business_sector: data.businessSector,
        manager_name: formatName(data.managerName),
        manager_contact: data.managerContact || "",
        contact_preference: data.contactPreference,
        province: data.province,
        district: ensureStringArray(data.district),
        working_type: data.workingType,
        earning_model: data.earningModel,
        working_days: data.workingDays,
        daily_package_estimate: data.dailyPackageEstimate,
        accept_terms: data.acceptTerms,
        accept_privacy: data.acceptPrivacy,
        accept_kvkk: data.acceptKVKK,
        accept_commercial: data.acceptCommercial,
        avatar_url: finalAvatarUrl,
      };
      const { error } = await supabase.from("businesses").insert(insert);
      if (error) throw error;
      
      // İşletme için otomatik bir başlangıç ilanı oluştur
      const adInsert = {
        user_id: sessionUserId,
        title: `${data.businessName} - Kurye Aranıyor`,
        description: `${data.businessSector} sektöründe çalışacak kurye aranıyor. Detaylar için iletişime geçin.`,
        province: data.province,
        district: ensureStringArray(data.district),
        working_type: data.workingType,
        earning_model: data.earningModel,
        working_days: data.workingDays,
        daily_package_estimate: data.dailyPackageEstimate,
        working_hours: data.workingType === "Full Time" ? "08:00-17:00" : "Esnek",
      };
      const { data: adData, error: adError } = await supabase.from("business_ads").insert(adInsert).select();
      if (adError) {
        console.error('Otomatik ilan oluşturulamadı:', adError);
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
              <Image src="/images/paketservisci.png" alt="PaketServisci Logo" width={160} height={50} priority className="drop-shadow-lg hover:opacity-90 transition-opacity" />
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
                <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  {role === "kurye" ? (
                    <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg> Kurye Kayıt</>
                  ) : (
                    <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg> İşletme Kayıt</>
                  )}
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
                    <p className="text-sm text-white font-semibold mb-1 flex items-center justify-center gap-1.5"><svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> Google ile Giriş Yapıldı</p>
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
