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
    const typeParam = searchParams.get('type');
    const googleParam = searchParams.get('google');
    
    const incomingRole = roleParam || typeParam;
    if (incomingRole === 'kurye' || incomingRole === 'isletme') {
      setRole(incomingRole);
    }
    
    if (googleParam === 'true' && setIsGoogleUser) {
      setIsGoogleUser(true);
    }
  }, [searchParams, setRole, setIsGoogleUser]);

  return null;
}
