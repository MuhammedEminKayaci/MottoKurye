'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface CourierData {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  nationality: string;
  phone: string | null;
  experience: string;
  province: string;
  district: string[];
  working_type: string;
  earning_model: string;
  daily_package_estimate: string;
  working_days: string;
  license_type: string;
  has_motorcycle: string;
  moto_brand: string | null;
  moto_cc: string | null;
  has_bag: string;
  contact_preference: 'phone' | 'in_app';
  avatar_url?: string | null;
}

export default function KuryeDuzenlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courier, setCourier] = useState<CourierData | null>(null);
  const [formData, setFormData] = useState<Partial<CourierData>>({});

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const avatarOptions = [
    "/images/avatars/kurye/avatar1.svg",
    "/images/avatars/kurye/avatar2.svg",
    "/images/avatars/kurye/avatar3.svg",
    "/images/avatars/kurye/avatar4.svg",
  ];

  useEffect(() => {
    const loadCourierData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('Oturum açmanız gerekiyor');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('couriers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Kurye profili bulunamadı');

        setCourier(data);
        setFormData(data);
        setAvatarPreview(data.avatar_url);
      } catch (err) {
        console.error('Error loading courier data:', err);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadCourierData();
  }, []);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setSelectedAvatar(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDistrictChange = (selected: string[]) => {
    setFormData(prev => ({
      ...prev,
      district: selected
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!formData.first_name?.trim()) {
        setError('Ad alanı zorunludur');
        setSaving(false);
        return;
      }
      if (!formData.last_name?.trim()) {
        setError('Soyad alanı zorunludur');
        setSaving(false);
        return;
      }
      if (!formData.age || formData.age < 18) {
        setError('Yaş 18 veya daha büyük olmalıdır');
        setSaving(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Oturum açmanız gerekiyor');

      let finalAvatarUrl = formData.avatar_url;
      
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop() || 'png';
        const fileName = `${user.id}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
        if (!uploadError) {
           const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
           finalAvatarUrl = publicUrl;
        }
      } else if (selectedAvatar) {
        finalAvatarUrl = selectedAvatar;
      }

      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: formData.age,
        gender: formData.gender,
        nationality: formData.nationality,
        avatar_url: finalAvatarUrl,
        phone: formData.contact_preference === 'phone' ? formData.phone : null,
        experience: formData.experience,
        province: formData.province,
        district: formData.district,
        working_type: formData.working_type,
        earning_model: formData.earning_model,
        daily_package_estimate: formData.daily_package_estimate,
        working_days: formData.working_days,
        license_type: formData.license_type,
        has_motorcycle: formData.has_motorcycle,
        moto_brand: formData.has_motorcycle === 'VAR' ? formData.moto_brand : null,
        moto_cc: formData.has_motorcycle === 'VAR' ? formData.moto_cc : null,
        has_bag: formData.has_bag,
        contact_preference: formData.contact_preference,
      };

      const { error: updateError } = await supabase
        .from('couriers')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Success message and redirect
      setError(null);
      setError('success');
      setTimeout(() => {
        router.push(`/profil`);
      }, 1500);
    } catch (err: any) {
      console.error('Error saving courier data:', err);
      setError(err.message || 'Bilgiler güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (!courier) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Hata</h1>
          <p className="text-neutral-600 mb-6">{error || 'Profil yüklenemedi'}</p>
          <Link
            href="/profil"
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Profilime Dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-12">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href={`/profil`}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#ff7a00]">Kurye Bilgilerimi Düzenle</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && error !== 'success' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">
            {error}
          </div>
        )}

        {error === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium">
            Bilgileriniz başarıyla güncellendi!
          </div>
        )}

        <form className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
             <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#ff7a00]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                Profil Fotoğrafı
             </h2>
             
             <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-lg shrink-0">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                    )}
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Fotoğraf Yükle</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff7a00] file:text-white hover:file:bg-[#e66e00]"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Veya Avatar Seç</label>
                        <div className="flex gap-4 overflow-x-auto py-2">
                            {avatarOptions.map((opt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setAvatarFile(null);
                                        setSelectedAvatar(opt);
                                        setAvatarPreview(opt);
                                    }}
                                    className={`w-12 h-12 rounded-full border-2 overflow-hidden shrink-0 transition-transform hover:scale-110 ${selectedAvatar === opt || (!avatarFile && avatarPreview === opt) ? 'border-[#ff7a00] ring-2 ring-[#ff7a00]/30' : 'border-neutral-200'}`}
                                >
                                    <img src={opt} alt={`Avatar ${idx+1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Temel Bilgiler */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Temel Bilgiler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Ad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Ad"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Soyadı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Soyadı"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Yaş <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="18+"
                  min="18"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Cinsiyet <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  <option value="ERKEK">Erkek</option>
                  <option value="KADIN">Kadın</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Uyruk
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Ör: Türk"
                />
              </div>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              İletişim Bilgileri
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İletişim Şekli <span className="text-red-500">*</span>
                </label>
                <select
                  name="contact_preference"
                  value={formData.contact_preference || 'phone'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="phone">Telefon ile İletişim</option>
                  <option value="in_app">Uygulama İçi İletişim</option>
                </select>
              </div>
              {formData.contact_preference === 'phone' && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Telefon Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                    placeholder="+90 (5__) ____-____"
                  />
                </div>
              )}
            </div>
          </div>

          {/* İş Bilgileri */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6h.01M8 6h.01M12 6h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              İş Bilgileri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Tecrübe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Ör: 2 yıl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İş Tipi <span className="text-red-500">*</span>
                </label>
                <select
                  name="working_type"
                  value={formData.working_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  <option value="Tam Zamanlı">Tam Zamanlı</option>
                  <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                  <option value="Esnek">Esnek</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Kazanç Modeli <span className="text-red-500">*</span>
                </label>
                <select
                  name="earning_model"
                  value={formData.earning_model || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  <option value="Saatlik">Saatlik</option>
                  <option value="Ücret Karyoner">Ücret Karyoner</option>
                  <option value="Parça Başı">Parça Başı</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Günlük Paket Tahmini
                </label>
                <input
                  type="text"
                  name="daily_package_estimate"
                  value={formData.daily_package_estimate || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Ör: 20-30"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Çalışma Günleri
                </label>
                <input
                  type="text"
                  name="working_days"
                  value={formData.working_days || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Ör: Pazartesi - Cumartesi"
                />
              </div>
            </div>
          </div>

          {/* Hizmet Bölgesi */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Hizmet Bölgesi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İl <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Ör: İstanbul"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İlçeler <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={Array.isArray(formData.district) ? formData.district.join(', ') : formData.district}
                  onChange={(e) => handleDistrictChange(e.target.value.split(',').map(d => d.trim()))}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Virgülle ayrılmış (Ör: Fatih, Beyoğlu)"
                />
              </div>
            </div>
          </div>

          {/* Araç Bilgileri */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Araç Bilgileri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Motorsiklet <span className="text-red-500">*</span>
                </label>
                <select
                  name="has_motorcycle"
                  value={formData.has_motorcycle || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  <option value="VAR">Var</option>
                  <option value="YOK">Yok</option>
                </select>
              </div>
              {formData.has_motorcycle === 'VAR' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Motorsiklet Markası
                    </label>
                    <input
                      type="text"
                      name="moto_brand"
                      value={formData.moto_brand || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                      placeholder="Ör: Honda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Motor CC
                    </label>
                    <input
                      type="text"
                      name="moto_cc"
                      value={formData.moto_cc || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                      placeholder="Ör: 150"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Taşıma Çantası <span className="text-red-500">*</span>
                </label>
                <select
                  name="has_bag"
                  value={formData.has_bag || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  <option value="VAR">Var</option>
                  <option value="YOK">Yok</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ehliyet ve Sertifikalar */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ehliyet ve Sertifikalar
            </h2>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Ehliyet Türü <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="license_type"
                value={formData.license_type || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                placeholder="Ör: A, A1, B, vb."
              />
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-4 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-4 sm:px-6 py-6 rounded-t-2xl shadow-lg">
            <Link
              href={`/profil`}
              className="flex-1 px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-semibold rounded-lg transition-colors text-center"
            >
              İptal
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#ff7a00] to-[#ff9933] hover:from-[#ff9933] hover:to-[#ffb366] disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
