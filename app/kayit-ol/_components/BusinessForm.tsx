"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { BusinessRegistration } from "../../../types/registration";
import { ISTANBUL_DISTRICTS } from "../../../lib/istanbul-districts";
import { MultiSelect } from "../../_components/MultiSelect";

const businessSchema = z.object({
  businessName: z.string().min(2, "Firma adı gerekli"),
  businessSector: z.string().min(1, "Firma sektörü seçin"),
  managerName: z.string().min(2, "Yetkili adı soyadı gerekli"),
  managerContact: z.string().optional(),
  contactPreference: z.enum(["in_app", "phone", "both"]),
  province: z.string().min(1, "İl seçin"),
  district: z.array(z.string()).min(1, "En az bir ilçe seçin"),
  workingType: z.enum(["Full Time", "Part Time"]),
  earningModel: z.enum(["Saat+Paket Başı", "Paket Başı", "Aylık Sabit"]),
  workingDays: z.array(z.string()).min(1, "En az bir gün seçin"),
  dailyPackageEstimate: z.enum(["0-15 PAKET", "15-25 PAKET", "25-40 PAKET", "40 VE ÜZERİ"]),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Kullanım şartlarını kabul etmelisiniz" }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "Gizlilik politikasını kabul etmelisiniz" }) }),
  acceptKVKK: z.literal(true, { errorMap: () => ({ message: "KVKK aydınlatma metnini kabul etmelisiniz" }) }),
  acceptCommercial: z.literal(true, { errorMap: () => ({ message: "Ticari ileti iznini onaylamalısınız" }) }),
  selectedAvatar: z.string().optional(),
  avatarFile: z.any().optional(),
}).superRefine((val, ctx) => {
  if (val.contactPreference === "phone" || val.contactPreference === "both") {
    if (!val.managerContact || val.managerContact.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Yetkili iletişim gerekli",
        path: ["managerContact"],
      });
    }
  }
});

export interface BusinessFormProps {
  onSubmit: (data: BusinessRegistration) => void;
  disabled?: boolean;
}

const businessSectors = [
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

const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Telefon numarası formatlama fonksiyonu: 0 (5XX) XXX XX XX
const formatPhoneNumber = (value: string): string => {
  // Sadece rakamları al
  let digits = value.replace(/\D/g, '');
  
  // 5 ile başlıyorsa otomatik 0 ekle
  if (digits.length > 0 && digits[0] === '5') {
    digits = '0' + digits;
  }
  
  // Max 11 rakam (0 + 10 hane)
  const limited = digits.slice(0, 11);
  
  // Format uygula
  if (limited.length === 0) return '';
  if (limited.length <= 1) return limited;
  if (limited.length <= 4) return `${limited[0]} (${limited.slice(1)}`;
  if (limited.length <= 7) return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4)}`;
  if (limited.length <= 9) return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7)}`;
  return `${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9)}`;
};

