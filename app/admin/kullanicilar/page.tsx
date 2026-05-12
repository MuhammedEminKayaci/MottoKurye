"use client";

import React, { useEffect, useState, useCallback } from "react";

type TabType = "couriers" | "businesses" | "auth";

const formatList = (value: any, separator = ", ") => {
  if (!value) return "-";
  if (Array.isArray(value)) return value.length ? value.join(separator) : "-";
  if (typeof value === "string") return value.trim() || "-";
  return String(value);
};

const formatWorkingDays = (value: any) => formatList(
  typeof value === "string" ? value.split(",").map((day) => day.trim()).filter(Boolean) : value,
  " - "
);

const formatBoolLike = (value: any) => {
  if (value === true || value === "VAR") return "Var";
  if (value === false || value === "YOK") return "Yok";
  return value || "-";
};

const formatContactPreference = (value: any) => {
  if (value === "phone") return "Telefon";
  if (value === "in_app") return "Uygulama içi";
  if (value === "both") return "Telefon + uygulama içi";
  return value || "-";
};

const formatDateTime = (value: any) => value ? new Date(value).toLocaleString("tr-TR") : "-";

const getProfilelessReason = (user: any) => {
  if (!user?.email_confirmed_at) return "E-posta doğrulaması bekliyor";
  return "Profil formu tamamlanmamış";
};

