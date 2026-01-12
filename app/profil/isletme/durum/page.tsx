'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function IsletmeDurumPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [seekingCouriers, setSeekingCouriers] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
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
          .select('seeking_couriers')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;
        if (data) {
          setSeekingCouriers(data.seeking_couriers ?? true);
        }
      } catch (err) {
        console.error('Error loading status:', err);
        setError('Durum yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  const handleToggle = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Oturum açmanız gerekiyor');

      const newStatus = !seekingCouriers;

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ seeking_couriers: newStatus })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSeekingCouriers(newStatus);
      setSuccess(
        newStatus
          ? '✓ Kurye arayışınız aktif hale getirildi'
          : '✓ Kurye arayışınız devre dışı bırakıldı'
      );
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Durum güncellenirken hata oluştu');
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-12">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href={`/profil`}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#ff7a00]">Kurye Arayışım</h1>
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

        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-8">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Kurye Arıyor musunuz?</h2>
              <p className="text-neutral-600 text-base mb-6">
                {seekingCouriers
                  ? 'Kuryeler sizi görebiliyor ve size başvuru yapabiliyor'
                  : 'Kuryeler sizi göremiyor, ilanlar sayfasında çıkmıyorsunuz'}
              </p>

              {/* Simple Button Toggle */}
              <button
                onClick={handleToggle}
                disabled={saving}
                className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:cursor-not-allowed ${
                  seekingCouriers
                    ? 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                } ${saving ? 'opacity-70' : ''}`}
              >
                {saving ? 'Güncelleniyor...' : (seekingCouriers ? '✓ AÇIK' : '✕ KAPALI')}
              </button>
            </div>
          </div>

          <div className="mt-8 p-5 bg-neutral-50 rounded-xl border border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nasıl çalışır?
            </h3>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>AÇIK:</strong> Kuryeler sizi görüp başvuru yapabilir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">✕</span>
                <span><strong>KAPALI:</strong> Kuryeler sizi göremez, başvuru alamazsınız</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
