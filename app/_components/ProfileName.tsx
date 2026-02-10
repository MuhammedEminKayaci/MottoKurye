"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileNameProps {
  targetUserId: string;
  maskedName: string;
  fullName: string;
  className?: string;
}

/**
 * Kullanıcı kendi profiline baktığında tam ismini,
 * başkalarının profiline baktığında maskelenmiş ismini gösterir.
 */
export function ProfileName({ targetUserId, maskedName, fullName, className }: ProfileNameProps) {
  const [displayName, setDisplayName] = useState(maskedName);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.id === targetUserId) {
        setDisplayName(fullName);
      }
    };
    checkUser();
  }, [targetUserId, fullName]);

  return <span className={className}>{displayName}</span>;
}
