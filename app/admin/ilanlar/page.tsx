"use client";

import React, { useEffect, useState, useCallback } from "react";

type TabType = "business_ads" | "courier_ads";

export default function ListingsPage() {
  const [tab, setTab] = useState<TabType>("business_ads");
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: "listings", type: tab, page: page.toString() });
      const res = await fetch(`/api/admin?${params}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Listings API error:", errData.error || res.statusText);
        setData([]);
        return;
      }
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error("Listings fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleDelete = async (listingId: string) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_listing", listingId, type: tab }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "İlan silindi", type: "success" });
        setSelectedListing(null);
        fetchListings();
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
          <h1 className="text-2xl font-bold text-gray-900">İlan Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Toplam {total} {tab === "business_ads" ? "işletme ilanı" : "kurye ilanı"}</p>
        </div>
        <button onClick={fetchListings} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff7a00]/10 text-[#ff7a00] rounded-xl hover:bg-[#ff7a00]/20 transition-colors text-sm font-medium border border-[#ff7a00]/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yenile
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl w-fit border border-gray-200">
        {[
          { key: "business_ads" as TabType, label: "İşletme İlanları", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
          { key: "courier_ads" as TabType, label: "Kurye İlanları", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-[#ff7a00]/20 text-[#ff7a00]" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <p className="text-gray-400">Henüz ilan yok</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all group cursor-pointer"
              onClick={() => setSelectedListing(item)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-semibold text-sm truncate">
                    {item.title || item.business_name || "İlan"}
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {item.business_sector || item.vehicle_type || ""}
                  </p>
                </div>
                {item.is_active !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    item.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {item.is_active ? "Aktif" : "Pasif"}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs">
                {item.province && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {item.province} {item.district ? `/ ${Array.isArray(item.district) ? item.district.slice(0, 2).join(", ") : item.district}` : ""}
                  </div>
                )}
                {item.working_type && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.working_type}
                  </div>
                )}
                {item.earning_model && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" />
                    </svg>
                    <span className="truncate">{item.earning_model}</span>
                  </div>
                )}
                {item.description && (
                  <p className="text-gray-400 line-clamp-2 mt-2">{item.description}</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <span className="text-gray-400 text-[10px]">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString("tr-TR") : ""}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  disabled={actionLoading}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="İlanı Sil"
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
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs">Sayfa {page} / {totalPages} — Toplam {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl text-sm bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors border border-gray-200">
              ← Önceki
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl text-sm bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors border border-gray-200">
              Sonraki →
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedListing(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold text-lg">İlan Detayı</h3>
              <button onClick={() => setSelectedListing(null)} className="text-gray-400 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedListing).map(([key, value]) => {
                  if (key === "id" || key === "user_id" || !value) return null;
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                  const displayValue = typeof value === "boolean" ? (value ? "Evet" : "Hayır") :
                    Array.isArray(value) ? value.join(", ") :
                    key.includes("_at") && typeof value === "string" ? new Date(value).toLocaleString("tr-TR") :
                    String(value);
                  return (
                    <div key={key} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium mb-1">{label}</p>
                      <p className="text-gray-900 text-sm break-words">{displayValue}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => handleDelete(selectedListing.id)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 text-sm font-medium border border-red-500/20 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                İlanı Sil
              </button>
              <button onClick={() => setSelectedListing(null)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
