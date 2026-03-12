"use client";

import React, { useEffect, useState, useCallback } from "react";

type FilterType = "all" | "has_file" | "pending" | "approved" | "rejected";
type DocStatus = "Beklemede" | "Onaylandı" | "Reddedildi";

interface CourierDoc {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  province: string | null;
  created_at: string;
  p1_certificate: string | null;
  src_certificate: string | null;
  criminal_record: string | null;
  p1_certificate_file_url: string | null;
  src_certificate_file_url: string | null;
  criminal_record_file_url: string | null;
}

interface Stats {
  total: number;
  withFiles: number;
  pendingReview: number;
  approved: number;
  rejected: number;
}

const DOC_LABELS: Record<string, string> = {
  p1_certificate: "P1 Yetki Belgesi",
  src_certificate: "SRC Belgesi",
  criminal_record: "Sabıka Kaydı",
};

const DOC_FILE_FIELDS: Record<string, string> = {
  p1_certificate: "p1_certificate_file_url",
  src_certificate: "src_certificate_file_url",
  criminal_record: "criminal_record_file_url",
};

const STATUS_STYLES: Record<string, string> = {
  "Onaylandı": "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  "Reddedildi": "bg-red-500/15 text-red-600 border-red-500/25",
  "Beklemede": "bg-amber-500/15 text-amber-600 border-amber-500/25",
  "Var": "bg-blue-500/15 text-blue-600 border-blue-500/25",
  "Yok": "bg-gray-200/60 text-gray-400 border-gray-300/50",
};

function getStatusStyle(val: string | null) {
  if (!val) return STATUS_STYLES["Yok"];
  return STATUS_STYLES[val] || STATUS_STYLES["Var"];
}

function getStatusLabel(val: string | null) {
  if (!val) return "Yok";
  return val;
}

