"use client";
import React, { useEffect, useState } from "react";
import { Header } from "../_components/Header";
import { supabase } from "../../lib/supabase";

const maskCourierName = (first?: string | null, last?: string | null) => {
  const f = (first || "").trim();
  const l = (last || "").trim();
  const initial = l ? `${l[0].toUpperCase()}.` : "";
  return [f, initial].filter(Boolean).join(" ") || "Kurye";
};

const maskBusinessName = (name?: string | null) => {
  const parts = (name || "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "İşletme";
  return parts.map(p => `${p[0]?.toUpperCase() || ''}....`).join(' ');
};

export default function ProfilPage() {
  const [role, setRole] = useState<"kurye"|"isletme"|null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string|null>(null);
  const fileInputId = "avatar-upload-input";

  useEffect(() => {
    const run = async () => {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth.session?.user?.id;
      if (!uid) { setLoading(false); return; }
      const { data: c } = await supabase.from("couriers").select("*").eq("user_id", uid).limit(1);
      if (c && c.length) { setRole("kurye"); setProfile(c[0]); setLoading(false); return; }
      const { data: b } = await supabase.from("businesses").select("*").eq("user_id", uid).limit(1);
      if (b && b.length) { setRole("isletme"); setProfile(b[0]); }
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
      setMsg('✓ Profil görseli güncellendi.');
    } catch (err:any) {
      setMsg('✗ ' + (err?.message ?? 'Yükleme başarısız'));
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
  const displayName = role === 'kurye' 
    ? maskCourierName(profile.first_name, profile.last_name)
    : maskBusinessName(profile.business_name);

  return (
    <main className="min-h-dvh w-full bg-neutral-50">
      <Header />
      
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
                <span>{role === 'kurye' ? '🚴 Kurye' : '🏢 İşletme'}</span>
                {profile.province && <span> • {profile.province}</span>}
              </div>
              
              {/* Status Badge */}
              <div className="flex justify-center mb-4">
                {role === 'kurye' ? (
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                    profile.is_accepting_offers
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {profile.is_accepting_offers ? '✓ İş Tekliflerine AÇIK' : '✕ İş Tekliflerine KAPALI'}
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                    profile.seeking_couriers
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {profile.seeking_couriers ? '✓ Kurye Arayışım AÇIK' : '✕ Kurye Arayışım KAPALI'}
                  </span>
                )}
              </div>
              
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
          <div className={`max-w-2xl mx-auto mb-6 p-3 rounded-lg text-center text-sm font-medium ${msg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg}
          </div>
        )}

        {/* Tabs / Sections */}
        <div className="border-b border-neutral-200 mb-8">
          <div className="flex gap-6 text-sm font-semibold">
            <button className="pb-3 border-b-2 border-orange-500 text-orange-600">Hakkında</button>
            <a 
              href={role === 'kurye' ? '/profil/kurye/durum' : '/profil/isletme/durum'}
              className="pb-3 text-neutral-600 hover:text-orange-600 transition"
            >
              {role === 'kurye' ? 'İş Teklifleri' : 'Kurye Arayışı'}
            </a>
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
              ["Konum", `${profile.province || '-'} / ${profile.district || '-'}`, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>],
              ["Çalışma Tipi", profile.working_type, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>],
              ["Kazanç Modeli", profile.earning_model, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>],
              ["Günlük Paket", profile.daily_package_estimate, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>],
              ["Çalışma Günleri", Array.isArray(profile.working_days) ? profile.working_days.join(" - ") : (typeof profile.working_days === 'string' ? profile.working_days.split(',').map((d: string) => d.trim()).join(' - ') : (profile.working_days || '-')), <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>],
              ["Ehliyet Türü", profile.license_type, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>],
              ["Motorsiklet", profile.has_motorcycle, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>],
              ["Marka", profile.moto_brand || '-', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>],
              ["Motor CC", profile.moto_cc || '-', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>],
              ["Taşıma Çantası", profile.has_bag, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>],
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
              ["Konum", `${profile.province || '-'} / ${profile.district || '-'}`, <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>],
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
