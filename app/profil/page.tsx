"use client";
import React, { useEffect, useState } from "react";
import { Header } from "../_components/Header";
import { PlanStatusCard } from "../_components/PlanStatusCard";
import { supabase } from "../../lib/supabase";
import { PlanType, PLAN_LIMITS } from "@/lib/planLimits";

const maskCourierName = (first?: string | null, last?: string | null) => {
  const f = (first || "").trim();
  const l = (last || "").trim();
  const initial = l ? `${l[0].toUpperCase()}.` : "";
  return [f, initial].filter(Boolean).join(" ") || "Kurye";
};

const maskBusinessName = (name?: string | null) => {
  const parts = (name || "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "İşletme";
  // Her kelime için ilk harf + 3 nokta: "Engin Has Lahmacun" → "E... H... L..."
  return parts.map(p => `${p[0]?.toUpperCase() || ''}...`).join(' ');
};

const formatDistrict = (district: any) => {
  if (!district) return '-';
  if (Array.isArray(district)) {
    if (district.length <= 2) return district.join(', ');
    return `${district.slice(0, 2).join(', ')} +${district.length - 2} ilçe`;
  }
  return district;
};

export default function ProfilPage() {
  const [role, setRole] = useState<"kurye"|"isletme"|null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string|null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [planStatus, setPlanStatus] = useState<{
    plan: PlanType;
    messagesLeft: number;
    dailyMessageLimit: number;
    approvalsLeft: number;
    dailyApprovalLimit: number;
  } | null>(null);
  const fileInputId = "avatar-upload-input";

  const fetchUnreadMessages = async (userId: string) => {
    try {
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .or(`business_id.eq.${userId},courier_id.eq.${userId}`);
      
      if (!convs || convs.length === 0) {
        setUnreadCount(0);
        return;
      }
      
      // Her sohbet için okunmamış mesaj var mı kontrol et
      let unreadConversations = 0;
      for (const conv of convs) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .eq('is_read', false);
        
        if (count && count > 0) {
          unreadConversations++;
        }
      }
      
      setUnreadCount(unreadConversations);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchPlanStatus = async (businessId: string, businessPlan: PlanType, messagesSent: number, approvalsSent: number, lastReset: string | null) => {
    const planLimits = PLAN_LIMITS[businessPlan] || PLAN_LIMITS.free;
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = lastReset ? lastReset.split('T')[0] : null;
    
    // Günlük sıfırlama kontrolü
    const actualMessagesSent = lastResetDate === today ? messagesSent : 0;
    const actualApprovalsSent = lastResetDate === today ? approvalsSent : 0;
    
    setPlanStatus({
      plan: businessPlan,
      messagesLeft: planLimits.dailyMessageLimit - actualMessagesSent,
      dailyMessageLimit: planLimits.dailyMessageLimit,
      approvalsLeft: planLimits.dailyApprovalLimit - actualApprovalsSent,
      dailyApprovalLimit: planLimits.dailyApprovalLimit
    });
  };

  useEffect(() => {
    const run = async () => {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth.session?.user?.id;
      if (!uid) { setLoading(false); return; }
      
      // Okunmamış mesaj sayısını çek
      await fetchUnreadMessages(uid);
      
      const { data: c } = await supabase.from("couriers").select("*").eq("user_id", uid).limit(1);
      if (c && c.length) { setRole("kurye"); setProfile(c[0]); setLoading(false); return; }
      const { data: b } = await supabase.from("businesses").select("*").eq("user_id", uid).limit(1);
      if (b && b.length) { 
        setRole("isletme"); 
        setProfile(b[0]); 
        // Plan durumunu al
        await fetchPlanStatus(
          b[0].id, 
          (b[0].plan || 'free') as PlanType, 
          b[0].messages_sent_today || 0,
          b[0].approvals_today || 0,
          b[0].last_usage_reset
        );
      }
      setLoading(false);
    };
    run();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMsg(null);
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth.session?.user?.id;
      if (!uid) throw new Error("Oturum bulunamadı");
      const ext = file.name.split('.').pop();
      const path = `${uid}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = pub?.publicUrl;
      if (!url) throw new Error('Görsel URL üretilemedi');
      // Update table
      if (role === 'kurye') {
        await supabase.from('couriers').update({ avatar_url: url }).eq('id', profile.id);
      } else if (role === 'isletme') {
        await supabase.from('businesses').update({ avatar_url: url }).eq('id', profile.id);
      }
      setProfile((p:any)=>({...p, avatar_url: url }));
      setMsg('Profil görseli güncellendi.');
    } catch (err:any) {
      setMsg('Hata: ' + (err?.message ?? 'Yükleme başarısız'));
    }
  };

  // Toggle iş/kurye arama durumu
  const handleStatusToggle = async () => {
    try {
      setSavingStatus(true);
      setMsg(null);
      
      if (role === 'kurye') {
        const newStatus = !profile.is_accepting_offers;
        const { error } = await supabase
          .from('couriers')
          .update({ is_accepting_offers: newStatus })
          .eq('id', profile.id);
        if (error) throw error;
        setProfile((p: any) => ({ ...p, is_accepting_offers: newStatus }));
        setMsg(newStatus ? 'İş tekliflerine AÇIK hale getirildiniz' : 'İş tekliflerine KAPALI hale getirildiniz');
      } else if (role === 'isletme') {
        const newStatus = !profile.seeking_couriers;
        const { error } = await supabase
          .from('businesses')
          .update({ seeking_couriers: newStatus })
          .eq('id', profile.id);
        if (error) throw error;
        setProfile((p: any) => ({ ...p, seeking_couriers: newStatus }));
        setMsg(newStatus ? 'Kurye arayışınız AÇIK hale getirildi' : 'Kurye arayışınız KAPALI hale getirildi');
      }
    } catch (err: any) {
      setMsg('Hata: ' + (err?.message ?? 'Durum güncellenemedi'));
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-dvh w-full bg-neutral-50">
        <Header />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="spinner" />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-dvh w-full bg-neutral-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-black/70 text-lg">Profil bulunamadı. Kayıt sayfasına yönlendiriliyorsunuz...</p>
          <script dangerouslySetInnerHTML={{__html:`setTimeout(()=>{ window.location.href='/kayit-ol'; },1200);`}} />
        </div>
      </main>
    );
  }

  const avatarUrl = profile?.avatar_url && (profile.avatar_url.startsWith('http') || profile.avatar_url.startsWith('/')) ? profile.avatar_url : '/images/icon-profile.png';
  const coverUrl = profile?.cover_photo_url && profile.cover_photo_url.startsWith('http') ? profile.cover_photo_url : null;
  // Kendi profil sayfamız - isimleri tam göster, maskeleme yapma
  const displayName = role === 'kurye' 
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Kurye'
    : profile.business_name || 'İşletme';

  return (
    <main className="min-h-dvh w-full bg-neutral-50">
      <Header />
      
      {/* Okunmamış Mesaj Bildirimi */}
      {unreadCount > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <a 
              href="/mesajlar"
              className="flex items-center justify-between hover:opacity-90 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">
                    {unreadCount} kişiden okunmamış mesajınız var!
                  </p>
                  <p className="text-sm text-white/80">Mesajlarınızı görmek için tıklayın</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-orange-600 px-4 py-2 rounded-full font-semibold text-sm">
                  Mesajlara Git
                </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      )}
      
      {/* Profile Header - Centered Avatar without Cover */}
      <div className="py-12 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center">
            {/* Centered Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-orange-200 shadow-xl overflow-hidden bg-white">
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              </div>
              {/* Avatar Edit overlay */}
              <button
                onClick={() => document.getElementById(fileInputId)?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-sm font-semibold"
              >
                <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Düzenle
              </button>
              <input id={fileInputId} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            
            {/* Name & Role - Centered */}
            <div className="text-center mt-4">
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-1">{displayName}</h1>
              <div className="flex items-center justify-center gap-3 text-neutral-600 text-sm md:text-base mb-2">
                <span className="flex items-center gap-1.5">
                  {role === 'kurye' ? (
                    <><svg className="w-4 h-4 text-[#ff7a00]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg> Kurye</>
                  ) : (
                    <><svg className="w-4 h-4 text-[#ff7a00]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg> İşletme</>
                  )}
                </span>
                {profile.province && <span> • {profile.province}</span>}
              </div>
              
              {/* Status Badge - Clickable Toggle */}
              <div className="flex justify-center mb-4">
                {role === 'kurye' ? (
                  <button
                    onClick={handleStatusToggle}
                    disabled={savingStatus}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all hover:scale-105 ${
                      profile.is_accepting_offers
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } ${savingStatus ? 'opacity-50' : ''}`}
                  >
                    {savingStatus ? (
                      <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Güncelleniyor...</>
                    ) : profile.is_accepting_offers ? (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> İş Arıyorum</>
                    ) : (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg> İş Aramıyorum</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleStatusToggle}
                    disabled={savingStatus}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all hover:scale-105 ${
                      profile.seeking_couriers
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } ${savingStatus ? 'opacity-50' : ''}`}
                  >
                    {savingStatus ? (
                      <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Güncelleniyor...</>
                    ) : profile.seeking_couriers ? (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> Kurye Arıyorum</>
                    ) : (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg> Kurye Aramıyorum</>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-500 mb-4">Durumu değiştirmek için butona tıklayın</p>
              
              {/* Edit Button */}
              <div className="mt-4">
                <a
                  href={role === 'kurye' ? '/profil/duzenle/kurye' : '/profil/duzenle/isletme'}
                  className={`inline-flex items-center gap-2 px-6 py-3 ${
                    role === 'kurye'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bilgileri Düzenle
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-12">

        {msg && (
          <div className={`max-w-2xl mx-auto mb-6 p-3 rounded-lg text-center text-sm font-medium ${msg.startsWith('Hata') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {msg}
          </div>
        )}

        {/* Plan Status Card - Sadece İşletmeler için */}
        {role === 'isletme' && planStatus && (
          <div className="mb-8">
            <PlanStatusCard
              plan={planStatus.plan}
              messagesLeft={planStatus.messagesLeft}
              dailyMessageLimit={planStatus.dailyMessageLimit}
              approvalsLeft={planStatus.approvalsLeft}
              dailyApprovalLimit={planStatus.dailyApprovalLimit}
              businessId={profile.id}
              onPlanUpdated={async () => {
                // Plan güncellenince yeniden yükle
                const { data: b } = await supabase.from("businesses").select("*").eq("id", profile.id).single();
                if (b) {
                  setProfile(b);
                  await fetchPlanStatus(
                    b.id,
                    (b.plan || 'free') as PlanType,
                    b.messages_sent_today || 0,
                    b.approvals_today || 0,
                    b.last_usage_reset
                  );
                }
              }}
            />
          </div>
        )}

        {/* Section Title */}
        <div className="border-b border-neutral-200 mb-8">
          <div className="flex gap-6 text-sm font-semibold">
            <span className="pb-3 border-b-2 border-orange-500 text-orange-600">Profil Bilgileri</span>
          </div>
        </div>

        {/* Info Grid */}
        {role === "kurye" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ["İsim", displayName, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>],
              ["Yaş", profile.age, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>],
              ["Cinsiyet", profile.gender, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>],
              ["Uyruk", profile.nationality, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>],
              ["Telefon", profile.phone, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>],
              ["İş Tecrübesi", `${profile.experience} yıl`, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>],
              ["Konum", `${profile.province || '-'} / ${formatDistrict(profile.district)}`, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>],
              ["Çalışma Tipi", profile.working_type, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>],
              ["Kazanç Modeli", profile.earning_model, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>],
              ["Günlük Paket", profile.daily_package_estimate, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>],
              ["Çalışma Günleri", Array.isArray(profile.working_days) ? profile.working_days.join(" - ") : (typeof profile.working_days === 'string' ? profile.working_days.split(',').map((d: string) => d.trim()).join(' - ') : (profile.working_days || '-')), <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>],
              ["Ehliyet Türü", profile.license_type, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>],
              ["Motorsiklet", profile.has_motorcycle, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>],
              ["Marka", profile.moto_brand || '-', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>],
              ["Motor CC", profile.moto_cc || '-', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>],
              ["Taşıma Çantası", profile.has_bag, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>],
              ["P1 Yetki Belgesi", profile.p1_certificate || '-', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>],
              ["Sabıka Kaydı", profile.criminal_record || '-', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>],
            ].map(([k, v, icon]) => (
              <div key={String(k)} className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200 hover:shadow-md hover:border-orange-200 transition">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-orange-500">{icon}</div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase">{k}</div>
                </div>
                <div className="text-base text-black font-medium pl-7">{String(v ?? "-")}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ["Firma Adı", displayName, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>],
              ["Sektör", profile.business_sector, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>],
              ["Yetkili", profile.manager_name, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>],
              ["İletişim", profile.manager_contact, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>],
              ["Konum", `${profile.province || '-'} / ${formatDistrict(profile.district)}`, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>],
              ["Çalışma Tipi", profile.working_type, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>],
              ["Kazanç Modeli", profile.earning_model, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>],
              ["Günlük Paket", profile.daily_package_estimate, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>],
              ["Çalışma Günleri", Array.isArray(profile.working_days) ? profile.working_days.join(" - ") : (typeof profile.working_days === 'string' ? profile.working_days.split(',').map((d: string) => d.trim()).join(' - ') : (profile.working_days || '-')), <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>],
            ].map(([k, v, icon]) => (
              <div key={String(k)} className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200 hover:shadow-md hover:border-orange-200 transition">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-orange-500">{icon}</div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase">{k}</div>
                </div>
                <div className="text-base text-black font-medium pl-7">{String(v ?? "-")}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
