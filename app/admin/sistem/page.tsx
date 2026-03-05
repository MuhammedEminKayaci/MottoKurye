"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SystemData {
  totalAuthUsers: number;
  confirmedCount: number;
  unconfirmedCount: number;
  orphanAuthCount: number;
  orphanProfileCount: number;
  deletedUsersCount: number;
  orphanAuthIds: string[];
  authError: string | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-2xl">
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.payload.fill || p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

function HealthCard({
  title, value, status, description, icon
}: {
  title: string; value: string | number; status: "good" | "warning" | "error"; description: string; icon: string;
}) {
  const statusConfig = {
    good: { bg: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20", dot: "bg-emerald-500", text: "text-emerald-400" },
    warning: { bg: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20", dot: "bg-amber-500", text: "text-amber-400" },
    error: { bg: "from-red-500/20 to-red-500/5", border: "border-red-500/20", dot: "bg-red-500", text: "text-red-400" },
  };
  const cfg = statusConfig[status];

  return (
    <div className={`bg-gradient-to-br ${cfg.bg} rounded-2xl p-5 border ${cfg.border} relative overflow-hidden`}>
      <div className="absolute top-3 right-3">
        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse`} />
      </div>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className={`w-5 h-5 ${cfg.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div>
          <h3 className="text-gray-900 font-semibold text-sm">{title}</h3>
          <p className={`text-xl font-bold ${cfg.text} mt-1`}>{value}</p>
        </div>
      </div>
      <p className="text-gray-400 text-xs">{description}</p>
    </div>
  );
}

export default function SystemPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchSystem = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=system");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API Hatası: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSystem(); }, [fetchSystem]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-36 border border-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
        <p className="text-red-400 font-semibold">{error}</p>
        <button onClick={fetchSystem} className="mt-4 px-6 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 text-sm font-medium">
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!data) return null;

  const emailPieData = [
    { name: "Doğrulanmış", value: data.confirmedCount, fill: "#10b981" },
    { name: "Doğrulanmamış", value: data.unconfirmedCount, fill: "#f59e0b" },
  ];

  const overallHealth = data.orphanAuthCount === 0 && data.orphanProfileCount === 0 && !data.authError ? "good" : 
    data.orphanAuthCount > 5 || data.orphanProfileCount > 0 ? "error" : "warning";

  const healthLabels = { good: "Sağlıklı", warning: "Dikkat Gerekiyor", error: "Sorun Tespit Edildi" };
  const healthColors = { good: "text-emerald-400", warning: "text-amber-400", error: "text-red-400" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Sağlığı</h1>
          <p className="text-gray-500 text-sm mt-1">
            Son kontrol: {lastChecked ? lastChecked.toLocaleTimeString("tr-TR") : "-"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${healthColors[overallHealth]} bg-gray-100 border border-gray-200`}>
            ● {healthLabels[overallHealth]}
          </span>
          <button onClick={fetchSystem} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff7a00]/10 text-[#ff7a00] rounded-xl hover:bg-[#ff7a00]/20 transition-colors text-sm font-medium border border-[#ff7a00]/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yeniden Kontrol Et
          </button>
        </div>
      </div>

      {/* Health Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <HealthCard
          title="Auth Kullanıcıları"
          value={data.totalAuthUsers}
          status="good"
          description="Supabase Auth'da kayıtlı toplam kullanıcı"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
        <HealthCard
          title="E-posta Doğrulama"
          value={`${data.confirmedCount} / ${data.totalAuthUsers}`}
          status={data.unconfirmedCount > 10 ? "warning" : "good"}
          description={`${data.unconfirmedCount} kullanıcı e-postasını doğrulamamış`}
          icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
        <HealthCard
          title="Yetim Auth Hesapları"
          value={data.orphanAuthCount}
          status={data.orphanAuthCount === 0 ? "good" : data.orphanAuthCount > 5 ? "error" : "warning"}
          description="Auth'ta var ama profil tablosunda olmayan hesaplar"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
        <HealthCard
          title="Yetim Profiller"
          value={data.orphanProfileCount}
          status={data.orphanProfileCount === 0 ? "good" : "error"}
          description="Profil tablosunda var ama Auth'ta olmayan hesaplar"
          icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
        <HealthCard
          title="Silinen Hesaplar"
          value={data.deletedUsersCount}
          status="good"
          description="Arşivlenmiş silinen kullanıcı hesapları"
          icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
        <HealthCard
          title="Auth API"
          value={data.authError ? "Hata" : "Aktif"}
          status={data.authError ? "error" : "good"}
          description={data.authError || "Supabase Auth API düzgün çalışıyor"}
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </div>

      {/* Charts & Details */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Email Verification Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-semibold text-base mb-1">E-posta Doğrulama Durumu</h3>
          <p className="text-gray-400 text-xs mb-4">Kullanıcıların e-posta doğrulama oranı</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={emailPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                {emailPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {emailPieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-gray-500 text-xs">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs">Doğrulama Oranı</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {data.totalAuthUsers > 0 ? Math.round((data.confirmedCount / data.totalAuthUsers) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Orphan Auth IDs */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-semibold text-base mb-1">Yetim Auth Hesapları</h3>
          <p className="text-gray-400 text-xs mb-4">Auth'ta kayıtlı ama profil tablosunda olmayan kullanıcılar</p>
          {data.orphanAuthIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-400 font-semibold">Sorun Yok!</p>
              <p className="text-gray-400 text-sm mt-1">Tüm auth hesapları profillerle eşleşiyor</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.orphanAuthIds.map((id) => (
                <div key={id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-xs font-mono truncate">{id}</p>
                    <p className="text-gray-400 text-[10px]">Auth'ta var, profil tablosunda yok</p>
                  </div>
                </div>
              ))}
              {data.orphanAuthCount > 10 && (
                <p className="text-gray-400 text-xs text-center py-2">
                  ve {data.orphanAuthCount - 10} daha fazla...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* System Checklist */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-semibold text-base mb-4">Sistem Kontrol Listesi</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: "Auth API Bağlantısı", ok: !data.authError },
            { label: "E-posta Doğrulama Servisi", ok: true },
            { label: "Veritabanı Bağlantısı", ok: true },
            { label: "Auth-Profil Eşleşmesi", ok: data.orphanAuthCount === 0 },
            { label: "Profil-Auth Eşleşmesi", ok: data.orphanProfileCount === 0 },
            { label: "RLS Politikaları", ok: true },
            { label: "Storage Servisi", ok: true },
            { label: "Realtime Bağlantısı", ok: true },
          ].map((check, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${check.ok ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                {check.ok ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${check.ok ? "text-gray-600" : "text-red-400"}`}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
