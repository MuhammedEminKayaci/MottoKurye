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
  contactPreference: z.enum(["phone", "in_app"]),
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
  if (val.contactPreference === "phone") {
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
      contactPreference: "phone",
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
      {/* Profil Fotoğrafı */}
      <div className="flex flex-col gap-4">
        <label className="block text-xs font-medium text-white">Firma Logosu veya Avatar Seçin</label>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-2 border-white/20 shrink-0">
            {preview ? (
              <img src={preview} alt="Önizleme" className="object-cover w-full h-full" />
            ) : (
              <span className="text-4xl cursor-default">🏢</span>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
             {/* File Upload */}
             <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="input-field text-xs block w-full text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#ff7a00] file:text-white hover:file:bg-[#e66e00] cursor-pointer"
                  {...register("avatarFile")}
                />
                <p className="text-[10px] text-white/50 mt-1">Firma logosu yükleyin veya bir avatar seçin.</p>
             </div>

             {/* Avatars Grid */}
             <div className="flex gap-3">
                {avatarOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                        setValue("avatarFile", undefined); 
                        setValue("selectedAvatar", opt);
                    }}
                    className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-transform hover:scale-110 ${selectedAvatar === opt && (!avatarDynamic || avatarDynamic.length === 0) ? 'border-[#ff7a00] ring-2 ring-[#ff7a00]/50' : 'border-transparent'}`}
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
            <label className="block text-xs font-medium text-white mb-1">Yetkili İletişim *</label>
            <input className="input-field text-sm" {...register("managerContact")} placeholder="05XXXXXXXXX" disabled={contactPreference === "in_app"} />
            {errors.managerContact && <p className="text-[10px] text-red-200 mt-1">{errors.managerContact.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">İletişim Tercihi *</label>
            <select className="input-field text-sm" {...register("contactPreference")}>
              <option value="phone">Telefon ile iletişim (arama/WhatsApp)</option>
              <option value="in_app">Uygulama içi iletişim (yakında)</option>
            </select>
            <p className="text-[10px] text-white/70 mt-1">Telefon seçilirse arama/WhatsApp açıktır. Uygulama içi seçilirse telefonla arama yapılmaz.</p>
          </div>
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