export default function UsersPage() {
  const [tab, setTab] = useState<TabType>("couriers");
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({ action: "users", type: tab, page: page.toString(), search });
      const res = await fetch(`/api/admin?${params}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = json.error || `API Hatası: ${res.status} ${res.statusText}`;
        console.error("Users API error:", message);
        setErrorMessage(message);
        setData([]);
        setTotal(0);
        return;
      }
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err: any) {
      console.error("Users fetch error:", err);
      setErrorMessage(err?.message || "Sunucu hatası");
      setData([]);
      setTotal(0);
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
      const roleValue = role === "couriers" ? "kurye" : role === "businesses" ? "isletme" : "auth";
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_user", userId, role: roleValue }),
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
          <p className="text-gray-500 text-sm mt-1">
            Toplam {total} {tab === "couriers" ? "kurye" : tab === "businesses" ? "işletme" : "profilsiz kayıt"}
          </p>
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
          { key: "auth" as TabType, label: "Profilsiz Kayıtlar", icon: "M16 12H8m4 0l-4 4m4-4l-4-4" },
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
        ) : errorMessage ? (
          <div className="p-12 text-center text-red-500">
            <p className="font-semibold mb-3">{errorMessage}</p>
            <button onClick={fetchUsers} className="px-4 py-2 rounded-xl bg-[#ff7a00]/10 text-[#ff7a00] hover:bg-[#ff7a00]/20 transition-colors text-sm">
              Tekrar Dene
            </button>
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
                  ) : tab === "businesses" ? (
                    <>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">İşletme</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Sektör</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Konum</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Plan</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Kayıt</th>
                      <th className="text-right text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">İşlem</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">E-posta</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Rol</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Durum</th>
                      <th className="text-left text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">Kayıt</th>
                      <th className="text-right text-gray-400 font-medium px-5 py-4 text-xs uppercase tracking-wider">İşlem</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item: any) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedUser({ ...item, _type: tab })}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
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
                          <button onClick={(e) => { e.stopPropagation(); setSelectedUser({ ...item, _type: "couriers" }); }} className="text-[#ff7a00] hover:text-[#ff7a00] text-xs font-medium">
                            Detay
                          </button>
                        </td>
                      </>
                    ) : tab === "businesses" ? (
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
                          <button onClick={(e) => { e.stopPropagation(); setSelectedUser({ ...item, _type: "businesses" }); }} className="text-[#ff7a00] hover:text-[#ff7a00] text-xs font-medium">
                            Detay
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4 text-gray-900">{item.email}</td>
                        <td className="px-5 py-4 text-gray-600">{item.user_metadata?.role || "-"}</td>
                        <td className="px-5 py-4 text-gray-600">{getProfilelessReason(item)}</td>
                        <td className="px-5 py-4 text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString("tr-TR") : "-"}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedUser({ ...item, _type: "auth" }); }} className="text-[#ff7a00] hover:text-[#ff7a00] text-xs font-medium">
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
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-5xl max-h-[88vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold text-lg">
                {selectedUser._type === "couriers" ? "Kurye Detayı" : selectedUser._type === "businesses" ? "İşletme Detayı" : "Profilsiz Kayıt Detayı"}
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
                  {selectedUser._type === "auth" ? (
                    <div className="w-full h-full flex items-center justify-center text-[#ff7a00] text-2xl font-bold">@</div>
                  ) : selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ff7a00] text-2xl font-bold">
                      {selectedUser._type === "couriers" ? (selectedUser.first_name || "K")[0] : (selectedUser.business_name || "İ")[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-lg">
                    {selectedUser._type === "couriers"
                      ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`
                      : selectedUser._type === "businesses"
                        ? selectedUser.business_name
                        : selectedUser.email}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {selectedUser._type === "auth" ? selectedUser.user_metadata?.role || "Profilsiz kayıt" : selectedUser.user_id}
                  </p>
                </div>
              </div>

              {selectedUser._type === "couriers" ? (
                <div className="space-y-5">
                  <DetailSection title="Kimlik ve İletişim">
                    <DetailItem label="Ad Soyad" value={`${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim()} />
                    <DetailItem label="Telefon" value={selectedUser.phone} />
                    <DetailItem label="İletişim Tercihi" value={formatContactPreference(selectedUser.contact_preference)} />
                    <DetailItem label="Cinsiyet" value={selectedUser.gender} />
                    <DetailItem label="Yaş" value={selectedUser.age} />
                    <DetailItem label="Uyruk" value={selectedUser.nationality} />
                  </DetailSection>
                  <DetailSection title="Çalışma Profili">
                    <DetailItem label="İl" value={selectedUser.province} />
                    <DetailItem label="İlçe" value={formatList(selectedUser.district)} />
                    <DetailItem label="Çalışma Tipi" value={selectedUser.working_type} />
                    <DetailItem label="Kazanç Modeli" value={selectedUser.earning_model} />
                    <DetailItem label="Günlük Paket Tahmini" value={selectedUser.daily_package_estimate} />
                    <DetailItem label="Çalışma Günleri" value={formatWorkingDays(selectedUser.working_days)} />
                    <DetailItem label="Deneyim" value={selectedUser.experience} />
                    <DetailItem label="Teklif Durumu" value={selectedUser.is_accepting_offers === false ? "Kapalı" : "Açık"} />
                  </DetailSection>
                  <DetailSection title="Araç ve Belgeler">
                    <DetailItem label="Araç" value={selectedUser.vehicle_type} />
                    <DetailItem label="Ehliyet Türü" value={selectedUser.license_type} />
                    <DetailItem label="Motorsiklet" value={formatBoolLike(selectedUser.has_motorcycle)} />
                    <DetailItem label="Marka" value={selectedUser.moto_brand} />
                    <DetailItem label="Motor CC" value={selectedUser.moto_cc} />
                    <DetailItem label="Taşıma Çantası" value={formatBoolLike(selectedUser.has_bag)} />
                    <DetailItem label="P1 Yetki Belgesi" value={formatBoolLike(selectedUser.p1_certificate)} />
                    <DetailItem label="SRC Belgesi" value={formatBoolLike(selectedUser.src_certificate)} />
                    <DetailItem label="Sabıka Kaydı" value={formatBoolLike(selectedUser.criminal_record)} />
                    <DetailItem label="Ehliyet Dosyası" value={selectedUser.license_file_url} isLink />
                    <DetailItem label="P1 Dosyası" value={selectedUser.p1_certificate_file_url} isLink />
                    <DetailItem label="SRC Dosyası" value={selectedUser.src_certificate_file_url} isLink />
                    <DetailItem label="Sabıka Kaydı Dosyası" value={selectedUser.criminal_record_file_url} isLink />
                  </DetailSection>
                  <DetailSection title="Sistem">
                    <DetailItem label="Profil ID" value={selectedUser.id} />
                    <DetailItem label="Kullanıcı ID" value={selectedUser.user_id} />
                    <DetailItem label="Kayıt Tarihi" value={formatDateTime(selectedUser.created_at)} />
                    <DetailItem label="Güncelleme Tarihi" value={formatDateTime(selectedUser.updated_at)} />
                  </DetailSection>
                </div>
              ) : selectedUser._type === "businesses" ? (
                <div className="space-y-5">
                  <DetailSection title="İşletme Bilgileri">
                    <DetailItem label="İşletme Adı" value={selectedUser.business_name} />
                    <DetailItem label="Sektör" value={selectedUser.business_sector} />
                    <DetailItem label="Yetkili" value={selectedUser.manager_name} />
                    <DetailItem label="Yetkili Telefonu" value={selectedUser.manager_contact} />
                    <DetailItem label="İletişim Tercihi" value={formatContactPreference(selectedUser.contact_preference)} />
                    <DetailItem label="Kurye Arayışı" value={selectedUser.seeking_couriers === false ? "Kapalı" : "Açık"} />
                  </DetailSection>
                  <DetailSection title="Çalışma Profili">
                    <DetailItem label="İl" value={selectedUser.province} />
                    <DetailItem label="İlçe" value={formatList(selectedUser.district)} />
                    <DetailItem label="Çalışma Tipi" value={selectedUser.working_type} />
                    <DetailItem label="Kazanç Modeli" value={selectedUser.earning_model} />
                    <DetailItem label="Günlük Paket Tahmini" value={selectedUser.daily_package_estimate} />
                    <DetailItem label="Çalışma Günleri" value={formatWorkingDays(selectedUser.working_days)} />
                    <DetailItem label="Hizmet Tipi" value={selectedUser.service_type} />
                  </DetailSection>
                  <DetailSection title="Plan ve Kullanım">
                    <DetailItem label="Plan" value={selectedUser.plan || "free"} />
                    <DetailItem label="Toplam Mesaj" value={selectedUser.messages_sent_total} />
                    <DetailItem label="Bugünkü Onay" value={selectedUser.approvals_today} />
                    <DetailItem label="Son Sıfırlama" value={formatDateTime(selectedUser.last_usage_reset)} />
                    <DetailItem label="Plan Güncelleme" value={formatDateTime(selectedUser.plan_updated_at)} />
                    <div className="bg-gray-100 rounded-xl p-4 sm:col-span-2 lg:col-span-3">
                      <p className="text-gray-400 text-xs font-medium mb-2">Plan Yönetimi</p>
                      <div className="flex flex-wrap items-center gap-2">
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
                                : "bg-white text-gray-500 hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            {plan === "free" ? "Ücretsiz" : plan === "standard" ? "Standart" : "Premium"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </DetailSection>
                  <DetailSection title="Sistem">
                    <DetailItem label="Profil ID" value={selectedUser.id} />
                    <DetailItem label="Kullanıcı ID" value={selectedUser.user_id} />
                    <DetailItem label="Kayıt Tarihi" value={formatDateTime(selectedUser.created_at)} />
                    <DetailItem label="Güncelleme Tarihi" value={formatDateTime(selectedUser.updated_at)} />
                  </DetailSection>
                </div>
              ) : (
                <DetailSection title="Profilsiz Kayıt">
                  <DetailItem label="Rol" value={selectedUser.user_metadata?.role || "Bilinmiyor"} />
                  <DetailItem label="E-posta" value={selectedUser.email} />
                  <DetailItem label="Telefon" value={selectedUser.phone || "-"} />
                  <DetailItem label="E-posta Durumu" value={selectedUser.email_confirmed_at ? "Doğrulandı" : "Doğrulama bekliyor"} />
                  <DetailItem label="Kayıt Tarihi" value={formatDateTime(selectedUser.created_at)} />
                  <DetailItem label="Son Giriş" value={formatDateTime(selectedUser.last_sign_in_at)} />
                  <DetailItem label="Durum" value={getProfilelessReason(selectedUser)} />
                  <DetailItem label="Not" value="Bu kullanıcı auth sisteminde var ancak couriers veya businesses tablosunda profil satırı yok." />
                </DetailSection>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                disabled={actionLoading}
                onClick={() => handleDeleteUser(selectedUser._type === "auth" ? selectedUser.id : selectedUser.user_id, selectedUser._type)}
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

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h5 className="text-gray-900 font-semibold text-sm mb-3">{title}</h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
    </section>
  );
}

function DetailItem({ label, value, isLink = false }: { label: string; value: any; isLink?: boolean }) {
  const displayValue = value || "-";
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium mb-1">{label}</p>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-[#ff7a00] text-sm font-medium break-all hover:underline">
          Dosyayı aç
        </a>
      ) : (
        <p className="text-gray-900 text-sm font-medium break-words">{displayValue}</p>
      )}
    </div>
  );
}
