"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  currentUserRole: string;
}

export function ChatWindow({ conversationId, currentUserId, currentUserRole }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages and subscribe
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `conversation_id=eq.${conversationId}` 
        },
        (payload: any) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          
          // If message is from other user, mark as read
          if (newMsg.sender_id !== currentUserId) {
            markAsRead(newMsg.id); // Or mark all as read
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
      // Tüm okunmamış mesajları okundu olarak işaretle (kendi gönderdiklerim hariç)
      await markAllAsRead();
    }
    setLoading(false);
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim(),
          sender_type: currentUserRole === 'kurye' ? 'courier' : 'business'
        });

      if (error) {
        console.error("Supabase sending error:", JSON.stringify(error, null, 2));
        throw error;
      };
      
      // Update updated_at of conversation
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      setNewMessage("");
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert(`Mesaj gönderilemedi: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-orange-200 border-t-orange-500 mb-3"></div>
        <span className="text-neutral-500 font-medium">Mesajlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-orange-50/30 via-white to-neutral-50">
      {/* Chat Header - Mobile Only */}
      <div className="md:hidden px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center gap-3 shadow-md">
        <a href="/mesajlar" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div className="flex-1">
          <h3 className="font-semibold text-white">Sohbet</h3>
          <p className="text-orange-100 text-xs">{messages.length} mesaj</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-neutral-500">Henüz mesaj yok. İlk mesajı gönderin!</p>
          </div>
        )}
        
        {messages.map((msg, index) => {
          const isOwn = msg.sender_id === currentUserId;
          const showDate = index === 0 || 
            new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
          
          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="px-4 py-1.5 bg-neutral-200/60 text-neutral-600 text-xs font-medium rounded-full">
                    {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] md:max-w-[70%] px-4 py-3 text-[15px] leading-relaxed relative transition-all duration-200 ${
                    isOwn 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-orange-500/20' 
                      : 'bg-white text-neutral-800 border border-neutral-100 rounded-2xl rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className={`text-[10px] mt-2 flex items-center justify-end gap-1.5 select-none ${isOwn ? 'text-orange-200' : 'text-neutral-400'}`}>
                    {formatTime(msg.created_at)}
                    {isOwn && (
                      <span className="flex items-center">
                        {msg.is_read ? (
                          <div className="flex -space-x-1.5">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white/80 backdrop-blur-md border-t border-neutral-100 safe-area-bottom">
        <form 
          className="flex items-end gap-2 md:gap-3 w-full"
          onSubmit={handleSend}
        >
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full bg-neutral-100 border-2 border-transparent rounded-2xl px-4 md:px-5 py-3 md:py-3.5 text-base text-neutral-800 placeholder-neutral-400 focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
              placeholder="Mesajınızı yazın..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-3.5 md:p-4 rounded-2xl transition-all duration-200 shadow-lg ${
              newMessage.trim() && !sending
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 active:scale-95 shadow-orange-500/30'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
