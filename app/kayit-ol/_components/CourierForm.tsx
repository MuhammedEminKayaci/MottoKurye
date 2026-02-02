"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image"; // Add this
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CourierRegistration } from "../../../types/registration";
import { ISTANBUL_DISTRICTS } from "../../../lib/istanbul-districts";
import { MultiSelect } from "../../_components/MultiSelect";

const courierSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter"),
  lastName: z.string().min(2, "Soyad en az 2 karakter"),
  age: z.number().int().min(18, "18 yaşından büyük olmalısınız").max(80, "Geçerli yaş girin"),
  gender: z.enum(["Erkek", "Kadın"]),
  nationality: z.string().min(1, "Uyruk seçin"),
  phone: z.string().optional(),
  contactPreference: z.enum(["in_app", "phone", "both"]),
  experience: z.enum(["0-1", "1-3", "3-5", "5-10", "10+"]),
  province: z.string().min(1, "İl seçin"),
  district: z.array(z.string()).min(1, "En az bir ilçe seçin"),
  workingType: z.enum(["Full Time", "Part Time"]),
  earningModel: z.enum(["Saat+Paket Başı", "Paket Başı", "Aylık Sabit"]),
  workingDays: z.array(z.string()).min(1, "En az bir gün seçin"),
  dailyPackageEstimate: z.enum(["0-15 PAKET", "15-25 PAKET", "25-40 PAKET", "40 VE ÜZERİ"]),
  licenseType: z.enum(["A1", "A", "A2"]),
  hasMotorcycle: z.enum(["VAR", "YOK"]),
  motoBrand: z.string().optional(),
  motoCc: z.string().optional(),
  hasBag: z.enum(["VAR", "YOK"]),
  p1Certificate: z.enum(["VAR", "YOK"], { required_error: "P1 yetki belgesi durumu gerekli" }),
  criminalRecord: z.enum(["VAR", "YOK"], { required_error: "Sabıka kaydı durumu gerekli" }),
  p1CertificateFile: z.any(),
  criminalRecordFile: z.any(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Kullanım şartlarını kabul etmelisiniz" }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "Gizlilik politikasını kabul etmelisiniz" }) }),
  acceptKVKK: z.literal(true, { errorMap: () => ({ message: "KVKK aydınlatma metnini kabul etmelisiniz" }) }),
  acceptCommercial: z.literal(true, { errorMap: () => ({ message: "Ticari ileti iznini onaylamalısınız" }) }),
  avatarFile: z.any().optional(),
  selectedAvatar: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.contactPreference === "phone" || val.contactPreference === "both") {
    if (!val.phone || val.phone.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telefon gerekli",
        path: ["phone"],
      });
    }
  }
  const validateFile = (fileList: FileList | undefined | null, field: "p1CertificateFile" | "criminalRecordFile") => {
    if (!fileList || (fileList as any).length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Belge yüklemek zorunlu", path: [field] });
      return;
    }
    const file = (fileList as any)[0] as File;
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sadece JPEG, PNG veya PDF yükleyin", path: [field] });
    }
  };

  // Only validate P1 file if P1 certificate is VAR
  if (val.p1Certificate === "VAR") {
    validateFile(val.p1CertificateFile as FileList, "p1CertificateFile");
  }
  
  // Criminal record file is always required
  validateFile(val.criminalRecordFile as FileList, "criminalRecordFile");
});

export interface CourierFormProps {
  onSubmit: (data: CourierRegistration) => void;
  disabled?: boolean;
}

