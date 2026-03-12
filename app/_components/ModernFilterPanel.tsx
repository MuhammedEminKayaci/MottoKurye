"use client";
import React, { useState } from "react";
import { ISTANBUL_DISTRICTS } from "../../lib/istanbul-districts";
import { MultiSelect } from "./MultiSelect";

export type Role = "kurye" | "isletme";

interface FilterPanelProps {
  role: Role;
  onChange: (filters: Record<string, string>) => void;
}

// İstanbul ilçeleri kullanılacak

// Çalışma günleri seçenekleri
const WORKING_DAYS_OPTIONS = ["İzinsiz", "Haftanın 1 Günü İzin", "Haftanın 2 Günü İzin"];

// İşletme sektörleri
const BUSINESS_SECTORS = [
  "E-Ticaret ve Online Satış Firmaları",
  "Moda, Tekstil ve Aksesuar",
  "Kurumsal ve Ofis Hizmetleri",
  "Finans - Bankacılık - Sigorta",
  "Yeme-İçme",
  "Sağlık ve Medikal",
  "Teknoloji ve Elektronik",
  "Lojistik ve Depolama",
  "Çiçek & Hediyeli Eşya",
  "Otomotiv ve Yedek Parça",
];

export function FilterPanel({ role, onChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value && value.trim() !== "") {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
    return newFilters;
  };

  const handleDistrictChange = (districts: string[]) => {
    setSelectedDistricts(districts);
    const newFilters = { ...filters };
    if (districts.length > 0) {
      newFilters.district = districts.join(',');
    } else {
      delete newFilters.district;
    }
    setFilters(newFilters);
    return newFilters;
  };

  const handleApply = () => {
    // Boş değerleri temizle ve sadece dolu olanları gönder
    const cleanFilters: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        cleanFilters[key] = value;
      }
    });
    onChange(cleanFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    setSelectedDistricts([]);
    onChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(k => filters[k] && filters[k].trim() !== "").length;

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#ff7a00] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#ff6a00] transition-all flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtrele
          {activeFilterCount > 0 && (
            <span className="bg-white text-[#ff7a00] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 animate-fadeIn">
          <div className="absolute inset-x-0 top-0 bg-white rounded-b-3xl shadow-2xl animate-slideDown max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-300 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl font-bold text-black">Filtreler</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-neutral-200 hover:bg-neutral-300 rounded-full transition"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-6">
              {/* İlçe */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">İlçe</label>
                <MultiSelect
                  options={ISTANBUL_DISTRICTS}
                  value={selectedDistricts}
                  onChange={handleDistrictChange}
                  placeholder="Tüm İlçeler"
                  theme="light"
                />
              </div>

              {/* Kurye için filtreler */}
              {role === "isletme" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Çalışma Tipi</label>
                    <select
                      value={filters.working_type || ""}
                      onChange={(e) => handleFilterChange("working_type", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="Full Time" className="text-black">Full Time</option>
                      <option value="Part Time" className="text-black">Part Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Kazanç Modeli</label>
                    <select
                      value={filters.earning_model || ""}
                      onChange={(e) => handleFilterChange("earning_model", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="Saat+Paket Başı" className="text-black">Esnaf Kurye - Saatlik Ücret + Paket Başı</option>
                      <option value="Aylık Sabit" className="text-black">Esnaf Kurye - Aylık Sabit</option>
                      <option value="Paket Başı" className="text-black">Sigortalı - Aylık Sabit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Çalışma Günleri</label>
                    <select
                      value={filters.working_days || ""}
                      onChange={(e) => handleFilterChange("working_days", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      {WORKING_DAYS_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="text-black">{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Ehliyet Türü</label>
                    <select
                      value={filters.license_type || ""}
                      onChange={(e) => handleFilterChange("license_type", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="A1" className="text-black">A1</option>
                      <option value="A" className="text-black">A</option>
                      <option value="A2" className="text-black">A2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Motosiklet Durumu</label>
                    <select
                      value={filters.has_motorcycle || ""}
                      onChange={(e) => handleFilterChange("has_motorcycle", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="VAR" className="text-black">Var</option>
                      <option value="YOK" className="text-black">Yok</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Taşıma Çantası</label>
                    <select
                      value={filters.has_bag || ""}
                      onChange={(e) => handleFilterChange("has_bag", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="VAR" className="text-black">Var</option>
                      <option value="YOK" className="text-black">Yok</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">P1 Yetki Belgesi</label>
                    <select
                      value={filters.p1_certificate || ""}
                      onChange={(e) => handleFilterChange("p1_certificate", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="VAR" className="text-black">Var</option>
                      <option value="YOK" className="text-black">Yok</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">SRC Belgesi</label>
                    <select
                      value={filters.src_certificate || ""}
                      onChange={(e) => handleFilterChange("src_certificate", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="VAR" className="text-black">Var</option>
                      <option value="YOK" className="text-black">Yok</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Sabıka Kaydı</label>
                    <select
                      value={filters.criminal_record || ""}
                      onChange={(e) => handleFilterChange("criminal_record", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="VAR" className="text-black">Var</option>
                      <option value="YOK" className="text-black">Yok</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Günlük Paket Tahmini</label>
                    <select
                      value={filters.daily_package_estimate || ""}
                      onChange={(e) => handleFilterChange("daily_package_estimate", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="0-15 PAKET" className="text-black">0-15 Paket</option>
                      <option value="15-25 PAKET" className="text-black">15-25 Paket</option>
                      <option value="25-40 PAKET" className="text-black">25-40 Paket</option>
                      <option value="40 VE ÜZERİ" className="text-black">40 ve üzeri</option>
                    </select>
                  </div>
                </>
              )}

              {/* İşletme ilanları için filtreler */}
              {role === "kurye" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Sektör</label>
                    <select
                      value={filters.business_sector || ""}
                      onChange={(e) => handleFilterChange("business_sector", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      {BUSINESS_SECTORS.map((sector) => (
                        <option key={sector} value={sector} className="text-black">{sector}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Çalışma Tipi</label>
                    <select
                      value={filters.working_type || ""}
                      onChange={(e) => handleFilterChange("working_type", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="Full Time" className="text-black">Full Time</option>
                      <option value="Part Time" className="text-black">Part Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Kazanç Modeli</label>
                    <select
                      value={filters.earning_model || ""}
                      onChange={(e) => handleFilterChange("earning_model", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="Saat+Paket Başı" className="text-black">Esnaf Kurye - Saatlik Ücret + Paket Başı</option>
                      <option value="Aylık Sabit" className="text-black">Esnaf Kurye - Aylık Sabit</option>
                      <option value="Paket Başı" className="text-black">Sigortalı - Aylık Sabit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Çalışma Günleri</label>
                    <select
                      value={filters.working_days || ""}
                      onChange={(e) => handleFilterChange("working_days", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      {WORKING_DAYS_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="text-black">{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Günlük Paket Tahmini</label>
                    <select
                      value={filters.daily_package_estimate || ""}
                      onChange={(e) => handleFilterChange("daily_package_estimate", e.target.value)}
                      className="w-full h-[52px] px-4 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="0-15 PAKET" className="text-black">0-15 Paket</option>
                      <option value="15-25 PAKET" className="text-black">15-25 Paket</option>
                      <option value="25-40 PAKET" className="text-black">25-40 Paket</option>
                      <option value="40 VE ÜZERİ" className="text-black">40 ve üzeri</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition"
              >
                Temizle
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-3 bg-[#ff7a00] text-white font-semibold rounded-xl hover:bg-[#ff6a00] transition shadow-md"
              >
                Filtrele
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filter Sidebar */}
      <aside className="hidden md:block w-72 bg-black border-r-2 border-[#ff7a00] p-6 min-h-screen">
        <div className="sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Filtreler</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClear}
                className="text-sm text-[#ff7a00] hover:text-[#ff6a00] font-semibold"
              >
                Temizle
              </button>
            )}
          </div>

          <div className="space-y-5">
            {/* İlçe */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">İlçe</label>
              <MultiSelect
                options={ISTANBUL_DISTRICTS}
                value={selectedDistricts}
                onChange={(val) => {
                  const newFilters = handleDistrictChange(val);
                  onChange(newFilters);
                }}
                placeholder="Tüm İlçeler"
                theme="light"
              />
            </div>
            {role === "isletme" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Çalışma Tipi</label>
                  <select
                    value={filters.working_type || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("working_type", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="Full Time" className="text-black">Full Time</option>
                    <option value="Part Time" className="text-black">Part Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Kazanç Modeli</label>
                  <select
                    value={filters.earning_model || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("earning_model", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="Saat+Paket Başı" className="text-black">Esnaf Kurye - Saatlik Ücret + Paket Başı</option>
                    <option value="Aylık Sabit" className="text-black">Esnaf Kurye - Aylık Sabit</option>
                    <option value="Paket Başı" className="text-black">Sigortalı - Aylık Sabit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Çalışma Günleri</label>
                  <select
                    value={filters.working_days || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("working_days", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    {WORKING_DAYS_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="text-black">{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Ehliyet Türü</label>
                  <select
                    value={filters.license_type || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("license_type", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="A1" className="text-black">A1</option>
                    <option value="A" className="text-black">A</option>
                    <option value="A2" className="text-black">A2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Motosiklet Durumu</label>
                  <select
                    value={filters.has_motorcycle || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("has_motorcycle", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="VAR" className="text-black">Var</option>
                    <option value="YOK" className="text-black">Yok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Taşıma Çantası</label>
                  <select
                    value={filters.has_bag || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("has_bag", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="VAR" className="text-black">Var</option>
                    <option value="YOK" className="text-black">Yok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">P1 Yetki Belgesi</label>
                  <select
                    value={filters.p1_certificate || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("p1_certificate", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="VAR" className="text-black">Var</option>
                    <option value="YOK" className="text-black">Yok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">SRC Belgesi</label>
                  <select
                    value={filters.src_certificate || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("src_certificate", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="VAR" className="text-black">Var</option>
                    <option value="YOK" className="text-black">Yok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Sabıka Kaydı</label>
                  <select
                    value={filters.criminal_record || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("criminal_record", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="VAR" className="text-black">Var</option>
                    <option value="YOK" className="text-black">Yok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Günlük Paket Tahmini</label>
                  <select
                    value={filters.daily_package_estimate || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("daily_package_estimate", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="0-15 PAKET" className="text-black">0-15 Paket</option>
                    <option value="15-25 PAKET" className="text-black">15-25 Paket</option>
                    <option value="25-40 PAKET" className="text-black">25-40 Paket</option>
                    <option value="40 VE ÜZERİ" className="text-black">40 ve üzeri</option>
                  </select>
                </div>
              </>
            )}

            {/* İşletme ilanları için */}
            {role === "kurye" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Sektör</label>
                  <select
                    value={filters.business_sector || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("business_sector", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    {BUSINESS_SECTORS.map((sector) => (
                      <option key={sector} value={sector} className="text-black">{sector}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Çalışma Tipi</label>
                  <select
                    value={filters.working_type || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("working_type", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="Full Time" className="text-black">Full Time</option>
                    <option value="Part Time" className="text-black">Part Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Kazanç Modeli</label>
                  <select
                    value={filters.earning_model || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("earning_model", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="Saat+Paket Başı" className="text-black">Esnaf Kurye - Saatlik Ücret + Paket Başı</option>
                    <option value="Aylık Sabit" className="text-black">Esnaf Kurye - Aylık Sabit</option>
                    <option value="Paket Başı" className="text-black">Sigortalı - Aylık Sabit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Çalışma Günleri</label>
                  <select
                    value={filters.working_days || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("working_days", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    {WORKING_DAYS_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="text-black">{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Günlük Paket Tahmini</label>
                  <select
                    value={filters.daily_package_estimate || ""}
                    onChange={(e) => {
                      const newFilters = handleFilterChange("daily_package_estimate", e.target.value);
                      onChange(newFilters);
                    }}
                    className="w-full h-[52px] px-3 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="0-15 PAKET" className="text-black">0-15 Paket</option>
                    <option value="15-25 PAKET" className="text-black">15-25 Paket</option>
                    <option value="25-40 PAKET" className="text-black">25-40 Paket</option>
                    <option value="40 VE ÜZERİ" className="text-black">40 ve üzeri</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
