"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export function EditProfileButton({ targetUserId, role }: { targetUserId: string, role: 'kurye' | 'isletme' }) {
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user.id === targetUserId) {
                setIsOwnProfile(true);
            }
        };
        checkUser();
    }, [targetUserId]);

    if (!isOwnProfile) return null;

    const colorClasses = role === 'kurye' 
        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' 
        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';

    return (
        <Link
            href={`/profil/duzenle/${role}`}
            className={`px-6 py-3 ${colorClasses} text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2`}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Bilgileri Düzenle
        </Link>
    );
}
