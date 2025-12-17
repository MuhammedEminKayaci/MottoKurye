"use client";
import React, { useState } from "react";

export type Role = "kurye" | "isletme";

interface FilterPanelProps {
  role: Role;
  onChange: (filters: Record<string, string>) => void;
}

// İl listesi
const PROVINCES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

// İlçe listeleri (basitleştirilmiş - en büyük illerin ilçeleri)
const DISTRICTS: Record<string, string[]> = {
  "İstanbul": ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
  "Ankara": ["Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kalecik", "Kazan", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"],
  "İzmir": ["Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"]
};

// Çalışma günleri
const WORKING_DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export function FilterPanel({ role, onChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (key === "province") {
      setSelectedProvince(value);
      // İl değiştiğinde ilçeyi sıfırla
      delete newFilters.district;
    }
    setFilters(newFilters);
  };

  const handleWorkingDayToggle = (day: string) => {
    const newDays = selectedWorkingDays.includes(day)
      ? selectedWorkingDays.filter(d => d !== day)
      : [...selectedWorkingDays, day];
    setSelectedWorkingDays(newDays);
    
    const newFilters = { ...filters };
    if (newDays.length > 0) {
      newFilters.working_days = newDays.join(',');
    } else {
      delete newFilters.working_days;
    }
    setFilters(newFilters);
  };

  const handleApply = () => {
    onChange(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    setSelectedProvince("");
    setSelectedWorkingDays([]);
    onChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(k => filters[k]).length;

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
              {/* İl */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">İl</label>
                <select
                  value={filters.province || ""}
                  onChange={(e) => handleFilterChange("province", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                >
                  <option value="" className="text-black">Tümü</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p} className="text-black">{p}</option>
                  ))}
                </select>
              </div>

              {/* İlçe */}
              {selectedProvince && DISTRICTS[selectedProvince] && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">İlçe</label>
                  <select
                    value={filters.district || ""}
                    onChange={(e) => handleFilterChange("district", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                  >
                    <option value="" className="text-black">Tümü</option>
                    {DISTRICTS[selectedProvince].map((d) => (
                      <option key={d} value={d} className="text-black">{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kurye için filtreler */}
              {role === "isletme" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Çalışma Tipi</label>
                    <select
                      value={filters.working_type || ""}
                      onChange={(e) => handleFilterChange("working_type", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
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
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="Saat+Paket Başı" className="text-black">Saat+Paket Başı</option>
                      <option value="Paket Başı" className="text-black">Paket Başı</option>
                      <option value="Aylık Sabit" className="text-black">Aylık Sabit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Çalışma Günleri</label>
                    <div className="grid grid-cols-2 gap-2">
                      {WORKING_DAYS.map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleWorkingDayToggle(day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            index === 6 ? 'col-span-2' : ''
                          } ${
                            selectedWorkingDays.includes(day)
                              ? 'bg-[#ff7a00] text-white border-2 border-[#ff7a00]'
                              : 'bg-white text-black border-2 border-neutral-300 hover:border-[#ff7a00]'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Ehliyet Türü</label>
                    <select
                      value={filters.license_type || ""}
                      onChange={(e) => handleFilterChange("license_type", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
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
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
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
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
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
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
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
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="VAR" className="text-black">Var</option>
                      <option value="YOK" className="text-black">Yok</option>
                    </select>
                  </div>
                </>
              )}

              {/* İşletme ilanları için filtreler */}
              {role === "kurye" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Çalışma Tipi</label>
                    <select
                      value={filters.working_type || ""}
                      onChange={(e) => handleFilterChange("working_type", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
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
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="Saat Başı" className="text-black">Saat Başı</option>
                      <option value="Paket Başı" className="text-black">Paket Başı</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Çalışma Günleri</label>
                    <div className="grid grid-cols-2 gap-2">
                      {WORKING_DAYS.map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleWorkingDayToggle(day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            index === 6 ? 'col-span-2' : ''
                          } ${
                            selectedWorkingDays.includes(day)
                              ? 'bg-[#ff7a00] text-white border-2 border-[#ff7a00]'
                              : 'bg-white text-black border-2 border-neutral-300 hover:border-[#ff7a00]'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Günlük Paket Tahmini</label>
                    <select
                      value={filters.daily_package_estimate || ""}
                      onChange={(e) => handleFilterChange("daily_package_estimate", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#ff7a00] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-base"
                    >
                      <option value="" className="text-black">Tümü</option>
                      <option value="0-25 PAKET" className="text-black">0-25 Paket</option>
                      <option value="25-50 PAKET" className="text-black">25-50 Paket</option>
                      <option value="50-75 PAKET" className="text-black">50-75 Paket</option>
                      <option value="75-100 PAKET" className="text-black">75-100 Paket</option>
                      <option value="100+ PAKET" className="text-black">100+ Paket</option>
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
            {/* İl */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">İl</label>
              <select
                value={filters.province || ""}
                onChange={(e) => {
                  handleFilterChange("province", e.target.value);
                  onChange({ ...filters, province: e.target.value, district: "" });
                }}
                className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
              >
                <option value="" className="text-black">Tüm İller</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p} className="text-black">{p}</option>
                ))}
              </select>
            </div>

            {/* İlçe */}
            {selectedProvince && DISTRICTS[selectedProvince] && (
              <div>
                <label className="block text-sm font-semibold text-white mb-2">İlçe</label>
                <select
                  value={filters.district || ""}
                  onChange={(e) => {
                    handleFilterChange("district", e.target.value);
                    onChange({ ...filters, district: e.target.value });
                  }}
                  className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                >
                  <option value="" className="text-black">Tüm İlçeler</option>
                  {DISTRICTS[selectedProvince].map((d) => (
                    <option key={d} value={d} className="text-black">{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Kurye filtreler */}
            {role === "isletme" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Çalışma Tipi</label>
                  <select
                    value={filters.working_type || ""}
                    onChange={(e) => {
                      handleFilterChange("working_type", e.target.value);
                      onChange({ ...filters, working_type: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
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
                      handleFilterChange("earning_model", e.target.value);
                      onChange({ ...filters, earning_model: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="Saat+Paket Başı" className="text-black">Saat+Paket Başı</option>
                    <option value="Paket Başı" className="text-black">Paket Başı</option>
                    <option value="Aylık Sabit" className="text-black">Aylık Sabit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Çalışma Günleri</label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORKING_DAYS.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          handleWorkingDayToggle(day);
                          const newDays = selectedWorkingDays.includes(day)
                            ? selectedWorkingDays.filter(d => d !== day)
                            : [...selectedWorkingDays, day];
                          const newFilters = { ...filters };
                          if (newDays.length > 0) {
                            newFilters.working_days = newDays.join(',');
                          } else {
                            delete newFilters.working_days;
                          }
                          onChange(newFilters);
                        }}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          index === 6 ? 'col-span-2' : ''
                        } ${
                          selectedWorkingDays.includes(day)
                            ? 'bg-[#ff7a00] text-white border-2 border-[#ff7a00]'
                            : 'bg-white text-black border-2 border-neutral-300 hover:border-[#ff7a00]'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Ehliyet Türü</label>
                  <select
                    value={filters.license_type || ""}
                    onChange={(e) => {
                      handleFilterChange("license_type", e.target.value);
                      onChange({ ...filters, license_type: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
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
                      handleFilterChange("has_motorcycle", e.target.value);
                      onChange({ ...filters, has_motorcycle: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
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
                      handleFilterChange("has_bag", e.target.value);
                      onChange({ ...filters, has_bag: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
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
                      handleFilterChange("p1_certificate", e.target.value);
                      onChange({ ...filters, p1_certificate: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
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
                      handleFilterChange("criminal_record", e.target.value);
                      onChange({ ...filters, criminal_record: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="VAR" className="text-black">Var</option>
                    <option value="YOK" className="text-black">Yok</option>
                  </select>
                </div>
              </>
            )}

            {/* İşletme ilanları için */}
            {role === "kurye" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Çalışma Tipi</label>
                  <select
                    value={filters.working_type || ""}
                    onChange={(e) => {
                      handleFilterChange("working_type", e.target.value);
                      onChange({ ...filters, working_type: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
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
                      handleFilterChange("earning_model", e.target.value);
                      onChange({ ...filters, earning_model: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="Saat Başı" className="text-black">Saat Başı</option>
                    <option value="Paket Başı" className="text-black">Paket Başı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Çalışma Günleri</label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORKING_DAYS.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          handleWorkingDayToggle(day);
                          const newDays = selectedWorkingDays.includes(day)
                            ? selectedWorkingDays.filter(d => d !== day)
                            : [...selectedWorkingDays, day];
                          const newFilters = { ...filters };
                          if (newDays.length > 0) {
                            newFilters.working_days = newDays.join(',');
                          } else {
                            delete newFilters.working_days;
                          }
                          onChange(newFilters);
                        }}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          index === 6 ? 'col-span-2' : ''
                        } ${
                          selectedWorkingDays.includes(day)
                            ? 'bg-[#ff7a00] text-white border-2 border-[#ff7a00]'
                            : 'bg-white text-black border-2 border-neutral-300 hover:border-[#ff7a00]'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Günlük Paket Tahmini</label>
                  <select
                    value={filters.daily_package_estimate || ""}
                    onChange={(e) => {
                      handleFilterChange("daily_package_estimate", e.target.value);
                      onChange({ ...filters, daily_package_estimate: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 border-2 border-[#ff7a00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] bg-white text-black text-sm"
                  >
                    <option value="" className="text-black">Tümü</option>
                    <option value="0-25 PAKET" className="text-black">0-25 Paket</option>
                    <option value="25-50 PAKET" className="text-black">25-50 Paket</option>
                    <option value="50-75 PAKET" className="text-black">50-75 Paket</option>
                    <option value="75-100 PAKET" className="text-black">75-100 Paket</option>
                    <option value="100+ PAKET" className="text-black">100+ Paket</option>
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
