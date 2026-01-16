"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChatWindow } from "../_components/ChatWindow";
import { useRouter, useParams } from "next/navigation";

export default function ChatDetailPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const params = useParams();
  // Ensure id is a string
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/giris');
        return;
      }
      setUserId(data.user.id);

      // Fetch role
      const { data: c } = await supabase.from("couriers").select("id").eq("user_id", data.user.id).maybeSingle();
      if (c) {
        setUserRole("kurye");
      } else {
        setUserRole("isletme");
      }
    };
    check();
  }, []);

  if (!userId || !id || !userRole) return <div className="h-full flex items-center justify-center">Yükleniyor...</div>;

  return (
    <ChatWindow 
      conversationId={id} 
      currentUserId={userId} 
      currentUserRole={userRole}
    />
  );
}
