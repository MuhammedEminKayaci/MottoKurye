"use client";

import React, { useEffect, useState, useCallback } from "react";

interface BugReport {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  status: "new" | "reviewing" | "resolved" | "dismissed";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  new: { label: "Yeni", bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  reviewing: { label: "İnceleniyor", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  resolved: { label: "Çözüldü", bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  dismissed: { label: "Reddedildi", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
};

export default function HataBildirimleriPage() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/bug-reports");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message || "Veriler alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/bug-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, adminNote: adminNote || undefined }),
      });
      if (!res.ok) throw new Error("Güncellenemedi");
      setReports((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: newStatus as BugReport["status"], admin_note: adminNote || r.admin_note, updated_at: new Date().toISOString() } : r)
      );
      if (selectedReport?.id === id) {
        setSelectedReport({ ...selectedReport, status: newStatus as BugReport["status"], admin_note: adminNote || selectedReport.admin_note });
      }
    } catch {
      alert("Durum güncellenirken hata oluştu.");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const counts = {
    all: reports.length,
    new: reports.filter((r) => r.status === "new").length,
    reviewing: reports.filter((r) => r.status === "reviewing").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ff7a00]/20 border-t-[#ff7a00] rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hata Bildirimleri</h1>
        <p className="text-gray-500 text-sm mt-1">Kullanıcılardan gelen hata bildirimleri</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: "all", label: "Toplam", count: counts.all, color: "from-[#ff7a00] to-orange-400" },
          { key: "new", label: "Yeni", count: counts.new, color: "from-blue-500 to-blue-400" },
          { key: "reviewing", label: "İnceleniyor", count: counts.reviewing, color: "from-amber-500 to-amber-400" },
          { key: "resolved", label: "Çözüldü", count: counts.resolved, color: "from-green-500 to-green-400" },
          { key: "dismissed", label: "Reddedildi", count: counts.dismissed, color: "from-gray-500 to-gray-400" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`rounded-2xl p-4 border transition-all text-left ${
              filter === s.key ? "border-[#ff7a00]/40 shadow-lg shadow-[#ff7a00]/5 bg-white" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
              <span className="text-white text-xs font-bold">{s.count}</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Bu filtreye ait bildirim bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const cfg = STATUS_CONFIG[report.status];
            return (
              <div
                key={report.id}
                onClick={() => { setSelectedReport(report); setAdminNote(report.admin_note || ""); }}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#ff7a00]/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {report.first_name} {report.last_name}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{report.message}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {report.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(report.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-[#ff7a00] transition-colors shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#ff7a00] to-orange-500 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Bildirim Detayı</h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    {new Date(selectedReport.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">İsim Soyisim</p>
                  <p className="text-sm font-medium text-gray-900">{selectedReport.first_name} {selectedReport.last_name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">E-posta</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{selectedReport.email}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Hata Açıklaması</p>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReport.message}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Durum</p>
                <div className="flex flex-wrap gap-2">
                  {(["new", "reviewing", "resolved", "dismissed"] as const).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = selectedReport.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(selectedReport.id, s)}
                        disabled={updating}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all disabled:opacity-50 ${
                          isActive
                            ? `${cfg.bg} ${cfg.text} border-current`
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? cfg.dot : "bg-gray-300"}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Yönetici Notu</p>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Not ekleyin (opsiyonel)..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30 focus:border-[#ff7a00]/50 transition-all resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, selectedReport.status)}
                    disabled={updating}
                    className="px-4 py-2 bg-[#ff7a00] text-white text-xs font-semibold rounded-xl hover:bg-[#e86e00] transition-colors disabled:opacity-50"
                  >
                    {updating ? "Kaydediliyor..." : "Notu Kaydet"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
