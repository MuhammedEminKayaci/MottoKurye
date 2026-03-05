"use client";

import React, { useEffect, useState, useCallback } from "react";

type TabType = "couriers" | "businesses";

export default function UsersPage() {
  const [tab, setTab] = useState<TabType>("couriers");
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: "users", type: tab, page: page.toString(), search });
      const res = await fetch(`/api/admin?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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

  const handleDeleteUser = async (userId: string, role: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_user", userId, role: role === "couriers" ? "kurye" : "isletme" }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Kullanıcı başarıyla silindi", type: "success" });
        setSelectedUser(null);
        fetchUsers();
      } else {
        setToast({ message: json.error || "Silme hatası", type: "error" });
      }
    } catch {
      setToast({ message: "Sunucu hatası", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlan = async (businessId: string, newPlan: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_plan", businessId, newPlan }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `Plan ${newPlan} olarak güncellendi`, type: "success" });
        fetchUsers();
        if (selectedUser) setSelectedUser({ ...selectedUser, plan: newPlan });
      } else {
        setToast({ message: json.error || "Güncelleme hatası", type: "error" });
      }
    } catch {
      setToast({ message: "Sunucu hatası", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-[slideIn_0.3s_ease] ${
          toast.type === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Toplam {total} {tab === "couriers" ? "kurye" : "işletme"}</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="İsim, sektör, il ara..."
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#ff7a00]/50 w-64"
          />
          <button type="submit" className="bg-[#ff7a00]/20 text-[#ff7a00] px-4 py-2.5 rounded-xl hover:bg-[#ff7a00]/30 transition-colors text-sm font-medium border border-[#ff7a00]/20">
            Ara
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl w-fit border border-gray-200">
        {[
          { key: "couriers" as TabType, label: "Kuryeler", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
          { key: "businesses" as TabType, label: "İşletmeler", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); setSearch(""); setSearchInput(""); }}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a00] mx-auto" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Sonuç bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {tab === "couriers" ? (
                    <>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Kurye</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Konum</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Araç</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Çalışma</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Kayıt</th>
                      <th className="text-right text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">İşlem</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">İşletme</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Sektör</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Konum</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Plan</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Kayıt</th>
                      <th className="text-right text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">İşlem</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    {tab === "couriers" ? (
                      <>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-500/20 flex-shrink-0">
                              {item.avatar_url ? (
                                <img src={item.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-emerald-400 text-xs font-bold">{(item.first_name || "K")[0]}</div>
                              )}
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">{item.first_name} {item.last_name}</p>
                              <p className="text-gray-400 text-xs">{item.gender || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{item.province || "-"}</td>
                        <td className="px-5 py-4 text-gray-600">{item.vehicle_type || "-"}</td>
                        <td className="px-5 py-4 text-gray-600">{item.working_type || "-"}</td>
                        <td className="px-5 py-4 text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString("tr-TR") : "-"}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setSelectedUser({ ...item, _type: "couriers" })} className="text-[#ff7a00] hover:text-[#ff7a00] text-xs font-medium">
                            Detay
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-violet-500/20 flex-shrink-0">
                              {item.avatar_url ? (
                                <img src={item.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-violet-400 text-xs font-bold">{(item.business_name || "İ")[0]}</div>
                              )}
                            </div>
                            <p className="text-gray-900 font-medium truncate max-w-[200px]">{item.business_name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600 truncate max-w-[160px]">{item.business_sector || "-"}</td>
                        <td className="px-5 py-4 text-gray-600">{item.province || "-"}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.plan === "premium" ? "bg-amber-500/20 text-amber-400" :
                            item.plan === "standard" ? "bg-blue-500/20 text-blue-400" :
                            "bg-slate-500/20 text-slate-400"
                          }`}>
                            {item.plan || "free"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString("tr-TR") : "-"}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setSelectedUser({ ...item, _type: "businesses" })} className="text-[#ff7a00] hover:text-[#ff7a00] text-xs font-medium">
                            Detay
                          </button>
                        </td>
                      </>
                    )}
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
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                ← Önceki
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Sonraki →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold text-lg">
                {selectedUser._type === "couriers" ? "Kurye Detayı" : "İşletme Detayı"}
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#ff7a00]/20">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ff7a00] text-2xl font-bold">
                      {selectedUser._type === "couriers" ? (selectedUser.first_name || "K")[0] : (selectedUser.business_name || "İ")[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-lg">
                    {selectedUser._type === "couriers" ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}` : selectedUser.business_name}
                  </h4>
                  <p className="text-gray-400 text-sm">{selectedUser.user_id}</p>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3">
                {selectedUser._type === "couriers" ? (
                  <>
                    <DetailItem label="Cinsiyet" value={selectedUser.gender} />
                    <DetailItem label="Yaş" value={selectedUser.age} />
                    <DetailItem label="İl" value={selectedUser.province} />
                    <DetailItem label="İlçe" value={Array.isArray(selectedUser.district) ? selectedUser.district.join(", ") : selectedUser.district} />
                    <DetailItem label="Araç" value={selectedUser.vehicle_type} />
                    <DetailItem label="Çalışma Tipi" value={selectedUser.working_type} />
                    <DetailItem label="Kazanç Modeli" value={selectedUser.earning_model} />
                    <DetailItem label="Deneyim" value={selectedUser.experience} />
                    <DetailItem label="Çanta" value={selectedUser.has_bag ? "Var" : "Yok"} />
                    <DetailItem label="SRC Belgesi" value={selectedUser.src_certificate ? "Var" : "Yok"} />
                    <DetailItem label="P1 Belgesi" value={selectedUser.p1_certificate ? "Var" : "Yok"} />
                    <DetailItem label="Kayıt Tarihi" value={selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString("tr-TR") : "-"} />
                  </>
                ) : (
                  <>
                    <DetailItem label="Sektör" value={selectedUser.business_sector} />
                    <DetailItem label="Yetkili" value={selectedUser.manager_name} />
                    <DetailItem label="İl" value={selectedUser.province} />
                    <DetailItem label="İlçe" value={Array.isArray(selectedUser.district) ? selectedUser.district.join(", ") : selectedUser.district} />
                    <DetailItem label="Çalışma Tipi" value={selectedUser.working_type} />
                    <DetailItem label="Kazanç Modeli" value={selectedUser.earning_model} />
                    <DetailItem label="Paket Tahmini" value={selectedUser.daily_package_estimate} />
                    <DetailItem label="İletişim" value={selectedUser.contact_preference} />
                    <DetailItem label="Kayıt Tarihi" value={selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString("tr-TR") : "-"} />
                    {/* Plan Management */}
                    <div className="col-span-2 bg-gray-100 rounded-xl p-4">
                      <p className="text-gray-400 text-xs font-medium mb-2">Plan Yönetimi</p>
                      <div className="flex items-center gap-2">
                        {["free", "standard", "premium"].map((plan) => (
                          <button
                            key={plan}
                            disabled={actionLoading}
                            onClick={() => handleUpdatePlan(selectedUser.id, plan)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedUser.plan === plan || (!selectedUser.plan && plan === "free")
                                ? plan === "premium" ? "bg-amber-500 text-white" :
                                  plan === "standard" ? "bg-blue-500 text-white" :
                                  "bg-slate-500 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {plan === "free" ? "Ücretsiz" : plan === "standard" ? "Standart" : "Premium"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                disabled={actionLoading}
                onClick={() => handleDeleteUser(selectedUser.user_id, selectedUser._type)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Kullanıcıyı Sil
              </button>
              <button onClick={() => setSelectedUser(null)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className="text-gray-900 text-sm font-medium truncate">{value || "-"}</p>
    </div>
  );
}
