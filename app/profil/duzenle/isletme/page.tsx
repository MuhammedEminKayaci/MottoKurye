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
  manager_name: string;
  manager_contact: string | null;
  service_type: string;
  service_hours_start: string;
  service_hours_end: string;
  sunday_working: string;
  province: string;
  district: string[];
  additional_info: string | null;
  contact_preference: 'phone' | 'in_app';
}

const SERVICE_TYPES = [
  'Kargo',
  'Kurye',
  'Restoran',
  'Market',
  'Diğer'
];

const PROVINCES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];

export default function IsletmeDuzenlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
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

        setBusiness(data);
        setFormData(data);
      } catch (err) {
        console.error('Error loading business data:', err);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, []);

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
        setError('Yönetici adı gereklidir');
        setSaving(false);
        return;
      }
      if (formData.contact_preference === 'phone' && !formData.manager_contact?.trim()) {
        setError('Telefon tercihini seçtiyseniz telefon numarası gereklidir');
        setSaving(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Oturum açmanız gerekiyor');

      const updateData: any = {
        business_name: formData.business_name,
        manager_name: formData.manager_name,
        manager_contact: formData.contact_preference === 'phone' ? formData.manager_contact : null,
        service_type: formData.service_type,
        service_hours_start: formData.service_hours_start,
        service_hours_end: formData.service_hours_end,
        sunday_working: formData.sunday_working,
        province: formData.province,
        district: formData.district,
        additional_info: formData.additional_info,
        contact_preference: formData.contact_preference,
      };

      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSuccess('✓ Bilgileriniz başarıyla güncellendi!');
      setTimeout(() => {
        router.push(`/profil`);
      }, 1500);
    } catch (err: any) {
      console.error('Error saving business data:', err);
      setError(err.message || 'Bilgiler güncellenirken hata oluştu');
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
          {/* İşletme Bilgileri */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              İşletme Bilgileri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  İşletme Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Örn: ABC Kargo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Yönetici Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="manager_name"
                  value={formData.manager_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                  placeholder="Ad Soyadı"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Hizmet Türü <span className="text-red-500">*</span>
                </label>
                <select
                  name="service_type"
                  value={formData.service_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  {SERVICE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                    name="manager_contact"
                    value={formData.manager_contact || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                    placeholder="+90 (5__) ____-____"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hizmet Saatleri */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hizmet Saatleri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Açılış Saati
                </label>
                <input
                  type="time"
                  name="service_hours_start"
                  value={formData.service_hours_start || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Kapanış Saati
                </label>
                <input
                  type="time"
                  name="service_hours_end"
                  value={formData.service_hours_end || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Pazar Günü
                </label>
                <select
                  name="sunday_working"
                  value={formData.sunday_working || 'ACIK'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="ACIK">Açık</option>
                  <option value="KAPALI">Kapalı</option>
                </select>
              </div>
            </div>
          </div>

          {/* Konum Bilgileri */}
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
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition bg-white text-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  {PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
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
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                    placeholder="Virgülle ayrılmış"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Ek Bilgiler */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ek Bilgiler
            </h2>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                İşletme Açıklaması
              </label>
              <textarea
                name="additional_info"
                value={formData.additional_info || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] transition"
                placeholder="İşletmeniz hakkında ek bilgileri buraya yazabilirsiniz..."
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
