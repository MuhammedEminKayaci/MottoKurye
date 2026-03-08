"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileNameProps {
  targetUserId: string;
  maskedName: string;
  fullName: string;
  className?: string;
}

// İsim formatlama: her kelimenin ilk harfi büyük, geri kalanı küçük
const formatName = (name: string): string => {
  return name
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Kullanıcı kendi profiline baktığında tam ismini,
 * başkalarının profiline baktığında maskelenmiş ismini gösterir.
 */
export function ProfileName({ targetUserId, maskedName, fullName, className }: ProfileNameProps) {
  const [displayName, setDisplayName] = useState(formatName(maskedName));

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.id === targetUserId) {
        setDisplayName(formatName(fullName));
      }
    };
    checkUser();
  }, [targetUserId, fullName]);

  return <span className={className}>{displayName}</span>;
}