const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Telefon numarası formatlama fonksiyonu: 0 (5XX) XXX XX XX
const formatPhoneNumber = (value: string): string => {
  // Sadece rakamları al
  const digits = value.replace(/\D/g, '');
  
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

export function CourierForm({ onSubmit, disabled }: CourierFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue, // Add setValue
    watch,
    formState: { errors },
  } = useForm<CourierRegistration>({
    resolver: zodResolver(courierSchema),
    defaultValues: {
      province: "İstanbul",
      district: [],
      nationality: "Türk Vatandaşı",
      workingType: "Full Time",
      earningModel: "Saat+Paket Başı",
      dailyPackageEstimate: "15-25 PAKET",
      workingDays: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"],
      hasMotorcycle: "VAR",
      hasBag: "VAR",
      licenseType: "A",
      experience: "0-1",
      gender: "Erkek",
      contactPreference: "in_app",
      p1Certificate: "YOK",
      criminalRecord: "YOK",
      p1CertificateFile: undefined,
      criminalRecordFile: undefined,
      acceptTerms: false,
      acceptPrivacy: false,
      acceptKVKK: false,
      acceptCommercial: false,
    },
  });

  const hasMotorcycle = watch("hasMotorcycle");
  const contactPreference = watch("contactPreference");
  const p1Certificate = watch("p1Certificate");
  const criminalRecord = watch("criminalRecord");
  // Always use Istanbul districts
  const districts = ISTANBUL_DISTRICTS;
  
  const avatarWatch = watch("avatarFile");
  const selectedAvatar = watch("selectedAvatar");

  const p1FileWatch = watch("p1CertificateFile");
  const criminalFileWatch = watch("criminalRecordFile");
  const [preview, setPreview] = useState<string | null>(null);
  
  // File upload status states
  const [p1FileUploaded, setP1FileUploaded] = useState(false);
  const [criminalFileUploaded, setCriminalFileUploaded] = useState(false);
  
  // Track file upload status
  useEffect(() => {
    setP1FileUploaded(!!(p1FileWatch && p1FileWatch.length > 0));
  }, [p1FileWatch]);
  
  useEffect(() => {
    setCriminalFileUploaded(!!(criminalFileWatch && criminalFileWatch.length > 0));
  }, [criminalFileWatch]);

  const avatarOptions = [
    "/images/avatars/kurye/avatar1.svg",
    "/images/avatars/kurye/avatar2.svg",
    "/images/avatars/kurye/avatar3.svg",
    "/images/avatars/kurye/avatar4.svg",
  ];
  
  useEffect(() => {
    if (avatarWatch && avatarWatch.length > 0) {
      const url = URL.createObjectURL(avatarWatch[0]);
      setPreview(url);
      setValue("selectedAvatar", undefined); // Clear predefined avatar if file selected
      return () => URL.revokeObjectURL(url);
    } else if (selectedAvatar) {
      setPreview(selectedAvatar);
    } else {
      setPreview(null);
    }
  }, [avatarWatch, selectedAvatar, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profil Fotoğrafı - Modern Tasarım */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">PROFİL FOTOĞRAFI</h3>
        
        <div className="flex flex-col items-center gap-4">
          {/* Avatar Önizleme */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-3 border-white/30 shadow-lg">
              {preview ? (
                <img src={preview} alt="Önizleme" className="object-cover w-full h-full" />
              ) : (
                <svg className="w-14 h-14 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
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
            Fotoğraf Yükle
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
                    selectedAvatar === opt && (!avatarWatch || avatarWatch.length === 0) 
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

      {/* KİŞİSEL BİLGİLER */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">KİŞİSEL BİLGİLER</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">Ad *</label>
            <input className="input-field text-sm" {...register("firstName")} placeholder="Adınız" />
            {errors.firstName && <p className="text-[10px] text-red-200 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Soyad *</label>
            <input className="input-field text-sm" {...register("lastName")} placeholder="Soyadınız" />
            {errors.lastName && <p className="text-[10px] text-red-200 mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Yaş *</label>
            <input type="number" className="input-field text-sm" {...register("age", { valueAsNumber: true })} placeholder="25" />
            {errors.age && <p className="text-[10px] text-red-200 mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Cinsiyet *</label>
            <select className="input-field text-sm" {...register("gender")}>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
            {errors.gender && <p className="text-[10px] text-red-200 mt-1">{errors.gender.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Uyruk *</label>
            <select className="input-field text-sm" {...register("nationality")}>
              <option value="Türk Vatandaşı">Türk Vatandaşı</option>
              <option value="Türk Vatandaşı Olmayan">Türk Vatandaşı Olmayan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Telefon {(contactPreference === "phone" || contactPreference === "both") && "*"}</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input 
                  className="input-field text-sm" 
                  value={field.value || ''}
                  onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                  placeholder="0 (5XX) XXX XX XX" 
                  disabled={contactPreference === "in_app"} 
                />
              )}
            />
            {errors.phone && <p className="text-[10px] text-red-200 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">İletişim Tercihi *</label>
            <select className="input-field text-sm" {...register("contactPreference")}>
              <option value="in_app">Uygulama İçi İletişim</option>
              <option value="phone">Telefon ve Uygulama İçi İletişim</option>
            </select>
            {(contactPreference === "phone" || contactPreference === "both") && (
              <p className="text-[10px] text-yellow-300 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Telefon görüşmelerine 08:00-20:00 saatleri arasında izin verilmektedir.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* İŞ TECRÜBE */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">İŞ TECRÜBE</h3>
        <div>
          <label className="block text-xs font-medium text-white mb-1">Tecrübe Süresi *</label>
          <select className="input-field text-sm" {...register("experience")}>
            <option value="0-1">0-1 YIL</option>
            <option value="1-3">1-3 YIL</option>
            <option value="3-5">3-5 YIL</option>
            <option value="5-10">5-10 YIL</option>
            <option value="10+">10 YIL ÜZERİ</option>
          </select>
          {errors.experience && <p className="text-[10px] text-red-200 mt-1">{errors.experience.message}</p>}
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

      {/* MOTORSİKLET BİLGİLERİ */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">MOTORSİKLET BİLGİLERİ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">Ehliyet Türü *</label>
            <select className="input-field text-sm" {...register("licenseType")}>
              <option value="A1">A1</option>
              <option value="A">A</option>
              <option value="A2">A2</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Motorsiklet Durumu *</label>
            <select className="input-field text-sm" {...register("hasMotorcycle")}>
              <option value="VAR">VAR</option>
              <option value="YOK">YOK</option>
            </select>
          </div>
          {hasMotorcycle === "VAR" && (
            <>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Motorsiklet Marka</label>
                <input className="input-field text-sm" {...register("motoBrand")} placeholder="Yamaha, Honda..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Motorsiklet CC</label>
                <input className="input-field text-sm" {...register("motoCc")} placeholder="125, 150..." />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-white mb-1">Taşıma Çantası *</label>
            <select className="input-field text-sm" {...register("hasBag")}>
              <option value="VAR">VAR</option>
              <option value="YOK">YOK</option>
            </select>
          </div>
        </div>
      </div>

      {/* BELGELER */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">BELGELER</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">P1 Yetki Belgesi *</label>
            <select className="input-field text-sm" {...register("p1Certificate")}>
              <option value="VAR">VAR</option>
              <option value="YOK">YOK</option>
            </select>
            {errors.p1Certificate && <p className="text-[10px] text-red-200 mt-1">{errors.p1Certificate.message as any}</p>}
            {p1Certificate === "VAR" && (
              <>
                <div className="relative mt-2">
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.pdf" 
                    className={`input-field text-xs ${p1FileUploaded ? 'opacity-0 absolute inset-0 w-full h-full cursor-pointer' : ''}`}
                    {...register("p1CertificateFile")}
                  />
                  {p1FileUploaded && (
                    <div className="input-field text-xs flex items-center gap-2 bg-green-500/20 border-green-400/50">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-200">Belge yüklendi</span>
                    </div>
                  )}
                </div>
                {errors.p1CertificateFile && <p className="text-[10px] text-red-200 mt-1">{errors.p1CertificateFile.message as any}</p>}
                <p className="text-[10px] text-white/70 mt-1">JPEG, PNG veya PDF yüklenmelidir.</p>
              </>
            )}
            {p1Certificate === "YOK" && (
              <p className="text-[10px] text-white/50 mt-2">P1 belgesi yok olarak işaretlendi.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Sabıka Kaydı *</label>
            <select className="input-field text-sm" {...register("criminalRecord")}>
              <option value="VAR">VAR</option>
              <option value="YOK">YOK</option>
            </select>
            {errors.criminalRecord && <p className="text-[10px] text-red-200 mt-1">{errors.criminalRecord.message as any}</p>}
            <div className="relative mt-2">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf" 
                className={`input-field text-xs ${criminalFileUploaded ? 'opacity-0 absolute inset-0 w-full h-full cursor-pointer' : ''}`}
                {...register("criminalRecordFile")}
              />
              {criminalFileUploaded && (
                <div className="input-field text-xs flex items-center gap-2 bg-green-500/20 border-green-400/50">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-200">Belge yüklendi</span>
                </div>
              )}
            </div>
            {errors.criminalRecordFile && <p className="text-[10px] text-red-200 mt-1">{errors.criminalRecordFile.message as any}</p>}
            <p className="text-[10px] text-white/70 mt-1">Sabıka kaydı belgesi yükleyin (JPEG, PNG veya PDF).</p>
          </div>
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
        {disabled ? "Kaydediliyor..." : "Kurye Kaydını Tamamla"}
      </button>
    </form>
  );
}
