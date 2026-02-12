'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MultiSelect } from '@/app/_components/MultiSelect';
import { ISTANBUL_DISTRICTS } from '@/lib/istanbul-districts';

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
  daily_package_estimate: string;
  working_days: string[];
  license_type: string;
  has_motorcycle: string;
  moto_brand: string | null;
  moto_cc: string | null;
  has_bag: string;
  p1_certificate: string;
  criminal_record: string;
  contact_preference: 'phone' | 'in_app' | 'both';
  avatar_url?: string | null;
  p1_certificate_file_url?: string | null;
  criminal_record_file_url?: string | null;
}

const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Telefon numarası formatlama fonksiyonu: 0 (5XX) XXX XX XX
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 11);
  
  if (limited.length === 0) return '';
  if (limited.length <= 1) return limited;
  if (limited.length <= 4) return `${limited[0]} (${limited.slice(1)}`;
  if (limited.length <= 7) return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4)}`;
  if (limited.length <= 9) return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7)}`;
  return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9)}`;
};

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

  // Ehliyet ve sertifika dosyaları
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [p1File, setP1File] = useState<File | null>(null);
  const [p1Preview, setP1Preview] = useState<string | null>(null);
  const [criminalRecordFile, setCriminalRecordFile] = useState<File | null>(null);
  const [criminalRecordPreview, setCriminalRecordPreview] = useState<string | null>(null);
  
  // Orijinal değerleri takip et (değişiklik tespiti için)
  const [originalLicenseType, setOriginalLicenseType] = useState<string | null>(null);
  const [originalP1Certificate, setOriginalP1Certificate] = useState<string | null>(null);

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

        // Parse working_days if it's a string
        let workingDays = data.working_days;
        if (typeof workingDays === 'string') {
          workingDays = workingDays.split(',').map((d: string) => d.trim());
        }

        setCourier({ ...data, working_days: workingDays });
        setFormData({ ...data, working_days: workingDays });
        setAvatarPreview(data.avatar_url);
        
        // Orijinal değerleri kaydet (değişiklik tespiti için)
        setOriginalLicenseType(data.license_type);
        setOriginalP1Certificate(data.p1_certificate);
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

  // Ehliyet görseli yükleme
  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLicenseFile(file);
      setLicensePreview(URL.createObjectURL(file));
    }
  };

  // P1 sertifikası görseli yükleme
  const handleP1FileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setP1File(file);
      setP1Preview(URL.createObjectURL(file));
    }
  };

  // Sabıka kaydı görseli yükleme
  const handleCriminalRecordFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCriminalRecordFile(file);
      setCriminalRecordPreview(URL.createObjectURL(file));
    }
  };

  // Dosya yükleme helper fonksiyonu
  const uploadDocument = async (file: File, prefix: string): Promise<string | null> => {
    try {
      const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      if (!ALLOWED_MIME.includes(file.type)) {
        setError('Sadece JPEG, PNG veya PDF dosyası yükleyebilirsiniz.');
        return null;
      }
      if (file.size > MAX_SIZE) {
        setError('Dosya boyutu 5MB\'ı geçemez.');
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const ext = file.name.split('.').pop() || 'bin';
      const path = `${prefix}_${user.id}_${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file, { upsert: false });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }
      
      const { data } = supabase.storage.from('documents').getPublicUrl(path);
      return data.publicUrl || null;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
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

      // Ehliyet türü değişti mi kontrol et - değiştiyse görsel zorunlu
      const licenseChanged = originalLicenseType && formData.license_type !== originalLicenseType;
      if (licenseChanged && !licenseFile) {
        setError('Ehliyet türünü değiştirdiğiniz için yeni ehliyet görselinizi yüklemeniz gerekmektedir.');
        setSaving(false);
        return;
      }

      // P1 sertifikası "YOK"tan "VAR"a değişti mi kontrol et - değiştiyse görsel zorunlu
      const p1Changed = originalP1Certificate === 'YOK' && formData.p1_certificate === 'VAR';
      if (p1Changed && !p1File) {
        setError('P1 sertifikanız olduğunu belirttiğiniz için P1 sertifika görselinizi yüklemeniz gerekmektedir.');
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

      // Ehliyet görseli yükle (eğer varsa)
      let licenseFileUrl = formData.p1_certificate_file_url; // Mevcut değeri koru
      if (licenseFile) {
        const uploadedUrl = await uploadDocument(licenseFile, 'ehliyet');
        if (uploadedUrl) {
          licenseFileUrl = uploadedUrl;
        }
      }

      // P1 sertifikası görseli yükle (eğer varsa)
      let p1FileUrl = formData.p1_certificate_file_url;
      if (p1File) {
        const uploadedUrl = await uploadDocument(p1File, 'p1');
        if (uploadedUrl) {
          p1FileUrl = uploadedUrl;
        }
      }

      // Sabıka kaydı görseli yükle (eğer varsa)
      let criminalRecordFileUrl = formData.criminal_record_file_url;
      if (criminalRecordFile) {
        const uploadedUrl = await uploadDocument(criminalRecordFile, 'sabka');
        if (uploadedUrl) {
          criminalRecordFileUrl = uploadedUrl;
        }
      }

      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: formData.age,
        gender: formData.gender,
        nationality: formData.nationality,
        avatar_url: finalAvatarUrl,
        phone: (formData.contact_preference === 'phone' || formData.contact_preference === 'both') 
          ? (formData.phone || '') 
          : '',
        experience: formData.experience,
        province: formData.province,
        district: formData.district,
        working_type: formData.working_type,
        daily_package_estimate: formData.daily_package_estimate,
        working_days: formData.working_days,
        license_type: formData.license_type,
        has_motorcycle: formData.has_motorcycle,
        moto_brand: formData.has_motorcycle === 'VAR' ? formData.moto_brand : null,
        moto_cc: formData.has_motorcycle === 'VAR' ? formData.moto_cc : null,
        has_bag: formData.has_bag,
        p1_certificate: formData.p1_certificate,
        criminal_record: formData.criminal_record,
        contact_preference: formData.contact_preference,
        p1_certificate_file_url: p1FileUrl,
        criminal_record_file_url: criminalRecordFileUrl,
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
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                        </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Ad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
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
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
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
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
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
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
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
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İletişim Şekli <span className="text-red-500">*</span>
                </label>
                <select
                  name="contact_preference"
                  value={formData.contact_preference || 'in_app'}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="in_app">Uygulama İçi İletişim</option>
                  <option value="phone">Telefon ve Uygulama İçi İletişim</option>
                </select>
                {(formData.contact_preference === 'phone' || formData.contact_preference === 'both') && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Telefon numaranız 08:00-20:00 saatleri arasında işletmelere gösterilecektir.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Telefon Numarası {(formData.contact_preference === 'phone' || formData.contact_preference === 'both') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))}
                  disabled={formData.contact_preference === 'in_app'}
                  className={`w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition ${formData.contact_preference === 'in_app' ? 'bg-neutral-100 cursor-not-allowed opacity-50' : ''}`}
                  placeholder="0 (5XX) XXX XX XX"
                />
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Tecrübe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
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
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Günlük Paket Tahmini
                </label>
                <select
                  name="daily_package_estimate"
                  value={formData.daily_package_estimate || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white"
                >
                  <option value="">Seçiniz</option>
                  <option value="0-15 PAKET">0-15 PAKET</option>
                  <option value="15-25 PAKET">15-25 PAKET</option>
                  <option value="25-40 PAKET">25-40 PAKET</option>
                  <option value="40 VE ÜZERİ">40 VE ÜZERİ</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Çalışma Günleri
                </label>
                <div className="flex flex-wrap gap-2 min-h-[80px] items-center p-3 border border-neutral-300 rounded-lg bg-white">
                  {days.map(day => {
                    const isSelected = Array.isArray(formData.working_days) && formData.working_days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWorkingDaysChange(day)}
                        className={`h-[40px] px-4 text-sm font-medium rounded-lg border transition-all ${
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

          {/* Hizmet Bölgesi */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Hizmet Bölgesi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İl <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white"
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
                    className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                    placeholder="Virgülle ayrılmış"
                  />
                )}
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
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
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
                      className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
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
                      className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
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
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Ehliyet Türü <span className="text-red-500">*</span>
                </label>
                <select
                  name="license_type"
                  value={formData.license_type || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white"
                >
                  <option value="">Seçiniz</option>
                  <option value="M (Motorlu Bisiklet)">M (Motorlu Bisiklet)</option>
                  <option value="A1 (125cc'ye kadar)">A1 (125cc'ye kadar)</option>
                  <option value="A2 (35kW'a kadar)">A2 (35kW'a kadar)</option>
                  <option value="A (Sınırsız)">A (Sınırsız)</option>
                  <option value="B (Otomobil)">B (Otomobil)</option>
                </select>
                {/* Ehliyet değişikliği uyarısı ve dosya yükleme */}
                {originalLicenseType && formData.license_type !== originalLicenseType && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Ehliyet türünü değiştirdiğiniz için yeni ehliyet görselinizi yükleyiniz.
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleLicenseFileChange}
                      className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff7a00] file:text-white hover:file:bg-[#e66e00]"
                    />
                    {licensePreview && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Dosya yüklendi
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  P1 Sertifikası <span className="text-red-500">*</span>
                </label>
                <select
                  name="p1_certificate"
                  value={formData.p1_certificate || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white"
                >
                  <option value="">Seçiniz</option>
                  <option value="VAR">Var</option>
                  <option value="YOK">Yok</option>
                </select>
                {/* P1 sertifikası YOK'tan VAR'a değiştiyse dosya yükleme */}
                {originalP1Certificate === 'YOK' && formData.p1_certificate === 'VAR' && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      P1 sertifikanız olduğunu belirttiğiniz için sertifika görselinizi yükleyiniz.
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleP1FileChange}
                      className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff7a00] file:text-white hover:file:bg-[#e66e00]"
                    />
                    {p1Preview && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Dosya yüklendi
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Sabıka Kaydı <span className="text-red-500">*</span>
                </label>
                <select
                  name="criminal_record"
                  value={formData.criminal_record || ''}
                  onChange={handleInputChange}
                  className="w-full h-[60px] px-4 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white"
                >
                  <option value="">Seçiniz</option>
                  <option value="VAR">Var</option>
                  <option value="YOK">Yok</option>
                </select>
                {/* Sabıka kaydı dosya yükleme */}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Sabıka kaydı belgenizi yükleyiniz (JPEG, PNG veya PDF).
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleCriminalRecordFileChange}
                    className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff7a00] file:text-white hover:file:bg-[#e66e00]"
                  />
                  {criminalRecordPreview && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Dosya yüklendi
                    </div>
                  )}
                  {formData.criminal_record_file_url && !criminalRecordFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mevcut belge yüklü
                    </div>
                  )}
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
