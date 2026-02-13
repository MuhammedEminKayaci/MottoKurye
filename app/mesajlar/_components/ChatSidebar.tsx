"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  last_message?: string | null;
  last_message_at?: string | null;
  last_message_sender_id?: string | null;
  unread_count?: number;
}

export function ChatSidebar({ userId, userRole }: { userId: string; userRole: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const activeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    
    try {
      // 1. Fetch raw conversations
      const deleteFilter = userRole === 'isletme' ? 'deleted_by_business' : 'deleted_by_courier';
      const { data: rawConvs, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .or(`business_id.eq.${userId},courier_id.eq.${userId}`)
        .or(`${deleteFilter}.is.null,${deleteFilter}.eq.false`)
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
      const convIds = rawConvs.map((c: any) => c.id);

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

      // 4. Fetch last message for each conversation & unread counts
      const lastMessagesPromises = convIds.map((convId: string) =>
        supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1)
          .then(({ data }: { data: any }) => ({ convId, message: data?.[0] || null }))
      );

      const unreadCountsPromises = convIds.map((convId: string) =>
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', convId)
          .eq('is_read', false)
          .neq('sender_id', userId)
          .then(({ count }: { count: any }) => ({ convId, count: count || 0 }))
      );

      const [lastMessagesResults, unreadCountsResults] = await Promise.all([
        Promise.all(lastMessagesPromises),
        Promise.all(unreadCountsPromises)
      ]);

      const lastMessagesMap: Record<string, any> = {};
      lastMessagesResults.forEach(({ convId, message }) => {
        lastMessagesMap[convId] = message;
      });

      const unreadCountsMap: Record<string, number> = {};
      unreadCountsResults.forEach(({ convId, count }) => {
        unreadCountsMap[convId] = count;
      });

      // 5. Merge data
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

        const lastMsg = lastMessagesMap[c.id];

        return {
            ...c,
            other_party: other,
            last_message: lastMsg?.content || null,
            last_message_at: lastMsg?.created_at || c.updated_at,
            last_message_sender_id: lastMsg?.sender_id || null,
            unread_count: unreadCountsMap[c.id] || 0,
        };
      });

      // 6. Sort by last_message_at descending (newest first)
      processed.sort((a, b) => {
        const dateA = new Date(a.last_message_at || a.updated_at).getTime();
        const dateB = new Date(b.last_message_at || b.updated_at).getTime();
        return dateB - dateA;
      });

      setConversations(processed);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [userId, fetchConversations]);

  const handleDeleteConversation = async (convId: string) => {
    setDeleting(true);
    try {
      // Soft delete: sadece bu kullanıcı için sohbeti gizle
      const deleteColumn = userRole === 'isletme' ? 'deleted_by_business' : 'deleted_by_courier';
      
      const { error } = await supabase
        .from('conversations')
        .update({ [deleteColumn]: true })
        .eq('id', convId);
      
      if (error) {
        console.error('Conversation soft delete error:', error);
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
      alert(`Sohbet silinirken bir hata oluştu: ${err?.message || 'Bilinmeyen hata'}`);
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
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (isToday) {
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Dün';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('tr-TR', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
  };

  // Truncate last message for preview
  const truncateMessage = (msg: string | null | undefined, maxLen: number = 35): string => {
    if (!msg) return 'Henüz mesaj yok';
    if (msg.length <= maxLen) return msg;
    return msg.substring(0, maxLen) + '...';
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
          const hasUnread = (conv.unread_count || 0) > 0;
          
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
                  : hasUnread
                    ? 'bg-orange-50/40 border-l-4 border-l-orange-300 hover:bg-orange-50/70'
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
                  className="flex-1 flex items-center gap-4 min-w-0"
                >
              {/* Avatar Container - Fixed Size */}
              <div className="relative flex-shrink-0 w-14 h-14">
                <div className={`w-14 h-14 ring-2 ${isActive ? 'ring-orange-400' : hasUnread ? 'ring-orange-300' : 'ring-neutral-200'} rounded-full overflow-hidden transition-all`}>
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
                {/* Unread badge on avatar */}
                {hasUnread && !isActive && (
                  <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-[#ff7a00] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-md">
                    {(conv.unread_count || 0) > 9 ? '9+' : conv.unread_count}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <h3 className={`truncate text-base ${
                    isActive 
                      ? 'font-semibold text-orange-700' 
                      : hasUnread 
                        ? 'font-bold text-neutral-900' 
                        : 'font-semibold text-neutral-900'
                  }`}>
                    {info.name}
                  </h3>
                  <span className={`text-xs whitespace-nowrap px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-orange-100 text-orange-700 font-semibold' 
                      : hasUnread
                        ? 'bg-orange-100 text-orange-600 font-semibold'
                        : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {formatTime(conv.last_message_at || conv.updated_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${info.role === 'Kurye' ? 'bg-orange-50 text-orange-600' : 'bg-neutral-100 text-neutral-700'}`}>
                    {info.role}
                  </span>
                  <p className={`text-sm truncate ${
                    isActive 
                      ? 'text-orange-600' 
                      : hasUnread 
                        ? 'text-neutral-800 font-medium' 
                        : 'text-neutral-500'
                  }`}>
                    {conv.last_message_sender_id === userId 
                      ? `Sen: ${truncateMessage(conv.last_message, 28)}` 
                      : truncateMessage(conv.last_message)}
                  </p>
                </div>
              </div>
              
              {/* Arrow or unread dot */}
              {hasUnread && !isActive ? (
                <div className="flex-shrink-0 w-3 h-3 bg-[#ff7a00] rounded-full shadow-sm shadow-orange-400/50 animate-pulse"></div>
              ) : (
                <svg className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-orange-400' : 'text-neutral-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
