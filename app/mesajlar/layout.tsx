"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChatLayoutClient } from "./ChatLayoutClient";
import { ChatSidebar } from "./_components/ChatSidebar";
import { Header } from "@/app/_components/Header";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/giris');
      return;
    }
    
    setUserId(user.id);
    // Check role
    const { data: c } = await supabase.from("couriers").select("id").eq("user_id", user.id).maybeSingle();
    if (c) {
      setRole("kurye");
    } else {
      const { data: b } = await supabase.from("businesses").select("id").eq("user_id", user.id).maybeSingle();
      if(b) setRole("isletme");
    }
    setLoading(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>;

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-white">
      <Header />
      <div className="flex-1 min-h-0">
        <ChatLayoutClient sidebar={<ChatSidebar userId={userId!} userRole={role} />}>
          {children}
        </ChatLayoutClient>
      </div>
    </div>
  );
}
