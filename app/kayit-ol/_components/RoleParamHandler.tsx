"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { RoleType } from "../../../types/registration";

export function RoleParamHandler({ 
  setRole, 
  setIsGoogleUser 
}: { 
  setRole: (role: RoleType) => void;
  setIsGoogleUser?: (isGoogle: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const googleParam = searchParams.get('google');
    
    if (roleParam === 'kurye' || roleParam === 'isletme') {
      setRole(roleParam);
    }
    
    if (googleParam === 'true' && setIsGoogleUser) {
      setIsGoogleUser(true);
    }
  }, [searchParams, setRole, setIsGoogleUser]);

  return null;
}
