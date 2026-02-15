'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MultiSelect } from '@/app/_components/MultiSelect';
import { ISTANBUL_DISTRICTS } from '@/lib/istanbul-districts';

interface BusinessData {
  id: string;
  business_name: string;
  business_sector: string;
  manager_name: string;
  manager_contact: string | null;
  province: string;
  district: string[];
  working_type: string;
  earning_model: string;
  working_days: string[];
  daily_package_estimate: string;
  contact_preference: 'phone' | 'in_app' | 'both';
  avatar_url?: string | null;
  is_looking_for_courier?: boolean;
}

const businessSectors = [
  "E-Ticaret ve Online Satış Firmaları",
  "Moda, Tekstil ve Aksesuar",
  "Kurumsal ve Ofis Hizmetleri",
  "Finans - Bankacılık - Sigorta",
  "Yeme-İçme",
  "Sağlık ve Medikal",
  "Teknoloji ve Elektronik",
  "Lojistik ve Depolama",
  "Çiçek & Hediyeli Eşya",
  "Otomotiv ve Yedek Parça",
];

const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Telefon numarası formatlama fonksiyonu: 0 (5XX) XXX XX XX
const formatPhoneNumber = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  
  // Eğer boşsa veya sadece 0 varsa, 0 döndür
  if (digits.length === 0) return '0';
  
  // 5 ile başlıyorsa otomatik 0 ekle
  if (digits[0] === '5') {
    digits = '0' + digits;
  }
  
  // 0 ile başlamıyorsa 0 ekle
  if (digits[0] !== '0') {
    digits = '0' + digits;
  }
  
  const limited = digits.slice(0, 11);
  
  if (limited.length <= 1) return limited;
  if (limited.length <= 4) return `${limited[0]} (${limited.slice(1)}`;
  if (limited.length <= 7) return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4)}`;
  if (limited.length <= 9) return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7)}`;
  return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9)}`;
};

export default function IsletmeDuzenlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [isLookingForCourier, setIsLookingForCourier] = useState(true);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const avatarOptions = [
    "/images/avatars/isletme/avatar1.svg",
    "/images/avatars/isletme/avatar2.svg",
    "/images/avatars/isletme/avatar3.svg",
    "/images/avatars/isletme/avatar4.svg",
  ];
  const [formData, setFormData] = useState<Partial<BusinessData>>({});

  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('Oturum açmanız gerekiyor');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('İşletme profili bulunamadı');

        // Parse working_days if it's a string
        let workingDays = data.working_days;
        if (typeof workingDays === 'string') {
          workingDays = workingDays.split(',').map((d: string) => d.trim());
        }

        setBusiness({ ...data, working_days: workingDays });
        setFormData({ ...data, working_days: workingDays });
        setAvatarPreview(data.avatar_url);
        setIsLookingForCourier(data.is_looking_for_courier ?? true);
      } catch (err) {
        console.error('Error loading business data:', err);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
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

  const handleWorkingDaysChange = (day: string) => {
    setFormData(prev => {
      const currentDays = Array.isArray(prev.working_days) ? prev.working_days : [];
      if (currentDays.includes(day)) {
        return { ...prev, working_days: currentDays.filter(d => d !== day) };
      } else {
        return { ...prev, working_days: [...currentDays, day] };
      }
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);
      setSaving(true);

      // Validation
      if (!formData.business_name?.trim()) {
        setError('İşletme adı gereklidir');
        setSaving(false);
        return;
      }
      if (!formData.manager_name?.trim()) {
        setError('Yetkili adı gereklidir');
        setSaving(false);
        return;
      }
      if ((formData.contact_preference === 'phone' || formData.contact_preference === 'both') && !formData.manager_contact?.trim()) {
        setError('Telefon tercihini seçtiyseniz telefon numarası gereklidir');
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
        business_name: formData.business_name,
        business_sector: formData.business_sector,
        manager_name: formData.manager_name,
        manager_contact: (formData.contact_preference === 'phone' || formData.contact_preference === 'both') ? formData.manager_contact : null,
        province: formData.province,
        district: formData.district,
        working_type: formData.working_type,
        earning_model: formData.earning_model,
        working_days: formData.working_days,
        daily_package_estimate: formData.daily_package_estimate,
        contact_preference: formData.contact_preference,
        avatar_url: finalAvatarUrl,
        is_looking_for_courier: isLookingForCourier,
      };

      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSuccess('Bilgileriniz başarıyla güncellendi!');
      setTimeout(() => {
        router.push(`/profil`);
      }, 1500);
    } catch (err: any) {
      console.error('Error saving business data:', err);
      // Hata mesajlarını Türkçeleştir
      let errorMessage = 'Bilgiler güncellenirken hata oluştu';
      const errMsg = err?.message || '';
      
      if (errMsg.includes('null value in column') && errMsg.includes('phone')) {
        errorMessage = 'Telefon numarası alanı boş bırakılamaz. Lütfen geçerli bir telefon numarası girin.';
      } else if (errMsg.includes('violates not-null constraint')) {
        errorMessage = 'Zorunlu alanlardan biri boş bırakılmış. Lütfen tüm alanları doldurun.';
      } else if (errMsg.includes('duplicate key')) {
        errorMessage = 'Bu bilgiler zaten kayıtlı. Lütfen farklı bilgiler deneyin.';
      } else if (errMsg.includes('network') || errMsg.includes('fetch')) {
        errorMessage = 'İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.';
      } else if (errMsg.includes('permission') || errMsg.includes('policy')) {
        errorMessage = 'Bu işlemi yapmaya yetkiniz yok.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ff7a00]/20 border-t-[#ff7a00] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Hata</h1>
          <p className="text-neutral-600 mb-6">{error || 'Profil yüklenemedi'}</p>
          <Link
            href="/profil"
            className="inline-block px-6 py-3 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white font-semibold rounded-xl transition-colors"
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
          <h1 className="text-xl sm:text-2xl font-bold text-[#ff7a00]">İşletme Bilgilerimi Düzenle</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium">
            {success}
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
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Logo Yükle</label>
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

          {/* İşletme Bilgileri */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              İşletme Bilgileri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İşletme Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white"
                  placeholder="Örn: ABC Kargo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Firma Sektörü <span className="text-red-500">*</span>
                </label>
                <select
                  name="business_sector"
                  value={formData.business_sector || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                >
                  <option value="">Sektör Seçin</option>
                  {businessSectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Yetkili Adı Soyadı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="manager_name"
                  value={formData.manager_name || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white"
                  placeholder="Ad Soyadı"
                />
              </div>
            </div>
          </div>

          {/* İletişim Tercihi */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              İletişim Tercihi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İletişim Şekli <span className="text-red-500">*</span>
                </label>
                <select
                  name="contact_preference"
                  value={formData.contact_preference || 'in_app'}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                >
                  <option value="in_app">Uygulama İçi İletişim</option>
                  <option value="phone">Telefon ve Uygulama İçi İletişim</option>
                </select>
                {(formData.contact_preference === 'phone' || formData.contact_preference === 'both') && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Telefon numaranız 08:00-20:00 saatleri arasında kuryelere gösterilecektir.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Telefon Numarası {(formData.contact_preference === 'phone' || formData.contact_preference === 'both') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="tel"
                  name="manager_contact"
                  value={formData.manager_contact || '0'}
                  onChange={(e) => setFormData(prev => ({ ...prev, manager_contact: formatPhoneNumber(e.target.value) }))}
                  disabled={formData.contact_preference === 'in_app'}
                  className={`w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white ${formData.contact_preference === 'in_app' ? '!bg-neutral-100 cursor-not-allowed opacity-60' : ''}`}
                  placeholder="0 (5XX) XXX XX XX"
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
                <select
                  name="province"
                  value={formData.province || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                >
                  <option value="">Seçiniz</option>
                  <option value="İstanbul">İstanbul</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İlçeler <span className="text-red-500">*</span>
                </label>
                {formData.province === 'İstanbul' ? (
                  <MultiSelect
                    options={ISTANBUL_DISTRICTS}
                    value={Array.isArray(formData.district) ? formData.district : []}
                    onChange={handleDistrictChange}
                    placeholder="İlçe seçiniz..."
                    theme="light"
                  />
                ) : (
                  <input
                    type="text"
                    value={Array.isArray(formData.district) ? formData.district.join(', ') : ''}
                    onChange={(e) => handleDistrictChange(e.target.value.split(',').map(d => d.trim()))}
                    className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white"
                    placeholder="Virgülle ayrılmış"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Çalışma Koşulları */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Çalışma Koşulları
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Çalışma Tipi <span className="text-red-500">*</span>
                </label>
                <select
                  name="working_type"
                  value={formData.working_type || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                >
                  <option value="">Seçiniz</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
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
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                >
                  <option value="">Seçiniz</option>
                  <option value="Saat+Paket Başı">Saat+Paket Başı</option>
                  <option value="Paket Başı">Paket Başı</option>
                  <option value="Aylık Sabit">Aylık Sabit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Günlük Paket Tahmini <span className="text-red-500">*</span>
                </label>
                <select
                  name="daily_package_estimate"
                  value={formData.daily_package_estimate || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                >
                  <option value="">Seçiniz</option>
                  <option value="0-15 PAKET">0-15 PAKET</option>
                  <option value="15-25 PAKET">15-25 PAKET</option>
                  <option value="25-40 PAKET">25-40 PAKET</option>
                  <option value="40 VE ÜZERİ">40 VE ÜZERİ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Çalışma Günleri <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 h-[80px] items-center">
                  {days.map(day => {
                    const isSelected = Array.isArray(formData.working_days) && formData.working_days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWorkingDaysChange(day)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#ff7a00] text-white border-[#ff7a00]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:border-[#ff7a00]'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
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
