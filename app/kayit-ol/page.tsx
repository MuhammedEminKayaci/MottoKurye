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
  const [stage, setStage] = useState<"role-select" | "auth" | "profile" | "success">("role-select");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showPreLaunchModal, setShowPreLaunchModal] = useState(false);

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

        // Rol parametresi varsa hemen ayarla + pre-launch popup göster
        const incomingRole = roleParam || typeParam;
        if (incomingRole && (incomingRole === 'kurye' || incomingRole === 'isletme')) {
          setRole(incomingRole as RoleType);
          setShowPreLaunchModal(true);
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

      // Sunucu tarafında kayıt — admin API kullanır, rate limit sorunu olmaz
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.code === "USER_EXISTS") {
          setMessage("Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.");
        } else {
          setMessage(result.error || "Bir hata oluştu. Tekrar deneyin.");
        }
        return;
      }

      if (result.emailVerificationEnabled) {
        // Email doğrulama açık — kullanıcıyı doğrulama sayfasına yönlendir
        router.push(`/email-dogrulama?email=${encodeURIComponent(email)}&role=${role}`);
      } else {
        // Doğrulama kapalı — kullanıcı zaten onaylı, direkt giriş yap
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setMessage("Kayıt başarılı! Lütfen giriş yapın.");
          setTimeout(() => router.push("/giris"), 1500);
          return;
        }

        setSessionUserId(result.user.id);
        setSessionEmail(email);
        setStage("profile");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setMessage("Bir hata oluştu. Tekrar deneyin.");
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
    setStage("role-select");
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
        working_days: [data.workingDays],
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
      setStage("success");
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
              "Diğer": "/images/avatars/isletme/diger.png",
            };
            finalAvatarUrl = sectorAvatarMap[data.businessSector] || "/images/avatars/isletme/diger.png";
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
        working_days: [data.workingDays],
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
        working_days: [data.workingDays],
        daily_package_estimate: data.dailyPackageEstimate,
        working_hours: data.workingType === "Full Time" ? "08:00-17:00" : "Esnek",
      };
      const { data: adData, error: adError } = await supabase.from("business_ads").insert(adInsert).select();
      if (adError) {
        console.error('Otomatik ilan oluşturulamadı:', adError);
      }
      
      setStage("success");
    } catch (err: any) {
      setMessage("İşletme kaydı başarısız: " + (err.message || ""));
    } finally { setLoading(false); }
  };

  return (
    <main className="relative min-h-dvh w-full overflow-hidden">
      {/* Background Image + Overlay */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/kayit-bg.jpeg')" }} />
      <div className="fixed inset-0 bg-[#ff7a00]/60 backdrop-blur-[2px]" />
      <Suspense fallback={null}>
        <RoleParamHandler setRole={setRole} setIsGoogleUser={setIsGoogleUser} />
      </Suspense>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/15 blur-2xl animate-float-slow" />
        <div className="absolute bottom-12 -right-8 w-56 h-56 rounded-full bg-white/10 blur-xl animate-pulse-soft" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float-slow" />
      </div>
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl fade-up">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Link href="/" className="cursor-pointer">
              <Image src="/images/paketservisci.png" alt="PaketServisçi Logo" width={160} height={50} priority className="drop-shadow-lg hover:opacity-90 transition-opacity" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {stage === "role-select" ? "Kayıt Ol" :
               stage === "auth" ? (role === "kurye" ? "Kurye Kaydı" : "İşletme Kaydı") :
               stage === "success" ? "" :
               isGoogleUser ? "Profil Tamamlama" : (role === "kurye" ? "Kurye Kaydı" : "İşletme Kaydı")}
            </h1>
            <p className="text-xs sm:text-sm text-white/85 text-center max-w-md">
              {stage === "role-select" ? "Nasıl kayıt olmak istediğini seç." :
               stage === "auth" ? "Hesabını oluştur, ardından profil bilgilerini doldur." : 
               stage === "success" ? "" :
               isGoogleUser ? "Google ile giriş yaptın! Şimdi profil bilgilerini tamamla." :
               "Gerekli bilgileri doldurun."}
            </p>
            {(stage === "auth" || stage === "profile") && (
              <div className="mt-2 px-4 py-1.5 bg-white/20 rounded-full">
                <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  {role === "kurye" ? (
                    <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg> Kurye</>
                  ) : (
                    <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg> İşletme</>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Stage: role-select (Rol Seçimi) */}
          {stage === "role-select" && (
            <div className="fade-up space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                {/* Kurye Card */}
                <button
                  onClick={() => { setRole("kurye"); setShowPreLaunchModal(true); }}
                  className="group relative overflow-hidden bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/25 rounded-2xl p-5 sm:p-7 text-center transition-all duration-300 hover:from-white/30 hover:to-white/10 hover:border-white/60 hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:rotate-3">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">Kurye</h3>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">Paket teslimatı yaparak<br className="hidden sm:block"/> kazanç sağla</p>
                    <div className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                      Başla
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </button>

                {/* İşletme Card */}
                <button
                  onClick={() => { setRole("isletme"); setShowPreLaunchModal(true); }}
                  className="group relative overflow-hidden bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/25 rounded-2xl p-5 sm:p-7 text-center transition-all duration-300 hover:from-white/30 hover:to-white/10 hover:border-white/60 hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:-rotate-3">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">İşletme</h3>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">İşletmen için kurye bul<br className="hidden sm:block"/> ve yönet</p>
                    <div className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                      Başla
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </button>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-xs text-white/50 shrink-0">veya</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              <button type="button" onClick={handleGoogleSignup} className="w-full rounded-2xl bg-white text-black font-semibold py-3 shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all inline-flex items-center justify-center gap-2.5">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.275c0-.85-.075-1.7-.225-2.525H12v4.775h6.5a5.56 5.56 0 0 1-2.4 3.65v3h3.9c2.275-2.1 3.6-5.2 3.6-8.9Z"/><path fill="#34A853" d="M12 24c3.25 0 5.975-1.075 7.967-2.925l-3.9-3c-1.075.75-2.45 1.2-4.067 1.2-3.125 0-5.775-2.1-6.717-4.925H1.2v3.075A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.283 14.35a7.21 7.21 0 0 1 0-4.7V6.575H1.2a12 12 0 0 0 0 10.85l4.083-3.075Z"/><path fill="#EA4335" d="M12 4.75c1.75 0 3.325.6 4.558 1.783l3.4-3.4C17.975 1.2 15.25 0 12 0A12 12 0 0 0 1.2 6.575l4.083 3.075C6.225 6.825 8.875 4.75 12 4.75Z"/></svg>
                Google ile Kayıt Ol
              </button>
            </div>
          )}

          {/* Stage: auth (email/password) - Google kullanıcıları için gizle */}
          {stage === "auth" && !isGoogleUser && (
            <>
              {/* Geri butonu */}
              <div className="mb-4">
                <button type="button" onClick={() => setStage("role-select")} className="text-white/70 text-xs hover:text-white transition-colors flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  Rol seçimine dön
                </button>
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

          {/* Stage: success */}
          {stage === "success" && (
            <div className="fade-up flex flex-col items-center text-center py-4">
              {/* Animated check icon */}
              <div className="relative mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-[scale-in_0.5s_ease-out]">
                  <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-green-400/50 animate-ping" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Tebrikler!
              </h2>
              <p className="text-lg sm:text-xl font-bold text-white/95 mb-2">
                Kayıt İşleminiz Başarıyla Tamamlandı
              </p>
              
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 sm:p-6 mt-4 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff7a00]/20 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed text-left">
                    Profiliniz başarıyla oluşturuldu. Platformumuz yeni yayına alınmış olup kurye ve işletme ağımız hızla genişlemektedir.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed text-left">
                    En kısa sürede sizlere dönüş sağlanacaktır. <strong className="text-white">Öncelikli kullanıcılar</strong> arasında yerinizi aldınız!
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#ff7a00] font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ana Sayfaya Dön
              </Link>
            </div>
          )}

          {stage !== "success" && message && <p className="mt-2 text-xs sm:text-sm text-center text-white/95">{message}</p>}
          {stage !== "success" && (
            <p className="mt-4 text-[10px] leading-relaxed text-white/50 text-center">Bilgileriniz Supabase üzerinde güvenle saklanır. RLS politikaları ile sadece size ait veriler kullanıcı kimliğiniz (auth.uid()) ile ilişkilendirilerek erişilebilir olmalıdır. Tablo şemalarınızı ve politikalarınızı uygun şekilde yapılandırın.</p>
          )}
        </div>
      </div>

      {/* Pre-Launch Modal */}
      {showPreLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPreLaunchModal(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden fade-up">
            {/* Top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#ff7a00] via-orange-400 to-[#ff7a00]" />
            
            {/* Close button */}
            <button
              onClick={() => setShowPreLaunchModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="px-6 sm:px-8 py-8 sm:py-10">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff7a00] to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 text-center mb-4">
                Platformumuza Hoş Geldiniz!
              </h3>
              
              <div className="space-y-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                <p>
                  Platformumuz <strong className="text-neutral-800">yeni yayına alınmıştır</strong> ve kayıt sürecimiz aktif olarak devam etmektedir.
                </p>
                <p>
                  Kısa süre içerisinde kurye ve işletme ağımız hızla genişleyecek, size <strong className="text-neutral-800">en uygun eşleşmeler</strong> sunulacaktır.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-neutral-700">
                    Şu anda oluşturacağınız <strong className="text-[#ff7a00]">sınırlı süreli ücretsiz üyelik</strong> ile öncelikli kullanıcılar arasında yer alabilir ve eşleşmeler başladığında <strong className="text-neutral-800">ilk haberdar olanlardan biri</strong> olabilirsiniz.
                  </p>
                </div>
                <p className="text-center font-semibold text-neutral-800">
                  Bu fırsatı kaçırmayın!
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => { setShowPreLaunchModal(false); setStage("auth"); }}
                className="mt-6 w-full py-3.5 bg-gradient-to-r from-[#ff7a00] to-orange-500 hover:from-[#e86e00] hover:to-orange-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                KAYIT OL
              </button>
              
              <p className="mt-3 text-xs text-neutral-400 text-center">
                Kayıt tamamen ücretsizdir • Kredi kartı gerekmez
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
