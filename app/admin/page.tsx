"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface DashboardData {
  stats: {
    courierCount: number;
    businessCount: number;
    conversationCount: number;
    messageCount: number;
    businessAdCount: number;
    courierAdCount: number;
  };
  planDistribution: { free: number; standard: number; premium: number };
  registrationTrend: { date: string; couriers: number; businesses: number }[];
  messageTrend: { date: string; messages: number }[];
  sectorDistribution: { name: string; value: number; fullName: string }[];
  provinceMap: Record<string, { couriers: number; businesses: number }>;
  recentCouriers: any[];
  recentBusinesses: any[];
}

const PLAN_COLORS = { free: "#94a3b8", standard: "#3b82f6", premium: "#f59e0b" };
const SECTOR_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6"];

function StatCard({ title, value, icon, color, sub }: { title: string; value: number | string; icon: string; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#ff7a00]/40 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{typeof value === "number" ? value.toLocaleString("tr-TR") : value}</p>
      <p className="text-gray-500 text-sm mt-1">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-gray-500 text-xs mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/admin?action=dashboard");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API Hatası: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Dashboard verisi alınamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000); // Her 60 saniyede yenile
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-32 border border-gray-200" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 border border-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-400 font-semibold text-lg">{error}</p>
        <button onClick={fetchDashboard} className="mt-4 px-6 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors font-medium text-sm">
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { stats, planDistribution, registrationTrend, messageTrend, sectorDistribution, recentCouriers, recentBusinesses } = data;
  const totalUsers = stats.courierCount + stats.businessCount;
  const pieData = [
    { name: "Ücretsiz", value: planDistribution.free },
    { name: "Standart", value: planDistribution.standard },
    { name: "Premium", value: planDistribution.premium },
  ];
  const monthlyRevenue = (planDistribution.standard * 200) + (planDistribution.premium * 275);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Sistemin genel durumu ve istatistikleri</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff7a00]/10 text-[#ff7a00] rounded-xl hover:bg-[#ff7a00]/20 transition-colors text-sm font-medium border border-[#ff7a00]/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Toplam Kullanıcı" value={totalUsers} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" color="from-[#ff7a00] to-[#ff9a40]" sub={`${stats.courierCount} kurye • ${stats.businessCount} işletme`} />
        <StatCard title="Kuryeler" value={stats.courierCount} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" color="from-emerald-500 to-teal-600" />
        <StatCard title="İşletmeler" value={stats.businessCount} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" color="from-violet-500 to-purple-600" />
        <StatCard title="Konuşmalar" value={stats.conversationCount} icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" color="from-pink-500 to-rose-600" />
        <StatCard title="Mesajlar" value={stats.messageCount} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" color="from-amber-500 to-orange-600" />
        <StatCard title="Tahmini Gelir" value={`₺${monthlyRevenue.toLocaleString("tr-TR")}`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="from-green-500 to-emerald-600" sub="Aylık abonelik" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-semibold text-base mb-1">Kayıt Trendi</h3>
          <p className="text-gray-400 text-xs mb-6">Son 7 günlük yeni kullanıcı kayıtları</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={registrationTrend}>
              <defs>
                <linearGradient id="colorCouriers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBusinesses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
              <Area type="monotone" dataKey="couriers" name="Kuryeler" stroke="#10b981" fill="url(#colorCouriers)" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} />
              <Area type="monotone" dataKey="businesses" name="İşletmeler" stroke="#8b5cf6" fill="url(#colorBusinesses)" strokeWidth={2.5} dot={{ r: 4, fill: "#8b5cf6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Message Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-semibold text-base mb-1">Mesaj Trafiği</h3>
          <p className="text-gray-400 text-xs mb-6">Son 7 günlük mesaj hacmi</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={messageTrend}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="messages" name="Mesajlar" fill="url(#colorMessages)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-semibold text-base mb-1">Plan Dağılımı</h3>
          <p className="text-gray-400 text-xs mb-4">İşletme abonelik planları</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={Object.values(PLAN_COLORS)[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: Object.values(PLAN_COLORS)[i] }} />
                <span className="text-gray-500 text-xs">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-semibold text-base mb-1">Sektör Dağılımı</h3>
          <p className="text-gray-400 text-xs mb-6">İşletme sektörleri</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectorDistribution} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="İşletme" radius={[0, 6, 6, 0]} maxBarSize={24}>
                {sectorDistribution.map((_, i) => (
                  <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Couriers */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-semibold text-base mb-4">Son Kayıt Olan Kuryeler</h3>
          <div className="space-y-3">
            {recentCouriers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Henüz kurye yok</p>
            ) : (
              recentCouriers.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-500/20 flex-shrink-0">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-400 text-sm font-bold">
                        {(c.first_name || "K")[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{c.first_name} {c.last_name}</p>
                    <p className="text-gray-400 text-xs">{c.province || "Konum belirtilmemiş"}</p>
                  </div>
                  <span className="text-gray-400 text-[10px] whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Businesses */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-semibold text-base mb-4">Son Kayıt Olan İşletmeler</h3>
          <div className="space-y-3">
            {recentBusinesses.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Henüz işletme yok</p>
            ) : (
              recentBusinesses.map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-violet-500/20 flex-shrink-0">
                    {b.avatar_url ? (
                      <img src={b.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-violet-400 text-sm font-bold">
                        {(b.business_name || "İ")[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{b.business_name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 text-xs truncate">{b.business_sector}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        b.plan === "premium" ? "bg-amber-500/20 text-amber-400" :
                        b.plan === "standard" ? "bg-blue-500/20 text-blue-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {b.plan || "free"}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-[10px] whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* İlan istatistikleri */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.businessAdCount}</p>
              <p className="text-gray-500 text-sm">İşletme İlanları</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.courierAdCount}</p>
              <p className="text-gray-500 text-sm">Kurye İlanları</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
