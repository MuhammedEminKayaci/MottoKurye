"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface StartChatButtonProps {
  targetId: string; // The ID of the business or courier (NOT auth user id)
  targetRole: 'isletme' | 'kurye'; // The role of the target
  targetUserId?: string; // Auth user id of the target (to prevent self-chat)
  className?: string;
  label?: string;
}

export function StartChatButton({ targetId, targetRole, targetUserId, className, label = "Mesaj Gönder" }: StartChatButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (targetUserId) {
      const checkSelf = async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user?.id === targetUserId) setIsSelf(true);
      };
      checkSelf();
    }
  }, [targetUserId]);

  if (isSelf) return null;

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/giris');
        return;
      }

      if (targetUserId && user.id === targetUserId) {
        alert("Kendinize mesaj gönderemezsiniz.");
        setLoading(false);
        return;
      }

      // Determine my identity
      let myUserId = user.id;

      let businessUserId = '';
      let courierUserId = '';

      if (targetRole === 'isletme') {
        // Target is business. I must be a courier.
        // Check if I am a courier
        const { data: courier, error: courierCheckError } = await supabase
          .from('couriers')
          .select('user_id')
          .eq('user_id', myUserId)
          .maybeSingle();
        
        if (courierCheckError || !courier) {
          alert("İşletmelerle mesajlaşmak için kurye profiline sahip olmalısınız.");
          setLoading(false);
          return;
        }

        if (!targetUserId) {
           console.error("Hedef işletme kullanıcı ID bulunamadı");
           alert("Bir hata oluştu.");
           setLoading(false);
           return;
        }

        businessUserId = targetUserId;
        courierUserId = myUserId;

      } else {
        // Target is courier. I must be a business.
        const { data: business, error: businessCheckError } = await supabase
          .from('businesses')
          .select('user_id')
          .eq('user_id', myUserId)
          .maybeSingle();

        if (businessCheckError || !business) {
          alert("Kuryelerle mesajlaşmak için işletme profiline sahip olmalısınız.");
          setLoading(false);
          return;
        }

        if (!targetUserId) {
           console.error("Hedef kurye kullanıcı ID bulunamadı");
           alert("Bir hata oluştu.");
           setLoading(false);
           return;
        }

        businessUserId = myUserId;
        courierUserId = targetUserId;
      }

      // Check existing conversation
      // Note: RLS ensures we can only select if we are part of it
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('business_id', businessUserId)
        .eq('courier_id', courierUserId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching conversation:", fetchError);
        throw fetchError;
      }

      if (existing) {
        router.push(`/mesajlar/${existing.id}`);
      } else {
        // Create new
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            business_id: businessUserId,
            courier_id: courierUserId
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating conversation:", createError);
          throw createError;
        }
        router.push(`/mesajlar/${newConv.id}`);
      }

    } catch (err) {
      console.error("Chat start error:", JSON.stringify(err, null, 2));
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors font-medium disabled:opacity-50 ${className || ''}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {loading ? "Başlatılıyor..." : label}
    </button>
  );
}
