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
          ? 'Kurye arayışınız aktif hale getirildi'
          : 'Kurye arayışınız devre dışı bırakıldı'
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
            <div className="w-full max-w-sm">
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Kurye Arıyor musunuz?</h2>
              <p className="text-neutral-600 text-base mb-8">
                {seekingCouriers
                  ? 'Kuryeler sizi görebiliyor ve size başvuru yapabiliyor'
                  : 'Kuryeler sizi göremiyor, ilanlar sayfasında çıkmıyorsunuz'}
              </p>

              {/* Neon Toggle Switch */}
              <div className="flex items-center justify-center">
                <button
                  onClick={handleToggle}
                  disabled={saving}
                  className="relative flex items-center w-full max-w-xs h-14 rounded-full p-1 transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: seekingCouriers
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    boxShadow: seekingCouriers
                      ? '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.2)'
                      : '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {/* Labels */}
                  <span className={`flex-1 text-sm font-bold z-10 transition-colors duration-300 ${
                    seekingCouriers ? 'text-white' : 'text-white/50'
                  }`}>
                    Arıyorum
                  </span>
                  <span className={`flex-1 text-sm font-bold z-10 transition-colors duration-300 ${
                    !seekingCouriers ? 'text-white' : 'text-white/50'
                  }`}>
                    Aramıyorum
                  </span>

                  {/* Sliding Knob */}
                  <div
                    className={`absolute top-1 h-12 w-[calc(50%-4px)] bg-white rounded-full shadow-lg transition-all duration-500 ease-in-out ${
                      seekingCouriers ? 'left-1' : 'left-[calc(50%+3px)]'
                    }`}
                    style={{
                      boxShadow: seekingCouriers
                        ? '0 0 12px rgba(16, 185, 129, 0.4), 0 2px 8px rgba(0,0,0,0.1)'
                        : '0 0 12px rgba(239, 68, 68, 0.4), 0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
                      ) : seekingCouriers ? (
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                      )}
                    </div>
                  </div>
                </button>
              </div>
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
                <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                <span><strong>AÇIK:</strong> Kuryeler sizi görüp başvuru yapabilir</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                <span><strong>KAPALI:</strong> Kuryeler sizi göremez, başvuru alamazsınız</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