export function BusinessForm({ onSubmit, disabled }: BusinessFormProps) {
  const { register, handleSubmit, watch, control, formState: { errors }, setValue } = useForm<BusinessRegistration>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      province: "İstanbul",
      district: [],
      workingType: "Full Time",
      earningModel: "Saat+Paket Başı",
      dailyPackageEstimate: "15-25 PAKET",
      workingDays: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"],
      businessSector: "",
      contactPreference: "in_app",
      acceptTerms: false,
      acceptPrivacy: false,
      acceptKVKK: false,
      acceptCommercial: false,
    } as any,
  });

  // Always use Istanbul districts
  const districts = ISTANBUL_DISTRICTS;
  const avatarDynamic = watch("avatarFile");
  const selectedAvatar = watch("selectedAvatar");
  const contactPreference = watch("contactPreference");
  const [preview, setPreview] = useState<string | null>(null);

  const avatarOptions = [
    "/images/avatars/isletme/avatar1.svg",
    "/images/avatars/isletme/avatar2.svg",
    "/images/avatars/isletme/avatar3.svg",
    "/images/avatars/isletme/avatar4.svg",
  ];
  
  useEffect(() => {
    const list: FileList | undefined = avatarDynamic as any;
    if (list && list.length > 0) {
      const url = URL.createObjectURL(list[0]);
      setPreview(url);
      setValue("selectedAvatar", undefined);
      return () => URL.revokeObjectURL(url);
    } else if (selectedAvatar) {
      setPreview(selectedAvatar);
    } else {
      setPreview(null);
    }
  }, [avatarDynamic, selectedAvatar, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profil Fotoğrafı - Modern Tasarım */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">FİRMA LOGOSU</h3>
        
        <div className="flex flex-col items-center gap-4">
          {/* Avatar Önizleme */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-3 border-white/30 shadow-lg">
              {preview ? (
                <img src={preview} alt="Önizleme" className="object-cover w-full h-full" />
              ) : (
                <svg className="w-14 h-14 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                </svg>
              )}
            </div>
            {/* Fotoğraf Yükle Butonu - Overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden"
                {...register("avatarFile")}
              />
            </label>
          </div>

          {/* Yükle Butonu - Mobil için görünür */}
          <label className="sm:hidden px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full cursor-pointer transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Logo Yükle
            <input 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setValue("avatarFile", files);
                }
              }}
            />
          </label>

          {/* Avatar Seçenekleri */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] text-white/60">veya hazır avatar seçin</p>
            <div className="flex gap-3">
              {avatarOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setValue("avatarFile", undefined); 
                    setValue("selectedAvatar", opt);
                  }}
                  className={`w-14 h-14 rounded-full overflow-hidden transition-all duration-200 hover:scale-110 ${
                    selectedAvatar === opt && (!avatarDynamic || avatarDynamic.length === 0) 
                      ? 'ring-3 ring-[#ff7a00] ring-offset-2 ring-offset-[#ff7a00]/20 scale-110' 
                      : 'ring-2 ring-white/20 hover:ring-white/40'
                  }`}
                >
                  <img src={opt} alt={`Avatar ${idx+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FİRMA BİLGİLER */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">FİRMA BİLGİLER</h3>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">Firma Adı *</label>
            <input className="input-field text-sm" {...register("businessName")} placeholder="Firma adınız" />
            {errors.businessName && <p className="text-[10px] text-red-200 mt-1">{errors.businessName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Firma Sektörü *</label>
            <select className="input-field text-sm" {...register("businessSector")}>
              <option value="">Sektör Seçin</option>
              {businessSectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            {errors.businessSector && <p className="text-[10px] text-red-200 mt-1">{errors.businessSector.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Yetkili Adı Soyadı *</label>
            <input className="input-field text-sm" {...register("managerName")} placeholder="Ad Soyad" />
            {errors.managerName && <p className="text-[10px] text-red-200 mt-1">{errors.managerName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">İletişim Tercihi *</label>
            <select className="input-field text-sm" {...register("contactPreference")}>
              <option value="in_app">Uygulama İçi İletişim</option>
              <option value="phone">Telefon ve Uygulama İçi İletişim</option>
            </select>
            {contactPreference === "in_app" && (
              <p className="text-[10px] mt-1.5 flex items-center gap-1 bg-white/90 text-neutral-800 px-2 py-1 rounded-lg">
                <svg className="w-3 h-3 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Bu seçenekte telefon numaranız gerekmez, kuryeler size uygulama içi mesaj yoluyla ulaşacaktır.
              </p>
            )}
            {(contactPreference === "phone" || contactPreference === "both") && (
              <p className="text-[10px] mt-1.5 flex items-center gap-1 bg-white/90 text-neutral-800 px-2 py-1 rounded-lg">
                <svg className="w-3 h-3 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Telefon numaranız 08:00-20:00 saatleri arasında kuryelere gösterilecektir.
              </p>
            )}
          </div>
          {(contactPreference === "phone" || contactPreference === "both") && (
            <div>
              <label className="block text-xs font-medium text-white mb-1">Yetkili İletişim *</label>
              <Controller
                name="managerContact"
                control={control}
                render={({ field }) => (
                  <input 
                    className="input-field text-sm" 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                    placeholder="0 (5XX) XXX XX XX" 
                  />
                )}
              />
              {errors.managerContact && <p className="text-[10px] text-red-200 mt-1">{errors.managerContact.message}</p>}
            </div>
          )}
        </div>
      </div>

      {/* ÇALIŞMA KOŞULLARI */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">ÇALIŞMA KOŞULLARI</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">Çalışılacak İl *</label>
            <input type="text" className="input-field text-sm bg-white/20" value="İstanbul" disabled {...register("province")} />
            {errors.province && <p className="text-[10px] text-red-200 mt-1">{errors.province.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Çalışılacak İlçe *</label>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={districts}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="İlçe Seçin"
                  theme="registration"
                />
              )}
            />
            {errors.district && <p className="text-[10px] text-red-200 mt-1">{errors.district.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Çalışma Tipi *</label>
            <select className="input-field text-sm" {...register("workingType")}>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Kazanç Modeli *</label>
            <select className="input-field text-sm" {...register("earningModel")}>
              <option value="Saat+Paket Başı">Saat + Paket Başı</option>
              <option value="Paket Başı">Paket Başı</option>
              <option value="Aylık Sabit">Aylık Sabit</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white mb-1">Tahmini Günlük Paket *</label>
            <select className="input-field text-sm" {...register("dailyPackageEstimate")}>
              <option value="0-15 PAKET">0-15 PAKET</option>
              <option value="15-25 PAKET">15-25 PAKET</option>
              <option value="25-40 PAKET">25-40 PAKET</option>
              <option value="40 VE ÜZERİ">40 VE ÜZERİ</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white mb-2">Çalışma Günleri *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {days.map(day => (
              <label key={day} className="flex items-center gap-1.5 text-xs text-white bg-white/10 rounded px-2 py-1.5">
                <input type="checkbox" value={day} {...register("workingDays")} className="accent-[#ff7a00]" />
                <span>{day}</span>
              </label>
            ))}
          </div>
          {errors.workingDays && <p className="text-[10px] text-red-200 mt-1">{errors.workingDays.message}</p>}
        </div>
      </div>

      {/* SÖZLEŞMELER VE İZİNLER */}
      <div className="space-y-2">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">SÖZLEŞMELER VE İZİNLER</h3>
        <label className="flex items-start gap-2 text-xs text-white">
          <input type="checkbox" className="mt-0.5 accent-[#ff7a00]" {...register("acceptTerms")} />
          <span>
            <a href="/kullanim-sartlari" target="_blank" className="text-white underline hover:text-white/80">Kullanım Şartları</a>'nı okudum ve kabul ediyorum. *
          </span>
        </label>
        {errors.acceptTerms && <p className="text-[10px] text-red-200">{errors.acceptTerms.message as any}</p>}
        <label className="flex items-start gap-2 text-xs text-white">
          <input type="checkbox" className="mt-0.5 accent-[#ff7a00]" {...register("acceptPrivacy")} />
          <span>
            <a href="/gizlilik-politikasi" target="_blank" className="text-white underline hover:text-white/80">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum. *
          </span>
        </label>
        {errors.acceptPrivacy && <p className="text-[10px] text-red-200">{errors.acceptPrivacy.message as any}</p>}
        <label className="flex items-start gap-2 text-xs text-white">
          <input type="checkbox" className="mt-0.5 accent-[#ff7a00]" {...register("acceptKVKK")} />
          <span>
            <a href="/kvkk-aydinlatma" target="_blank" className="text-white underline hover:text-white/80">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum. *
          </span>
        </label>
        {errors.acceptKVKK && <p className="text-[10px] text-red-200">{errors.acceptKVKK.message as any}</p>}
        <label className="flex items-start gap-2 text-xs text-white">
          <input type="checkbox" className="mt-0.5 accent-[#ff7a00]" {...register("acceptCommercial")} />
          <span>
            <a href="/ticari-ileti-izni" target="_blank" className="text-white underline hover:text-white/80">Ticari İleti İzni</a>'ni okudum ve ticari elektronik ileti almayı kabul ediyorum. *
          </span>
        </label>
        {errors.acceptCommercial && <p className="text-[10px] text-red-200">{errors.acceptCommercial.message as any}</p>}
        <p className="text-[10px] text-white/70 mt-2">
          * Tüm onaylar zorunludur. Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için lütfen ilgili metinleri okuyun.
        </p>
      </div>

      <button type="submit" disabled={disabled} className="primary-btn w-full">
        {disabled ? "Kaydediliyor..." : "İşletme Kaydını Tamamla"}
      </button>
    </form>
  );
}
