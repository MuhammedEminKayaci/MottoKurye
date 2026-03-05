"use client";

import React, { useEffect, useState, useCallback } from "react";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [convDetail, setConvDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?action=messages&page=${page}`);
      const json = await res.json();
      setConversations(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const openConversation = async (convId: string) => {
    setSelectedConv(convId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin?action=messages&conversation_id=${convId}`);
      const json = await res.json();
      setConvDetail(json);
    } catch {
      setConvDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_message", messageId }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Mesaj silindi", type: "success" });
        if (selectedConv) openConversation(selectedConv);
      } else {
        setToast({ message: json.error, type: "error" });
      }
    } catch {
      setToast({ message: "Hata oluştu", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm("Bu konuşmayı ve tüm mesajlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_conversation", conversationId: convId }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Konuşma silindi", type: "success" });
        setSelectedConv(null);
        setConvDetail(null);
        fetchConversations();
      } else {
        setToast({ message: json.error, type: "error" });
      }
    } catch {
      setToast({ message: "Hata oluştu", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium ${
          toast.type === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesaj Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Toplam {total} konuşma</p>
        </div>
        <button onClick={fetchConversations} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff7a00]/10 text-[#ff7a00] rounded-xl hover:bg-[#ff7a00]/20 transition-colors text-sm font-medium border border-[#ff7a00]/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yenile
        </button>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a00] mx-auto" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Henüz konuşma yok</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedConv === conv.id ? "bg-[#ff7a00]/5 border-l-2 border-l-[#ff7a00]" : ""
                }`}
                onClick={() => openConversation(conv.id)}
              >
                {/* Participants */}
                <div className="flex -space-x-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-violet-500/20 border-2 border-white z-10">
                    {conv.business_avatar ? (
                      <img src={conv.business_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-violet-400 text-xs font-bold">{(conv.business_name || "İ")[0]}</div>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-500/20 border-2 border-white">
                    {conv.courier_avatar ? (
                      <img src={conv.courier_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-400 text-xs font-bold">{(conv.courier_name || "K")[0]}</div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 text-sm font-medium truncate">{conv.business_name}</p>
                    <span className="text-gray-400">↔</span>
                    <p className="text-gray-900 text-sm font-medium truncate">{conv.courier_name}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-400 text-xs">{conv.message_count} mesaj</span>
                    {conv.unread_count > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {conv.unread_count} okunmamış
                      </span>
                    )}
                  </div>
                </div>

                {/* Time + Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-gray-400 text-xs">
                    {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString("tr-TR") : ""}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                    disabled={actionLoading}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Konuşmayı Sil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
            <p className="text-gray-400 text-xs">Sayfa {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition-colors">
                ← Önceki
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition-colors">
                Sonraki →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Detail Modal */}
      {selectedConv && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedConv(null); setConvDetail(null); }}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              {convDetail ? (
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-gray-900 font-semibold">
                      {convDetail.businessInfo?.business_name || "İşletme"} ↔ {convDetail.courierInfo ? `${convDetail.courierInfo.first_name || ""} ${convDetail.courierInfo.last_name || ""}` : "Kurye"}
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">{convDetail.messages?.length || 0} mesaj</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-900 font-semibold">Konuşma Detayı</div>
              )}
              <button onClick={() => { setSelectedConv(null); setConvDetail(null); }} className="text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-0">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a00]" />
                </div>
              ) : !convDetail?.messages?.length ? (
                <p className="text-gray-400 text-center py-12">Mesaj yok</p>
              ) : (
                convDetail.messages.map((msg: any) => {
                  const isBusinessSender = msg.sender_id === convDetail.conversation?.business_id;
                  const senderName = isBusinessSender
                    ? convDetail.businessInfo?.business_name || "İşletme"
                    : `${convDetail.courierInfo?.first_name || ""} ${convDetail.courierInfo?.last_name || ""}`.trim() || "Kurye";

                  return (
                    <div key={msg.id} className={`flex gap-3 group ${isBusinessSender ? "" : "flex-row-reverse"}`}>
                      <div className={`max-w-[70%] ${isBusinessSender ? "" : "text-right"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold ${isBusinessSender ? "text-violet-400" : "text-emerald-400"}`}>
                            {senderName}
                          </span>
                          <span className="text-gray-400 text-[10px]">
                            {new Date(msg.created_at).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                          </span>
                          {msg.is_read && <span className="text-[#ff7a00] text-[10px]">✓✓</span>}
                        </div>
                        <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm ${
                          isBusinessSender
                            ? "bg-violet-500/10 text-violet-700 rounded-tl-sm"
                            : "bg-emerald-500/10 text-emerald-700 rounded-tr-sm"
                        }`}>
                          {msg.content}
                        </div>
                        {/* Delete message button - visible on hover */}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          disabled={actionLoading}
                          className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded text-gray-400 hover:text-red-400 transition-all"
                          title="Mesajı sil"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => selectedConv && handleDeleteConversation(selectedConv)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 text-xs font-medium border border-red-500/20 disabled:opacity-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Tüm Konuşmayı Sil
              </button>
              <button onClick={() => { setSelectedConv(null); setConvDetail(null); }} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
