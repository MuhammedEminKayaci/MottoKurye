"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// İsim maskeleme fonksiyonları - profildeki ile aynı mantık
const maskCourierName = (first?: string | null, last?: string | null) => {
  const f = (first || "").trim();
  const l = (last || "").trim();
  const initial = l ? `${l[0].toUpperCase()}.` : "";
  return [f, initial].filter(Boolean).join(" ") || "Kurye";
};

const maskBusinessName = (name?: string | null) => {
  const parts = (name || "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "İşletme";
  // Her kelime için ilk harf + 3 nokta: "Engin Has Lahmacun" → "E... H... L..."
  return parts.map(p => `${p[0]?.toUpperCase() || ''}...`).join(' ');
};

interface Conversation {
  id: string;
  business_id: string;
  courier_id: string;
  updated_at: string;
  other_party?: {
    name: string;
    avatar_url: string | null;
    role: string;
  };
}

export function ChatSidebar({ userId, userRole }: { userId: string; userRole: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const activeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  // Realtime subscription
  useEffect(() => {
    fetchConversations();

    const conversationChannel = supabase
      .channel('sidebar_conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) return;
    
    try {
      // 1. Fetch raw conversations
      const { data: rawConvs, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .or(`business_id.eq.${userId},courier_id.eq.${userId}`)
        .order("updated_at", { ascending: false });

      if (convError) throw convError;
      if (!rawConvs || rawConvs.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // 2. Extract IDs for bulk fetching
      const businessIds = [...new Set(rawConvs.map((c: any) => c.business_id))];
      const courierIds = [...new Set(rawConvs.map((c: any) => c.courier_id))];

      // 3. Fetch details manually
      let businessesMap: Record<string, any> = {};
      let couriersMap: Record<string, any> = {};

      if (businessIds.length > 0) {
        const { data: bData } = await supabase
          .from('businesses')
          .select('user_id, business_name, avatar_url')
          .in('user_id', businessIds);
        bData?.forEach((b: any) => { businessesMap[b.user_id] = b; });
      }

      if (courierIds.length > 0) {
        const { data: cData } = await supabase
          .from('couriers')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', courierIds);
        cData?.forEach((c: any) => { couriersMap[c.user_id] = c; });
      }

      // 4. Merge data
      const processed: Conversation[] = rawConvs.map((c: any) => {
        let other: any = {};
        
        if (userRole === 'isletme') {
            const courier = couriersMap[c.courier_id];
            other = {
                name: courier ? maskCourierName(courier.first_name, courier.last_name) : 'Kurye',
                avatar_url: courier?.avatar_url,
                role: 'Kurye'
            };
        } else {
            const business = businessesMap[c.business_id];
            other = {
                name: maskBusinessName(business?.business_name),
                avatar_url: business?.avatar_url,
                role: 'İşletme'
            };
        }

        return {
            ...c,
            other_party: other
        };
      });

      setConversations(processed);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    setDeleting(true);
    try {
      // Önce mesajları sil
      const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', convId);
      
      if (msgError) {
        console.error('Message delete error:', msgError);
        // Mesaj silme hatası olsa bile sohbeti silmeye devam et
      }
      
      // Sonra sohbeti sil
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', convId);
      
      if (error) {
        console.error('Conversation delete error:', error);
        throw error;
      }
      
      // Başarılı - Listeden kaldır
      setConversations(prev => prev.filter(c => c.id !== convId));
      setDeleteConfirm(null);
      
      // Eğer silinen sohbet aktif ise mesajlar ana sayfasına yönlendir
      if (activeId === convId) {
        router.push('/mesajlar');
      }
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
      alert(`Sohbet silinirken bir hata oluştu: ${err?.message || 'Bilinmeyen hata'}. Lütfen Supabase'de DELETE politikasının eklendiğinden emin olun.`);
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    return d.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      day: isToday ? undefined : 'numeric',
      month: isToday ? undefined : 'short'
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white to-orange-50/30">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-200 border-t-orange-500"></div>
          <span className="text-sm text-neutral-500 font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-orange-50/30">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-1">Henüz mesaj yok</h3>
        <p className="text-sm text-neutral-500 text-center max-w-[200px]">İlanlardan işletme veya kuryelerle iletişime geçebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-4 md:py-5 border-b border-neutral-100 bg-gradient-to-r from-orange-500 to-orange-600 md:from-white md:to-white">
        <h2 className="font-bold text-xl text-white md:text-neutral-800 tracking-tight">Mesajlar</h2>
        <p className="text-orange-100 md:text-neutral-500 text-sm mt-0.5">{conversations.length} sohbet</p>
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const isActive = activeId === conv.id;
          const info = conv.other_party!;
          const showDeleteConfirm = deleteConfirm === conv.id;
          
          return (
            <div key={conv.id} className="relative">
              {/* Silme Onay Dialogu */}
              {showDeleteConfirm && (
                <div className="absolute inset-0 bg-white z-10 flex items-center justify-center px-4 py-3 border-b border-neutral-100">
                  <div className="text-center">
                    <p className="text-sm text-neutral-700 mb-3">Bu sohbeti silmek istediğinize emin misiniz?</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deleting}
                        className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleDeleteConversation(conv.id)}
                        disabled={deleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                      >
                        {deleting ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Siliniyor...</>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Sil</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`flex items-center gap-4 px-4 py-4 border-b border-neutral-50 transition-all duration-200 ${
                isActive 
                  ? 'bg-orange-50 border-l-4 border-l-orange-500' 
                  : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
              }`}>
                {/* Sil Butonu */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteConfirm(conv.id);
                  }}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                  title="Sohbeti Sil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                
                <Link 
                  href={`/mesajlar/${conv.id}`}
                  className="flex-1 flex items-center gap-4"
                >
              {/* Avatar Container - Fixed Size */}
              <div className="relative flex-shrink-0 w-14 h-14">
                <div className={`w-14 h-14 ring-2 ${isActive ? 'ring-orange-400' : 'ring-neutral-200'} rounded-full overflow-hidden transition-all`}>
                  <Image 
                    src={info.avatar_url && info.avatar_url.trim() !== '' ? info.avatar_url : '/images/icon-profile.png'} 
                    alt={info.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/icon-profile.png';
                    }}
                  />
                </div>
                {/* Online indicator - Fixed Position */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <h3 className={`font-semibold truncate text-base ${isActive ? 'text-orange-700' : 'text-neutral-900'}`}>
                    {info.name}
                  </h3>
                  <span className={`text-xs whitespace-nowrap px-2 py-0.5 rounded-full ${isActive ? 'bg-orange-100 text-orange-700 font-semibold' : 'bg-neutral-100 text-neutral-500'}`}>
                    {formatTime(conv.updated_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${info.role === 'Kurye' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {info.role}
                  </span>
                  <p className={`text-sm truncate ${isActive ? 'text-orange-600' : 'text-neutral-500'}`}>
                    Sohbete devam et →
                  </p>
                </div>
              </div>
              
              {/* Arrow */}
              <svg className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-orange-400' : 'text-neutral-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