export default function BelgelerPage() {
  const [data, setData] = useState<CourierDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, withFiles: 0, pendingReview: 0, approved: 0, rejected: 0 });
  const [selectedCourier, setSelectedCourier] = useState<CourierDoc | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ url: string; label: string } | null>(null);
  const [viewingSignedUrl, setViewingSignedUrl] = useState<string | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [viewingError, setViewingError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: "documents", page: page.toString(), search, filter });
      const res = await fetch(`/api/admin?${params}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Documents API error:", errData.error || res.statusText);
        setData([]);
        return;
      }
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
      if (json.stats) setStats(json.stats);
    } catch (err) {
      console.error("Documents fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // Belge görüntüleme açıldığında signed URL al
  useEffect(() => {
    if (!viewingDoc) {
      setViewingSignedUrl(null);
      setViewingError(false);
      return;
    }
    let cancelled = false;
    setViewingLoading(true);
    setViewingError(false);
    setViewingSignedUrl(null);

    const fetchSignedUrl = async () => {
      try {
        const params = new URLSearchParams({ action: "document_signed_url", url: viewingDoc.url });
        const res = await fetch(`/api/admin?${params}`);
        if (!res.ok) throw new Error("Signed URL alınamadı");
        const json = await res.json();
        if (!cancelled && json.signedUrl) {
          setViewingSignedUrl(json.signedUrl);
        } else if (!cancelled) {
          setViewingError(true);
        }
      } catch {
        if (!cancelled) setViewingError(true);
      } finally {
        if (!cancelled) setViewingLoading(false);
      }
    };
    fetchSignedUrl();
    return () => { cancelled = true; };
  }, [viewingDoc]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleUpdateStatus = async (courierId: string, field: string, status: DocStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_document_status", courierId, field, status }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `${DOC_LABELS[field]} → ${status}`, type: "success" });
        fetchDocuments();
        if (selectedCourier && selectedCourier.id === courierId) {
          setSelectedCourier((prev) => prev ? { ...prev, [field]: status } : null);
        }
      } else {
        setToast({ message: json.error || "Güncelleme hatası", type: "error" });
      }
    } catch {
      setToast({ message: "Sunucu hatası", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const hasAnyDocument = (c: CourierDoc) => !!(c.p1_certificate_file_url || c.src_certificate_file_url || c.criminal_record_file_url);

  const getDocCount = (c: CourierDoc) => {
    let count = 0;
    if (c.p1_certificate_file_url) count++;
    if (c.src_certificate_file_url) count++;
    if (c.criminal_record_file_url) count++;
    return count;
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-[slideIn_0.3s_ease] ${
          toast.type === "success" ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30" : "bg-red-500/20 text-red-500 border border-red-500/30"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belge Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Kuryelerin yüklediği belgeleri kontrol edin</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="İsim veya il ara..."
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#ff7a00]/50 w-64"
          />
          <button type="submit" className="bg-[#ff7a00]/20 text-[#ff7a00] px-4 py-2.5 rounded-xl hover:bg-[#ff7a00]/30 transition-colors text-sm font-medium border border-[#ff7a00]/20">
            Ara
          </button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Toplam Kurye", value: stats.total, color: "text-gray-900", bg: "bg-gray-50" },
          { label: "Dosya Yüklemiş", value: stats.withFiles, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Beklemede", value: stats.pendingReview, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Onaylanmış", value: stats.approved, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Reddedilmiş", value: stats.rejected, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl w-fit border border-gray-200 flex-wrap">
        {[
          { key: "all" as FilterType, label: "Tümü", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
          { key: "has_file" as FilterType, label: "Dosya Yüklemiş", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
          { key: "pending" as FilterType, label: "Beklemede", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { key: "approved" as FilterType, label: "Onaylı", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { key: "rejected" as FilterType, label: "Reddedilmiş", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              filter === key ? "bg-[#ff7a00]/20 text-[#ff7a00]" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a00] mx-auto" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Sonuç bulunamadı
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Kurye</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Konum</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">SRC</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Sabıka</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">P1 Yetki</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Dosya</th>
                  <th className="text-right text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-500/20 flex-shrink-0">
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-emerald-500 text-xs font-bold">
                              {(item.first_name || "K")[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{item.first_name} {item.last_name}</p>
                          <p className="text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString("tr-TR") : "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.province || "-"}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyle(item.src_certificate)}`}>
                        {getStatusLabel(item.src_certificate)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyle(item.criminal_record)}`}>
                        {getStatusLabel(item.criminal_record)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyle(item.p1_certificate)}`}>
                        {getStatusLabel(item.p1_certificate)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {hasAnyDocument(item) ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {getDocCount(item)}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedCourier(item)}
                        className="text-[#ff7a00] hover:text-[#e86e00] text-xs font-medium transition-colors"
                      >
                        İncele
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
            <p className="text-gray-400 text-xs">Sayfa {page} / {totalPages} — Toplam {total} sonuç</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                ← Önceki
              </button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Sonraki →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setViewingDoc(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold">{viewingDoc.label}</h3>
              <div className="flex items-center gap-2">
                {viewingSignedUrl && (
                  <a
                    href={viewingSignedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Yeni Sekmede Aç
                  </a>
                )}
                <button onClick={() => setViewingDoc(null)} className="text-gray-400 hover:text-gray-900 transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center min-h-[400px]">
              {viewingLoading && (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a00]" />
                  <p className="text-gray-400 text-sm">Belge yükleniyor...</p>
                </div>
              )}
              {viewingError && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Belge yüklenemedi</p>
                  <a
                    href={viewingDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 px-4 py-2 rounded-lg bg-[#ff7a00]/15 text-[#ff7a00] text-xs font-medium hover:bg-[#ff7a00]/25 transition-colors"
                  >
                    Doğrudan Bağlantıyı Dene
                  </a>
                </div>
              )}
              {viewingSignedUrl && !viewingLoading && !viewingError && (
                <>
                  {viewingDoc.url.toLowerCase().match(/\.pdf(\?|$)/) ? (
                    <iframe
                      src={viewingSignedUrl}
                      className="w-full h-full min-h-[500px] rounded-lg border border-gray-200"
                      title={viewingDoc.label}
                    />
                  ) : (
                    <img
                      src={viewingSignedUrl}
                      alt={viewingDoc.label}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      onError={() => setViewingError(true)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Courier Detail Modal */}
      {selectedCourier && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCourier(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#ff7a00]/15">
                  {selectedCourier.avatar_url ? (
                    <img src={selectedCourier.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ff7a00] text-lg font-bold">
                      {(selectedCourier.first_name || "K")[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-lg">
                    {selectedCourier.first_name} {selectedCourier.last_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-gray-400 text-xs">{selectedCourier.province || "Konum belirtilmemiş"}</p>
                    {selectedCourier.phone && <p className="text-gray-400 text-xs">• {selectedCourier.phone}</p>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCourier(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Document Cards */}
            <div className="p-6 space-y-4">
              {(["src_certificate", "criminal_record", "p1_certificate"] as const).map((field) => {
                const fileUrlField = DOC_FILE_FIELDS[field] as keyof CourierDoc;
                const fileUrl = selectedCourier[fileUrlField] as string | null;
                const statusVal = selectedCourier[field as keyof CourierDoc] as string | null;

                return (
                  <div key={field} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          field === "src_certificate" ? "bg-blue-500/15 text-blue-600" :
                          field === "criminal_record" ? "bg-purple-500/15 text-purple-600" :
                          "bg-amber-500/15 text-amber-600"
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={
                              field === "src_certificate"
                                ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                : field === "criminal_record"
                                ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                : "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                            } />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium text-sm">{DOC_LABELS[field]}</p>
                          <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyle(statusVal)}`}>
                            {getStatusLabel(statusVal)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {fileUrl && (
                          <button
                            onClick={() => setViewingDoc({ url: fileUrl, label: DOC_LABELS[field] })}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors text-xs font-medium border border-blue-500/20"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Görüntüle
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Update Buttons */}
                    {fileUrl && (
                      <div className="px-5 py-3 bg-white/50 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 text-xs mr-2">Durumu güncelle:</span>
                        {(["Beklemede", "Onaylandı", "Reddedildi"] as DocStatus[]).map((s) => (
                          <button
                            key={s}
                            disabled={actionLoading || statusVal === s}
                            onClick={() => handleUpdateStatus(selectedCourier.id, field, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${
                              statusVal === s
                                ? s === "Onaylandı" ? "bg-emerald-500 text-white border-emerald-500"
                                  : s === "Reddedildi" ? "bg-red-500 text-white border-red-500"
                                  : "bg-amber-500 text-white border-amber-500"
                                : s === "Onaylandı" ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                  : s === "Reddedildi" ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                  : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            {s === "Onaylandı" && (
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Onayla
                              </span>
                            )}
                            {s === "Reddedildi" && (
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Reddet
                              </span>
                            )}
                            {s === "Beklemede" && (
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Beklet
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No file uploaded message */}
                    {!fileUrl && (
                      <div className="px-5 py-3 bg-white/50 border-t border-gray-100">
                        <p className="text-gray-400 text-xs flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Dosya yüklenmemiş
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200">
              <button onClick={() => setSelectedCourier(null)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
